import React, { useMemo } from "react";
import {
  Animated,
  Image,
  Text,
  TouchableOpacity,
  ImageSourcePropType,
  View,
  StyleSheet,
  Dimensions,
  Modal, 
  Pressable,
} from "react-native";
import {
  FloorPlanRegistryEntry,
  LocalizedNode,
  LocalizedNodeType,
} from "../../../services/floorPlanService";
import Svg, {
  Circle,
  Polyline,
  Image as SvgImage,
  Rect,
} from "react-native-svg";
import { useIndoorFloorPlanInteraction } from "../hooks/useIndoorFloorPlanState";

const { width, height } = Dimensions.get("window");

interface FloorPlanDisplayProps {
  floorPlanEntry: FloorPlanRegistryEntry;
  onInteractionChange?: (isInteracting: boolean) => void;
  path?: LocalizedNode[];
  /** Called when a POI icon is pressed. Wire this up to show a detail sheet. */
  onPoiPress?: (node: LocalizedNode) => void;
}

const POI_ICON_SIZE = 32;

const POI_ASSETS: Partial<
  Record<LocalizedNodeType, ReturnType<typeof Image.resolveAssetSource>>
> = {
  elevator: Image.resolveAssetSource(
    require("../../../../assets/indoor_poi_icons/elevators.png"),
  ),
  stair_landing: Image.resolveAssetSource(
    require("../../../../assets/indoor_poi_icons/stairs.png"),
  ),
  water_fountain: Image.resolveAssetSource(
    require("../../../../assets/indoor_poi_icons/fountain.png"),
  ),
  washroom: Image.resolveAssetSource(
    require("../../../../assets/indoor_poi_icons/restroom.png"),
  ),
};

const POI_DETAILS: Partial<
  Record<LocalizedNodeType, { title: string; description?: string }>
> = {
  washroom: {
    title: "Washroom",
    description: "Men's / Women's washroom",
  },
  elevator: {
    title: "Elevator",
    description: "Inter-floor access",
  },
  stair_landing: {
    title: "Stairs",
    description: "Stair access between floors",
  },
  water_fountain: {
    title: "Water Fountain",
    description: "Drinking water available",
  },
};

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
  onPoiPress,
}: FloorPlanDisplayProps) => {
  const { zoom, translate, panResponder, handleZoomChange, handleResetView } =
    useIndoorFloorPlanInteraction(onInteractionChange);

  // Map the building ID and floor number to the correct PNG
  const mapImageKey = `${floorPlanEntry.buildingId}_${floorPlanEntry.floorNumber}`;
  const MapImageSource = PNG_ASSET_MAP[mapImageKey];

  const [selectedPoi, setSelectedPoi] = React.useState<LocalizedNode | null>(null);

  // To use image as SVG viewBox so node coordinates align correctly
  const naturalSize = MapImageSource
    ? Image.resolveAssetSource(MapImageSource as number)
    : null;

  const polylinePoints = useMemo(
    () => path.map((n) => `${n.x},${n.y}`).join(" "),
    [path],
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

          {/* POI icons + path overlay */}
          {naturalSize && (
            <Svg
              style={StyleSheet.absoluteFill}
              width={width}
              height={height * 0.6}
              viewBox={`0 0 ${naturalSize.width} ${naturalSize.height}`}
            >
              {/* Figma POI icons — only on floors whose PNG has no embedded icons */}
              {!floorPlanEntry.poiIconsEmbedded &&
                floorPlanEntry.localizedNodes
                  .filter((node) => node.nodeType in POI_ASSETS)
                  .map((node) => {
                    const asset = POI_ASSETS[node.nodeType]!;
                    return (
                      <SvgImage
                        key={node.id}
                        x={node.x - POI_ICON_SIZE / 2}
                        y={node.y - POI_ICON_SIZE / 2}
                        width={POI_ICON_SIZE}
                        height={POI_ICON_SIZE}
                        href={{ uri: asset.uri }}
                        preserveAspectRatio="xMidYMid meet"
                        onPress={() => {
                          setSelectedPoi(node);
                          onPoiPress?.(node);
                          console.log(`POI pressed: ${node.label}`);
                        }}
                      />
                    );
                  })}

              {/* Transparent hit-targets over embedded PNG icons (H_8, H_9, VE_2).
                  The icons are put into the PNG directly so we can't interact with them directly —
                  therefore, these invisible Rects sit at the same coordinates and forward taps to onPoiPress for 4.4.2 . */}
              {floorPlanEntry.poiIconsEmbedded &&
              floorPlanEntry.localizedNodes
                .filter((node) => node.nodeType in POI_ASSETS)
                .map((node) => (
                  <Rect
                    key={node.id}
                    x={node.x - POI_ICON_SIZE / 2}
                    y={node.y - POI_ICON_SIZE / 2}
                    width={POI_ICON_SIZE}
                    height={POI_ICON_SIZE}
                    fill="rgba(252, 116, 116, 0.58)"
                    onPress={() => {
                      console.log("POI pressed", node.id);
                      setSelectedPoi(node);
                      onPoiPress?.(node);
                    }}
                  />
                ))}

              {/* Navigation path */}
              {path.length > 1 && (
                <>
                  <Polyline
                    points={polylinePoints}
                    fill="none"
                    stroke="#2d8bf0"
                    strokeWidth={14}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <Circle
                    cx={path[0].x}
                    cy={path[0].y}
                    r={18}
                    fill="#2d8bf0"
                    stroke="white"
                    strokeWidth={4}
                  />
                  <Circle
                    cx={path.at(-1)!.x}
                    cy={path.at(-1)!.y}
                    r={18}
                    fill="#642222"
                    stroke="white"
                    strokeWidth={4}
                  />
                </>
              )}
            </Svg>
          )}
        </Animated.View>
      </View>
      <Modal
        visible={!!selectedPoi}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedPoi(null)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setSelectedPoi(null)}
        >
          <View style={styles.tooltip}>
            <Text style={styles.tooltipTitle}>
              {selectedPoi
                ? POI_DETAILS[selectedPoi.nodeType]?.title ||
                  selectedPoi.label
                : ""}
            </Text>

            {selectedPoi &&
              POI_DETAILS[selectedPoi.nodeType]?.description && (
                <Text style={styles.tooltipDescription}>
                  {POI_DETAILS[selectedPoi.nodeType]?.description}
                </Text>
              )}

            {selectedPoi?.label && (
              <Text style={styles.tooltipMeta}>
                {selectedPoi.label}
              </Text>
            )}
          </View>
        </Pressable>
      </Modal>
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
  modalOverlay: {
  flex: 1,
  backgroundColor: "rgba(0,0,0,0.2)",
  justifyContent: "center",
  alignItems: "center",
},

tooltip: {
  backgroundColor: "white",
  padding: 16,
  borderRadius: 10,
  minWidth: 180,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.2,
  shadowRadius: 6,
  elevation: 5,
},

tooltipTitle: {
  fontSize: 16,
  fontWeight: "700",
  marginBottom: 4,
},

tooltipDescription: {
  fontSize: 13,
  color: "#555",
},

tooltipMeta: {
  fontSize: 12,
  color: "#999",
  marginTop: 6,
},
});

export default FloorPlanDisplay;
