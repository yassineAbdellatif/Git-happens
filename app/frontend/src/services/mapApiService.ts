import axios from "axios";

// Read API base URL from environment variable.
// Resolve at call-time so tests can override process.env per suite.
const getApiBaseUrl = (): string =>
  process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:3000";

export const getRouteFromBackend = async (
  origin: string,
  destination: string,
  mode: string,
) => {
  const url = `${getApiBaseUrl()}/api/directions`;
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