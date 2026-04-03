import { useMemo, useState } from "react";
import type {
  FloorNumber,
  IndoorBuildingId,
  LocalizedNode,
} from "../../../services/floorPlanService";
import { getBuildingGraph } from "../../../services/floorPlanService";
import { findPath } from "../utils/pathfinding";

const normalizeLabel = (value: string) => value.trim().toLowerCase();

type NavigationStartResult = {
  ok: boolean;
  reason?: "missing_points" | "no_route" | "no_accessible_route";
};

const CONNECTOR_NODE_TYPES = new Set(["elevator", "stair_landing", "stairs"]);

const compressConnectorHops = (inputPath: LocalizedNode[]): LocalizedNode[] => {
  if (inputPath.length < 3) {
    return inputPath;
  }

  const compressed: LocalizedNode[] = [];
  let index = 0;

  while (index < inputPath.length) {
    const current = inputPath[index];
    const currentLabel = normalizeLabel(current.label || "");

    if (!CONNECTOR_NODE_TYPES.has(current.nodeType) || !currentLabel) {
      compressed.push(current);
      index += 1;
      continue;
    }

    let end = index + 1;
    while (end < inputPath.length) {
      const next = inputPath[end];
      if (
        next.nodeType !== current.nodeType ||
        normalizeLabel(next.label || "") !== currentLabel
      ) {
        break;
      }
      end += 1;
    }

    if (end - index > 1) {
      compressed.push(current, inputPath[end - 1]);
      index = end;
      continue;
    }

    compressed.push(current);
    index += 1;
  }

  return compressed.filter(
    (node, idx, arr) =>
      idx === 0 ||
      node.id !== arr[idx - 1].id ||
      node.floor !== arr[idx - 1].floor,
  );
};

export const useIndoorNavigation = (
  buildingId: IndoorBuildingId,
  currentFloor: FloorNumber,
) => {
  const graph = useMemo(() => getBuildingGraph(buildingId), [buildingId]);

  const [startPoint, setStartPoint] = useState("");
  const [destinationPoint, setDestinationPoint] = useState("");
  const [isAccessibilityEnabled, setIsAccessibilityEnabled] = useState(false);

  const [startResults, setStartResults] = useState<LocalizedNode[]>([]);
  const [destinationResults, setDestinationResults] = useState<LocalizedNode[]>([]);

  const [selectedStartNode, setSelectedStartNode] = useState<LocalizedNode | null>(
    null,
  );
  const [selectedDestinationNode, setSelectedDestinationNode] =
    useState<LocalizedNode | null>(null);

  const [path, setPath] = useState<LocalizedNode[]>([]);

  const allNodes = graph?.nodes || [];
  const allEdges = graph?.edges || [];

  const computePath = (
    startNode: LocalizedNode | null,
    destinationNode: LocalizedNode | null,
    accessibilityEnabled: boolean,
  ) => {
    if (!startNode || !destinationNode) {
      return [];
    }

    return compressConnectorHops(
      findPath(startNode.id, destinationNode.id, allNodes, allEdges, {
        accessibilityEnabled,
      }),
    );
  };

  const filterNodes = (text: string) => {
    const normalizedText = normalizeLabel(text);
    if (!normalizedText) return [];

    return allNodes
      .filter((node) => normalizeLabel(node.label || "").includes(normalizedText))
      .sort((a, b) => {
        const aExact = normalizeLabel(a.label || "") === normalizedText ? 0 : 1;
        const bExact = normalizeLabel(b.label || "") === normalizedText ? 0 : 1;
        if (aExact !== bExact) return aExact - bExact;

        const aCurrentFloor = a.floor === currentFloor ? 0 : 1;
        const bCurrentFloor = b.floor === currentFloor ? 0 : 1;
        if (aCurrentFloor !== bCurrentFloor) return aCurrentFloor - bCurrentFloor;

        return (a.label || "").localeCompare(b.label || "");
      });
  };

  const recomputePath = (
    startNode: LocalizedNode | null,
    destinationNode: LocalizedNode | null,
    accessibilityEnabled: boolean,
  ) => {
    if (!startNode || !destinationNode) {
      setPath([]);
      return [];
    }

    const result = computePath(startNode, destinationNode, accessibilityEnabled);
    setPath(result);
    return result;
  };

  const handleStartSearch = (text: string) => {
    setStartPoint(text);
    setSelectedStartNode(null);
    setStartResults(filterNodes(text));
    setIsAccessibilityEnabled(false);
    setPath([]);
  };

  const handleDestinationSearch = (text: string) => {
    setDestinationPoint(text);
    setSelectedDestinationNode(null);
    setDestinationResults(filterNodes(text));
    setIsAccessibilityEnabled(false);
    setPath([]);
  };

  const selectStartNode = (node: LocalizedNode) => {
    setSelectedStartNode(node);
    setStartPoint(node.label);
    setStartResults([]);
    setIsAccessibilityEnabled(false);
    setPath([]);
  };

  const selectDestinationNode = (node: LocalizedNode) => {
    setSelectedDestinationNode(node);
    setDestinationPoint(node.label);
    setDestinationResults([]);
    setIsAccessibilityEnabled(false);
    setPath([]);
  };

  const handleStartNavigation = (): NavigationStartResult => {
    if (!selectedStartNode || !selectedDestinationNode) {
      setPath([]);
      return { ok: false, reason: "missing_points" };
    }

    const result = recomputePath(
      selectedStartNode,
      selectedDestinationNode,
      isAccessibilityEnabled,
    );

    if (result.length === 0) {
      if (isAccessibilityEnabled) {
        const fallbackRoute = computePath(
          selectedStartNode,
          selectedDestinationNode,
          false,
        );

        if (fallbackRoute.length > 0) {
          setPath(fallbackRoute);
          setIsAccessibilityEnabled(false);
          return {
            ok: false,
            reason: "no_accessible_route",
          };
        }
      }

      return {
        ok: false,
        reason: isAccessibilityEnabled ? "no_accessible_route" : "no_route",
      };
    }

    return { ok: true };
  };

  const swapPoints = () => {
    setStartPoint(destinationPoint);
    setDestinationPoint(startPoint);
    setSelectedStartNode(selectedDestinationNode);
    setSelectedDestinationNode(selectedStartNode);
    setStartResults([]);
    setDestinationResults([]);
    setIsAccessibilityEnabled(false);
    setPath([]);
  };

  const toggleAccessibility = (): NavigationStartResult | null => {
    const nextValue = !isAccessibilityEnabled;

    if (selectedStartNode && selectedDestinationNode) {
      const result = computePath(
        selectedStartNode,
        selectedDestinationNode,
        nextValue,
      );

      if (result.length === 0) {
        return {
          ok: false,
          reason: nextValue ? "no_accessible_route" : "no_route",
        };
      }

      setPath(result);
      setIsAccessibilityEnabled(nextValue);
      return { ok: true };
    }

    setIsAccessibilityEnabled(nextValue);
    return null;
  };

  return {
    startPoint,
    destinationPoint,
    startResults,
    destinationResults,
    path,
    isAccessibilityEnabled,
    selectedStartNode,
    selectedDestinationNode,
    handleStartSearch,
    handleDestinationSearch,
    selectStartNode,
    selectDestinationNode,
    handleStartNavigation,
    toggleAccessibility,
    swapPoints,
  };
};
