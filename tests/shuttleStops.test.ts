import { shuttleStops } from '../app/frontend/src/constants/shuttleStops';

describe('shuttleStops constants', () => {
  describe('shuttleStops', () => {
    it('should be defined', () => {
      expect(shuttleStops).toBeDefined();
    });

    it('should have LOYOLA stop', () => {
      expect(shuttleStops).toHaveProperty('LOYOLA');
    });

    it('should have SGW stop', () => {
      expect(shuttleStops).toHaveProperty('SGW');
    });

    describe('LOYOLA stop', () => {
      it('should have latitude and longitude', () => {
        expect(shuttleStops.LOYOLA).toHaveProperty('latitude');
        expect(shuttleStops.LOYOLA).toHaveProperty('longitude');
      });

      it('should have valid coordinate types', () => {
        expect(typeof shuttleStops.LOYOLA.latitude).toBe('number');
        expect(typeof shuttleStops.LOYOLA.longitude).toBe('number');
      });

      it('should be in Montreal area (Loyola campus)', () => {
        // Loyola campus is around 45.458° N, -73.639° W
        expect(shuttleStops.LOYOLA.latitude).toBeGreaterThan(45.45);
        expect(shuttleStops.LOYOLA.latitude).toBeLessThan(45.47);
        expect(shuttleStops.LOYOLA.longitude).toBeGreaterThan(-73.65);
        expect(shuttleStops.LOYOLA.longitude).toBeLessThan(-73.63);
      });

      it('should have expected coordinates', () => {
        expect(shuttleStops.LOYOLA.latitude).toBeCloseTo(45.458, 2);
        expect(shuttleStops.LOYOLA.longitude).toBeCloseTo(-73.639, 2);
      });
    });

    describe('SGW stop', () => {
      it('should have latitude and longitude', () => {
        expect(shuttleStops.SGW).toHaveProperty('latitude');
        expect(shuttleStops.SGW).toHaveProperty('longitude');
      });

      it('should have valid coordinate types', () => {
        expect(typeof shuttleStops.SGW.latitude).toBe('number');
        expect(typeof shuttleStops.SGW.longitude).toBe('number');
      });

      it('should be in Montreal area (SGW campus)', () => {
        // SGW campus is around 45.497° N, -73.578° W
        expect(shuttleStops.SGW.latitude).toBeGreaterThan(45.49);
        expect(shuttleStops.SGW.latitude).toBeLessThan(45.50);
        expect(shuttleStops.SGW.longitude).toBeGreaterThan(-73.59);
        expect(shuttleStops.SGW.longitude).toBeLessThan(-73.57);
      });

      it('should have expected coordinates', () => {
        expect(shuttleStops.SGW.latitude).toBeCloseTo(45.497, 2);
        expect(shuttleStops.SGW.longitude).toBeCloseTo(-73.578, 2);
      });
    });

    describe('Distance between stops', () => {
      it('should be separated by a reasonable distance', () => {
        const latDiff = Math.abs(shuttleStops.SGW.latitude - shuttleStops.LOYOLA.latitude);
        const lonDiff = Math.abs(shuttleStops.SGW.longitude - shuttleStops.LOYOLA.longitude);
        
        // Campuses are about 0.04 degrees apart in latitude and 0.06 in longitude
        expect(latDiff).toBeGreaterThan(0.03);
        expect(latDiff).toBeLessThan(0.05);
        expect(lonDiff).toBeGreaterThan(0.05);
        expect(lonDiff).toBeLessThan(0.08);
      });
    });

    it('should have object structure maintained', () => {
      // TypeScript ensures immutability at compile time via 'as const'
      expect(typeof shuttleStops).toBe('object');
      expect(shuttleStops.LOYOLA).toBeDefined();
      expect(shuttleStops.SGW).toBeDefined();
    });

    it('should only have expected properties', () => {
      const keys = Object.keys(shuttleStops);
      expect(keys).toContain('LOYOLA');
      expect(keys).toContain('SGW');
      expect(keys.length).toBe(2);
    });
  });
});
