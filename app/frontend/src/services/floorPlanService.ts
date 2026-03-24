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
  | "water_fountain"
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
  edges: RawEdge[];
  // True when the floor plan PNG already has styled map-pin POI icons embedded on it, so we know not to render the SVG overlay icons for that floor
  poiIconsEmbedded: boolean;
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

export interface RawEdge {
  source: string;
  target: string;
  type: string;
  weight: number;
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

const ALL_RAW_EDGES: RawEdge[] = [
  ...((hData as any)?.edges || []),
  ...((ccData as any)?.edges || []),
  ...((mbData as any)?.edges || []),
  ...((veData as any)?.edges || []),
  ...((vlData as any)?.edges || []),
];

export const getSupportedFloorsForBuilding = (
  buildingId: string,
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
  floorNumber: FloorNumber,
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

    // 2. Handle standard matches (CC, MB, VE, VL)
    return nodeBuilding === buildingId && nodeFloor === String(floorNumber);
  });

  //If no nodes are found, return null
  if (rawNodesForFloor.length === 0) {
    console.warn(`No JSON nodes found for ${buildingId} Floor ${floorNumber}`);
    return null;
  }

  // Map the flat JSON shape into the LocalizedNode structure expected by the app
  const localizedNodes: LocalizedNode[] = rawNodesForFloor.map((node) => {
    let nodeType = (node.type || "room") as LocalizedNodeType;
    // Normalise legacy JSON type names to the canonical LocalizedNodeType values
    if ((nodeType as string) === "elevator_door") nodeType = "elevator";
    // Hall washrooms are typed "room" but identified via their id
    if (nodeType === "room" && node.id.toLowerCase().includes("washroom"))
      nodeType = "washroom";
    return {
      id: node.id,
      label: node.label || node.id,
      nodeType,
      x: node.x,
      y: node.y,
    };
  });

  const nodeIdSet = new Set(rawNodesForFloor.map((n) => n.id));
  const edges = ALL_RAW_EDGES.filter(
    (e) => nodeIdSet.has(e.source) && nodeIdSet.has(e.target),
  );

  // Floors whose PNG already contains styled map-pin icons — skip the SVG overlay for those
  const EMBEDDED_ICON_FLOORS = new Set(["H_8", "H_9", "VE_2"]);
  const poiIconsEmbedded = EMBEDDED_ICON_FLOORS.has(
    `${buildingId}_${floorNumber}`,
  );

  return {
    buildingId,
    floorNumber,
    localizedNodes,
    edges,
    poiIconsEmbedded,
  };
};
