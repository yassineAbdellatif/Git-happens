import { SHUTTLE_SCHEDULE } from "../../../constants/shuttleSchedule";

type Campus = "SGW" | "LOYOLA";

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
