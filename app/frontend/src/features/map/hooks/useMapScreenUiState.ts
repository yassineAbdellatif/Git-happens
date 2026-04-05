import { useState, useCallback } from "react";
import { MapType } from "react-native-maps";

export const useMapScreenUiState = (_selectedBuildingId: string | null) => {
  const [mapType, setMapType] = useState<MapType>("standard");
  const [isIndoorInteracting, setIsIndoorInteracting] = useState(false);

  const toggleMapType = useCallback(() => {
    setMapType((prev) => (prev === "standard" ? "hybrid" : "standard"));
  }, []);

  return {
    mapType,
    setMapType,
    toggleMapType,
    isIndoorInteracting,
    setIsIndoorInteracting,
  };
};
