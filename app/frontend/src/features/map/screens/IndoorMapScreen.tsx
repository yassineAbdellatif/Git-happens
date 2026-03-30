import React, { useEffect, useMemo, useState } from "react";
import {
  Keyboard,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import {
  FloorNumber,
  getFloorPlanRegistryEntry,
  getSupportedFloorsForBuilding,
  IndoorBuildingId,
  LocalizedNode,
} from "../../../services/floorPlanService";
import FloorPlanDisplay from "../components/FloorPlanDisplay";
import { useIndoorNavigation } from "../hooks/useIndoorNavigation";
import SearchResults from "../components/SearchResults";
import { styles } from "../../map/styles/IndoorMapScreenStyle";

type IndoorMapRouteParams = {
  buildingId: IndoorBuildingId;
  buildingName: string;
  selectedFloorNumber: FloorNumber;
};

const FloorPill = ({
  floors,
  selectedFloorNumber,
  onSelectFloor,
}: {
  floors: string[];
  selectedFloorNumber: string;
  onSelectFloor: (floor: string) => void;
}) => (
  <View style={styles.floorPill}>
    <Text style={styles.floorPillTitle}>Floor</Text>
    {floors.map((floor) => {
      const isActive = floor === selectedFloorNumber;

      return (
        <TouchableOpacity
          key={floor}
          style={[styles.floorPillButton, isActive && styles.floorPillButtonActive]}
          onPress={() => onSelectFloor(floor)}
        >
          <Text
            style={[
              styles.floorPillButtonText,
              isActive && styles.floorPillButtonTextActive,
            ]}
          >
            {floor}
          </Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

const IndoorMapScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { buildingId, buildingName, selectedFloorNumber } =
    route.params as IndoorMapRouteParams;

  const [currentFloor, setCurrentFloor] = useState<FloorNumber>(selectedFloorNumber);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const floorPlanEntry = useMemo(
    () => getFloorPlanRegistryEntry(buildingId, currentFloor),
    [buildingId, currentFloor],
  );

  const {
    startPoint,
    destinationPoint,
    startResults,
    destinationResults,
    path,
    routeFloors,
    isAccessibilityEnabled,
    selectedStartNode,
    selectedDestinationNode,
    handleStartSearch,
    handleDestinationSearch,
    selectStartNode,
    selectDestinationNode,
    handleStartNavigation,
    toggleAccessibility,
    swapPoints,
    clearPath,
  } = useIndoorNavigation(buildingId);

  const isShowingRoute = path.length > 0;

  const currentFloorPath = useMemo(
    () => path.filter((node) => String(node.floor) === String(currentFloor)),
    [currentFloor, path],
  );

  const currentFloorStartNode =
    selectedStartNode && String(selectedStartNode.floor) === String(currentFloor)
      ? selectedStartNode
      : null;

  const currentFloorDestinationNode =
    selectedDestinationNode &&
    String(selectedDestinationNode.floor) === String(currentFloor)
      ? selectedDestinationNode
      : null;

  const floorChangeNode = useMemo(() => {
    if (!isShowingRoute) {
      return null;
    }

    const changeNode = path.find((node, index) => {
      const previousNode = path[index - 1];
      const nextNode = path[index + 1];

      return (
        String(node.floor) === String(currentFloor) &&
        ((previousNode && String(previousNode.floor) !== String(currentFloor)) ||
          (nextNode && String(nextNode.floor) !== String(currentFloor)))
      );
    });

    return changeNode || null;
  }, [currentFloor, isShowingRoute, path]);

  const availableFloors = useMemo(() => {
    if (routeFloors.length > 0) {
      return [...routeFloors].sort((a, b) =>
        a.localeCompare(b, undefined, { numeric: true }),
      );
    }

    return getSupportedFloorsForBuilding(buildingId);
  }, [buildingId, routeFloors]);

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });

    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    if (!isShowingRoute || routeFloors.length === 0) {
      return;
    }

    if (!routeFloors.includes(String(currentFloor))) {
      setCurrentFloor(routeFloors[0] as FloorNumber);
    }
  }, [currentFloor, isShowingRoute, routeFloors]);

  const resetRouteView = () => {
    clearPath();
    setCurrentFloor(selectedFloorNumber);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.mapContainer}>
        {floorPlanEntry ? (
          <FloorPlanDisplay
            floorPlanEntry={floorPlanEntry}
            path={currentFloorPath}
            startNode={currentFloorStartNode}
            destinationNode={currentFloorDestinationNode}
            floorChangeNode={floorChangeNode}
          />
        ) : (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              Map not available for Floor {currentFloor}.
            </Text>
          </View>
        )}
      </View>

      <TouchableOpacity onPress={navigation.goBack} style={styles.backButton}>
        <MaterialIcons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>

      {isShowingRoute ? (
        <>
          <View style={styles.routeInfoPill}>
            <Text style={styles.routeInfoTitle}>{buildingName}</Text>
            <Text style={styles.routeInfoSubtitle}>Accessible Indoor Route</Text>
          </View>

          <FloorPill
            floors={availableFloors}
            selectedFloorNumber={String(currentFloor)}
            onSelectFloor={(floor) => setCurrentFloor(floor as FloorNumber)}
          />

          <View style={styles.accessibilityContainer}>
            <View style={styles.accessibilityIconBubble}>
              <MaterialIcons name="accessible" size={24} color="#231f20" />
            </View>
            <Switch
              trackColor={{ false: "#d9d9d9", true: "#44d264" }}
              thumbColor="#ffffff"
              ios_backgroundColor="#d9d9d9"
              value={isAccessibilityEnabled}
              onValueChange={toggleAccessibility}
            />
          </View>

          <TouchableOpacity style={styles.exitRouteButton} onPress={resetRouteView}>
            <MaterialIcons name="close" size={22} color="#fff" />
          </TouchableOpacity>
        </>
      ) : (
        <>
          <View style={styles.floatingHeader}>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>{buildingName}</Text>
              <Text style={styles.headerSubtitle}>Floor {selectedFloorNumber}</Text>
            </View>
          </View>

          <View
            style={[styles.floatingBottomCard, { bottom: 30 + keyboardHeight }]}
          >
            <Text style={styles.cardTitle}>Navigation Points</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Start Point</Text>
              <View style={styles.searchBar}>
                <MaterialIcons name="search" size={20} color="#999" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search rooms by name or number"
                  placeholderTextColor="#999"
                  value={startPoint}
                  onChangeText={handleStartSearch}
                />
              </View>

              <SearchResults results={startResults} onSelectNode={selectStartNode} />
            </View>

            <TouchableOpacity onPress={swapPoints} style={styles.swapIconContainer}>
              <MaterialIcons name="swap-vert" size={28} color="#333" />
            </TouchableOpacity>

            <View style={[styles.inputGroup, { marginTop: -10 }]}>
              <Text style={styles.inputLabel}>Destination Point</Text>
              <View style={styles.searchBar}>
                <MaterialIcons name="search" size={20} color="#999" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search rooms by name or number"
                  placeholderTextColor="#999"
                  value={destinationPoint}
                  onChangeText={handleDestinationSearch}
                />
              </View>

              <SearchResults
                results={destinationResults}
                onSelectNode={selectDestinationNode}
              />
            </View>

            <TouchableOpacity
              style={styles.startNavigationButton}
              onPress={handleStartNavigation}
            >
              <MaterialIcons
                name="near-me"
                size={20}
                color="white"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.startNavigationText}>Start Navigation</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
};

export default IndoorMapScreen;
