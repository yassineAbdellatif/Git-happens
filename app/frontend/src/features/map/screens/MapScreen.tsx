import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  SafeAreaView,
} from "react-native";
import OutdoorView from "../components/OutDoorView";
import * as Location from "expo-location";
import { CONCORDIA_BUILDINGS, Building } from "../../../constants/buildings";
import { isPointInPolygon } from "geolib";
import { MaterialIcons } from "@expo/vector-icons"; // Ensure you have expo/vector-icons installed

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
  const [userLocation, setUserLocation] = useState<Location.LocationObjectCoords | null>(null);
  const [currentBuilding, setCurrentBuilding] = useState<Building | null>(null);
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);

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
          isPointInPolygon({ latitude, longitude }, b.coordinates)
        );

        setCurrentBuilding(buildingFound || null);
      } catch (error) {
        console.log("Location update failed:", error);
      }
    };

    const startLocationService = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      performManualUpdate();
      intervalId = setInterval(performManualUpdate, 2000); // Pulse every 2 seconds
    };

    startLocationService();

    return () => {
      isMounted = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  // --- Actions ---
  const handleRecenter = () => {
    // logic to recenter the map on the user's current location
    console.log("Recentering map to user location...");
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      }, 1000);
    }
  };

  const toggleCampus = () => {
    const newRegion = currentRegion.latitude === SGW_REGION.latitude ? LOYOLA_REGION : SGW_REGION;
    setCurrentRegion(newRegion);
    // Optional: fly the map camera to the new campus
    mapRef.current?.animateToRegion(newRegion, 1000);
  };

  const handleBuildingPress = (building: Building) => {
    setSelectedBuilding(building);
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
        />
      </View>

      <SafeAreaView style={styles.overlay} pointerEvents="box-none">
        {/* TOP SEARCH BAR */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Text style={styles.searchText}>Search for a building or room...</Text>
          </View>
        </View>

        {/* RIGHT-SIDE CONTROLS */}
        <View style={styles.rightControlsContainer}>
          {/* RECENTER BUTTON */}
          <TouchableOpacity style={styles.recenterButton} onPress={handleRecenter}>
            <MaterialIcons name="my-location" size={24} color="#912338" />
          </TouchableOpacity>

       {/* STATUS CARD */}
          <View style={styles.statusCard}>
            <Text style={styles.statusLabel}>CAMPUS</Text>
            <Text style={styles.statusValue}>
              {currentBuilding ? currentBuilding.campus : (currentRegion.latitude === SGW_REGION.latitude ? "SGW" : "LOY")}
            </Text>
            <View style={styles.divider} />
            <Text style={styles.statusLabel}>BUILDING</Text>
            <Text style={styles.statusValue}>{currentBuilding ? currentBuilding.id : "--"}</Text>
          </View>

          {/* CAMPUS TOGGLE */}
          <TouchableOpacity style={styles.toggleButton} onPress={toggleCampus}>
            <Text style={styles.toggleText}>
              {currentRegion.latitude === SGW_REGION.latitude ? "TO LOYOLA" : "TO SGW"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* BOTTOM SHEET */}
        <View style={styles.bottomSheetMock}>
          <View style={styles.dragHandle} />
          <Text style={styles.sheetTitle}>
            {selectedBuilding ? selectedBuilding.fullName : 
             (currentBuilding ? currentBuilding.fullName : 
             (currentRegion.latitude === SGW_REGION.latitude ? "SGW Campus" : "Loyola Campus"))}
          </Text>
          <Text style={styles.sheetSubtitle}>
            {selectedBuilding ? "Building Details & Services" : 
             (currentBuilding ? "You are currently in this building" : "Tap a building to see indoor maps")}
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  mapContainer: { ...StyleSheet.absoluteFillObject },
  overlay: { flex: 1, justifyContent: "space-between" },
  searchContainer: { padding: 20 },
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
  rightControlsContainer: {
    alignItems: "flex-end",
    paddingRight: 20,
    gap: 12,
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
  divider: { height: 1, backgroundColor: "#eee", width: "100%", marginVertical: 4 },
  toggleButton: {
    backgroundColor: "#912338",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    elevation: 4,
  },
  toggleText: { color: "white", fontWeight: "bold" },
  bottomSheetMock: {
    backgroundColor: "white",
    height: 140,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    alignItems: "center",
    elevation: 10,
  },
  dragHandle: { width: 40, height: 5, backgroundColor: "#ccc", borderRadius: 10, marginBottom: 15 },
  sheetTitle: { fontSize: 18, fontWeight: "bold", textAlign: 'center' },
  sheetSubtitle: { color: "#666", marginTop: 5, textAlign: 'center' },
});

export default MapScreen;