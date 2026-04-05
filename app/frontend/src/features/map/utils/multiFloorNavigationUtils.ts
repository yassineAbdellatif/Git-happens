import type { LocalizedNode, FloorNumber, LocalizedNodeType } from "../../../services/floorPlanService";

// @param path is the complete path spanning multiple floors
export function splitPathByFloor(
  path: LocalizedNode[] 
): Record<FloorNumber, LocalizedNode[]> {
  return path.reduce(
    (acc, node) => {
      (acc[node.floor] ??= []).push(node);
      return acc;
    },
    {} as Record<FloorNumber, LocalizedNode[]>
  );
}

// Extracts unique floors in order:
export function getFloorsInPath(path: LocalizedNode[]): FloorNumber[] {
  const seen = new Set<FloorNumber>();
  const floors: FloorNumber[] = [];

  for (const node of path) {
    if (!seen.has(node.floor)) {
      seen.add(node.floor);
      floors.push(node.floor);
    }
  }
  return floors;
}

export function getPathSegmentForFloor(
  path: LocalizedNode[],
  activeFloor: FloorNumber
): LocalizedNode[] {
  return path.filter((node) => node.floor === activeFloor);
}

// identifies elevators/stairs:
export function isCrossFloorNode(node: LocalizedNode): boolean {
  return node.nodeType === "elevator" || node.nodeType === "stair_landing";
}

export function getNextFloorInPath(
  path: LocalizedNode[],
  currentFloor: FloorNumber
): FloorNumber | null {
  const floors = getFloorsInPath(path);
  const idx = floors.indexOf(currentFloor);
  return idx !== -1 && idx + 1 < floors.length ? floors[idx + 1] : null;
}