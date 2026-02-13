import { SHUTTLE_SCHEDULE } from "../../../constants/shuttleSchedule";
import { shuttleStops } from "../../../constants/shuttleStops";
import { decodePolyline } from "../../../utils/polylineDecoder";
import { getRouteFromBackend } from "../../../services/mapApiService";

type Campus = "SGW" | "LOYOLA";

export const SHUTTLE_TRAVEL_MINUTES = 40;

type ShuttleResult = {
  title: string;
  subtitle: string;
};

export const getNextShuttleInfo = (
  originCampus: Campus | null,
  destinationCampus: Campus | null,
  now: Date = new Date(),
): ShuttleResult => {
  if (!originCampus || !destinationCampus) {
    return {
      title: "Select origin and destination",
      subtitle: "Shuttle schedules show after both campuses are set.",
    };
  }

  if (originCampus === destinationCampus) {
    return {
      title: "Shuttle runs between campuses only",
      subtitle: "Choose a destination on the other campus.",
    };
  }

  const schedule =
    SHUTTLE_SCHEDULE.semesters[SHUTTLE_SCHEDULE.activeSemester]?.Schedule;
  if (!schedule) {
    return {
      title: "No schedule available",
      subtitle: "Check back later for updates.",
    };
  }

  const dayIndex = now.getDay();
  const daySchedule =
    dayIndex >= 1 && dayIndex <= 4
      ? schedule["Monday-Thursday"]
      : dayIndex === 5
        ? schedule["Friday"]
        : null;

  if (!daySchedule) {
    return {
      title: "No shuttle service today",
      subtitle: "Service runs Monday to Friday.",
    };
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
  const nextTime = times.find((time) => toMinutes(time) >= nowMinutes) || null;

  if (!nextTime) {
    return {
      title: "No more shuttles today",
      subtitle: "Try again tomorrow.",
    };
  }

  const minutesUntil = Math.max(0, toMinutes(nextTime) - nowMinutes);
  return {
    title: `Next shuttle at ${nextTime}`,
    subtitle: `${originCampus} to ${destinationCampus} · in ${minutesUntil} min`,
  };
};

type Coordinates = {
  latitude: number;
  longitude: number;
};

type RegionCenter = {
  latitude: number;
  longitude: number;
};

export const getOriginCampusFromLocation = (
  currentBuildingCampus: Campus | null,
  userLocation: Coordinates | null,
  sgwRegion: RegionCenter,
  loyolaRegion: RegionCenter,
): Campus | null => {
  if (currentBuildingCampus) {
    return currentBuildingCampus;
  }

  if (!userLocation) {
    return null;
  }

  const sgwDistance =
    Math.pow(userLocation.latitude - sgwRegion.latitude, 2) +
    Math.pow(userLocation.longitude - sgwRegion.longitude, 2);
  const loyolaDistance =
    Math.pow(userLocation.latitude - loyolaRegion.latitude, 2) +
    Math.pow(userLocation.longitude - loyolaRegion.longitude, 2);

  return sgwDistance <= loyolaDistance ? "SGW" : "LOYOLA";
};

type ShuttleRouteInput = {
  originCoords: Coordinates;
  destinationCoords: Coordinates;
  originCampus: Campus;
  destinationCampus: Campus;
};

type ShuttleRouteResult = {
  coords: Coordinates[];
  steps: { instruction: string; distance: string; duration: string }[];
  distance: string;
  duration: string;
};

export const buildShuttleRoute = async (
  input: ShuttleRouteInput,
): Promise<ShuttleRouteResult | null> => {
  const originStop = shuttleStops[input.originCampus];
  const destinationStop = shuttleStops[input.destinationCampus];

  const origin = `${input.originCoords.latitude},${input.originCoords.longitude}`;
  const destination = `${input.destinationCoords.latitude},${input.destinationCoords.longitude}`;
  const originStopCoords = `${originStop.latitude},${originStop.longitude}`;
  const destinationStopCoords = `${destinationStop.latitude},${destinationStop.longitude}`;

  const [walkToStop, shuttleLeg, walkToDestination] = await Promise.all([
    getRouteFromBackend(origin, originStopCoords, "WALKING"),
    getRouteFromBackend(originStopCoords, destinationStopCoords, "DRIVING"),
    getRouteFromBackend(destinationStopCoords, destination, "WALKING"),
  ]);

  const getLeg = (data: any) => data.routes?.[0]?.legs?.[0] || null;
  const getPolyline = (data: any) =>
    data.routes?.[0]?.overview_polyline?.points || "";

  const walkToStopLeg = getLeg(walkToStop);
  const shuttleLegData = getLeg(shuttleLeg);
  const walkToDestinationLeg = getLeg(walkToDestination);

  if (!walkToStopLeg || !shuttleLegData || !walkToDestinationLeg) {
    return null;
  }

  const walkToStopCoords = decodePolyline(getPolyline(walkToStop));
  const shuttleCoords = decodePolyline(getPolyline(shuttleLeg));
  const walkToDestinationCoords = decodePolyline(
    getPolyline(walkToDestination),
  );

  const combinedCoords = [
    ...walkToStopCoords,
    ...shuttleCoords,
    ...walkToDestinationCoords,
  ];

  const walkingSteps = walkToStop.processedRoute?.steps || [];
  const shuttleStep = {
    instruction: `Take shuttle from ${input.originCampus} stop to ${input.destinationCampus} stop`,
    distance: shuttleLegData.distance?.text || "",
    duration: `${SHUTTLE_TRAVEL_MINUTES} min`,
  };
  const destinationSteps = walkToDestination.processedRoute?.steps || [];
  const combinedSteps = [...walkingSteps, shuttleStep, ...destinationSteps];

  const totalDistanceMeters =
    (walkToStopLeg.distance?.value || 0) +
    (shuttleLegData.distance?.value || 0) +
    (walkToDestinationLeg.distance?.value || 0);
  const totalDurationMinutes =
    Math.round((walkToStopLeg.duration?.value || 0) / 60) +
    SHUTTLE_TRAVEL_MINUTES +
    Math.round((walkToDestinationLeg.duration?.value || 0) / 60);

  const formatDistance = (meters: number) => {
    if (meters >= 1000) {
      const km = meters / 1000;
      const rounded = Math.round(km * 10) / 10;
      return `${rounded} km`;
    }
    return `${Math.round(meters)} m`;
  };

  const formatDuration = (minutes: number) => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const remaining = minutes % 60;
      return remaining > 0 ? `${hours} hr ${remaining} min` : `${hours} hr`;
    }
    return `${minutes} min`;
  };

  return {
    coords: combinedCoords,
    steps: combinedSteps,
    distance: formatDistance(totalDistanceMeters),
    duration: formatDuration(totalDurationMinutes),
  };
};
