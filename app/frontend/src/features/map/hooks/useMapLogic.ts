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
import {
  getNextShuttleInfo,
  getOriginCampusFromLocation,
  buildShuttleRoute,
} from "../utils/shuttleLogic";
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
  const [routeSegments, setRouteSegments] = useState<
    { mode: string; coords: { latitude: number; longitude: number }[] }[]
  >([]);

  // Navigation States
  const [routeSteps, setRouteSteps] = useState<any[]>([]);
  const [routeDistance, setRouteDistance] = useState("");
  const [routeDuration, setRouteDuration] = useState("");
  const [isNavigating, setIsNavigating] = useState(false);
  const [originType, setOriginType] = useState<
    "CURRENT" | "BUILDING" | "SEARCH" | null
  >(null);
  const [destinationType, setDestinationType] = useState<
    "CURRENT" | "BUILDING" | "SEARCH" | null
  >(null);
  const [originCoords, setOriginCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [destinationCoords, setDestinationCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [originLabel, setOriginLabel] = useState("My Location");
  const [destinationLabel, setDestinationLabel] = useState("My Location");
  const [originCampus, setOriginCampus] = useState<"SGW" | "LOYOLA" | null>(
    null,
  );
  const [destinationCampus, setDestinationCampus] = useState<"SGW" | "LOYOLA" | null>(
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
    setDestinationType(null);
    setDestinationCoords(null);
    setDestinationLabel("Select Destination");
    setDestinationCampus(null);
    setNextShuttleTitle("");
    setNextShuttleSubtitle("");
    setRouteCoords([]);
    setRouteSegments([]);
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
    setRouteSegments([]);
    setIsNavigating(false);
    setIsRouting(false);
    setDestinationCoords(null);
    setDestinationType(null);
    setDestinationLabel("Select destination");
    setOriginCoords(null);
    setOriginType(null);
    setOriginLabel("Choose starting point");

  };
  
  useEffect(() => {
    if (originType === "CURRENT") {
      setOriginCampus(
        getOriginCampusFromLocation(
          currentBuilding?.campus || null,
          userLocation,
          SGW_REGION,
          LOYOLA_REGION,
        ),
      );
    }
  }, [originType, currentBuilding, userLocation]);

  useEffect(() => {
    if (transportMode !== "SHUTTLE") {
      setNextShuttleTitle("");
      setNextShuttleSubtitle("");
      return;
    }

    const destinationCampus = selectedBuilding?.campus || null;
    const shuttleInfo = getNextShuttleInfo(originCampus, destinationCampus);
    setNextShuttleTitle(shuttleInfo.title);
    setNextShuttleSubtitle(shuttleInfo.subtitle);
  }, [originCoords, selectedBuilding, transportMode, originCampus]);

  const handleFetchRoute = async (mode: string) => {
    console.log("Fetching route with mode:", mode);

    if (!originCoords || !destinationCoords) return;
    try {
      if (mode === "SHUTTLE") {
        const destinationCampus = selectedBuilding.campus || null;
        if (!originCampus || !destinationCampus) {
          alert("Select origin and destination campuses.");
          return;
        }

        if (originCampus === destinationCampus) {
          alert("Shuttle runs between campuses only.");
          return;
        }

        const shuttleRoute = await buildShuttleRoute({
          originCoords,
          destinationCoords: selectedBuilding.coordinates[0],
          originCampus,
          destinationCampus,
        });

        if (!shuttleRoute) {
          alert("Unable to calculate shuttle route.");
          return;
        }

        setRouteCoords(shuttleRoute.coords);
        setRouteSegments(shuttleRoute.segments || []);
        setRouteDistance(shuttleRoute.distance);
        setRouteDuration(shuttleRoute.duration);
        setRouteSteps(shuttleRoute.steps);
        setIsNavigating(true);

        mapRef.current?.fitToCoordinates(shuttleRoute.coords, {
          edgePadding: { top: 50, right: 50, bottom: 300, left: 50 },
          animated: true,
        });
        return;
      }

      const origin = `${originCoords.latitude},${originCoords.longitude}`;
      const destination = `${destinationCoords.latitude},${destinationCoords.longitude}`;
      const data = await getRouteFromBackend(origin, destination, mode);

      if (data.routes?.length > 0) {
        const route = data.routes[0];
        const decoded = decodePolyline(route.overview_polyline.points);
        setRouteCoords(decoded);
        setRouteSegments([]);
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
    routeSegments,
    routeSteps,
    routeDistance,
    routeDuration,
    isNavigating,
    originType,
    originCoords,
    originLabel,
    destinationType,
    destinationCoords,
    destinationLabel,
    setSelectedBuilding,
    setIsRouting,
    setTransportMode,
    setOriginType,
    setOriginCoords,
    setOriginLabel,
    setOriginCampus,
    setDestinationType,
    setDestinationCoords,
    setDestinationLabel,
    setDestinationCampus,
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
