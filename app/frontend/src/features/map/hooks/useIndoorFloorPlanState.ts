import { useEffect, useMemo, useState } from "react";
import {
  FloorNumber,
  FloorPlanRegistryEntry,
  getFloorPlanRegistryEntry,
  getSupportedFloorsForBuilding,
} from "../../../services/floorPlanService";

export const useIndoorFloorPlanState = (selectedBuildingId: string | null) => {
  const supportedFloors = useMemo(
    () =>
      selectedBuildingId ? getSupportedFloorsForBuilding(selectedBuildingId) : [],
    [selectedBuildingId]
  );

  const [selectedFloorNumber, setSelectedFloorNumber] =
    useState<FloorNumber | null>(supportedFloors[0] || null);

  useEffect(() => {
    setSelectedFloorNumber(supportedFloors[0] || null);
  }, [selectedBuildingId, supportedFloors]);

  const activeFloorPlanEntry: FloorPlanRegistryEntry | null = useMemo(() => {
    if (!selectedBuildingId || !selectedFloorNumber) return null;
    return getFloorPlanRegistryEntry(selectedBuildingId, selectedFloorNumber);
  }, [selectedBuildingId, selectedFloorNumber]);

  return {
    supportedFloors,
    selectedFloorNumber,
    setSelectedFloorNumber,
    activeFloorPlanEntry,
  };
};
