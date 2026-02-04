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
  frequency: number;
  operatingHours: {
    start: string;
    end: string;
  };
}

export interface ShuttleSchedule {
  routeId: string;
  nextDeparture: string; // ISO string
  minutesUntilDeparture: number;
  currentStop: ShuttleStop;
  destination: ShuttleStop;
}

export interface ShuttleTrackingResponse {
  schedule: ShuttleSchedule;
  allUpcomingDepartures: string[];
}
