import { decodePolyline } from '../app/frontend/src/utils/polylineDecoder';

describe('polylineDecoder', () => {
  describe('decodePolyline', () => {
    it('should decode a simple polyline string correctly', () => {
      // Encoded string for a simple path
      const encoded = '_p~iF~ps|U_ulLnnqC_mqNvxq`@';
      const result = decodePolyline(encoded);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('latitude');
      expect(result[0]).toHaveProperty('longitude');
    });

    it('should return an array of coordinate objects with latitude and longitude', () => {
      const encoded = 'u~ttGba_`L_AtC';
      const result = decodePolyline(encoded);

      result.forEach(point => {
        expect(point).toHaveProperty('latitude');
        expect(point).toHaveProperty('longitude');
        expect(typeof point.latitude).toBe('number');
        expect(typeof point.longitude).toBe('number');
      });
    });

    it('should decode Google Maps encoded polyline for Montreal coordinates', () => {
      // Example polyline near Concordia University Montreal area
      const encoded = 'qcvtGbcu_MAAA??A@?';
      const result = decodePolyline(encoded);

      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
      
      // Check that coordinates are reasonable for Montreal area
      // Montreal is roughly between 45.4° to 45.6° N and -73.8° to -73.5° W
      result.forEach(point => {
        expect(point.latitude).toBeGreaterThan(45.3);
        expect(point.latitude).toBeLessThan(45.7);
        expect(point.longitude).toBeGreaterThan(-73.9);
        expect(point.longitude).toBeLessThan(-73.4);
      });
    });

    it('should handle empty string by returning empty array', () => {
      const result = decodePolyline('');
      expect(result).toEqual([]);
    });

    it('should decode a longer polyline with multiple points', () => {
      // This represents a longer path
      const encoded = 'u~ttGba_`L_AtC@u@NcBRmBJmBJiBL_BH_BDeBDeBBeB@eB@cA?cA';
      const result = decodePolyline(encoded);

      expect(result.length).toBeGreaterThan(5);
      
      // Verify consecutive points are different
      for (let i = 0; i < result.length - 1; i++) {
        const point1 = result[i];
        const point2 = result[i + 1];
        const isDifferent = 
          point1.latitude !== point2.latitude || 
          point1.longitude !== point2.longitude;
        expect(isDifferent).toBe(true);
      }
    });

    it('should maintain precision to 5 decimal places', () => {
      const encoded = '_p~iF~ps|U_ulLnnqC';
      const result = decodePolyline(encoded);

      result.forEach(point => {
        const latDecimals = (point.latitude.toString().split('.')[1] || '').length;
        const lngDecimals = (point.longitude.toString().split('.')[1] || '').length;
        
        // Google polyline encoding uses 5 decimal precision
        expect(latDecimals).toBeLessThanOrEqual(5);
        expect(lngDecimals).toBeLessThanOrEqual(5);
      });
    });
  });
});
