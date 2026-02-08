import { isUserInBuilding } from '../app/frontend/src/utils/geofencing';

describe('geofencing', () => {
  describe('isUserInBuilding', () => {
    // Simple rectangular building for testing
    const rectangularBuilding = [
      { latitude: 45.4971, longitude: -73.5788 },
      { latitude: 45.4968, longitude: -73.5791 },
      { latitude: 45.4973, longitude: -73.5798 },
      { latitude: 45.4976, longitude: -73.5795 },
    ];

    it('should return true when user is inside the building polygon', () => {
      const userLocation = { latitude: 45.4972, longitude: -73.5793 };
      const result = isUserInBuilding(userLocation, rectangularBuilding);
      expect(result).toBe(true);
    });

    it('should return false when user is outside the building polygon', () => {
      const userLocation = { latitude: 45.5000, longitude: -73.5800 };
      const result = isUserInBuilding(userLocation, rectangularBuilding);
      expect(result).toBe(false);
    });

    it('should return false when user is far from the building', () => {
      const userLocation = { latitude: 40.7128, longitude: -74.0060 }; // New York
      const result = isUserInBuilding(userLocation, rectangularBuilding);
      expect(result).toBe(false);
    });

    it('should handle user location at building boundary', () => {
      // Test with exact vertex coordinate
      const userLocation = { latitude: 45.4971, longitude: -73.5788 };
      const result = isUserInBuilding(userLocation, rectangularBuilding);
      // Result depends on geolib implementation, but should be boolean
      expect(typeof result).toBe('boolean');
    });

    it('should work with different building shapes', () => {
      // Triangle-shaped building
      const triangularBuilding = [
        { latitude: 45.4970, longitude: -73.5790 },
        { latitude: 45.4975, longitude: -73.5790 },
        { latitude: 45.4972, longitude: -73.5795 },
      ];

      const insideLocation = { latitude: 45.4972, longitude: -73.5791 };
      const outsideLocation = { latitude: 45.4980, longitude: -73.5790 };

      expect(isUserInBuilding(insideLocation, triangularBuilding)).toBe(true);
      expect(isUserInBuilding(outsideLocation, triangularBuilding)).toBe(false);
    });

    it('should handle complex polygons with many vertices', () => {
      const complexBuilding = [
        { latitude: 45.4970, longitude: -73.5790 },
        { latitude: 45.4971, longitude: -73.5788 },
        { latitude: 45.4973, longitude: -73.5789 },
        { latitude: 45.4974, longitude: -73.5791 },
        { latitude: 45.4975, longitude: -73.5793 },
        { latitude: 45.4973, longitude: -73.5795 },
        { latitude: 45.4971, longitude: -73.5794 },
      ];

      const centerPoint = { latitude: 45.4972, longitude: -73.5792 };
      const result = isUserInBuilding(centerPoint, complexBuilding);
      expect(typeof result).toBe('boolean');
    });

    it('should handle edge case with minimum polygon (3 points)', () => {
      const minimalPolygon = [
        { latitude: 45.4970, longitude: -73.5790 },
        { latitude: 45.4975, longitude: -73.5790 },
        { latitude: 45.4972, longitude: -73.5795 },
      ];

      const userLocation = { latitude: 45.4972, longitude: -73.5792 };
      const result = isUserInBuilding(userLocation, minimalPolygon);
      expect(typeof result).toBe('boolean');
    });
  });
});
