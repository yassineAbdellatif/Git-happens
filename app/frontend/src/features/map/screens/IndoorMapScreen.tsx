import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
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
  IndoorBuildingId,
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

const IndoorMapScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { buildingId, buildingName, selectedFloorNumber } =
    route.params as IndoorMapRouteParams;

  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const floorPlanEntry = useMemo(
    () => getFloorPlanRegistryEntry(buildingId, selectedFloorNumber),
    [buildingId, selectedFloorNumber],
  );

  const {
    startPoint,
    destinationPoint,
    startResults,
    destinationResults,
    path,
    isAccessibilityEnabled,
    handleStartSearch,
    handleDestinationSearch,
    selectStartNode,
    selectDestinationNode,
    handleStartNavigation,
    toggleAccessibility,
    swapPoints,
  } = useIndoorNavigation(buildingId, selectedFloorNumber);

  const currentFloorPath = useMemo(
    () =>
      path.filter(
        (node) => String(node.floor) === String(selectedFloorNumber),
      ),
    [path, selectedFloorNumber],
  );

  const isShowingRoute = path.length > 0;

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

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.mapContainer}>
        {floorPlanEntry ? (
          <FloorPlanDisplay floorPlanEntry={floorPlanEntry} path={currentFloorPath} />
        ) : (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              Map not available for Floor {selectedFloorNumber}.
            </Text>
          </View>
        )}
      </View>

      {isShowingRoute ? (
        <>
          <View style={styles.routeInfoPill}>
            <Text style={styles.routeInfoTitle}>{buildingName}</Text>
            <Text style={styles.routeInfoSubtitle}>
              {isAccessibilityEnabled ? "Accessible Indoor Route" : "Indoor Route"}
            </Text>
          </View>

          <View style={styles.accessibilityContainer}>
            <View style={styles.accessibilityIconBubble}>
              <MaterialIcons name="accessible" size={24} color="#231f20" />
            </View>
            <Switch
              trackColor={{ false: "#d9d9d9", true: "#44d264" }}
              thumbColor="#ffffff"
              ios_backgroundColor="#d9d9d9"
              value={isAccessibilityEnabled}
              onValueChange={() => {
                const result = toggleAccessibility();

                if (!result?.ok && result?.reason === "no_accessible_route") {
                  Alert.alert(
                    "No accessible route found",
                    "No accessible route was found between those two points. You can keep searching or turn accessibility off.",
                  );
                }
              }}
            />
          </View>

          <TouchableOpacity
            style={styles.exitRouteButton}
            onPress={navigation.goBack}
          >
            <MaterialIcons name="close" size={22} color="#fff" />
          </TouchableOpacity>
        </>
      ) : (
        <>
          <View style={styles.floatingHeader}>
            <TouchableOpacity onPress={navigation.goBack} style={styles.backButton}>
              <MaterialIcons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>{buildingName}</Text>
              <Text style={styles.headerSubtitle}>Floor {selectedFloorNumber}</Text>
            </View>
          </View>

          <View style={[styles.floatingBottomCard, { bottom: 30 + keyboardHeight }]}>
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
              onPress={() => {
                const result = handleStartNavigation();

                if (result.ok) {
                  return;
                }

                if (result.reason === "missing_points") {
                  Alert.alert(
                    "Missing points",
                    "Please choose both a start point and a destination point.",
                  );
                  return;
                }

                if (result.reason === "no_accessible_route") {
                  Alert.alert(
                    "No accessible route found",
                    "No accessible route was found between those two points. Try another route or turn accessibility off.",
                  );
                  return;
                }

                Alert.alert(
                  "No route found",
                  "No route was found between those two points.",
                );
              }}
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
