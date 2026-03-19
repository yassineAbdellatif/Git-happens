import React, { useMemo } from "react";
import {
  Animated,
  Image,
  Text,
  TouchableOpacity,
  ImageSourcePropType,
  View,
  StyleSheet,
  Dimensions
} from "react-native";
import { FloorPlanRegistryEntry, LocalizedNode } from "../../../services/floorPlanService";
import Svg, { Circle, Polyline } from "react-native-svg";
import { useIndoorFloorPlanInteraction } from "../hooks/useIndoorFloorPlanState";

const { width, height } = Dimensions.get("window");

interface FloorPlanDisplayProps {
  floorPlanEntry: FloorPlanRegistryEntry;
  onInteractionChange?: (isInteracting: boolean) => void;
  path?: LocalizedNode[];
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

const FloorPlanDisplay = ({
  floorPlanEntry,
  onInteractionChange,
  path = [],
}: FloorPlanDisplayProps) => {
  const { zoom, translate, panResponder, handleZoomChange, handleResetView } =
    useIndoorFloorPlanInteraction(onInteractionChange);

  // Map the building ID and floor number to the correct PNG
  const mapImageKey = `${floorPlanEntry.buildingId}_${floorPlanEntry.floorNumber}`;
  const MapImageSource = PNG_ASSET_MAP[mapImageKey];

  // To use image as SVG viewBox so node coordinates align correctly
  const naturalSize = MapImageSource
    ? Image.resolveAssetSource(MapImageSource as number)
    : null;

    const polylinePoints = useMemo(
      () => path.map((n) => `${n.x},${n.y}`).join(" "),
      [path]
  );

  return (
    <View style={styles.container}>
      {/* Zoom Controls floating on the right side */}
      <View style={styles.zoomControls}>
        <TouchableOpacity
          style={styles.zoomButton}
          onPress={() => handleZoomChange(0.25)}
        >
          <Text style={styles.zoomButtonText}>+</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.zoomButton}
          onPress={() => handleZoomChange(-0.25)}
        >
          <Text style={styles.zoomButtonText}>-</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.zoomButton, { borderBottomWidth: 0 }]}
          onPress={handleResetView}
        >
          <Text style={styles.resetButtonText}>Reset</Text>
        </TouchableOpacity>
      </View>

      {/* The zoomable/pannable map frame */}
      <View style={styles.viewerFrame}>
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
              style={styles.rasterImage}
              resizeMode="contain"
            />
          ) : (
            <Text style={styles.errorText}>
              Missing floor-plan asset mapping for: {mapImageKey}
            </Text>
          )}

          {/* Path overlay */}
          {path.length > 1 && naturalSize && (
            <Svg
              style={StyleSheet.absoluteFill}
              width={width}
              height={height * 0.6}
              viewBox={`0 0 ${naturalSize.width} ${naturalSize.height}`}
            >
              <Polyline
                points={polylinePoints}
                fill="none"
                stroke="#2d8bf0"
                strokeWidth={14}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Start point */}
              <Circle
                cx={path[0].x}
                cy={path[0].y}
                r={18}
                fill="#2d8bf0"
                stroke="white"
                strokeWidth={4}
              />
              {/* Destination point */}
              <Circle
                cx={path.at(-1)!.x}
                cy={path.at(-1)!.y}
                r={18}
                fill="#642222"
                stroke="white"
                strokeWidth={4}
              />
            </Svg>
          )}
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    overflow: "hidden",
  },
  zoomControls: {
    position: "absolute",
    right: 20,
    top: 140,
    zIndex: 10,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  zoomButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  zoomButtonText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#912338",
  },
  resetButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
  },
  viewerFrame: {
    flex: 1,
    width: "100%", 
    justifyContent: "center",
    alignItems: "center",
  },
  rasterImage: {
    width: width, //Use full screen width to allow for better zooming and panning
    height: height * 0.6, // Use 60% of the screen height to ensure it fits well with zooming
  },
  errorText: {
    color: "#d9534f",
    fontSize: 16,
    textAlign: "center",
  },
});

export default FloorPlanDisplay;
