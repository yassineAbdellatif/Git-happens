import axios from "axios";
import { Platform } from "react-native";

// On Android emulator, the host machine is reachable at 10.0.2.2 (not localhost).
const getDefaultHost = () => (Platform.OS === "android" ? "10.0.2.2" : "localhost");

const getApiBaseUrl = () =>
  process.env.EXPO_PUBLIC_API_BASE_URL || `http://${getDefaultHost()}:3000`;

let httpClient: Pick<typeof axios, "get" | "post"> = axios;

export const __setMapApiHttpClientForTests = (
  client: Pick<typeof axios, "get" | "post">
) => {
  httpClient = client;
};

export const __resetMapApiHttpClientForTests = () => {
  httpClient = axios;
};

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
  const url = `${getApiBaseUrl()}/api/places/nearby`;
  
  const response = await httpClient.get(url, {
    params: { location: `${latitude},${longitude}`, radius, type, maxResults },
    timeout: 10000,
  });
  return response.data.results as POIResult[];
};

export type NearbyPoiType = "cafe" | "restaurant" | "library";

export interface NearbyPoiRequest {
  lat: number;
  lng: number;
  type: NearbyPoiType;
  radius?: number;
  limit?: number;
  keyword?: string;
}

export interface NearbyPoiResult {
  status: string;
  results: Array<{
    id: string;
    name: string;
    location: { lat: number; lng: number };
    address: string;
    types: string[];
    rating?: number;
    userRatingsTotal?: number;
    isOpenNow?: boolean;
  }>;
}

export const getRouteFromBackend = async (
  origin: string,
  destination: string,
  mode: string,
) => {

  const url = `${getApiBaseUrl()}/api/directions`;

  try {
    const response = await httpClient.get(url, {
      params: {
        origin, // "latitude,longitude"
        destination, // "latitude,longitude"
        mode, // "WALKING", "DRIVING", etc.
      },
      timeout: 10000, // 10 second limit before giving up
    });

    return response.data;
  } catch (error) {
    // Rethrow so the UI can catch it and show an alert
    throw error;
  }
};

export const getNearbyPlacesFromGoogle = async (
  request: NearbyPoiRequest
): Promise<NearbyPoiResult> => {
  const googleMapsApiKey =
    process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() || "";

  if (!googleMapsApiKey) {
    throw new Error("EXPO_PUBLIC_GOOGLE_MAPS_API_KEY is missing");
  }

  try {
    const response = await httpClient.post(
      "https://maps.googleapis.com/maps/api/place/nearbysearch/json",
      {},
      {
        params: {
          location: `${request.lat},${request.lng}`,
          type: request.type,
          radius: request.radius,
          keyword: request.keyword,
        },
        headers: { "X-API-Key": googleMapsApiKey },
        timeout: 10000,
      }
    );

    const status = response.data?.status;
    if (status === "REQUEST_DENIED") {
      throw new Error(
        response.data?.error_message ||
          "Google Places request denied. Check API key and Places API access."
      );
    }

    if (status !== "OK" && status !== "ZERO_RESULTS") {
      throw new Error(`Google Places failed with status: ${status}`);
    }

    const limit = request.limit ?? 10;
    const mappedResults = (response.data?.results || [])
      .slice(0, limit)
      .map((place: any) => ({
        id: place.place_id,
        name: place.name,
        location: {
          lat: place.geometry?.location?.lat,
          lng: place.geometry?.location?.lng,
        },
        address: place.vicinity || place.formatted_address || "",
        types: Array.isArray(place.types) ? place.types : [],
        rating: place.rating,
        userRatingsTotal: place.user_ratings_total,
        isOpenNow: place.opening_hours?.open_now,
      }));

    return {
      status,
      results: mappedResults,
    };
  } catch (error) {
    throw error;
  }
};
