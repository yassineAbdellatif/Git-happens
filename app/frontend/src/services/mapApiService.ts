import axios from "axios";
import { Platform } from "react-native";

// On Android emulator, the host machine is reachable at 10.0.2.2 (not localhost).
const DEFAULT_HOST = Platform.OS === "android" ? "10.0.2.2" : "localhost";
const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL || `http://${DEFAULT_HOST}:3000`;

export interface POIResult {
  placeId: string;
  name: string;
  vicinity: string;
  rating: number | null;
  userRatingsTotal: number;
  location: { latitude: number; longitude: number };
  icon: string | null;
  openNow: boolean | null;
}

export const getNearbyPlaces = async (
  latitude: number,
  longitude: number,
  type: string,
  maxResults = 10,
  radius = 1500,
): Promise<POIResult[]> => {
  const url = `${API_BASE_URL}/api/places/nearby`;
  
  const response = await axios.get(url, {
    params: { location: `${latitude},${longitude}`, radius, type, maxResults },
    timeout: 10000,
  });
  console.log("Received nearby places from backend:", response.data);
  return response.data.results as POIResult[];
};

export const getRouteFromBackend = async (
  origin: string,
  destination: string,
  mode: string,
) => {

  const url = `${API_BASE_URL}/api/directions`;
  console.log(`Requesting route from backend at: ${url}`);

  try {
    const response = await axios.get(url, {
      params: {
        origin, // "latitude,longitude"
        destination, // "latitude,longitude"
        mode, // "WALKING", "DRIVING", etc.
      },
      timeout: 10000, // 10 second limit before giving up
    });

    console.log("Received response from backend:", response.data);
    return response.data;
  } catch (error) {
    console.error("Failed to connect to backend:", error);
    // Rethrow so the UI can catch it and show an alert
    throw error;
  }
};
