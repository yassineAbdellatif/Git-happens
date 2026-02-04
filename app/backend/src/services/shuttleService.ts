import { ShuttleRoute, ShuttleStop, ShuttleSchedule } from "../types/shuttle";

// Define shuttle routes between campuses and key locations
export const SHUTTLE_ROUTES: ShuttleRoute[] = [
  {
    id: "sgw-loyola",
    name: "SGW to Loyola",
    stops: [
      {
        id: "sgw-hall",
        name: "Hall Building (SGW)",
        latitude: 45.4971,
        longitude: -73.5788,
        campus: "SGW",
      },
      {
        id: "sgw-lb",
        name: "J.W. McConnell Building (SGW)",
        latitude: 45.4966,
        longitude: -73.5779,
        campus: "SGW",
      },
      {
        id: "loyola-vl",
        name: "Vanier Library (Loyola)",
        latitude: 45.4592,
        longitude: -73.6385,
        campus: "LOYOLA",
      },
      {
        id: "loyola-ad",
        name: "Administration Building (Loyola)",
        latitude: 45.4581,
        longitude: -73.6398,
        campus: "LOYOLA",
      },
    ],
    frequency: 30, // Every 30 minutes
    operatingHours: {
      start: "07:00",
      end: "22:00",
    },
  },
  {
    id: "loyola-sgw",
    name: "Loyola to SGW",
    stops: [
      {
        id: "loyola-sc",
        name: "Student Centre (Loyola)",
        latitude: 45.4591,
        longitude: -73.6413,
        campus: "LOYOLA",
      },
      {
        id: "loyola-ad2",
        name: "Administration Building (Loyola)",
        latitude: 45.4581,
        longitude: -73.6398,
        campus: "LOYOLA",
      },
      {
        id: "sgw-ev",
        name: "EV Building (SGW)",
        latitude: 45.4954,
        longitude: -73.5779,
        campus: "SGW",
      },
      {
        id: "sgw-mb",
        name: "John Molson Building (SGW)",
        latitude: 45.4951,
        longitude: -73.5792,
        campus: "SGW",
      },
    ],
    frequency: 30,
    operatingHours: {
      start: "07:00",
      end: "22:00",
    },
  },
];

/**
 * Get the next shuttle schedule for a given route and current time
 */
export const getNextShuttleSchedule = (
  routeId: string,
  currentTime: Date = new Date(),
): ShuttleSchedule | null => {
  const route = SHUTTLE_ROUTES.find((r) => r.id === routeId);

  if (!route) {
    return null;
  }

  const [startHour, startMin] = route.operatingHours.start
    .split(":")
    .map(Number);
  const [endHour, endMin] = route.operatingHours.end.split(":").map(Number);

  const currentHours = currentTime.getHours();
  const currentMinutes = currentTime.getMinutes();

  // Check if service is operating
  const operatingStart = startHour * 60 + startMin;
  const operatingEnd = endHour * 60 + endMin;
  const currentInMinutes = currentHours * 60 + currentMinutes;

  if (currentInMinutes < operatingStart || currentInMinutes >= operatingEnd) {
    // Service not operating - return next morning's first shuttle
    const nextDay = new Date(currentTime);
    nextDay.setDate(nextDay.getDate() + 1);
    nextDay.setHours(startHour, startMin, 0, 0);

    return {
      routeId: route.id,
      nextDeparture: nextDay,
      minutesUntilDeparture: Math.ceil(
        (nextDay.getTime() - currentTime.getTime()) / 60000,
      ),
      currentStop: route.stops[0],
      destination: route.stops[route.stops.length - 1],
    };
  }

  // Calculate next departure based on frequency
  const minutesSinceMidnight = currentHours * 60 + currentMinutes;
  const minutesSinceStart = minutesSinceMidnight - operatingStart;
  const minutesUntilNextDeparture =
    route.frequency - (minutesSinceStart % route.frequency);

  const nextDeparture = new Date(currentTime);
  nextDeparture.setMinutes(
    nextDeparture.getMinutes() + minutesUntilNextDeparture,
  );

  return {
    routeId: route.id,
    nextDeparture,
    minutesUntilDeparture: minutesUntilNextDeparture,
    currentStop: route.stops[0],
    destination: route.stops[route.stops.length - 1],
  };
};

/**
 * Get all upcoming departures for a route in the next 2 hours
 */
export const getUpcomingShuttleDepartures = (
  routeId: string,
  currentTime: Date = new Date(),
  hoursAhead: number = 2,
): Date[] => {
  const route = SHUTTLE_ROUTES.find((r) => r.id === routeId);

  if (!route) {
    return [];
  }

  const departures: Date[] = [];
  let nextSchedule = getNextShuttleSchedule(routeId, currentTime);

  if (!nextSchedule) {
    return departures;
  }

  const endTime = new Date(currentTime.getTime() + hoursAhead * 60 * 60 * 1000);

  while (nextSchedule.nextDeparture <= endTime) {
    departures.push(nextSchedule.nextDeparture);
    const nextTime = new Date(nextSchedule.nextDeparture.getTime() + 1000); // Add 1 second to avoid duplicates
    nextSchedule = getNextShuttleSchedule(routeId, nextTime);
    if (!nextSchedule) break;
  }

  return departures;
};
