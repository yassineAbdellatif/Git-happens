import React, { forwardRef, useMemo } from "react";
import { StyleSheet, View, Text } from "react-native";
import { Marker } from "react-native-maps";
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

  // Determine the color for the route based on the transport mode
  const currentColor = useMemo(() => {
    const mode = transportMode?.toUpperCase();
    console.log("Current transport mode:", mode);
    switch (mode) {
      case "DRIVING":
        console.log("Using DRIVING mode color:", "#4285F4");
        return "#4285F4";
      case "WALKING":
        console.log("Using WALKING mode color:", "#4285F4");
        return "#4285F4";
      case "TRANSIT":
        console.log("Using TRANSIT mode color:", "#020202");
        return "#020202";
      default:
        console.log("Using default color for mode:", mode);
        return "#912338";
    }
  }, [transportMode]);

  // Get polygon center to write building name
  const getPolygonCenter = (
    coordinates: { latitude: number; longitude: number }[],
  ) => {
    const sys = coordinates.reduce(
      (acc, curr) => ({
        latitude: acc.latitude + curr.latitude,
        longitude: acc.longitude + curr.longitude,
      }),
      { latitude: 0, longitude: 0 },
    );
    return {
      latitude: sys.latitude / coordinates.length,
      longitude: sys.longitude / coordinates.length,
    };
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
            strokeColor={currentColor}
            strokeWidth={8}
            lineCap="round"
            lineJoin="round"
            lineDashPattern={transportMode === "WALKING" ? [2, 10] : [0]}
            zIndex={20} // Boost this to ensure it's not hidden
          />
        )}

        {CONCORDIA_BUILDINGS.map((building) => {
          const isSelected = building.id === selectedBuildingId;
          const isCurrent = building.id === currentBuildingId;
          const buildingCenter = getPolygonCenter(building.coordinates);

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
            <React.Fragment key={`group-${building.id}`}>
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

              <Marker
                coordinate={buildingCenter}
                tracksViewChanges={false}
                pointerEvents="none"
              >
                <View >
                  <Text>{building.id}</Text>
                </View>
              </Marker>
            </React.Fragment>
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
