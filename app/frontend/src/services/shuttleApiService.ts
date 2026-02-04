import axios from "axios";
import { ShuttleSchedule, ShuttleRoute } from "../types/shuttle";

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:3000";

/**
 * Get the next shuttle schedule for a specific route
 */
export const getShuttleSchedule = async (
  routeId: string,
): Promise<ShuttleSchedule> => {
  const url = `${API_BASE_URL}/api/shuttle/schedule`;
  console.log(`Requesting shuttle schedule from: ${url}`);

  try {
    const response = await axios.get(url, {
      params: { routeId },
      timeout: 10000,
    });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch shuttle schedule:", error);
    throw error;
  }
};

/**
 * Get all upcoming shuttle departures for a route
 */
export const getShuttleDepartures = async (
  routeId: string,
  hoursAhead: number = 2,
): Promise<string[]> => {
  const url = `${API_BASE_URL}/api/shuttle/departures`;
  console.log(`Requesting shuttle departures from: ${url}`);

  try {
    const response = await axios.get(url, {
      params: { routeId, hoursAhead },
      timeout: 10000,
    });
    return response.data.departures;
  } catch (error) {
    console.error("Failed to fetch shuttle departures:", error);
    throw error;
  }
};

/**
 * Get all available shuttle routes
 */
export const getShuttleRoutes = async (): Promise<ShuttleRoute[]> => {
  const url = `${API_BASE_URL}/api/shuttle/routes`;
  console.log(`Requesting shuttle routes from: ${url}`);

  try {
    const response = await axios.get(url, {
      timeout: 10000,
    });
    return response.data.routes;
  } catch (error) {
    console.error("Failed to fetch shuttle routes:", error);
    throw error;
  }
};

/**
 * Format minutes until departure to human-readable format
 */
export const formatMinutesUntilDeparture = (minutes: number): string => {
  if (minutes < 1) {
    return "Departing now";
  }
  if (minutes < 60) {
    return `In ${minutes} min${minutes > 1 ? "s" : ""}`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `In ${hours}h ${mins}m`;
};

/**
 * Format departure time to readable format
 */
export const formatDepartureTime = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};
