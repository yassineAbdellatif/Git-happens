export type IndoorBuildingId = "H" | "CC";

export type FloorNumber = "1" | "2" | "8" | "9";

export type LocalizedNodeType =
  | "entrance"
  | "elevator"
  | "stairs"
  | "washroom"
  | "classroom";

export interface LocalizedNode {
  id: string;
  label: string;
  nodeType: LocalizedNodeType;
  x: number;
  y: number;
}

export interface FloorPlanRegistryEntry {
  buildingId: IndoorBuildingId;
  floorNumber: FloorNumber;
  floorPlanFile: string;
  localizedNodes: LocalizedNode[];
}

const SUPPORTED_INDOOR_BUILDINGS: readonly IndoorBuildingId[] = ["H", "CC"];

const isSupportedIndoorBuildingId = (
  buildingId: string,
): buildingId is IndoorBuildingId =>
  SUPPORTED_INDOOR_BUILDINGS.includes(buildingId as IndoorBuildingId);

const FLOOR_PLAN_REGISTRY: FloorPlanRegistryEntry[] = [
  {
    buildingId: "H",
    floorNumber: "1",
    floorPlanFile: "assets/floor_plans/Hall-1.png",
    localizedNodes: [
      {
        id: "H1-ENT-S",
        label: "H1 South Entrance",
        nodeType: "entrance",
        x: 1320,
        y: 2738,
      },
      {
        id: "H1-ENT-E",
        label: "H1 East Entrance",
        nodeType: "entrance",
        x: 2590,
        y: 1045,
      },
      {
        id: "H1-ELEV-1",
        label: "H1 Elevator Bank",
        nodeType: "elevator",
        x: 1533,
        y: 2117,
      },
      {
        id: "H1-STAIR-1",
        label: "H1 East Stair Core",
        nodeType: "stairs",
        x: 2537,
        y: 932,
      },
      {
        id: "H1-STAIR-2",
        label: "H1 West Stair Core",
        nodeType: "stairs",
        x: 449,
        y: 536,
      },
      {
        id: "H1-WC-1",
        label: "H1 Washroom Cluster A",
        nodeType: "washroom",
        x: 1771,
        y: 1863,
      },
      {
        id: "H1-WC-2",
        label: "H1 Washroom Cluster B",
        nodeType: "washroom",
        x: 2484,
        y: 1270,
      },
      {
        id: "H1-CLS-1",
        label: "H1 Classroom 150",
        nodeType: "classroom",
        x: 1956,
        y: 1299,
      },
      {
        id: "H1-CLS-2",
        label: "H1 Classroom 110",
        nodeType: "classroom",
        x: 846,
        y: 1637,
      },
      {
        id: "H1-CLS-3",
        label: "H1 Classroom 102",
        nodeType: "classroom",
        x: 1136,
        y: 2428,
      },
    ],
  },
  {
    buildingId: "H",
    floorNumber: "2",
    floorPlanFile: "assets/floor_plans/Hall-2.png",
    localizedNodes: [
      {
        id: "H2-ENT-S",
        label: "H2 South Entrance",
        nodeType: "entrance",
        x: 1178,
        y: 2552,
      },
      {
        id: "H2-ENT-NW",
        label: "H2 North-West Entrance",
        nodeType: "entrance",
        x: 165,
        y: 104,
      },
      {
        id: "H2-ELEV-1",
        label: "H2 Elevator Bank",
        nodeType: "elevator",
        x: 1461,
        y: 1953,
      },
      {
        id: "H2-STAIR-1",
        label: "H2 East Stair Core",
        nodeType: "stairs",
        x: 1908,
        y: 1953,
      },
      {
        id: "H2-STAIR-2",
        label: "H2 West Stair Core",
        nodeType: "stairs",
        x: 377,
        y: 937,
      },
      {
        id: "H2-WC-1",
        label: "H2 Washroom Cluster A",
        nodeType: "washroom",
        x: 1249,
        y: 781,
      },
      {
        id: "H2-WC-2",
        label: "H2 Washroom Cluster B",
        nodeType: "washroom",
        x: 989,
        y: 833,
      },
      {
        id: "H2-CLS-1",
        label: "H2 Classroom 110",
        nodeType: "classroom",
        x: 777,
        y: 1641,
      },
      {
        id: "H2-CLS-2",
        label: "H2 Classroom 260",
        nodeType: "classroom",
        x: 1979,
        y: 1510,
      },
      {
        id: "H2-CLS-3",
        label: "H2 Classroom 205",
        nodeType: "classroom",
        x: 188,
        y: 1614,
      },
    ],
  },
  {
    buildingId: "H",
    floorNumber: "8",
    floorPlanFile: "assets/floor_plans/Hall-8.svg",
    localizedNodes: [
      {
        id: "H8-ENT-W",
        label: "H8 West Entrance",
        nodeType: "entrance",
        x: 81.16,
        y: 255.13,
      },
      {
        id: "H8-ENT-E",
        label: "H8 East Entrance",
        nodeType: "entrance",
        x: 668.57,
        y: 266.11,
      },
      {
        id: "H8-ELEV-1",
        label: "H8 Elevator Bank A",
        nodeType: "elevator",
        x: 326.43,
        y: 572.01,
      },
      {
        id: "H8-ELEV-2",
        label: "H8 Elevator Bank B",
        nodeType: "elevator",
        x: 444.34,
        y: 644.13,
      },
      {
        id: "H8-STAIR-1",
        label: "H8 Stairs Core West",
        nodeType: "stairs",
        x: 194.0,
        y: 547.0,
      },
      {
        id: "H8-STAIR-2",
        label: "H8 Stairs Core East",
        nodeType: "stairs",
        x: 560.62,
        y: 498.79,
      },
      {
        id: "H8-WC-1",
        label: "H8 Washroom West",
        nodeType: "washroom",
        x: 188.93,
        y: 517.36,
      },
      {
        id: "H8-WC-2",
        label: "H8 Washroom East",
        nodeType: "washroom",
        x: 449.46,
        y: 356.69,
      },
      {
        id: "H8-CLS-1",
        label: "H8 Classroom 1",
        nodeType: "classroom",
        x: 159.11,
        y: 266.29,
      },
      {
        id: "H8-CLS-2",
        label: "H8 Classroom 2",
        nodeType: "classroom",
        x: 343.93,
        y: 266.29,
      },
      {
        id: "H8-CLS-3",
        label: "H8 Classroom 3",
        nodeType: "classroom",
        x: 464.16,
        y: 395.01,
      },
      {
        id: "H8-CLS-4",
        label: "H8 Classroom 4",
        nodeType: "classroom",
        x: 540.0,
        y: 600.58,
      },
      {
        id: "H8-CLS-5",
        label: "H8 Classroom 5",
        nodeType: "classroom",
        x: 668.57,
        y: 655.76,
      },
    ],
  },
  {
    buildingId: "H",
    floorNumber: "9",
    floorPlanFile: "assets/floor_plans/Hall-9.svg",
    localizedNodes: [
      {
        id: "H9-ENT-W",
        label: "H9 West Entrance",
        nodeType: "entrance",
        x: 79.3,
        y: 904.49,
      },
      {
        id: "H9-ENT-E",
        label: "H9 East Entrance",
        nodeType: "entrance",
        x: 945.53,
        y: 857.77,
      },
      {
        id: "H9-ELEV-1",
        label: "H9 Elevator Bank A",
        nodeType: "elevator",
        x: 757.36,
        y: 692.42,
      },
      {
        id: "H9-ELEV-2",
        label: "H9 Elevator Bank B",
        nodeType: "elevator",
        x: 538.92,
        y: 698.23,
      },
      {
        id: "H9-STAIR-1",
        label: "H9 Stairs Core East",
        nodeType: "stairs",
        x: 665.19,
        y: 668.13,
      },
      {
        id: "H9-STAIR-2",
        label: "H9 Stairs Core South",
        nodeType: "stairs",
        x: 545.73,
        y: 766.67,
      },
      {
        id: "H9-WC-1",
        label: "H9 Washroom North",
        nodeType: "washroom",
        x: 546.75,
        y: 852.53,
      },
      {
        id: "H9-WC-2",
        label: "H9 Washroom East",
        nodeType: "washroom",
        x: 854.28,
        y: 525.55,
      },
      {
        id: "H9-CLS-1",
        label: "H9 Classroom 1",
        nodeType: "classroom",
        x: 468.96,
        y: 904.49,
      },
      {
        id: "H9-CLS-2",
        label: "H9 Classroom 2",
        nodeType: "classroom",
        x: 985.43,
        y: 283.31,
      },
      {
        id: "H9-CLS-3",
        label: "H9 Classroom 3",
        nodeType: "classroom",
        x: 796.96,
        y: 418.29,
      },
      {
        id: "H9-CLS-4",
        label: "H9 Classroom 4",
        nodeType: "classroom",
        x: 662.41,
        y: 418.29,
      },
      {
        id: "H9-CLS-5",
        label: "H9 Classroom 5",
        nodeType: "classroom",
        x: 379.07,
        y: 709.84,
      },
    ],
  },
  {
    buildingId: "CC",
    floorNumber: "1",
    floorPlanFile: "assets/floor_plans/CC1.png",
    localizedNodes: [
      {
        id: "CC1-ENT-W",
        label: "CC1 West Entrance",
        nodeType: "entrance",
        x: 488,
        y: 862,
      },
      {
        id: "CC1-ENT-E",
        label: "CC1 East Entrance",
        nodeType: "entrance",
        x: 4539,
        y: 860,
      },
      {
        id: "CC1-ELEV-1",
        label: "CC1 Elevator Core",
        nodeType: "elevator",
        x: 3257,
        y: 685,
      },
      {
        id: "CC1-STAIR-1",
        label: "CC1 Stair Core West",
        nodeType: "stairs",
        x: 1658,
        y: 643,
      },
      {
        id: "CC1-STAIR-2",
        label: "CC1 Stair Core East",
        nodeType: "stairs",
        x: 4087,
        y: 971,
      },
      {
        id: "CC1-WC-1",
        label: "CC1 Washroom Block",
        nodeType: "washroom",
        x: 762,
        y: 578,
      },
      {
        id: "CC1-CLS-1",
        label: "CC1 Classroom 116",
        nodeType: "classroom",
        x: 2113,
        y: 536,
      },
      {
        id: "CC1-CLS-2",
        label: "CC1 Classroom 111",
        nodeType: "classroom",
        x: 2634,
        y: 1062,
      },
      {
        id: "CC1-CLS-3",
        label: "CC1 Classroom 106",
        nodeType: "classroom",
        x: 3750,
        y: 581,
      },
    ],
  },
];

export const getSupportedFloorsForBuilding = (
  buildingId: string,
): FloorNumber[] => {
  if (!isSupportedIndoorBuildingId(buildingId)) {
    return [];
  }

  return FLOOR_PLAN_REGISTRY.filter((entry) => entry.buildingId === buildingId)
    .map((entry) => entry.floorNumber)
    .sort();
};

export const getFloorPlanRegistryEntry = (
  buildingId: string,
  floorNumber: FloorNumber,
): FloorPlanRegistryEntry | null => {
  if (!isSupportedIndoorBuildingId(buildingId)) {
    return null;
  }

  return (
    FLOOR_PLAN_REGISTRY.find(
      (entry) =>
        entry.buildingId === buildingId && entry.floorNumber === floorNumber,
    ) || null
  );
};
