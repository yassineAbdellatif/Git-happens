import { useState } from "react";
import type { LocalizedNode, RawEdge } from "../../../services/floorPlanService";
import { findPath } from "../utils/pathfinding";

export const useIndoorNavigation = (nodes: LocalizedNode[], edges: RawEdge[]) => {
  const [startPoint, setStartPoint] = useState("");
  const [destinationPoint, setDestinationPoint] = useState("");

  const [startResults, setStartResults] = useState<LocalizedNode[]>([]);
  const [destinationResults, setDestinationResults] = useState<LocalizedNode[]>([]);

  const [selectedStartNode, setSelectedStartNode] = useState<LocalizedNode | null>(null);
  const [selectedDestinationNode, setSelectedDestinationNode] = useState<LocalizedNode | null>(null);

  const [path, setPath] = useState<LocalizedNode[]>([]);

  const filterNodes = (text: string) => {
    if (!text) return [];

    return nodes.filter((node) =>
      (node.label || "").toLowerCase().includes(text.toLowerCase())
    );
  };

  const handleSearch = (text: string, setPoint: React.Dispatch<React.SetStateAction<string>>, setSelectedNode: React.Dispatch<React.SetStateAction<LocalizedNode | null>>, setResults: React.Dispatch<React.SetStateAction<LocalizedNode[]>>) => {
    setPoint(text);
    setSelectedNode(null);
    setResults(filterNodes(text));
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
    if (!selectedStartNode || !selectedDestinationNode) {
      console.warn("Select both points first");
      return;
    }

    console.log(
      `[NAV] ${selectedStartNode.label} → ${selectedDestinationNode.label}`
    );

    const result = findPath(
      selectedStartNode.id,
      selectedDestinationNode.id,
      nodes,
      edges
    );

    if (result.length === 0) {
      console.warn(
        `[NAV] No path found between ${selectedStartNode.id} and ${selectedDestinationNode.id}`
      );
    } else {
      console.log(
        `[NAV] Path found: ${result.length} nodes`,
        result.map((n) => n.label)
      );
    }

    setPath(result);
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

  return {
    startPoint,
    destinationPoint,
    startResults,
    destinationResults,
    path,
    handleStartSearch,
    handleDestinationSearch,
    selectStartNode,
    selectDestinationNode,
    handleStartNavigation,
    swapPoints,
  };
};