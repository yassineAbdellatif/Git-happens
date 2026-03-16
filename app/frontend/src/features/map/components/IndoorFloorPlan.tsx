import React from "react";
import {
  Animated,
  Image,
  Text,
  TouchableOpacity,
  View,
  ImageSourcePropType,
} from "react-native";
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

const PNG_ASSET_MAP: Record<string, ImageSourcePropType> = {
  H_1: require("../../../../assets/updated_floor_plans/h1.png"),
  H_2: require("../../../../assets/updated_floor_plans/h2.png"),
  H_8: require("../../../../assets/updated_floor_plans/h8.png"),
  H_9: require("../../../../assets/updated_floor_plans/h9.png"),
  CC_1: require("../../../../assets/updated_floor_plans/cc1.png"),
  MB_1: require("../../../../assets/updated_floor_plans/mb1.png"),
  MB_S2: require("../../../../assets/updated_floor_plans/mbs2.png"),
  VE_1: require("../../../../assets/updated_floor_plans/ve1.png"),
  VE_2: require("../../../../assets/updated_floor_plans/ve2.png"),
  VL_1: require("../../../../assets/updated_floor_plans/vl1.png"),
  VL_2: require("../../../../assets/updated_floor_plans/vl2.png"),
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

  const mapImageKey = `${floorPlanEntry.buildingId}_${selectedFloorNumber}`;
  const MapImageSource = PNG_ASSET_MAP[mapImageKey];

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
        <TouchableOpacity
          style={styles.indoorZoomButton}
          onPress={handleResetView}
        >
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
          {MapImageSource ? (
            <Image
              source={MapImageSource}
              style={styles.indoorRasterImage}
              resizeMode="contain"
            />
          ) : (
            <Text style={styles.indoorSummaryText}>
              Missing floor-plan asset mapping for: {mapImageKey}
            </Text>
          )}
        </Animated.View>
      </View>

      <Text style={styles.indoorSvgSource}>Source: {mapImageKey}</Text>
    </View>
  );
};

export default IndoorFloorPlan;
