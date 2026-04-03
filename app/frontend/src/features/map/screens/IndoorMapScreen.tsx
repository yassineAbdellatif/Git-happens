// src/features/map/screens/IndoorMapScreen.tsx
import React, { useMemo, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Keyboard,
  ScrollView,
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

  const buildingGraph = useMemo(() => {
    return getBuildingGraph(buildingId);
  }, [buildingId]);

  const [activeFloor, setActiveFloor] = useState<FloorNumber>(selectedFloorNumber);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const {
    startPoint,
    destinationPoint,
    startResults,
    destinationResults,
    path,
    handleStartSearch,
    handleDestinationSearch,
    selectStartNode,
    selectDestinationNode,
    handleStartNavigation,
    swapPoints,
  } = useIndoorNavigation(
    buildingGraph?.nodes || [],
    buildingGraph?.edges || []
  );

  const floorsInPath = useMemo(() => {
    return getFloorsInPath(path);
  }, [path]);

  const activeFloorSegment = useMemo(() => {
    return getPathSegmentForFloor(path, activeFloor);
  }, [path, activeFloor]);

  const floorPlanEntry = useMemo(() => {
    return getFloorPlanRegistryEntry(buildingId, activeFloor);
  }, [buildingId, activeFloor]);

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
      {/* MAP LAYER */}
      <View style={styles.mapContainer}>
        {floorPlanEntry ? (
          <FloorPlanDisplay
            floorPlanEntry={floorPlanEntry}
            path={activeFloorSegment}
          />
        ) : (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              Map not available for Floor {activeFloor}.
            </Text>
          </View>
        )}
      </View>

      {/* FLOATING TOP HEADER */}
      <View style={styles.floatingHeader}>
        <TouchableOpacity
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

      {/* FLOOR BUTTONS - Show only when path spans multiple floors */}
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

      {/* FLOATING BOTTOM NAVIGATION CARD */}
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

          {/* Using SearchResults component */}
          <SearchResults results={startResults} onSelectNode={selectStartNode} />
        </View>

        {/* Swap Arrow Icon */}
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

          <SearchResults results={destinationResults} onSelectNode={selectDestinationNode} />
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
    </SafeAreaView>
  );
};

export default IndoorMapScreen;