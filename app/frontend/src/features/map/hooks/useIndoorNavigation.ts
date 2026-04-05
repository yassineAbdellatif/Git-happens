import { useState } from "react";
import type { LocalizedNode, RawEdge } from "../../../services/floorPlanService";
import { findPath } from "../utils/pathfinding";

type NavigationResult =
  | { ok: true }
  | { ok: false; reason: "missing_points" | "no_route" | "no_accessible_route" };

export const useIndoorNavigation = (
  nodes: LocalizedNode[],
  edges: RawEdge[],
) => {
  const [startPoint, setStartPoint] = useState("");
  const [destinationPoint, setDestinationPoint] = useState("");
  const [startResults, setStartResults] = useState<LocalizedNode[]>([]);
  const [destinationResults, setDestinationResults] = useState<LocalizedNode[]>([]);
  const [selectedStartNode, setSelectedStartNode] =
    useState<LocalizedNode | null>(null);
  const [selectedDestinationNode, setSelectedDestinationNode] =
    useState<LocalizedNode | null>(null);
  const [path, setPath] = useState<LocalizedNode[]>([]);
  const [isAccessibilityEnabled, setIsAccessibilityEnabled] = useState(false);

  const filterNodes = (text: string) => {
    if (!text) return [];

    return nodes.filter((node) =>
      (node.label || "").toLowerCase().includes(text.toLowerCase()),
    );
  };

  const resetRouteState = () => {
    setPath([]);
    setIsAccessibilityEnabled(false);
  };

  const handleStartSearch = (text: string) => {
    setStartPoint(text);
    setSelectedStartNode(null);
    setStartResults(filterNodes(text));
    resetRouteState();
  };

  const handleDestinationSearch = (text: string) => {
    setDestinationPoint(text);
    setSelectedDestinationNode(null);
    setDestinationResults(filterNodes(text));
    resetRouteState();
  };

  const selectStartNode = (node: LocalizedNode) => {
    setSelectedStartNode(node);
    setStartPoint(node.label);
    setStartResults([]);
    resetRouteState();
  };

  const selectDestinationNode = (node: LocalizedNode) => {
    setSelectedDestinationNode(node);
    setDestinationPoint(node.label);
    setDestinationResults([]);
    resetRouteState();
  };

  const buildRoute = (accessibilityEnabled: boolean) => {
    if (!selectedStartNode || !selectedDestinationNode) {
      return [];
    }

    return findPath(selectedStartNode.id, selectedDestinationNode.id, nodes, edges, {
      accessibilityEnabled,
    });
  };

  const handleStartNavigation = (): NavigationResult => {
    if (!selectedStartNode || !selectedDestinationNode) {
      console.warn("Select both points first");
      return { ok: false, reason: "missing_points" };
    }

    const result = buildRoute(isAccessibilityEnabled);

    if (result.length === 0) {
      const reason = isAccessibilityEnabled ? "no_accessible_route" : "no_route";
      console.warn(
        `[NAV] No path found between ${selectedStartNode.id} and ${selectedDestinationNode.id}`,
      );
      setPath([]);
      return { ok: false, reason };
    }

    console.log(
      `[NAV] Path found: ${result.length} nodes`,
      result.map((n) => n.label),
    );
    setPath(result);
    return { ok: true };
  };

  const toggleAccessibility = (): NavigationResult => {
    const nextValue = !isAccessibilityEnabled;

    if (!selectedStartNode || !selectedDestinationNode) {
      setIsAccessibilityEnabled(nextValue);
      return { ok: true };
    }

    const result = buildRoute(nextValue);
    if (result.length === 0) {
      return {
        ok: false,
        reason: nextValue ? "no_accessible_route" : "no_route",
      };
    }

    setIsAccessibilityEnabled(nextValue);
    setPath(result);
    return { ok: true };
  };

  const swapPoints = () => {
    setStartPoint(destinationPoint);
    setDestinationPoint(startPoint);
    setSelectedStartNode(selectedDestinationNode);
    setSelectedDestinationNode(selectedStartNode);
    setStartResults([]);
    setDestinationResults([]);
    resetRouteState();
  };

  return {
    startPoint,
    destinationPoint,
    startResults,
    destinationResults,
    path,
    isAccessibilityEnabled,
    handleStartSearch,
    handleDestinationSearch,
    selectStartNode,
    selectDestinationNode,
    handleStartNavigation,
    toggleAccessibility,
    swapPoints,
  };
};
