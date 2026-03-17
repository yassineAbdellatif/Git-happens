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

export interface RawMapNode {
  id: string;
  type: string;
  buildingId: string;
  floor: number | string;
  x: number;
  y: number;
  label?: string;
  accessible?: boolean;
}

const SUPPORTED_INDOOR_BUILDINGS = new Set<string>([
  "H",
  "CC",
  "MB",
  "VE",
  "VL",
]);

const isSupportedIndoorBuildingId = (
  buildingId: string,
): buildingId is IndoorBuildingId => SUPPORTED_INDOOR_BUILDINGS.has(buildingId);


const ALL_RAW_NODES: RawMapNode[] = [
  ...(hData?.nodes || []),
  ...(ccData?.nodes || []),
  ...(mbData?.nodes || []),
  ...(veData?.nodes || []),
  ...(vlData?.nodes || []),
];

export const getSupportedFloorsForBuilding = (
  buildingId: string
): FloorNumber[] => {
  if (!isSupportedIndoorBuildingId(buildingId)) {
    return [];
  }

  // We know what PNG assets exist for each building and what floors they have.
  switch (buildingId) {
    case "H":
      return ["1", "2", "8", "9"];
    case "MB":
      return ["1", "S2"];
    case "CC":
      return ["1"];
    case "VE":
      return ["1", "2"];
    case "VL":
      return ["1", "2"];
    default:
      return [];
  }
};

export const getFloorPlanRegistryEntry = (
  buildingId: string,
  floorNumber: FloorNumber
): FloorPlanRegistryEntry | null => {
  if (!isSupportedIndoorBuildingId(buildingId)) {
    return null;
  }

  // Find all raw JSON nodes that match the requested building and floor,
  const rawNodesForFloor = ALL_RAW_NODES.filter((node) => {
    const nodeBuilding = String(node.buildingId);
    const nodeFloor = String(node.floor);

    // 1. Handle the Hall Building mismatch ("H" -> "Hall")
    if (buildingId === "H") {
      return nodeBuilding === "Hall" && nodeFloor === String(floorNumber);
    }

    // 2. Handle the MB S2 mismatch (Building "MB" + Floor "S2" -> Building "MB-S2" + Floor "1")
    if (buildingId === "MB" && floorNumber === "S2") {
      return nodeBuilding === "MB-S2" && nodeFloor === "1";
    }

    // 3. Handle standard matches (CC, MB Floor 1, VE, VL)
    return nodeBuilding === buildingId && nodeFloor === String(floorNumber);
  });

  //If no nodes are found, return null
  if (rawNodesForFloor.length === 0) {
    console.warn(`No JSON nodes found for ${buildingId} Floor ${floorNumber}`);
    return null;
  }

  // Map the flat JSON shape into the LocalizedNode structure expected by the app
  const localizedNodes: LocalizedNode[] = rawNodesForFloor.map((node) => ({
    id: node.id,
    label: node.label || node.id,
    nodeType: (node.type || "room") as LocalizedNodeType,
    x: node.x,
    y: node.y,
  }));

  return {
    buildingId,
    floorNumber,
    localizedNodes,
  };
};
