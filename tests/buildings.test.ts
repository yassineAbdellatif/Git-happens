import {
  CONCORDIA_BUILDINGS,
  Building,
  getDisplayStatus,
} from '../app/frontend/src/constants/buildings';

describe('buildings constants', () => {
  describe('CONCORDIA_BUILDINGS', () => {
    it('should contain building data', () => {
      expect(CONCORDIA_BUILDINGS).toBeDefined();
      expect(Array.isArray(CONCORDIA_BUILDINGS)).toBe(true);
      expect(CONCORDIA_BUILDINGS.length).toBeGreaterThan(0);
    });

    it('should have buildings from both campuses', () => {
      const sgwBuildings = CONCORDIA_BUILDINGS.filter(b => b.campus === 'SGW');
      const loyolaBuildings = CONCORDIA_BUILDINGS.filter(b => b.campus === 'LOYOLA');

      expect(sgwBuildings.length).toBeGreaterThan(0);
      expect(loyolaBuildings.length).toBeGreaterThan(0);
    });

    it('should have all required properties for each building', () => {
      CONCORDIA_BUILDINGS.forEach(building => {
        expect(building).toHaveProperty('id');
        expect(building).toHaveProperty('name');
        expect(building).toHaveProperty('fullName');
        expect(building).toHaveProperty('campus');
        expect(building).toHaveProperty('coordinates');
        expect(building).toHaveProperty('info');
      });
    });

    it('should have valid campus values', () => {
      CONCORDIA_BUILDINGS.forEach(building => {
        expect(['SGW', 'LOYOLA']).toContain(building.campus);
      });
    });

    it('should have at least 3 coordinates per building (polygon)', () => {
      CONCORDIA_BUILDINGS.forEach(building => {
        expect(building.coordinates.length).toBeGreaterThanOrEqual(3);
      });
    });

    it('should have valid coordinate structure', () => {
      CONCORDIA_BUILDINGS.forEach(building => {
        building.coordinates.forEach(coord => {
          expect(coord).toHaveProperty('latitude');
          expect(coord).toHaveProperty('longitude');
          expect(typeof coord.latitude).toBe('number');
          expect(typeof coord.longitude).toBe('number');
        });
      });
    });

    it('should have coordinates in Montreal area for SGW campus', () => {
      const sgwBuildings = CONCORDIA_BUILDINGS.filter(b => b.campus === 'SGW');
      
      sgwBuildings.forEach(building => {
        building.coordinates.forEach(coord => {
          // SGW campus is around 45.497° N, -73.579° W
          expect(coord.latitude).toBeGreaterThan(45.49);
          expect(coord.latitude).toBeLessThan(45.50);
          expect(coord.longitude).toBeGreaterThan(-73.59);
          expect(coord.longitude).toBeLessThan(-73.57);
        });
      });
    });

    it('should have coordinates in Montreal area for Loyola campus', () => {
      const loyolaBuildings = CONCORDIA_BUILDINGS.filter(b => b.campus === 'LOYOLA');
      
      loyolaBuildings.forEach(building => {
        building.coordinates.forEach(coord => {
          // Loyola campus is around 45.458° N, -73.640° W
          expect(coord.latitude).toBeGreaterThan(45.45);
          expect(coord.latitude).toBeLessThan(45.47);
          expect(coord.longitude).toBeGreaterThan(-73.65);
          expect(coord.longitude).toBeLessThan(-73.63);
        });
      });
    });

    it('should have unique building IDs', () => {
      const ids = CONCORDIA_BUILDINGS.map(b => b.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have non-empty building information', () => {
      CONCORDIA_BUILDINGS.forEach(building => {
        expect(building.id.length).toBeGreaterThan(0);
        expect(building.name.length).toBeGreaterThan(0);
        expect(building.fullName.length).toBeGreaterThan(0);
        expect(building.info.length).toBeGreaterThan(0);
      });
    });

    it('should include known SGW buildings', () => {
      const buildingIds = CONCORDIA_BUILDINGS.map(b => b.id);
      
      // Check for some known SGW buildings
      expect(buildingIds).toContain('H');   // Hall Building
      expect(buildingIds).toContain('LB');  // Library
      expect(buildingIds).toContain('EV');  // EV Building
      expect(buildingIds).toContain('MB');  // John Molson
    });

    it('should include known Loyola buildings', () => {
      const buildingIds = CONCORDIA_BUILDINGS.map(b => b.id);
      
      // Check for some known Loyola buildings
      expect(buildingIds).toContain('VL');  // Vanier Library
      expect(buildingIds).toContain('SP');  // Administration Building
      // Note: Building IDs may vary based on current data
    });
  });

  describe('Building interface', () => {
    it('should match the expected structure', () => {
      const exampleBuilding: Building = {
        id: 'TEST',
        name: 'Test',
        fullName: 'Test Building',
        campus: 'SGW',
        coordinates: [
          { latitude: 45.497, longitude: -73.578 },
          { latitude: 45.498, longitude: -73.579 },
          { latitude: 45.499, longitude: -73.580 },
        ],
        info: 'Test info',
      };

      expect(exampleBuilding).toBeDefined();
      expect(exampleBuilding.campus).toBe('SGW');
    });
  });

  describe('getDisplayStatus', () => {
    const currentRegion = { latitude: 45.4971, longitude: -73.5788 };

    it('returns -- when user location is missing', () => {
      const result = getDisplayStatus(null, currentRegion, null, null);
      expect(result).toBe('--');
    });

    it('returns selected building name when selected building exists', () => {
      const selected = CONCORDIA_BUILDINGS[0];

      const result = getDisplayStatus(
        { latitude: 45.497, longitude: -73.579 },
        currentRegion,
        selected,
        null
      );

      expect(result).toBe(selected.name);
    });

    it('returns current building name when no selected building exists', () => {
      const current = CONCORDIA_BUILDINGS[1];

      const result = getDisplayStatus(
        { latitude: 45.497, longitude: -73.579 },
        currentRegion,
        null,
        current
      );

      expect(result).toBe(current.name);
    });

    it('returns containing building when user is inside polygon', () => {
      const target = CONCORDIA_BUILDINGS[0];
      const centroid = target.coordinates.reduce(
        (acc, point) => ({
          latitude: acc.latitude + point.latitude,
          longitude: acc.longitude + point.longitude,
        }),
        { latitude: 0, longitude: 0 }
      );

      const insidePoint = {
        latitude: centroid.latitude / target.coordinates.length,
        longitude: centroid.longitude / target.coordinates.length,
      };

      const result = getDisplayStatus(insidePoint, currentRegion, null, null);
      expect(result).toBe(target.name);
    });

    it('returns -- when no selected/current and user not in a building', () => {
      const result = getDisplayStatus(
        { latitude: 46.0, longitude: -74.0 },
        currentRegion,
        null,
        null
      );

      expect(result).toBe('--');
    });
  });
});
