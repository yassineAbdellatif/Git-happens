// src/features/map/screens/IndoorMapScreen.tsx
import React, { useMemo, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
  Keyboard,
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
    // Fetch JSON map data based on the route params
  const floorPlanEntry = useMemo(() => {
    return getFloorPlanRegistryEntry(buildingId, selectedFloorNumber as any);
  }, [buildingId, selectedFloorNumber]);
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
    floorPlanEntry?.localizedNodes || [],
    floorPlanEntry?.edges || []
  );

  const [keyboardHeight, setKeyboardHeight] = useState(0);

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
          <FloorPlanDisplay floorPlanEntry={floorPlanEntry} path={path} />
        ) : (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              Map not available for Floor {selectedFloorNumber}.
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
          <Text style={styles.headerSubtitle}>Floor {selectedFloorNumber}</Text>
        </View>
      </View>

      {/* FLOATING BOTTOM NAVIGATION CARD */}
      {path.length === 0 && (
        <View style={[
          styles.floatingBottomCard,
          { bottom: 30 + keyboardHeight },
          ]}
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

            {startResults.length > 0 && (
            <ScrollView style={styles.resultsContainer}>
              {startResults.map((node) => (
                <TouchableOpacity
                  key={node.id}
                  onPress={() => selectStartNode(node)}
                  style={styles.resultItem}
                >
                  <Text>{node.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            )}
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

            {destinationResults.length > 0 && (
                <ScrollView style={styles.resultsContainer}>
                  {destinationResults.map((node) => (
                    <TouchableOpacity
                      key={node.id}
                      onPress={() => selectDestinationNode(node)}
                      style={styles.resultItem}
                    >
                      <Text>{node.label}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
          </View>

          <TouchableOpacity style={styles.startNavigationButton} onPress={handleStartNavigation}>
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  mapContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1, // Map is on the bottom
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "#666",
    fontSize: 16,
  },

  floatingHeader: {
    position: "absolute",
    top: 50,
    left: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    padding: 12,
    borderRadius: 12,
    zIndex: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  backButton: {
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#912338",
    fontWeight: "600",
  },

  floatingBottomCard: {
    position: "absolute",
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: "#912338", // Maroon background
    borderRadius: 24,
    padding: 20,
    zIndex: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  cardTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    color: "white",
    fontSize: 12,
    marginBottom: 6,
    marginLeft: 4,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: "#333",
  },
  swapIconContainer: {
    alignItems: "center",
    marginVertical: 4,
    zIndex: 2,
  },
  startNavigationButton: {
    backgroundColor: "#1976D2",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 50,
    borderRadius: 25,
    marginTop: 16,
  },
  startNavigationText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  resultsContainer: {
    backgroundColor: "white",
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 170,
  },

  resultItem: {
    padding: 10,
    marginLeft: 30,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
});

export default IndoorMapScreen;
