import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, PanResponder } from "react-native";
import {
  FloorNumber,
  FloorPlanRegistryEntry,
  getFloorPlanRegistryEntry,
  getSupportedFloorsForBuilding,
} from "../../../services/floorPlanService";

const clampScale = (value: number) => Math.min(3, Math.max(1, value));

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

export const useIndoorFloorPlanInteraction = (
  onInteractionChange?: (isInteracting: boolean) => void
) => {
  const [zoom, setZoom] = useState(1);
  const translate = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const lastPan = useRef({ x: 0, y: 0 });
  const pinchStartDistance = useRef<number | null>(null);
  const pinchStartZoom = useRef(1);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onStartShouldSetPanResponderCapture: () => false,
        onMoveShouldSetPanResponder: (_, gestureState) => {
          return Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
        },
        onMoveShouldSetPanResponderCapture: () => true,
        onPanResponderGrant: () => {
          onInteractionChange?.(true);
        },
        onPanResponderMove: (evt, gestureState) => {
          const touches = evt.nativeEvent.touches;

          if (touches.length === 2) {
            const [touchA, touchB] = touches;
            const dx = touchA.pageX - touchB.pageX;
            const dy = touchA.pageY - touchB.pageY;
            const distance = Math.hypot(dx, dy);

            if (pinchStartDistance.current === null) {
              pinchStartDistance.current = distance;
              pinchStartZoom.current = zoom;
            } else {
              setZoom(
                clampScale(
                  pinchStartZoom.current *
                    (distance / pinchStartDistance.current)
                )
              );
            }
            return;
          }

          pinchStartDistance.current = null;
          translate.setValue({
            x: lastPan.current.x + gestureState.dx,
            y: lastPan.current.y + gestureState.dy,
          });
        },
        onPanResponderRelease: () => {
          pinchStartDistance.current = null;
          translate.stopAnimation((value: { x: number; y: number }) => {
            lastPan.current = { x: value.x, y: value.y };
          });
          onInteractionChange?.(false);
        },
        onPanResponderTerminate: () => {
          pinchStartDistance.current = null;
          onInteractionChange?.(false);
        },
      }),
    [onInteractionChange, translate, zoom]
  );

  const handleZoomChange = (delta: number) => {
    setZoom((prev) => clampScale(prev + delta));
  };

  const handleResetView = () => {
    setZoom(1);
    translate.setValue({ x: 0, y: 0 });
    lastPan.current = { x: 0, y: 0 };
    pinchStartDistance.current = null;
  };

  return {
    zoom,
    translate,
    panResponder,
    handleZoomChange,
    handleResetView,
  };
};
