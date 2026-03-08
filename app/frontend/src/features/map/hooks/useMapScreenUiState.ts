import { useEffect, useState } from "react";
import { MapType } from "react-native-maps";

export const useMapScreenUiState = (selectedBuildingId: string | null) => {
  const [mapType, setMapType] = useState<MapType>("hybrid");
  const [isIndoorOpen, setIsIndoorOpen] = useState(false);
  const [isIndoorInteracting, setIsIndoorInteracting] = useState(false);

  useEffect(() => {
    setIsIndoorOpen(false);
    setIsIndoorInteracting(false);
  }, [selectedBuildingId]);

  const toggleMapType = () => {
    setMapType((prev) => (prev === "hybrid" ? "standard" : "hybrid"));
  };

  return {
    mapType,
    setMapType,
    toggleMapType,
    isIndoorOpen,
    setIsIndoorOpen,
    isIndoorInteracting,
    setIsIndoorInteracting,
  };
};
