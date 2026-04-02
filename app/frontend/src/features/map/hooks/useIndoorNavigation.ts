import { useMemo, useState } from "react";
import type {
  IndoorBuildingId,
  LocalizedNode,
} from "../../../services/floorPlanService";
import { getBuildingGraph } from "../../../services/floorPlanService";
import { findPath } from "../utils/pathfinding";

const normalizeLabel = (value: string) => value.trim().toLowerCase();

export const useIndoorNavigation = (buildingId: IndoorBuildingId) => {
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

  const filterNodes = (text: string) => {
    const normalizedText = normalizeLabel(text);
    if (!normalizedText) return [];

    return allNodes.filter((node) =>
      normalizeLabel(node.label || "").includes(normalizedText),
    );
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

    const result = findPath(startNode.id, destinationNode.id, allNodes, allEdges, {
      accessibilityEnabled,
    });

    setPath(result);
    return result;
  };

  const handleStartSearch = (text: string) => {
    setStartPoint(text);
    setSelectedStartNode(null);
    setStartResults(filterNodes(text));
    setPath([]);
  };

  const handleDestinationSearch = (text: string) => {
    setDestinationPoint(text);
    setSelectedDestinationNode(null);
    setDestinationResults(filterNodes(text));
    setPath([]);
  };

  const selectStartNode = (node: LocalizedNode) => {
    setSelectedStartNode(node);
    setStartPoint(node.label);
    setStartResults([]);
    setPath([]);
  };

  const selectDestinationNode = (node: LocalizedNode) => {
    setSelectedDestinationNode(node);
    setDestinationPoint(node.label);
    setDestinationResults([]);
    setPath([]);
  };

  const handleStartNavigation = () => {
    recomputePath(
      selectedStartNode,
      selectedDestinationNode,
      isAccessibilityEnabled,
    );
  };

  const swapPoints = () => {
    setStartPoint(destinationPoint);
    setDestinationPoint(startPoint);
    setSelectedStartNode(selectedDestinationNode);
    setSelectedDestinationNode(selectedStartNode);
    setStartResults([]);
    setDestinationResults([]);
    setPath([]);
  };

  const toggleAccessibility = () => {
    const nextValue = !isAccessibilityEnabled;
    setIsAccessibilityEnabled(nextValue);

    if (selectedStartNode && selectedDestinationNode) {
      recomputePath(selectedStartNode, selectedDestinationNode, nextValue);
    }
  };

  const clearPath = () => {
    setPath([]);
  };

  const routeFloors = useMemo(
    () =>
      [...new Set(path.map((node) => node.floor).filter(Boolean))].map(String),
    [path],
  );

  return {
    startPoint,
    destinationPoint,
    startResults,
    destinationResults,
    path,
    routeFloors,
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
    clearPath,
  };
};
