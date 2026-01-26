import React, { forwardRef } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Polygon, Region } from 'react-native-maps';
import { CONCORDIA_BUILDINGS, Building } from '../../../constants/buildings';

interface OutdoorViewProps {
  region: Region;
  currentBuildingId?: string | null;
  selectedBuildingId?: string | null;
  onBuildingPress: (building: Building) => void;
  onMapPress: () => void;
}

const OutdoorView = forwardRef<MapView, OutdoorViewProps>((props, ref) => {
  const { 
    region, 
    currentBuildingId, 
    selectedBuildingId, 
    onBuildingPress, 
    onMapPress 
  } = props;

  // We create a unique string based on what is currently active.
  // When this string changes, the 'key' in the map function changes,
  // forcing the native engine to redraw the polygons correctly.
  const stateTracker = `${selectedBuildingId}-${currentBuildingId}`;

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
        {CONCORDIA_BUILDINGS.map((building) => {
          const isSelected = building.id === selectedBuildingId;
          const isCurrent = building.id === currentBuildingId;

          let fillColor = "rgba(145, 35, 56, 0.15)"; // Very light default
          let strokeColor = "#912338";
          let zIndex = 1;

          if (isSelected) {
            fillColor = "rgba(145, 35, 56, 0.8)"; // Tapped
            strokeColor = "#000000";
            zIndex = 10;
          } else if (isCurrent) {
            fillColor = "rgba(255, 215, 0, 0.6)"; // GPS
            zIndex = 5;
          }

          return (
            <Polygon
              // This key forces a refresh ONLY when the selection or GPS building changes.
              // It prevents the "Invisible" bug while ensuring the color actually updates.
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

OutdoorView.displayName = 'OutdoorView';

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { ...StyleSheet.absoluteFillObject },
});

export default OutdoorView;