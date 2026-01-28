import * as geolib from 'geolib';

// Check if user is within the building polygon
export const isUserInBuilding = (userLocation: any, buildingCoords: any[]) => {
  return geolib.isPointInPolygon(
    { latitude: userLocation.latitude, longitude: userLocation.longitude },
    buildingCoords
  );
};