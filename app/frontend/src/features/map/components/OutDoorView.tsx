import React, { forwardRef } from "react";
import { StyleSheet, View } from "react-native";
import MapView, {
  PROVIDER_GOOGLE,
  Polygon,
  Region,
  Polyline,
} from "react-native-maps";
import { CONCORDIA_BUILDINGS, Building } from "../../../constants/buildings";

interface OutdoorViewProps {

  region: Region;  
  currentBuildingId?: string | null;
  selectedBuildingId?: string | null;
  onBuildingPress: (building: Building) => void;
  onMapPress: () => void;
  routeCoords?: { latitude: number; longitude: number }[];
  transportMode?: string;
}

const OutdoorView = forwardRef<MapView, OutdoorViewProps>((props, ref) => {
  const {
    region,
    currentBuildingId,
    selectedBuildingId,
    onBuildingPress,
    onMapPress,
    routeCoords,
    transportMode,
  } = props;

  const stateTracker = `${selectedBuildingId}-${currentBuildingId}`;

  const getPolylineColor = () => {
    switch (transportMode) {
      case "DRIVING":
        return "#4285F4"; // Blue for driving
      case "WALKING":
        return "#4285F4"; // Blue for walking (matches driving per request)
      case "TRANSIT":
        return "#020202"; // Black for bus/transit
      default:
        return "#912338"; // Default Concordia Maroon
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={ref}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={region}
        showsUserLocation={true}
        moveOnMarkerPress={false}
        onPress={onMapPress}
      >
        {/* --- DRAW THE ROUTE LINE --- */}
        {routeCoords && routeCoords.length > 0 && (
          <Polyline
            coordinates={routeCoords}
            strokeColor={getPolylineColor()}
            strokeWidth={5}
            lineCap="round"
            lineJoin="round"
            zIndex={20}
            lineDashPattern={transportMode === "WALKING" ? [2, 10] : undefined}
          />
        )}

        {CONCORDIA_BUILDINGS.map((building) => {
          const isSelected = building.id === selectedBuildingId;
          const isCurrent = building.id === currentBuildingId;

          let fillColor = "rgba(145, 35, 56, 0.15)";
          let strokeColor = "#912338";
          let zIndex = 1;

          if (isSelected) {
            fillColor = "rgba(145, 35, 56, 0.8)";
            strokeColor = "#000000";
            zIndex = 10;
          } else if (isCurrent) {
            fillColor = "rgba(255, 215, 0, 0.6)";
            zIndex = 5;
          }

          return (
            <Polygon
              key={`${building.id}-${stateTracker}`}
              coordinates={building.coordinates}
              fillColor={fillColor}
              strokeColor={strokeColor}
              strokeWidth={isSelected ? 3 : 2}
              zIndex={zIndex}
              tappable={true}
              onPress={(e) => {
                e.stopPropagation();
                onBuildingPress(building);
              }}
            />
          );
        })}
      </MapView>
    </View>
  );
});

OutdoorView.displayName = "OutdoorView";

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { ...StyleSheet.absoluteFillObject },
});

export default OutdoorView;