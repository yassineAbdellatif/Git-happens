import { CalendarEvent, NextClassInfo } from "../types/calendarTypes";
import { CONCORDIA_BUILDINGS } from "../constants/buildings";

export type NextClassStatus =
  | { kind: "found"; data: NextClassInfo }
  | { kind: "no_upcoming" }
  | { kind: "location_unavailable"; data: NextClassInfo }
  | { kind: "building_unknown"; data: NextClassInfo }
  | { kind: "api_error"; message: string };

export const USER_MESSAGES: Record<Exclude<NextClassStatus["kind"], "found">, string> = {
  no_upcoming: "No upcoming classes",
  location_unavailable: "Location not available",
  building_unknown: "Building not found on campus map",
  api_error: "Could not load calendar events",
};

/**
 * Takes a NextClassInfo | null result from findNextClass() and classifies it
 * into a status enum the UI can switch on without worrying about null checks.
 */
export const classifyNextClass = (
  result: NextClassInfo | null
): NextClassStatus => {
  if (!result) return { kind: "no_upcoming" };

  if (!result.location) {
    return { kind: "location_unavailable", data: result };
  }

  const known = CONCORDIA_BUILDINGS.some(
    (b) => b.id === result.location!.building
  );
  if (!known) {
    return { kind: "building_unknown", data: result };
  }

  return { kind: "found", data: result };
};

/**
 * Build an api_error status from a caught exception.
 */
export const apiErrorStatus = (error: unknown): NextClassStatus => {
  const message =
    error instanceof Error ? error.message : "Unknown error occurred";
  return { kind: "api_error", message };
};
