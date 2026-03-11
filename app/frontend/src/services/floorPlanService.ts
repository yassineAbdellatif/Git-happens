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
    floorPlanFile: "assets/updated_floor_plans/h1.png",
    localizedNodes: [
      {
        id: "H1-ENT-S",
        label: "H1 South Entrance",
        nodeType: "entrance",
        x: 1032,
        y: 1460,
      },
      {
        id: "H1-ENT-E",
        label: "H1 East Entrance",
        nodeType: "entrance",
        x: 1370,
        y: 672,
      },
      {
        id: "H1-ELEV-1",
        label: "H1 Elevator Bank",
        nodeType: "elevator",
        x: 761,
        y: 1020,
      },
      {
        id: "H1-STAIR-1",
        label: "H1 West Stair Core",
        nodeType: "stairs",
        x: 173,
        y: 708,
      },
      {
        id: "H1-STAIR-2",
        label: "H1 East Stair Core",
        nodeType: "stairs",
        x: 1355,
        y: 534,
      },
      {
        id: "H1-STAIR-3",
        label: "H1 South Stair Core",
        nodeType: "stairs",
        x: 823,
        y: 1212,
      },
      {
        id: "H1-WC-1",
        label: "H1 North Washroom Cluster",
        nodeType: "washroom",
        x: 1039,
        y: 227,
      },
      {
        id: "H1-WC-2",
        label: "H1 Central Washroom Cluster",
        nodeType: "washroom",
        x: 759,
        y: 536,
      },
      {
        id: "H1-ROOM-150",
        label: "H1 Classroom 150",
        nodeType: "classroom",
        x: 1083,
        y: 684,
      },
      {
        id: "H1-ROOM-141",
        label: "H1 Room 141",
        nodeType: "classroom",
        x: 1328,
        y: 77,
      },
      {
        id: "H1-ROOM-133",
        label: "H1 Room 133",
        nodeType: "classroom",
        x: 863,
        y: 151,
      },
      {
        id: "H1-ROOM-127",
        label: "H1 Room 127",
        nodeType: "classroom",
        x: 70,
        y: 366,
      },
      {
        id: "H1-ROOM-125",
        label: "H1 Room 125",
        nodeType: "classroom",
        x: 67,
        y: 522,
      },
      {
        id: "H1-ROOM-120",
        label: "H1 Room 120",
        nodeType: "classroom",
        x: 635,
        y: 664,
      },
      {
        id: "H1-ROOM-115",
        label: "H1 Room 115",
        nodeType: "classroom",
        x: 875,
        y: 808,
      },
      {
        id: "H1-ROOM-116",
        label: "H1 Room 116",
        nodeType: "classroom",
        x: 855,
        y: 1000,
      },
      {
        id: "H1-ROOM-110",
        label: "H1 Classroom 110",
        nodeType: "classroom",
        x: 381,
        y: 842,
      },
      {
        id: "H1-ROOM-102",
        label: "H1 Classroom 102",
        nodeType: "classroom",
        x: 1183,
        y: 1206,
      },
      {
        id: "H1-ROOM-101",
        label: "H1 Room 101",
        nodeType: "classroom",
        x: 1303,
        y: 1333,
      },
    ],
  },
  {
    buildingId: "H",
    floorNumber: "2",
    floorPlanFile: "assets/updated_floor_plans/h2.png",
    localizedNodes: [
      {
        id: "H2-ENT-NW",
        label: "H2 North-West Entrance",
        nodeType: "entrance",
        x: 25,
        y: 37,
      },
      {
        id: "H2-ENT-E",
        label: "H2 East Entrance",
        nodeType: "entrance",
        x: 1322,
        y: 336,
      },
      {
        id: "H2-ENT-S",
        label: "H2 South Entrance",
        nodeType: "entrance",
        x: 1269,
        y: 1464,
      },
      {
        id: "H2-ELEV-1",
        label: "H2 Elevator Bank",
        nodeType: "elevator",
        x: 906,
        y: 925,
      },
      {
        id: "H2-STAIR-1",
        label: "H2 North-West Stair Core",
        nodeType: "stairs",
        x: 47,
        y: 42,
      },
      {
        id: "H2-STAIR-2",
        label: "H2 East Stair Core",
        nodeType: "stairs",
        x: 1266,
        y: 666,
      },
      {
        id: "H2-STAIR-3",
        label: "H2 South-East Stair Core",
        nodeType: "stairs",
        x: 1189,
        y: 975,
      },
      {
        id: "H2-STAIR-4",
        label: "H2 West Mid Stair Core",
        nodeType: "stairs",
        x: 83,
        y: 737,
      },
      {
        id: "H2-WC-1",
        label: "H2 Upper Central Washroom Cluster",
        nodeType: "washroom",
        x: 640,
        y: 244,
      },
      {
        id: "H2-WC-2",
        label: "H2 Lower Central Washroom Cluster",
        nodeType: "washroom",
        x: 579,
        y: 287,
      },
      {
        id: "H2-ROOM-290",
        label: "H2 Room 290",
        nodeType: "classroom",
        x: 88,
        y: 572,
      },
      {
        id: "H2-ROOM-280",
        label: "H2 Room 280",
        nodeType: "classroom",
        x: 1276,
        y: 446,
      },
      {
        id: "H2-ROOM-239",
        label: "H2 Room 239",
        nodeType: "classroom",
        x: 749,
        y: 182,
      },
      {
        id: "H2-ROOM-231",
        label: "H2 Room 231",
        nodeType: "classroom",
        x: 524,
        y: 182,
      },
      {
        id: "H2-ROOM-230",
        label: "H2 Room 230",
        nodeType: "classroom",
        x: 486,
        y: 267,
      },
      {
        id: "H2-ROOM-222",
        label: "H2 Room 222",
        nodeType: "classroom",
        x: 1125,
        y: 440,
      },
      {
        id: "H2-ROOM-220",
        label: "H2 Room 220",
        nodeType: "classroom",
        x: 1029,
        y: 443,
      },
      {
        id: "H2-ROOM-205",
        label: "H2 Room 205",
        nodeType: "classroom",
        x: 188,
        y: 575,
      },
      {
        id: "H2-ROOM-110",
        label: "H2 Classroom 110",
        nodeType: "classroom",
        x: 390,
        y: 829,
      },
      {
        id: "H2-ROOM-108",
        label: "H2 Room 108",
        nodeType: "classroom",
        x: 613,
        y: 1371,
      },
    ],
  },
  {
    buildingId: "H",
    floorNumber: "8",
    floorPlanFile: "assets/updated_floor_plans/h8.png",
    localizedNodes: [
      {
        id: "H8-ENT-W",
        label: "H8 West Corridor Access",
        nodeType: "entrance",
        x: 300,
        y: 740,
      },
      {
        id: "H8-ENT-E",
        label: "H8 East Corridor Access",
        nodeType: "entrance",
        x: 1315,
        y: 740,
      },
      {
        id: "H8-ELEV-1",
        label: "H8 West Elevator A",
        nodeType: "elevator",
        x: 578,
        y: 499,
      },
      {
        id: "H8-ELEV-2",
        label: "H8 West Elevator B",
        nodeType: "elevator",
        x: 626,
        y: 499,
      },
      {
        id: "H8-STAIR-1",
        label: "H8 West Stair Core",
        nodeType: "stairs",
        x: 498,
        y: 493,
      },
      {
        id: "H8-STAIR-2",
        label: "H8 North-East Stair Core",
        nodeType: "stairs",
        x: 1130,
        y: 334,
      },
      {
        id: "H8-STAIR-3",
        label: "H8 South-East Stair Core",
        nodeType: "stairs",
        x: 1134,
        y: 1111,
      },
      {
        id: "H8-STAIR-4",
        label: "H8 South-West Stair Core",
        nodeType: "stairs",
        x: 500,
        y: 1116,
      },
      {
        id: "H8-WC-1",
        label: "H8 Washroom West",
        nodeType: "washroom",
        x: 616,
        y: 339,
      },
      {
        id: "H8-WC-2",
        label: "H8 Washroom East",
        nodeType: "washroom",
        x: 1079,
        y: 337,
      },
      {
        id: "H8-ROOM-867",
        label: "H8 Room 867",
        nodeType: "classroom",
        x: 128,
        y: 90,
      },
      {
        id: "H8-ROOM-803",
        label: "H8 Room 803",
        nodeType: "classroom",
        x: 503,
        y: 86,
      },
      {
        id: "H8-ROOM-811",
        label: "H8 Room 811",
        nodeType: "classroom",
        x: 1068,
        y: 87,
      },
      {
        id: "H8-ROOM-817",
        label: "H8 Room 817",
        nodeType: "classroom",
        x: 1519,
        y: 89,
      },
      {
        id: "H8-ROOM-802",
        label: "H8 Room 802",
        nodeType: "classroom",
        x: 562,
        y: 361,
      },
      {
        id: "H8-ROOM-810",
        label: "H8 Room 810",
        nodeType: "classroom",
        x: 1018,
        y: 368,
      },
      {
        id: "H8-ROOM-820",
        label: "H8 Room 820",
        nodeType: "classroom",
        x: 1030,
        y: 707,
      },
      {
        id: "H8-ROOM-822",
        label: "H8 Room 822",
        nodeType: "classroom",
        x: 1193,
        y: 900,
      },
      {
        id: "H8-ROOM-862",
        label: "H8 Room 862",
        nodeType: "classroom",
        x: 586,
        y: 706,
      },
      {
        id: "H8-ROOM-849",
        label: "H8 Room 849",
        nodeType: "classroom",
        x: 125,
        y: 1365,
      },
      {
        id: "H8-ROOM-841",
        label: "H8 Room 841",
        nodeType: "classroom",
        x: 742,
        y: 1366,
      },
      {
        id: "H8-ROOM-831",
        label: "H8 Room 831",
        nodeType: "classroom",
        x: 1517,
        y: 1369,
      },
    ],
  },
  {
    buildingId: "H",
    floorNumber: "9",
    floorPlanFile: "assets/updated_floor_plans/h9.png",
    localizedNodes: [
      {
        id: "H9-ENT-W",
        label: "H9 West Corridor Access",
        nodeType: "entrance",
        x: 248,
        y: 748,
      },
      {
        id: "H9-ENT-E",
        label: "H9 East Corridor Access",
        nodeType: "entrance",
        x: 1491,
        y: 756,
      },
      {
        id: "H9-ELEV-1",
        label: "H9 Central Elevator A",
        nodeType: "elevator",
        x: 807,
        y: 900,
      },
      {
        id: "H9-ELEV-2",
        label: "H9 Central Elevator B",
        nodeType: "elevator",
        x: 865,
        y: 902,
      },
      {
        id: "H9-STAIR-1",
        label: "H9 North-West Stair Core",
        nodeType: "stairs",
        x: 501,
        y: 457,
      },
      {
        id: "H9-STAIR-2",
        label: "H9 North-East Stair Core",
        nodeType: "stairs",
        x: 1171,
        y: 458,
      },
      {
        id: "H9-STAIR-3",
        label: "H9 South-East Stair Core",
        nodeType: "stairs",
        x: 1225,
        y: 1016,
      },
      {
        id: "H9-STAIR-4",
        label: "H9 South-West Stair Core",
        nodeType: "stairs",
        x: 490,
        y: 1164,
      },
      {
        id: "H9-WC-1",
        label: "H9 South-West Washroom",
        nodeType: "washroom",
        x: 607,
        y: 1166,
      },
      {
        id: "H9-WC-2",
        label: "H9 South-East Washroom",
        nodeType: "washroom",
        x: 1009,
        y: 1168,
      },
      {
        id: "H9-ROOM-929",
        label: "H9 Room 929",
        nodeType: "classroom",
        x: 98,
        y: 104,
      },
      {
        id: "H9-ROOM-933",
        label: "H9 Room 933",
        nodeType: "classroom",
        x: 420,
        y: 103,
      },
      {
        id: "H9-ROOM-941",
        label: "H9 Room 941",
        nodeType: "classroom",
        x: 938,
        y: 95,
      },
      {
        id: "H9-ROOM-945",
        label: "H9 Room 945",
        nodeType: "classroom",
        x: 1137,
        y: 260,
      },
      {
        id: "H9-ROOM-980",
        label: "H9 Room 980",
        nodeType: "classroom",
        x: 576,
        y: 613,
      },
      {
        id: "H9-ROOM-920",
        label: "H9 Room 920",
        nodeType: "classroom",
        x: 614,
        y: 812,
      },
      {
        id: "H9-ROOM-910",
        label: "H9 Room 910",
        nodeType: "classroom",
        x: 605,
        y: 1094,
      },
      {
        id: "H9-ROOM-902",
        label: "H9 Room 902",
        nodeType: "classroom",
        x: 1048,
        y: 1113,
      },
      {
        id: "H9-ROOM-903",
        label: "H9 Room 903",
        nodeType: "classroom",
        x: 1175,
        y: 1405,
      },
      {
        id: "H9-ROOM-963",
        label: "H9 Room 963",
        nodeType: "classroom",
        x: 1521,
        y: 810,
      },
      {
        id: "H9-ROOM-965",
        label: "H9 Room 965",
        nodeType: "classroom",
        x: 1518,
        y: 1035,
      },
    ],
  },
  {
    buildingId: "CC",
    floorNumber: "1",
    floorPlanFile: "assets/updated_floor_plans/cc1.png",
    localizedNodes: [
      {
        id: "CC1-ENT-W",
        label: "CC1 West Entrance",
        nodeType: "entrance",
        x: 12,
        y: 378,
      },
      {
        id: "CC1-ENT-E",
        label: "CC1 East Entrance",
        nodeType: "entrance",
        x: 2596,
        y: 372,
      },
      {
        id: "CC1-ELEV-1",
        label: "CC1 Elevator Core",
        nodeType: "elevator",
        x: 1737,
        y: 283,
      },
      {
        id: "CC1-STAIR-1",
        label: "CC1 Stair Core West",
        nodeType: "stairs",
        x: 1150,
        y: 106,
      },
      {
        id: "CC1-STAIR-2",
        label: "CC1 Stair Core East",
        nodeType: "stairs",
        x: 2294,
        y: 478,
      },
      {
        id: "CC1-WC-1",
        label: "CC1 West Washroom Cluster",
        nodeType: "washroom",
        x: 169,
        y: 216,
      },
      {
        id: "CC1-WC-2",
        label: "CC1 East Washroom",
        nodeType: "washroom",
        x: 2267,
        y: 259,
      },
      {
        id: "CC1-ROOM-124",
        label: "CC1 Room 124",
        nodeType: "classroom",
        x: 146,
        y: 189,
      },
      {
        id: "CC1-ROOM-122",
        label: "CC1 Room 122",
        nodeType: "classroom",
        x: 427,
        y: 179,
      },
      {
        id: "CC1-ROOM-120",
        label: "CC1 Room 120",
        nodeType: "classroom",
        x: 709,
        y: 184,
      },
      {
        id: "CC1-ROOM-118",
        label: "CC1 Room 118",
        nodeType: "classroom",
        x: 945,
        y: 193,
      },
      {
        id: "CC1-ROOM-116",
        label: "CC1 Classroom 116",
        nodeType: "classroom",
        x: 1119,
        y: 195,
      },
      {
        id: "CC1-ROOM-112",
        label: "CC1 Room 112",
        nodeType: "classroom",
        x: 1532,
        y: 190,
      },
      {
        id: "CC1-ROOM-106",
        label: "CC1 Classroom 106",
        nodeType: "classroom",
        x: 1860,
        y: 259,
      },
      {
        id: "CC1-ROOM-104",
        label: "CC1 Room 104",
        nodeType: "classroom",
        x: 2256,
        y: 248,
      },
      {
        id: "CC1-ROOM-102",
        label: "CC1 Room 102",
        nodeType: "classroom",
        x: 2272,
        y: 344,
      },
      {
        id: "CC1-ROOM-101",
        label: "CC1 Room 101",
        nodeType: "classroom",
        x: 1849,
        y: 546,
      },
      {
        id: "CC1-ROOM-111",
        label: "CC1 Classroom 111",
        nodeType: "classroom",
        x: 1440,
        y: 546,
      },
      {
        id: "CC1-ROOM-115",
        label: "CC1 Room 115",
        nodeType: "classroom",
        x: 1038,
        y: 537,
      },
      {
        id: "CC1-ROOM-117",
        label: "CC1 Room 117",
        nodeType: "classroom",
        x: 690,
        y: 560,
      },
      {
        id: "CC1-ROOM-119",
        label: "CC1 Room 119",
        nodeType: "classroom",
        x: 375,
        y: 595,
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
