export interface ShuttleStop {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  campus: "SGW" | "LOYOLA";
}

export interface ShuttleRoute {
  id: string;
  name: string;
  stops: ShuttleStop[];
  frequency: number; // in minutes
  operatingHours: {
    start: string; // "HH:MM" format
    end: string; // "HH:MM" format
  };
}

export interface ShuttleSchedule {
  routeId: string;
  nextDeparture: Date;
  minutesUntilDeparture: number;
  currentStop: ShuttleStop;
  destination: ShuttleStop;
}

export interface ShuttleTrackingResponse {
  schedule: ShuttleSchedule;
  allUpcomingDepartures: Date[];
}
