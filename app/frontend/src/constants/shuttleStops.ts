// Shuttle stops and service information for Concordia campuses
export const SHUTTLE_STOPS = {
  SGW: [
    {
      id: "sgw-hall",
      name: "Hall Building",
      building: "H",
      latitude: 45.4971,
      longitude: -73.5788,
    },
    {
      id: "sgw-lb",
      name: "J.W. McConnell Building",
      building: "LB",
      latitude: 45.4966,
      longitude: -73.5779,
    },
    {
      id: "sgw-ev",
      name: "EV Building",
      building: "EV",
      latitude: 45.4954,
      longitude: -73.5779,
    },
    {
      id: "sgw-mb",
      name: "John Molson Building",
      building: "MB",
      latitude: 45.4951,
      longitude: -73.5792,
    },
  ],
  LOYOLA: [
    {
      id: "loyola-sc",
      name: "Student Centre",
      building: "SC",
      latitude: 45.4591,
      longitude: -73.6413,
    },
    {
      id: "loyola-vl",
      name: "Vanier Library",
      building: "VL",
      latitude: 45.4592,
      longitude: -73.6385,
    },
    {
      id: "loyola-ad",
      name: "Administration Building",
      building: "AD",
      latitude: 45.4581,
      longitude: -73.6398,
    },
  ],
};

export const SHUTTLE_ROUTES_INFO = [
  {
    id: "sgw-loyola",
    name: "SGW ⟷ Loyola",
    frequency: 30, // minutes
    operatingHours: { start: "07:00", end: "22:00" },
  },
  {
    id: "loyola-sgw",
    name: "Loyola ⟷ SGW",
    frequency: 30,
    operatingHours: { start: "07:00", end: "22:00" },
  },
];
