import type {
  IndoorBuildingId,
  LocalizedNode,
  RawEdge,
} from "../../../services/floorPlanService";
import { getBuildingGraph } from "../../../services/floorPlanService";
import {
  getEntryExitsForBuilding,
  getEntryExitCoord,
  type EntryExitCoord,
} from "../../../constants/buildingEntryExitCoords";
import { findPath } from "./pathfinding";
import { getRouteFromBackend } from "../../../services/mapApiService";
import { decodePolyline } from "../../../utils/polylineDecoder";
 
// ─── Types ───────────────────────────────────────────────────────────────────
 
export interface HandoffRouteRequest {
  /** Building ID where the journey starts (e.g. "H") */
  originBuildingId: IndoorBuildingId;
  /** Indoor node ID for the starting room (e.g. "Hall_F8_room_820") */
  originNodeId: string;
  /** Building ID where the journey ends (e.g. "MB") */
  destinationBuildingId: IndoorBuildingId;
  /** Indoor node ID for the destination room (e.g. "MB_F1_room_123") */
  destinationNodeId: string;
  /** Outdoor travel mode for the between-buildings leg */
  outdoorMode?: "WALKING" | "DRIVING";
  /** Whether to use accessibility-only routes indoors */
  accessibilityEnabled?: boolean;
}
 
/** A segment of indoor navigation within one building. */
export interface IndoorSegment {
  type: "indoor";
  buildingId: IndoorBuildingId;
  path: LocalizedNode[];
  entryExitNodeId: string;
}
 
/** The outdoor segment between two buildings. */
export interface OutdoorSegment {
  type: "outdoor";
  originCoord: { latitude: number; longitude: number };
  destinationCoord: { latitude: number; longitude: number };
  polylineCoords: { latitude: number; longitude: number }[];
  distance: string;
  duration: string;
  steps: { instruction: string; distance: string; duration: string }[];
}
 
export type HandoffSegment = IndoorSegment | OutdoorSegment;
 
export interface HandoffRouteResult {
  segments: [IndoorSegment, OutdoorSegment, IndoorSegment];
  totalOutdoorDistance: string;
  totalOutdoorDuration: string;
}
 
export type HandoffError =
  | { code: "NO_BUILDING_GRAPH"; buildingId: string }
  | { code: "NO_ENTRY_EXITS"; buildingId: string }
  | { code: "NO_INDOOR_ROUTE"; buildingId: string; from: string; to: string }
  | { code: "NO_OUTDOOR_ROUTE"; from: string; to: string }
  | { code: "MISSING_EXIT_COORDS"; nodeId: string };
 
export type HandoffResult =
  | { ok: true; route: HandoffRouteResult }
  | { ok: false; error: HandoffError };
 
// ─── Helpers ─────────────────────────────────────────────────────────────────
 
/**
 * Finds the best entry/exit node in a building for indoor navigation.
 *
 * "Best" = the exit node that produces the shortest indoor path from the
 * given room. We try every building_entry_exit node that has a mapped
 * lat/lng coordinate and pick the one with the shortest A* path.
 */
export function findBestExit(
  roomNodeId: string,
  nodes: LocalizedNode[],
  edges: RawEdge[],
  buildingId: IndoorBuildingId,
  accessibilityEnabled: boolean,
): { exitNode: LocalizedNode; path: LocalizedNode[]; coord: EntryExitCoord } | null {
  const entryExits = getEntryExitsForBuilding(buildingId);
  if (entryExits.length === 0) return null;
 
  const exitNodeIds = new Set(entryExits.map((e) => e.nodeId));
 
  let bestResult: {
    exitNode: LocalizedNode;
    path: LocalizedNode[];
    coord: EntryExitCoord;
  } | null = null;
  let bestCost = Infinity;
 
  for (const entryExit of entryExits) {
    const exitNode = nodes.find((n) => n.id === entryExit.nodeId);
    if (!exitNode) continue;
 
    const path = findPath(roomNodeId, entryExit.nodeId, nodes, edges, {
      accessibilityEnabled,
    });
 
    if (path.length === 0) continue;
 
    // Use path length as a proxy for cost (A* already gives shortest path)
    if (path.length < bestCost) {
      bestCost = path.length;
      bestResult = { exitNode, path, coord: entryExit };
    }
  }
 
  return bestResult;
}
 
/**
 * Finds the best entry node in a destination building — the one closest
 * (Haversine) to the outdoor origin coordinate, that also has a valid
 * indoor path to the destination room.
 */
export function findBestEntry(
  roomNodeId: string,
  nodes: LocalizedNode[],
  edges: RawEdge[],
  buildingId: IndoorBuildingId,
  fromCoord: { latitude: number; longitude: number },
  accessibilityEnabled: boolean,
): { entryNode: LocalizedNode; path: LocalizedNode[]; coord: EntryExitCoord } | null {
  const entryExits = getEntryExitsForBuilding(buildingId);
  if (entryExits.length === 0) return null;
 
  let bestResult: {
    entryNode: LocalizedNode;
    path: LocalizedNode[];
    coord: EntryExitCoord;
  } | null = null;
  let bestDistance = Infinity;
 
  for (const entryExit of entryExits) {
    const entryNode = nodes.find((n) => n.id === entryExit.nodeId);
    if (!entryNode) continue;
 
    const path = findPath(entryExit.nodeId, roomNodeId, nodes, edges, {
      accessibilityEnabled,
    });
 
    if (path.length === 0) continue;
 
    // Pick the entry closest to where the user will arrive from outdoors
    const dist = haversine(fromCoord, entryExit);
    if (dist < bestDistance) {
      bestDistance = dist;
      bestResult = { entryNode, path, coord: entryExit };
    }
  }
 
  return bestResult;
}
 
