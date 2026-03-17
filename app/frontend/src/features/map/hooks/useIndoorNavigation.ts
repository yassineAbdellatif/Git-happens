import { useState } from "react";

export const useIndoorNavigation = () => {
  const [startPoint, setStartPoint] = useState("");
  const [destinationPoint, setDestinationPoint] = useState("");

  const handleStartSearch = (text: string) => {
    setStartPoint(text);
    // to be implemented later: filter nodes based on text
  };

  const handleDestinationSearch = (text: string) => {
    setDestinationPoint(text);
    // to be implemented later: filter nodes based on text
  };

  const handleStartNavigation = () => {
    console.log(`Navigating from ${startPoint} to ${destinationPoint}`);
    // to be implemented later: Trigger pathfinding algorithm
  };

  const swapPoints = () => {
    const temp = startPoint;
    setStartPoint(destinationPoint);
    setDestinationPoint(temp);
  };

  return {
    startPoint,
    destinationPoint,
    handleStartSearch,
    handleDestinationSearch,
    handleStartNavigation,
    swapPoints,
  };
};
