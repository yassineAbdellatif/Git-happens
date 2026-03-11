import React from "react";
import { Animated, Image, Text, TouchableOpacity, View } from "react-native";
import {
  FloorNumber,
  FloorPlanRegistryEntry,
} from "../../../services/floorPlanService";
import { useIndoorFloorPlanInteraction } from "../hooks/useIndoorFloorPlanState";
import { styles } from "../styles/mapScreenStyle";

interface IndoorFloorPlanProps {
  floorPlanEntry: FloorPlanRegistryEntry | null;
  supportedFloors: FloorNumber[];
  selectedFloorNumber: FloorNumber;
  onSelectFloor: (floor: FloorNumber) => void;
  onInteractionChange?: (isInteracting: boolean) => void;
}

const PNG_ASSET_MAP: Record<string, number> = {
  "assets/updated_floor_plans/h1.png": require("../../../../assets/updated_floor_plans/h1.png"),
  "assets/updated_floor_plans/h2.png": require("../../../../assets/updated_floor_plans/h2.png"),
  "assets/updated_floor_plans/h8.png": require("../../../../assets/updated_floor_plans/h8.png"),
  "assets/updated_floor_plans/h9.png": require("../../../../assets/updated_floor_plans/h9.png"),
  "assets/updated_floor_plans/cc1.png": require("../../../../assets/updated_floor_plans/cc1.png"),
};

const IndoorFloorPlan = ({
  floorPlanEntry,
  supportedFloors,
  selectedFloorNumber,
  onSelectFloor,
  onInteractionChange,
}: IndoorFloorPlanProps) => {
  const { zoom, translate, panResponder, handleZoomChange, handleResetView } =
    useIndoorFloorPlanInteraction(onInteractionChange);

  if (!floorPlanEntry) {
    return (
      <View style={styles.indoorPanel}>
        <Text style={styles.sheetTitle}>Indoor map unavailable</Text>
      </View>
    );
  }

  return (
    <View style={styles.indoorPanel}>
      <Text style={styles.sheetTitle}>
        {floorPlanEntry.buildingId} Floor {selectedFloorNumber}
      </Text>

      <View style={styles.floorChipRow}>
        {supportedFloors.map((floor) => (
          <TouchableOpacity
            key={floor}
            style={[
              styles.floorChip,
              floor === selectedFloorNumber && styles.floorChipActive,
            ]}
            onPress={() => onSelectFloor(floor)}
          >
            <Text
              style={[
                styles.floorChipText,
                floor === selectedFloorNumber && styles.floorChipTextActive,
              ]}
            >
              Floor {floor}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.indoorZoomControls}>
        <TouchableOpacity
          style={styles.indoorZoomButton}
          onPress={() => handleZoomChange(0.25)}
        >
          <Text style={styles.indoorZoomButtonText}>+</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.indoorZoomButton}
          onPress={() => handleZoomChange(-0.25)}
        >
          <Text style={styles.indoorZoomButtonText}>-</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.indoorZoomButton} onPress={handleResetView}>
          <Text style={styles.indoorZoomButtonText}>Reset</Text>
        </TouchableOpacity>
        <Text style={styles.indoorZoomText}>Zoom {zoom.toFixed(2)}x</Text>
      </View>

      <View style={styles.indoorViewerFrame}>
        <Animated.View
          {...panResponder.panHandlers}
          style={{
            transform: [
              { translateX: translate.x },
              { translateY: translate.y },
              { scale: zoom },
            ],
          }}
        >
          {PNG_ASSET_MAP[floorPlanEntry.floorPlanFile] ? (
            <Image
              source={PNG_ASSET_MAP[floorPlanEntry.floorPlanFile]}
              style={styles.indoorRasterImage}
              resizeMode="contain"
            />
          ) : (
            <Text style={styles.indoorSummaryText}>
              Missing floor-plan asset mapping for: {floorPlanEntry.floorPlanFile}
            </Text>
          )}
        </Animated.View>
      </View>

      <Text style={styles.indoorSvgSource}>
        Source: {floorPlanEntry.floorPlanFile}
      </Text>
    </View>
  );
};

export default IndoorFloorPlan;