/** Simple Haversine distance in meters between two lat/lng points. */
// haversine function learned and used from https://github.com/thealmarques/haversine-distance-typescript.git
function haversine(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number },
): number {
  const R = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const sinLat = Math.sin(dLat / 2);
  const sinLon = Math.sin(dLon / 2);
  const h =
    sinLat * sinLat +
    Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * sinLon * sinLon;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export async function buildHandoffRoute(
  request: HandoffRouteRequest,
): Promise<HandoffResult> {
  const {
    originBuildingId,
    originNodeId,
    destinationBuildingId,
    destinationNodeId,
    outdoorMode = "WALKING",
    accessibilityEnabled = false,
  } = request;
 
  // ── Step 1: Load building graphs ──────────────────────────────────────
 
  const originGraph = getBuildingGraph(originBuildingId);
  if (!originGraph) {
    return { ok: false, error: { code: "NO_BUILDING_GRAPH", buildingId: originBuildingId } };
  }
 
  const destGraph = getBuildingGraph(destinationBuildingId);
  if (!destGraph) {
    return { ok: false, error: { code: "NO_BUILDING_GRAPH", buildingId: destinationBuildingId } };
  }
 
  // ── Step 2: Find best exit from origin building ───────────────────────
 
  const exitResult = findBestExit(
    originNodeId,
    originGraph.nodes,
    originGraph.edges,
    originBuildingId,
    accessibilityEnabled,
  );
 
  if (!exitResult) {
    const hasExits = getEntryExitsForBuilding(originBuildingId).length > 0;
    if (!hasExits) {
      return { ok: false, error: { code: "NO_ENTRY_EXITS", buildingId: originBuildingId } };
    }
    return {
      ok: false,
      error: { code: "NO_INDOOR_ROUTE", buildingId: originBuildingId, from: originNodeId, to: "exit" },
    };
  }
 
  // ── Step 3: Find best entry into destination building ─────────────────
 
  const entryResult = findBestEntry(
    destinationNodeId,
    destGraph.nodes,
    destGraph.edges,
    destinationBuildingId,
    exitResult.coord,
    accessibilityEnabled,
  );
 
  if (!entryResult) {
    const hasExits = getEntryExitsForBuilding(destinationBuildingId).length > 0;
    if (!hasExits) {
      return { ok: false, error: { code: "NO_ENTRY_EXITS", buildingId: destinationBuildingId } };
    }
    return {
      ok: false,
      error: { code: "NO_INDOOR_ROUTE", buildingId: destinationBuildingId, from: "entry", to: destinationNodeId },
    };
  }
 
  // ── Step 4: Fetch outdoor route between exit and entry doors ──────────
 
  const originStr = `${exitResult.coord.latitude},${exitResult.coord.longitude}`;
  const destStr = `${entryResult.coord.latitude},${entryResult.coord.longitude}`;
 
  let outdoorSegment: OutdoorSegment;
 
  try {
    const data = await getRouteFromBackend(originStr, destStr, outdoorMode);
 
    if (!data.routes?.length) {
      return {
        ok: false,
        error: { code: "NO_OUTDOOR_ROUTE", from: originStr, to: destStr },
      };
    }
 
    const route = data.routes[0];
    const polylineCoords = decodePolyline(route.overview_polyline.points);
 
    outdoorSegment = {
      type: "outdoor",
      originCoord: { latitude: exitResult.coord.latitude, longitude: exitResult.coord.longitude },
      destinationCoord: { latitude: entryResult.coord.latitude, longitude: entryResult.coord.longitude },
      polylineCoords,
      distance: route.legs[0].distance.text,
      duration: route.legs[0].duration.text,
      steps: data.processedRoute?.steps ?? [],
    };
  } catch {
    return {
      ok: false,
      error: { code: "NO_OUTDOOR_ROUTE", from: originStr, to: destStr },
    };
  }
 
  // ── Step 5: Assemble the three segments ───────────────────────────────
 
  const indoorOriginSegment: IndoorSegment = {
    type: "indoor",
    buildingId: originBuildingId,
    path: exitResult.path,
    entryExitNodeId: exitResult.exitNode.id,
  };
 
  const indoorDestSegment: IndoorSegment = {
    type: "indoor",
    buildingId: destinationBuildingId,
    path: entryResult.path,
    entryExitNodeId: entryResult.entryNode.id,
  };
 
  return {
    ok: true,
    route: {
      segments: [indoorOriginSegment, outdoorSegment, indoorDestSegment],
      totalOutdoorDistance: outdoorSegment.distance,
      totalOutdoorDuration: outdoorSegment.duration,
    },
  };
}
