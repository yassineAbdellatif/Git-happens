import hData from "../../assets/indoor_floor_plans/hall.json";
import ccData from "../../assets/indoor_floor_plans/cc1.json";
import mbData from "../../assets/indoor_floor_plans/mb_floors_combined.json";
import veData from "../../assets/indoor_floor_plans/ve.json";
import vlData from "../../assets/indoor_floor_plans/vl_floors_combined.json";

export type IndoorBuildingId = "H" | "CC" | "MB" | "VE" | "VL";

export type FloorNumber = "1" | "2" | "8" | "9" | "S2";

export type LocalizedNodeType =
  | "entrance"
  | "elevator"
  | "stairs"
  | "washroom"
  | "classroom"
  | "room"
  | "doorway"
  | "stair_landing"
  | "hallway_waypoint"
  | "building_entry_exit";

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
  localizedNodes: LocalizedNode[];
}

const SUPPORTED_INDOOR_BUILDINGS: readonly IndoorBuildingId[] = [
  "H",
  "CC",
  "MB",
  "VE",
  "VL",
];

const isSupportedIndoorBuildingId = (
  buildingId: string,
): buildingId is IndoorBuildingId =>
  SUPPORTED_INDOOR_BUILDINGS.includes(buildingId as IndoorBuildingId);

const ALL_RAW_NODES: any[] = [
  ...(hData?.nodes || []),
  ...(ccData?.nodes || []),
  ...(mbData?.nodes || []),
  ...(veData?.nodes || []),
  ...(vlData?.nodes || []),
];

export const getSupportedFloorsForBuilding = (
  buildingId: string,
): FloorNumber[] => {
  if (!isSupportedIndoorBuildingId(buildingId)) {
    return [];
  }

  // Scan JSON to find which floors exist
  const floors = ALL_RAW_NODES.filter(
    (node) => node.buildingId === buildingId,
  ).map((node) => String(node.floor) as FloorNumber);

  // Return unique floors in sorted order
  return [...new Set(floors)].sort((a, b) => {
    // Check if the floor strings are purely numeric
    const isNumA = /^\d+$/.test(a);
    const isNumB = /^\d+$/.test(b);

    if (isNumA && isNumB) {
      // If both are numbers, sort them numerically (so 2 comes before 10)
      return parseInt(a, 10) - parseInt(b, 10);
    }

    if (!isNumA && isNumB) {
      // If 'a' is a letter (like S2) and 'b' is a number, put 'a' first
      return -1;
    }

    if (isNumA && !isNumB) {
      // If 'a' is a number and 'b' is a letter, put 'b' first
      return 1;
    }

    // If both are letters (like S1 and S2), sort them alphabetically
    return a.localeCompare(b);
  });
};

export const getFloorPlanRegistryEntry = (
  buildingId: string,
  floorNumber: FloorNumber,
): FloorPlanRegistryEntry | null => {
  if (!isSupportedIndoorBuildingId(buildingId)) {
    return null;
  }

  // Find all raw JSON nodes that match the requested building and floor
  const rawNodesForFloor = ALL_RAW_NODES.filter(
    (node) =>
      node.buildingId === buildingId && String(node.floor) === floorNumber,
  );

  // If there are no nodes, return null (meaning no map exists for this floor)
  if (rawNodesForFloor.length === 0) {
    return null;
  }

  // Map the flat JSON shape into the LocalizedNode structure expected by IndoorFloorPlan.tsx
  const localizedNodes: LocalizedNode[] = rawNodesForFloor.map((node) => ({
    id: node.id,
    label: node.label || node.id,
    nodeType: (node.type || "room") as LocalizedNodeType,
    x: node.x,
    y: node.y,
  }));

  // Return the exact object structure that IndoorFloorPlan.tsx expects
  return {
    buildingId,
    floorNumber,
    localizedNodes,
  };
};
