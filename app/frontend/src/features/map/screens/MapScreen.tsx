import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  SafeAreaView,
  TextInput,
  ScrollView,
} from "react-native";

import { SafeAreaProvider } from "react-native-safe-area-context"; //safe area view deprecated https://reactnative.dev/docs/safeareaview
import OutdoorView from "../components/OutDoorView";
import * as Location from "expo-location";
import { CONCORDIA_BUILDINGS, Building } from "../../../constants/buildings";
import { isPointInPolygon } from "geolib";
import { MaterialIcons } from "@expo/vector-icons";
import { decodePolyline } from "../../../utils/polylineDecoder";
import { getRouteFromBackend } from "../../../services/mapApiService";

const SGW_REGION = {
  latitude: 45.4971,
  longitude: -73.5788,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

const LOYOLA_REGION = {
  latitude: 45.4582,
  longitude: -73.6405,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

const MapScreen = () => {
  const mapRef = useRef<any>(null); // Reference for the MapView
  const [currentRegion, setCurrentRegion] = useState(SGW_REGION);
  const [userLocation, setUserLocation] =
    useState<Location.LocationObjectCoords | null>(null);
  const [currentBuilding, setCurrentBuilding] = useState<Building | null>(null);
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState(""); // Current text in search bar
  const [filteredBuildings, setFilteredBuildings] = useState<Building[]>([]); // Results to show in dropdown
  const [isRouting, setIsRouting] = useState(false); // For Directions feature
  const [transportMode, setTransportMode] = useState("WALKING"); // Commute mode

  const [routeCoords, setRouteCoords] = useState<
    { latitude: number; longitude: number }[]
  >([]); // Route polyline coordinates

  //added for step-by-step directions on bottom sheet
  const [routeSteps, setRouteSteps] = useState<any[]>([]);
  const [routeDistance, setRouteDistance] = useState<string>("");
  const [routeDuration, setRouteDuration] = useState<string>("");
  const [currentTransportMode, setCurrentTransportMode] = useState<string>("");

  const [isNavigating, setIsNavigating] = useState(false);

  // --- Location Tracking & Geofencing ---
  useEffect(() => {
    let isMounted = true;
    let intervalId: NodeJS.Timeout;

    const performManualUpdate = async () => {
      try {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        if (!isMounted) return;

        const { latitude, longitude } = location.coords;
        setUserLocation(location.coords); // Save for the recenter button

        console.log(`Live Position: ${latitude}, ${longitude}`);

        const buildingFound = CONCORDIA_BUILDINGS.find((b) =>
          isPointInPolygon({ latitude, longitude }, b.coordinates),
        );

        setCurrentBuilding(buildingFound || null);
      } catch (error) {
        console.log("Location update failed:", error);
      }
    };

    const startLocationService = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      performManualUpdate();

      intervalId = setInterval(performManualUpdate, 2000); // Pulse every 2 seconds
    };

    startLocationService();

    return () => {
      isMounted = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  // exit navigation mode if user changes selected building
  const handleCancelNavigation = () => {
    setRouteCoords([]); // Clears the  line
    setIsNavigating(false); // Brings back the Bottom Sheet/Right Controls
    setIsRouting(false); // Resets the top header to the Search Bar
  };

  const handleFetchRoute = async (mode: string) => {
    // Debug log
    console.log("Fetching route with mode:", mode);

    // Safety Check: Don't run if we don't have a user or a target
    if (!userLocation || !selectedBuilding) {
      console.warn("User location or building selection is missing.");
      return;
    }

    try {
      const origin = `${userLocation.latitude},${userLocation.longitude}`;
      const destination = `${selectedBuilding.coordinates[0].latitude},${selectedBuilding.coordinates[0].longitude}`;
      const data = await getRouteFromBackend(origin, destination, mode);

      console.log("Route data received:", data);

      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const leg = route.legs[0];

        const encodedPath = data.routes[0].overview_polyline.points;
        const decodedPath = decodePolyline(encodedPath);

        console.log("Decoded path coordinates:", decodedPath);

        console.log("Decoded path coordinates:", decodedPath);

        // saving processed steps from backend
        if (data.processedRoute && data.processedRoute.steps) {
          setRouteSteps(data.processedRoute.steps);
          console.log("Steps received:", data.processedRoute.steps);
        }

        // step by step instructions processing
        setRouteCoords(decodedPath);
        setRouteDistance(leg.distance.text);
        setRouteDuration(leg.duration.text);
        setCurrentTransportMode(mode);

        if (decodedPath.length > 0) {
          mapRef.current?.animateToRegion(
            {
              latitude: decodedPath[0].latitude,
              longitude: decodedPath[0].longitude,
              latitudeDelta: 0.01, // Zoom in closer to the start
              longitudeDelta: 0.01,
            },
            1000,
          );
        }

        setIsNavigating(true);
        // Auto-zoom the map to fit the new path
        mapRef.current?.fitToCoordinates(decodedPath, {
          edgePadding: { top: 50, right: 50, bottom: 300, left: 50 },
          animated: true,
        });
      }
    } catch (error) {
      console.error("Failed to draw path:", error);
      alert("Connection to backend failed. Check your IP address!");
      setIsNavigating(false);
    }
  };

  // --- Recenter Button ---
  const handleRecenter = () => {
    // logic to recenter the map on the user's current location
    console.log("Recentering map to user location...");
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        },
        1000,
      );
    }
  };

  // --- Campus Toggle ---
  const toggleCampus = () => {
    const newRegion =
      currentRegion.latitude === SGW_REGION.latitude
        ? LOYOLA_REGION
        : SGW_REGION;
    setCurrentRegion(newRegion);
    // Fly the map camera to the new campus
    mapRef.current?.animateToRegion(newRegion, 1000);
  };

  // --- Building Selection ---
  const handleBuildingPress = (building: Building) => {
    setSelectedBuilding(building);
  };

  // --- Search Logic ---
  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (text.trim().length > 0) {
      const results = CONCORDIA_BUILDINGS.filter(
        (b) =>
          b.fullName.toLowerCase().includes(text.toLowerCase()) ||
          b.id.toLowerCase().includes(text.toLowerCase()),
      );
      setFilteredBuildings(results);
    } else {
      setFilteredBuildings([]);
    }
  };

  const handleSelectFromSearch = (building: Building) => {
    setSelectedBuilding(building);
    setSearchQuery(""); // Clear the bar
    setFilteredBuildings([]); // Close dropdown

    // Focus the map on the building's first coordinate point
    if (mapRef.current && building.coordinates.length > 0) {
      mapRef.current.animateToRegion(
        {
          latitude: building.coordinates[0].latitude,
          longitude: building.coordinates[0].longitude,
          latitudeDelta: 0.003,
          longitudeDelta: 0.003,
        },
        1000,
      );
    }
  };

  return (
    <View style={styles.container}>
      {/* MAP LAYER */}
      <View style={styles.mapContainer}>
        <OutdoorView
          ref={mapRef}
          region={currentRegion}
          currentBuildingId={currentBuilding?.id}
          selectedBuildingId={selectedBuilding?.id}
          onBuildingPress={handleBuildingPress}
          onMapPress={() => setSelectedBuilding(null)}
          routeCoords={routeCoords}
          transportMode=""
        />
      </View>

      <SafeAreaProvider style={styles.overlay} pointerEvents="box-none">
        {/* TOP SEARCH BAR */}
        <View style={styles.searchContainer}>
          {!isRouting ? (
            !isNavigating && (
              /* DEFAULT SEARCH BAR */
              <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                  <TextInput
                    testID="search-input"
                    style={styles.searchInput}
                    placeholder="Search for a building or room..."
                    placeholderTextColor="#999"
                    value={searchQuery}
                    onChangeText={handleSearch}
                  />
                </View>

                {/* DROPDOWN RESULTS */}
                {filteredBuildings.length > 0 && (
                  <View style={styles.dropdown}>
                    <ScrollView keyboardShouldPersistTaps="handled">
                      {filteredBuildings.map((b) => (
                        <TouchableOpacity
                          key={b.id}
                          testID={`search-result-${b.id}`}
                          style={styles.dropdownItem}
                          onPress={() => handleSelectFromSearch(b)}
                        >
                          <Text style={styles.dropdownText}>{b.fullName}</Text>
                          <Text style={styles.dropdownSubtext}>
                            {b.id} - {b.campus} Campus
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>
            )
          ) : (
            /* ROUTE HEADER */
            <View style={styles.routeHeader}>
              <TouchableOpacity
                style={styles.closeButton}
                // Change this onPress:
                onPress={
                  isNavigating
                    ? handleCancelNavigation
                    : () => setIsRouting(false)
                }
              >
                <MaterialIcons
                  name={isNavigating ? "arrow-back" : "close"}
                  size={24}
                  color="#333"
                />
              </TouchableOpacity>

              <View style={styles.routeInputs}>
                <View style={styles.inputRow}>
                  <MaterialIcons name="my-location" size={18} color="#4285F4" />
                  <Text style={styles.routeTextStatic}>My Location</Text>
                </View>

                <View style={styles.routeDivider} />

                <View style={styles.inputRow}>
                  <MaterialIcons name="place" size={18} color="#912338" />
                  <Text style={styles.routeTextStatic}>
                    {selectedBuilding?.fullName || "Select destination"}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>
        {/* RIGHT-SIDE CONTROLS */}
        {!isNavigating && (
          <View style={styles.rightControlsContainer}>
            {/* RECENTER BUTTON */}
            <TouchableOpacity
              testID="recenter-button"
              style={styles.recenterButton}
              onPress={handleRecenter}
            >
              <MaterialIcons name="my-location" size={24} color="#912338" />
            </TouchableOpacity>

            {/* STATUS CARD */}
            <View style={styles.statusCard}>
              <Text style={styles.statusLabel}>CAMPUS</Text>
              <Text style={styles.statusValue}>
                {currentBuilding
                  ? currentBuilding.campus
                  : currentRegion.latitude === SGW_REGION.latitude
                    ? "SGW"
                    : "LOY"}
              </Text>
              <View style={styles.divider} />
              <Text style={styles.statusLabel}>BUILDING</Text>
              <Text style={styles.statusValue}>
                {currentBuilding ? currentBuilding.id : "--"}
              </Text>
            </View>

            {/* CAMPUS TOGGLE */}
            <TouchableOpacity
              testID="campus-toggle-button"
              style={styles.toggleButton}
              onPress={toggleCampus}
            >
              <Text style={styles.toggleText}>
                {currentRegion.latitude === SGW_REGION.latitude
                  ? "TO LOYOLA"
                  : "TO SGW"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
        {/* BOTTOM SHEET */}
        {selectedBuilding && !isNavigating && (
          <View
            style={[
              styles.bottomSheetMock,
              isRouting && { minHeight: 220, height: "auto" }, // Grow naturally in routing mode
            ]}
          >
            <View style={styles.dragHandle} />

            {/* ScrollView ensures content is never cut off on smaller screens */}
            <ScrollView
              style={{ width: "100%" }}
              contentContainerStyle={{ alignItems: "center" }}
              showsVerticalScrollIndicator={false}
            >
              {!isRouting ? (
                // --- DEFAULT UI ---
                <>
                  <Text style={styles.sheetTitle}>
                    {selectedBuilding
                      ? selectedBuilding.fullName
                      : "Select a building"}
                  </Text>
                  {selectedBuilding && (
                    <TouchableOpacity
                      testID="directions-button"
                      style={styles.directionsButton}
                      onPress={() => setIsRouting(true)}
                    >
                      <MaterialIcons
                        name="directions"
                        size={20}
                        color="white"
                      />
                      <Text style={styles.directionsButtonText}>
                        Directions
                      </Text>
                    </TouchableOpacity>
                  )}
                  <Text style={styles.sheetSubtitle}>
                    Tap a building to see indoor maps
                  </Text>
                </>
              ) : (
                // --- ROUTING UI ---
                <View style={styles.routingSheetContent}>
                  <Text style={styles.routingTitle}>Choose Travel Mode</Text>

                  <View style={styles.modeContainer}>
                    {[
                      { id: "WALKING", icon: "directions-walk" },
                      { id: "DRIVING", icon: "directions-car" },
                      { id: "TRANSIT", icon: "directions-bus" },
                      { id: "SHUTTLE", icon: "airport-shuttle" },
                    ].map((mode) => (
                      <TouchableOpacity
                        key={mode.id}
                        testID={`travel-mode-${mode.id.toLowerCase()}`}
                        style={[
                          styles.modeButton,
                          transportMode === mode.id && styles.activeModeButton,
                        ]}
                        onPress={() => setTransportMode(mode.id)}
                      >
                        <MaterialIcons
                          name={mode.icon as any}
                          size={24}
                          color={
                            transportMode === mode.id ? "white" : "#912338"
                          }
                        />
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Shuttle info only shows if SHUTTLE is selected */}
                  {transportMode === "SHUTTLE" && (
                    <View style={styles.shuttleInfo}>
                      <Text style={styles.shuttleText}>
                        Next Shuttle: 12:45 PM (In 12 mins)
                      </Text>
                      <Text style={styles.shuttleSubtext}>
                        Departs from outside Hall Building
                      </Text>
                    </View>
                  )}

                  <TouchableOpacity
                    testID="start-navigation-button"
                    style={styles.startButton}
                    onPress={() => handleFetchRoute(transportMode)}
                  >
                    <Text style={styles.startButtonText}>Start Navigation</Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </View>
        )}
        {/*step by step instructions*/}
        {isNavigating && (
          <View style={styles.navigationSheet}>
            <View style={styles.dragHandle} />

            {/* Route Summary Header (Existing Code) */}
            <View style={styles.routeSummary}>
              <View style={styles.summaryRow}>
                <MaterialIcons
                  name={
                    currentTransportMode === "WALKING"
                      ? "directions-walk"
                      : currentTransportMode === "DRIVING"
                        ? "directions-car"
                        : currentTransportMode === "TRANSIT"
                          ? "directions-bus"
                          : "airport-shuttle"
                  }
                  size={24}
                  color="#912338"
                />
                <View style={styles.summaryInfo}>
                  <Text style={styles.durationText}>{routeDuration}</Text>
                  <Text style={styles.distanceText}>{routeDistance}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.endNavButton}
                onPress={handleCancelNavigation}
              >
                <Text style={styles.endNavText}>End</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.divider} />

            <Text style={styles.stepsHeader}>Steps</Text>

            <ScrollView style={styles.stepsContainer}>
              {routeSteps.map((step, index) => (
                <View key={index} style={styles.stepItem}>
                  {/* Direction Icon based on maneuver if available, or a dot */}
                  <MaterialIcons
                    name={
                      step.maneuver.includes("left")
                        ? "turn-left"
                        : step.maneuver.includes("right")
                          ? "turn-right"
                          : "straight"
                    }
                    size={20}
                    color="#666"
                    style={{ marginTop: 2 }}
                  />
                  <View style={styles.stepTextContainer}>
                    <Text style={styles.stepInstruction}>
                      {step.instruction}
                    </Text>
                    <Text style={styles.stepDistance}>{step.distance}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        )}
      </SafeAreaProvider>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "transparent",
  },
  // --- TOP UI ---
  searchContainer: {
    position: "absolute",
    top: 50, // Adjust for Notch/SafeArea
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    zIndex: 10,
  },
  searchBar: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
  },
  searchText: { color: "#999" },
  searchInput: {
    fontSize: 16,
    color: "#333",
  },
  routeHeader: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
  },
  routeTextStatic: {
    fontSize: 16,
    color: "#333",
  },
  routeDivider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 8,
  },

  // --- RIGHT SIDE CONTROLS ---
  rightControlsContainer: {
    position: "absolute",
    right: 20,
    bottom: 240, // Anchor it above the bottom sheet
    alignItems: "flex-end",
    gap: 12,
    zIndex: 5,
  },
  recenterButton: {
    backgroundColor: "white",
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  statusCard: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 12,
    minWidth: 85,
    alignItems: "center",
    elevation: 5,
    borderLeftWidth: 4,
    borderLeftColor: "#912338",
  },
  statusLabel: { fontSize: 9, fontWeight: "700", color: "#888" },
  statusValue: { fontSize: 14, fontWeight: "bold", color: "#912338" },
  divider: {
    height: 1,
    backgroundColor: "#eee",
    width: "100%",
    marginVertical: 4,
  },
  toggleButton: {
    backgroundColor: "#912338",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    elevation: 4,
  },
  toggleText: { color: "white", fontWeight: "bold" },

  // --- BOTTOM SHEET UI ---
  bottomSheetMock: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    minHeight: 140,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40, // Safety for home bar
    alignItems: "center",
    elevation: 10,
    zIndex: 10,
  },
  dragHandle: {
    width: 40,
    height: 5,
    backgroundColor: "#ccc",
    borderRadius: 10,
    marginBottom: 15,
  },
  sheetTitle: { fontSize: 18, fontWeight: "bold", textAlign: "center" },
  sheetSubtitle: { color: "#666", marginTop: 5, textAlign: "center" },

  // --- DROPDOWN & BUTTONS ---
  dropdown: {
    backgroundColor: "white",
    borderRadius: 10,
    marginTop: 10,
    elevation: 5,
    maxHeight: 300,
  },
  dropdownItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  dropdownText: { fontSize: 16, fontWeight: "600", color: "#333" },
  dropdownSubtext: { fontSize: 12, color: "#999", marginTop: 4 },
  directionsButton: {
    backgroundColor: "#912338",
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    gap: 8,
    marginTop: 10,
  },
  directionsButtonText: { color: "white", fontWeight: "bold", fontSize: 14 },

  // --- ROUTING CONTENT ---
  routingSheetContent: {
    width: "100%",
    alignItems: "center",
  },
  routingTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 15,
  },
  modeContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 20,
  },
  modeButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  activeModeButton: {
    backgroundColor: "#912338",
    borderColor: "#912338",
  },
  shuttleInfo: {
    backgroundColor: "#fff5f5",
    padding: 10,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
    marginBottom: 15,
  },
  shuttleText: { color: "#912338", fontWeight: "bold" },
  shuttleSubtext: { fontSize: 11, color: "#666" },
  startButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
  },
  startButtonText: { color: "white", fontWeight: "bold", fontSize: 16 },
  closeButton: {
    padding: 8,
  },
  routeInputs: {
    marginTop: 10,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  //step by step instruction elements
  routeSummary: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  summaryInfo: {
    flexDirection: "column",
  },
  durationText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  distanceText: {
    fontSize: 14,
    color: "#666",
  },
  endNavButton: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  endNavText: {
    color: "#912338",
    fontWeight: "bold",
  },
  destinationInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  destinationText: {
    fontSize: 16,
    color: "#333",
  },
  navigationSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
    elevation: 10,
    zIndex: 10,
    maxHeight: "60%",
  },
  stepsHeader: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginTop: 10,
    marginBottom: 10,
  },
  stepsContainer: {
    marginTop: 5,
  },
  stepItem: {
    flexDirection: "row",
    marginBottom: 15,
    alignItems: "flex-start",
    gap: 10,
  },
  stepTextContainer: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    paddingBottom: 10,
  },
  stepInstruction: {
    fontSize: 14,
    color: "#333",
    marginBottom: 4,
    flexWrap: "wrap",
  },
  stepDistance: {
    fontSize: 12,
    color: "#999",
  },
});

export default MapScreen;
