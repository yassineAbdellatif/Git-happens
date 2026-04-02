import { collection, getDocs, query, where } from "firebase/firestore";
import { CONCORDIA_BUILDINGS } from "../constants/buildings";
import { db } from "../features/auth/config/firebaseConfig";

export interface BuildingTransitionNode {
  id: string;
  buildingId: string;
  floor: number;
  label: string;
  x: number;
  y: number;
  latitude: number;
  longitude: number;
  isPrimary: boolean;
}

const TRANSITION_NODES_COLLECTION = "buildingTransitionNodes";
const TRANSITION_FLOOR = 1;

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const isValidLatitude = (value: number): boolean =>
  value >= -90 && value <= 90;

const isValidLongitude = (value: number): boolean =>
  value >= -180 && value <= 180;

const isValidTransitionNode = (
  node: Partial<BuildingTransitionNode>,
): node is BuildingTransitionNode => {
  if (
    typeof node.id !== "string" ||
    typeof node.buildingId !== "string" ||
    typeof node.label !== "string"
  ) {
    return false;
  }

  if (
    !isFiniteNumber(node.floor) ||
    !isFiniteNumber(node.x) ||
    !isFiniteNumber(node.y) ||
    !isFiniteNumber(node.latitude) ||
    !isFiniteNumber(node.longitude) ||
    typeof node.isPrimary !== "boolean"
  ) {
    return false;
  }

  return isValidLatitude(node.latitude) && isValidLongitude(node.longitude);
};

const localFallbackTransitionNodes: BuildingTransitionNode[] =
  CONCORDIA_BUILDINGS.map((building) => {
    const defaultCoordinate = building.coordinates[0];
    return {
      id: `${building.id}_F1_MAIN_EXIT`,
      buildingId: building.id,
      floor: TRANSITION_FLOOR,
      label: `${building.id} Main Entrance`,
      // Temporary floor-plan coordinate defaults until indoor maps are fully calibrated.
      x: 0,
      y: 0,
      latitude: defaultCoordinate.latitude,
      longitude: defaultCoordinate.longitude,
      isPrimary: true,
    };
  });

const transitionCache = new Map<string, BuildingTransitionNode[]>();

const getFallbackNodesForBuilding = (
  buildingId: string,
): BuildingTransitionNode[] =>
  localFallbackTransitionNodes.filter(
    (node) => node.buildingId === buildingId && node.floor === TRANSITION_FLOOR,
  );

const normalizeTransitionNode = (
  input: Partial<BuildingTransitionNode>,
): BuildingTransitionNode | null => {
  const normalized: Partial<BuildingTransitionNode> = {
    id: input.id,
    buildingId: input.buildingId,
    floor: input.floor,
    label: input.label,
    x: input.x,
    y: input.y,
    latitude: input.latitude,
    longitude: input.longitude,
    isPrimary: input.isPrimary ?? false,
  };

  if (!isValidTransitionNode(normalized)) {
    return null;
  }

  return normalized;
};

export const getTransitionNodesForBuilding = async (
  buildingId: string,
): Promise<BuildingTransitionNode[]> => {
  const cached = transitionCache.get(buildingId);
  if (cached) {
    return cached;
  }

  try {
    const transitionQuery = query(
      collection(db, TRANSITION_NODES_COLLECTION),
      where("buildingId", "==", buildingId),
      where("floor", "==", TRANSITION_FLOOR),
    );

    const snapshot = await getDocs(transitionQuery);
    const remoteNodes = snapshot.docs
      .map((doc) =>
        normalizeTransitionNode({
          ...(doc.data() as Partial<BuildingTransitionNode>),
          id: (doc.data() as Partial<BuildingTransitionNode>).id ?? doc.id,
        }),
      )
      .filter((node): node is BuildingTransitionNode => node !== null);

    const nodesToUse =
      remoteNodes.length > 0 ? remoteNodes : getFallbackNodesForBuilding(buildingId);

    transitionCache.set(buildingId, nodesToUse);
    return nodesToUse;
  } catch (error) {
    console.warn("Falling back to local transition node defaults:", error);
    const fallbackNodes = getFallbackNodesForBuilding(buildingId);
    transitionCache.set(buildingId, fallbackNodes);
    return fallbackNodes;
  }
};

export const getPrimaryTransitionCoordinate = async (
  buildingId: string,
): Promise<{ latitude: number; longitude: number } | null> => {
  const nodes = await getTransitionNodesForBuilding(buildingId);
  if (nodes.length === 0) {
    return null;
  }

  const primaryNode =
    nodes.find((node) => node.isPrimary) ??
    nodes.sort((a, b) => a.id.localeCompare(b.id))[0];

  return {
    latitude: primaryNode.latitude,
    longitude: primaryNode.longitude,
  };
};