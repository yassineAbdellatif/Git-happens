import * as geolib from 'geolib';

export const isUserInBuilding = (userLocation: any, buildingCoords: any[]) => {
  return geolib.isPointInPolygon(
    { latitude: userLocation.latitude, longitude: userLocation.longitude },
    buildingCoords
  );
};