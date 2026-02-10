// useMapLogic.ts
import { useState, useEffect, useRef } from "react";
import { Keyboard } from "react-native";
import * as Location from "expo-location";
import {
  SGW_REGION,
  LOYOLA_REGION,
  CONCORDIA_BUILDINGS,
  Building,
} from "../../../constants/buildings";
import { SHUTTLE_SCHEDULE } from "../../../constants/shuttleSchedule";
import { decodePolyline } from "../../../utils/polylineDecoder";
import { isPointInPolygon } from "geolib";
import { getRouteFromBackend } from "../../../services/mapApiService";

export const useMapLogic = () => {
  const mapRef = useRef<any>(null);

  // States
  const [currentRegion, setCurrentRegion] = useState(SGW_REGION);
  const [userLocation, setUserLocation] =
    useState<Location.LocationObjectCoords | null>(null);
  const [currentBuilding, setCurrentBuilding] = useState<Building | null>(null);
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredBuildings, setFilteredBuildings] = useState<Building[]>([]);

  const [isRouting, setIsRouting] = useState(false);
  const [transportMode, setTransportMode] = useState("WALKING");
  const [routeCoords, setRouteCoords] = useState<
    { latitude: number; longitude: number }[]
  >([]);

  // Navigation States
  const [routeSteps, setRouteSteps] = useState<any[]>([]);
  const [routeDistance, setRouteDistance] = useState("");
  const [routeDuration, setRouteDuration] = useState("");
  const [isNavigating, setIsNavigating] = useState(false);
  const [originType, setOriginType] = useState<
    "CURRENT" | "BUILDING" | "SEARCH" | null
  >(null);
  const [originCoords, setOriginCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [originLabel, setOriginLabel] = useState("My Location");
  const [originCampus, setOriginCampus] = useState<"SGW" | "LOYOLA" | null>(
    null,
  );
  const [nextShuttleTitle, setNextShuttleTitle] = useState("");
  const [nextShuttleSubtitle, setNextShuttleSubtitle] = useState("");

  /*
  Routing state vs Navigation state:
  - Routing: User is in the process of setting up a route (choosing origin, destination, mode)
  - Navigation: User has an active route displayed and is following it
  */

  // Helper: Reset Routing
  const resetRoutingState = () => {
    setOriginType(null);
    setOriginCoords(null);
    setOriginLabel("Choose starting point");
    setOriginCampus(null);
    setNextShuttleTitle("");
    setNextShuttleSubtitle("");
    setRouteCoords([]);
    setIsNavigating(false);
    setIsRouting(false);
  };

  // Location Tracking
  useEffect(() => {
    let isMounted = true;
    let intervalId: NodeJS.Timeout;

    const performUpdate = async () => {
      try {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        if (!isMounted) return;
        setUserLocation(location.coords);
        const found = CONCORDIA_BUILDINGS.find((b) =>
          isPointInPolygon(location.coords, b.coordinates),
        );
        setCurrentBuilding(found || null);
      } catch (e) {
        console.log("Location update failed:", e);
      }
    };

    const start = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        performUpdate();
        intervalId = setInterval(performUpdate, 2000);
      }
    };
    start();
    return () => {
      isMounted = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  // Handlers
  const handleRecenter = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          ...userLocation,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        },
        1000,
      );
    }
  };

  const toggleCampus = () => {
    const newRegion =
      currentRegion.latitude === SGW_REGION.latitude
        ? LOYOLA_REGION
        : SGW_REGION;
    setCurrentRegion(newRegion);
    mapRef.current?.animateToRegion(newRegion, 1000);
  };

  const handleBuildingPress = (building: Building) => {
    if (isNavigating) return; // Prevent changing selection while navigating
    setSelectedBuilding(building);
    resetRoutingState();
  };

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
    Keyboard.dismiss();
    setSelectedBuilding(building);
    resetRoutingState();
    setSearchQuery("");
    setFilteredBuildings([]);
    if (mapRef.current && building.coordinates.length > 0) {
      mapRef.current.animateToRegion(
        {
          ...building.coordinates[0],
          latitudeDelta: 0.003,
          longitudeDelta: 0.003,
        },
        1000,
      );
    }
  };

  const handleCancelNavigation = () => {
    setRouteCoords([]);
    setIsNavigating(false);
    setIsRouting(false);
  };

  useEffect(() => {
    if (originType === "CURRENT") {
      if (currentBuilding?.campus) {
        setOriginCampus(currentBuilding.campus);
        return;
      }

      if (userLocation) {
        const sgwDistance =
          Math.pow(userLocation.latitude - SGW_REGION.latitude, 2) +
          Math.pow(userLocation.longitude - SGW_REGION.longitude, 2);
        const loyolaDistance =
          Math.pow(userLocation.latitude - LOYOLA_REGION.latitude, 2) +
          Math.pow(userLocation.longitude - LOYOLA_REGION.longitude, 2);
        setOriginCampus(sgwDistance <= loyolaDistance ? "SGW" : "LOYOLA");
        return;
      }

      setOriginCampus(null);
    }
  }, [originType, currentBuilding, userLocation]);

  useEffect(() => {
    if (transportMode !== "SHUTTLE") {
      setNextShuttleTitle("");
      setNextShuttleSubtitle("");
      return;
    }

    if (!originCoords || !selectedBuilding) {
      setNextShuttleTitle("Select origin and destination");
      setNextShuttleSubtitle(
        "Shuttle schedules show after both campuses are set.",
      );
      return;
    }

    const destinationCampus = selectedBuilding.campus;
    if (!originCampus || !destinationCampus) {
      setNextShuttleTitle("Select origin and destination");
      setNextShuttleSubtitle(
        "Shuttle schedules show after both campuses are set.",
      );
      return;
    }

    if (originCampus === destinationCampus) {
      setNextShuttleTitle("Shuttle runs between campuses only");
      setNextShuttleSubtitle("Choose a destination on the other campus.");
      return;
    }

    const schedule =
      SHUTTLE_SCHEDULE.semesters[SHUTTLE_SCHEDULE.activeSemester]?.Schedule;
    if (!schedule) {
      setNextShuttleTitle("No schedule available");
      setNextShuttleSubtitle("Check back later for updates.");
      return;
    }

    const now = new Date();
    const dayIndex = now.getDay();
    const daySchedule =
      dayIndex >= 1 && dayIndex <= 4
        ? schedule["Monday-Thursday"]
        : dayIndex === 5
          ? schedule["Friday"]
          : null;

    if (!daySchedule) {
      setNextShuttleTitle("No shuttle service today");
      setNextShuttleSubtitle("Service runs Monday to Friday.");
      return;
    }

    const times =
      originCampus === "LOYOLA"
        ? daySchedule.departure_times_LOY
        : daySchedule.departure_times_SGW;

    const toMinutes = (time: string) => {
      const [hours, minutes] = time.split(":").map((value) => Number(value));
      return hours * 60 + minutes;
    };

    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const nextTime =
      times.find((time) => toMinutes(time) >= nowMinutes) || null;

    if (!nextTime) {
      setNextShuttleTitle("No more shuttles today");
      setNextShuttleSubtitle("Try again tomorrow.");
      return;
    }

    const minutesUntil = Math.max(0, toMinutes(nextTime) - nowMinutes);
    setNextShuttleTitle(`Next shuttle at ${nextTime}`);
    setNextShuttleSubtitle(
      `${originCampus} to ${destinationCampus} · in ${minutesUntil} min`,
    );
  }, [originCoords, selectedBuilding, transportMode, originCampus]);

  const handleFetchRoute = async (mode: string) => {
    console.log("Fetching route with mode:", mode);

    if (!originCoords || !selectedBuilding) return;
    try {
      const origin = `${originCoords.latitude},${originCoords.longitude}`;
      const destination = `${selectedBuilding.coordinates[0].latitude},${selectedBuilding.coordinates[0].longitude}`;
      const data = await getRouteFromBackend(origin, destination, mode);

      if (data.routes?.length > 0) {
        const route = data.routes[0];
        const decoded = decodePolyline(route.overview_polyline.points);
        setRouteCoords(decoded);
        setRouteDistance(route.legs[0].distance.text);
        setRouteDuration(route.legs[0].duration.text);
        setRouteSteps(data.processedRoute?.steps || []);
        setIsNavigating(true);

        mapRef.current?.fitToCoordinates(decoded, {
          edgePadding: { top: 50, right: 50, bottom: 300, left: 50 },
          animated: true,
        });
      }
    } catch (e) {
      alert("Backend connection failed.");
    }
  };

  return {
    mapRef,
    currentRegion,
    userLocation,
    currentBuilding,
    selectedBuilding,
    searchQuery,
    filteredBuildings,
    isRouting,
    transportMode,
    routeCoords,
    routeSteps,
    routeDistance,
    routeDuration,
    isNavigating,
    originType,
    originCoords,
    originLabel,
    setSelectedBuilding,
    setIsRouting,
    setTransportMode,
    setOriginType,
    setOriginCoords,
    setOriginLabel,
    setOriginCampus,
    handleRecenter,
    handleFetchRoute,
    toggleCampus,
    handleBuildingPress,
    handleSearch,
    handleSelectFromSearch,
    handleCancelNavigation,
    resetRoutingState,
    nextShuttleTitle,
    nextShuttleSubtitle,
  };
};
