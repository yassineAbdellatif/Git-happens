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
  type LocationPoint = {
    type: "CURRENT" | "BUILDING" | "SEARCH" | null;
    coords: { latitude: number; longitude: number } | null;
    label: string;
    campus: "SGW" | "LOYOLA" | null;
  };

  // States
  const [origin, setOrigin] = useState<LocationPoint>({
    type: null,
    coords: null,
    label: "Choose starting point",
    campus: null,
  });

  const [destination, setDestination] = useState<LocationPoint>({
    type: null,
    coords: null,
    label: "Select Destination",
    campus: null,
  });

  const [currentRegion, setCurrentRegion] = useState(SGW_REGION);
  const [userLocation, setUserLocation] =
    useState<Location.LocationObjectCoords | null>(null);
  const [currentBuilding, setCurrentBuilding] = useState<Building | null>(null);
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(
    null
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
  const [nextShuttleTitle, setNextShuttleTitle] = useState("");
  const [nextShuttleSubtitle, setNextShuttleSubtitle] = useState("");

  /*
  Routing state vs Navigation state:
  - Routing: User is in the process of setting up a route (choosing origin, destination, mode)
  - Navigation: User has an active route displayed and is following it
  */

  // Helper: Reset Routing
  const resetRoutingState = () => {
    const resetRoutingState = () => {
      setOrigin({
        type: null,
        coords: null,
        label: "Choose starting point",
        campus: null,
      });

      setDestination({
        type: null,
        coords: null,
        label: "Select Destination",
        campus: null,
      });
    };

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
          isPointInPolygon(location.coords, b.coordinates)
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
        1000
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
          b.id.toLowerCase().includes(text.toLowerCase())
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
        1000
      );
    }
  };

  const handleCancelNavigation = () => {
    setRouteCoords([]);
    setRouteSegments([]);
    setIsNavigating(false);
    setIsRouting(false);
    setDestination({
      type: null,
      coords: null,
      label: "Select Destination",
      campus: null,
    });

    setOrigin({
      type: null,
      coords: null,
      label: "Choose starting point",
      campus: null,
    });
  };

  useEffect(() => {
    if (origin.type === "CURRENT") {
      const campus = getOriginCampusFromLocation(
        currentBuilding?.campus || null,
        userLocation,
        SGW_REGION,
        LOYOLA_REGION
      );

      setOrigin((prev) => ({
        ...prev,
        campus,
      }));
    }
  }, [origin.type, currentBuilding, userLocation]);

  useEffect(() => {
    if (transportMode !== "SHUTTLE") {
      setNextShuttleTitle("");
      setNextShuttleSubtitle("");
      return;
    }

    const destinationCampus = selectedBuilding?.campus || null;

    const shuttleInfo = getNextShuttleInfo(origin.campus, destinationCampus);

    setNextShuttleTitle(shuttleInfo.title);
    setNextShuttleSubtitle(shuttleInfo.subtitle);
  }, [origin.campus, selectedBuilding, transportMode]);

  const handleFetchRoute = async (mode: string) => {
    console.log("Fetching route with mode:", mode);

    if (!origin.coords || !destination.coords) return;

    try {
      if (mode === "SHUTTLE") {
        const originCampus = origin.campus;
        const originCoords = origin.coords;
        const destinationCampus =
          destination.campus || selectedBuilding?.campus;
        const destinationCoords =
          destination.coords || selectedBuilding?.coordinates?.[0] || null;

        if (
          !originCampus ||
          !destinationCampus ||
          !originCoords ||
          !destination.coords
        ) {
          alert("Select origin and destination campuses.");
          return;
        }

        if (originCampus === destinationCampus) {
          alert("Shuttle runs between campuses only.");
          return;
        }

        const shuttleRoute = await buildShuttleRoute({
          originCoords,
          destinationCoords,
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

      const originStr = `${origin.coords.latitude},${origin.coords.longitude}`;
      const destinationStr = `${destination.coords.latitude},${destination.coords.longitude}`;

      const data = await getRouteFromBackend(originStr, destinationStr, mode);

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
    origin,
    destination,
    setOrigin,
    setDestination,
    setSelectedBuilding,
    setIsRouting,
    setTransportMode,
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
