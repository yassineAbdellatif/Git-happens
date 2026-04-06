import type { IndoorBuildingId } from "../services/floorPlanService";
 
export interface EntryExitCoord {
  nodeId: string;
  buildingId: IndoorBuildingId;
  latitude: number;
  longitude: number;
}
 
/**
 * Maps indoor building_entry_exit node IDs to real-world lat/lng coordinates.
 * These coordinates represent the physical location of each door on the
 * building's exterior, used to bridge indoor ↔ outdoor navigation.
 */

export const BUILDING_ENTRY_EXIT_COORDS: Record<string, EntryExitCoord> = {
  // --- Hall Building (H) - SGW Campus ---
  // East side doors (facing Mackay St)
  Hall_F1_building_entry_exit_1: {
    nodeId: "Hall_F1_building_entry_exit_1",
    buildingId: "H",
    latitude: 45.497364,
    longitude: -73.578569,
  },
  Hall_F1_building_entry_exit_2: {
    nodeId: "Hall_F1_building_entry_exit_2",
    buildingId: "H",
    latitude: 45.497193,
    longitude: -73.578499,
  },
  // South side doors (facing De Maisonneuve Blvd - main entrance)
  Hall_F1_building_entry_exit_3: {
    nodeId: "Hall_F1_building_entry_exit_3",
    buildingId: "H",
    latitude: 45.496946,
    longitude: -73.579041,
  },
  Hall_F1_building_entry_exit_4: {
    nodeId: "Hall_F1_building_entry_exit_4",
    buildingId: "H",
    latitude: 45.496889,
    longitude: -73.579219,
  },
 
  // --- John Molson Building (MB) - SGW Campus ---
  MB_F1_building_entry_exit_1: {
    nodeId: "MB_F1_building_entry_exit_1",
    buildingId: "MB",
    latitude: 45.495471,
    longitude: -73.579131,
  },
  MB_F1_building_entry_exit_2: {
    nodeId: "MB_F1_building_entry_exit_2",
    buildingId: "MB",
    latitude: 45.495024,
    longitude: -73.578714,
  },
 
  // --- Central Building (CC) - Loyola Campus ---
  CC_F1_building_entry_exit_5: {
    nodeId: "CC_F1_building_entry_exit_5",
    buildingId: "CC",
    latitude: 45.458277,
    longitude: -73.640305,
  },
 
  // --- Vanier Library (VL) - Loyola Campus ---
  VL_F1_building_entry_exit_1: {
    nodeId: "VL_F1_building_entry_exit_1",
    buildingId: "VL",
    latitude: 45.458736,
    longitude: -73.638831,
  },
  VL_F1_building_entry_exit_2: {
    nodeId: "VL_F1_building_entry_exit_2",
    buildingId: "VL",
    latitude: 45.459102,
    longitude: -73.638204,
  },
};
 
/**
 * Returns all entry/exit coordinates for a given building.
 */
export function getEntryExitsForBuilding(
  buildingId: IndoorBuildingId,
): EntryExitCoord[] {
  return Object.values(BUILDING_ENTRY_EXIT_COORDS).filter(
    (e) => e.buildingId === buildingId,
  );
}
 
/**
 * Returns the lat/lng for a specific entry/exit node, or null if not mapped.
 */
export function getEntryExitCoord(
  nodeId: string,
): EntryExitCoord | null {
  return BUILDING_ENTRY_EXIT_COORDS[nodeId] ?? null;
}