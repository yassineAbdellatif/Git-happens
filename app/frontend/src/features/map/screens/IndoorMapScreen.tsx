// src/features/map/screens/IndoorMapScreen.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Keyboard,
  ScrollView,
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
  getBuildingGraph,
  getFloorPlanRegistryEntry,
  IndoorBuildingId,
} from "../../../services/floorPlanService";
import FloorPlanDisplay from "../components/FloorPlanDisplay";
import { useIndoorNavigation } from "../hooks/useIndoorNavigation";
import SearchResults from "../components/SearchResults";
import { styles } from "../../map/styles/IndoorMapScreenStyle";
import {
  getFloorsInPath,
  getPathSegmentForFloor,
} from "../utils/multiFloorNavigationUtils";

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

  const buildingGraph = useMemo(() => getBuildingGraph(buildingId), [buildingId]);
  const [activeFloor, setActiveFloor] = useState<FloorNumber>(selectedFloorNumber);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

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
  } = useIndoorNavigation(buildingGraph?.nodes || [], buildingGraph?.edges || []);

  const isShowingRoute = path.length > 0;

  const floorsInPath = useMemo(() => getFloorsInPath(path), [path]);
  const activeFloorSegment = useMemo(
    () => getPathSegmentForFloor(path, activeFloor),
    [path, activeFloor],
  );
  const floorPlanEntry = useMemo(
    () => getFloorPlanRegistryEntry(buildingId, activeFloor),
    [buildingId, activeFloor],
  );

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
    if (path.length > 0) {
      setActiveFloor(path[0].floor);
    }
  }, [path]);

  const showNoAccessibleRouteAlert = () => {
    Alert.alert(
      "No accessible route found",
      "This route cannot avoid stairs with the current building graph.",
    );
  };

  const onStartNavigation = () => {
    const result = handleStartNavigation();

    if (!result.ok) {
      if (result.reason === "missing_points") {
        Alert.alert(
          "Missing points",
          "Please select both a start and destination point.",
        );
      } else if (result.reason === "no_accessible_route") {
        showNoAccessibleRouteAlert();
      } else {
        Alert.alert(
          "No route found",
          "No indoor route could be generated for these points.",
        );
      }
    }
  };

  const onToggleAccessibility = () => {
    const result = toggleAccessibility();
    if (!result.ok && result.reason === "no_accessible_route") {
      showNoAccessibleRouteAlert();
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.mapContainer}>
        {floorPlanEntry ? (
          <FloorPlanDisplay floorPlanEntry={floorPlanEntry} path={activeFloorSegment} />
        ) : (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Map not available for Floor {activeFloor}.</Text>
          </View>
        )}
      </View>

      <View style={styles.floatingHeader}>
        <TouchableOpacity
          testID="indoor-back-button"
          onPress={navigation.goBack}
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>{buildingName}</Text>
          <Text style={styles.headerSubtitle}>Floor {activeFloor}</Text>
        </View>
      </View>

      {floorsInPath.length > 1 && (
        <View style={styles.floorButtonsContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.floorButtonsScroll}
          >
            {floorsInPath.map((floor) => (
              <TouchableOpacity
                key={floor}
                style={[
                  styles.floorButton,
                  activeFloor === floor && styles.floorButtonActive,
                ]}
                onPress={() => setActiveFloor(floor)}
              >
                <Text
                  style={[
                    styles.floorButtonText,
                    activeFloor === floor && styles.floorButtonTextActive,
                  ]}
                >
                  Floor {floor}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {!isShowingRoute && (
        <View style={[styles.floatingBottomCard, { bottom: 30 + keyboardHeight }]}>
          <Text style={styles.cardTitle}>Navigation Points</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Start Point</Text>
            <View style={styles.searchBar}>
              <MaterialIcons name="search" size={20} color="#999" />
              <TextInput
                testID="indoor-start-input"
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
                testID="indoor-destination-input"
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
            testID="indoor-start-navigation-button"
            style={styles.startNavigationButton}
            onPress={onStartNavigation}
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
      )}

      {isShowingRoute && (
        <View style={styles.accessibilityFloatingContainer}>
          <View style={styles.accessibilityIconBubble}>
            <MaterialIcons name="accessible" size={22} color="#111" />
          </View>
          <Switch
            value={isAccessibilityEnabled}
            onValueChange={onToggleAccessibility}
            trackColor={{ false: "#cfcfcf", true: "#5FD38D" }}
            thumbColor="white"
          />
        </View>
      )}
    </SafeAreaView>
  );
};

export default IndoorMapScreen;
