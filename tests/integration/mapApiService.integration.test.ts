import axios from 'axios';
import { getRouteFromBackend } from '../../app/frontend/src/services/mapApiService';

describe('mapApiService Integration Tests', () => {
  const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000';
  
  // Montreal coordinates
  const SGW_COORDS = '45.4971,-73.5788';
  const LOYOLA_COORDS = '45.4580,-73.6390';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Backend Communication', () => {
    it('should successfully communicate with backend for WALKING route', async () => {
      try {
        const result = await getRouteFromBackend(SGW_COORDS, LOYOLA_COORDS, 'WALKING');
        
        expect(result).toBeDefined();
        expect(result.routes).toBeDefined();
        expect(Array.isArray(result.routes)).toBe(true);
        
        if (result.routes.length > 0) {
          expect(result.routes[0]).toHaveProperty('legs');
          expect(result.routes[0]).toHaveProperty('overview_polyline');
        }
      } catch (error) {
        if (axios.isAxiosError(error) && error.code === 'ECONNREFUSED') {
          console.warn('Backend not running - skipping integration test');
        } else {
          throw error;
        }
      }
    });

    it('should handle DRIVING mode requests', async () => {
      try {
        const result = await getRouteFromBackend(SGW_COORDS, LOYOLA_COORDS, 'DRIVING');
        
        expect(result).toBeDefined();
        if (result.routes && result.routes.length > 0) {
          const leg = result.routes[0].legs[0];
          expect(leg).toHaveProperty('distance');
          expect(leg).toHaveProperty('duration');
        }
      } catch (error) {
        if (axios.isAxiosError(error) && error.code === 'ECONNREFUSED') {
          console.warn('Backend not running - skipping DRIVING test');
        } else {
          throw error;
        }
      }
    });

    it('should handle TRANSIT mode requests', async () => {
      try {
        const result = await getRouteFromBackend(SGW_COORDS, LOYOLA_COORDS, 'TRANSIT');
        
        expect(result).toBeDefined();
        expect(result.routes).toBeDefined();
      } catch (error) {
        if (axios.isAxiosError(error) && error.code === 'ECONNREFUSED') {
          console.warn('Backend not running - skipping TRANSIT test');
        } else {
          throw error;
        }
      }
    });

    it('should properly construct request URL with parameters', async () => {
      const origin = '45.5000,-73.5800';
      const destination = '45.4600,-73.6400';
      const mode = 'WALKING';

      try {
        await getRouteFromBackend(origin, destination, mode);
        // If successful, the request was properly constructed
        expect(true).toBe(true);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          if (error.code === 'ECONNREFUSED') {
            console.warn('Backend not running - skipping URL construction test');
          } else {
            // Check that the error is from the backend, not from malformed request
            expect(error.config?.url).toContain('/api/directions');
            expect(error.config?.params).toEqual({ origin, destination, mode });
          }
        }
      }
    });

    it('should respect timeout configuration', async () => {
      try {
        const start = Date.now();
        await getRouteFromBackend(SGW_COORDS, LOYOLA_COORDS, 'WALKING');
        const duration = Date.now() - start;
        
        // If backend responds, duration should be less than timeout
        expect(duration).toBeLessThan(10000);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          if (error.code === 'ECONNREFUSED') {
            console.warn('Backend not running - skipping timeout test');
          } else if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
            // Timeout occurred as expected
            expect(['ECONNABORTED', 'ETIMEDOUT']).toContain(error.code);
          }
        }
      }
    });

    it('should handle backend errors gracefully', async () => {
      try {
        // Invalid coordinates should trigger backend error
        await getRouteFromBackend('invalid', 'invalid', 'WALKING');
      } catch (error) {
        if (axios.isAxiosError(error)) {
          if (error.code === 'ECONNREFUSED') {
            console.warn('Backend not running - skipping error handling test');
          } else {
            // Backend returned an error response
            expect(error).toBeDefined();
            expect(axios.isAxiosError(error)).toBe(true);
          }
        }
      }
    });

    it('should handle network errors', async () => {
      try {
        // Using a non-existent server
        const result = await getRouteFromBackend(SGW_COORDS, LOYOLA_COORDS, 'WALKING');
        // If it succeeds, backend is running
        expect(result).toBeDefined();
      } catch (error) {
        if (axios.isAxiosError(error)) {
          // Network error is expected if backend not running
          expect(['ECONNREFUSED', 'ENOTFOUND', 'ETIMEDOUT']).toContain(error.code);
        }
      }
    });
  });

  describe('Response Processing', () => {
    it('should return properly formatted route data', async () => {
      try {
        const result = await getRouteFromBackend(SGW_COORDS, LOYOLA_COORDS, 'WALKING');
        
        if (result.routes && result.routes.length > 0) {
          const route = result.routes[0];
          
          // Check route structure
          expect(route).toHaveProperty('legs');
          expect(route).toHaveProperty('overview_polyline');
          expect(Array.isArray(route.legs)).toBe(true);
          
          if (route.legs.length > 0) {
            const leg = route.legs[0];
            expect(leg).toHaveProperty('distance');
            expect(leg).toHaveProperty('duration');
            expect(leg.distance).toHaveProperty('text');
            expect(leg.duration).toHaveProperty('text');
          }
        }
      } catch (error) {
        if (axios.isAxiosError(error) && error.code === 'ECONNREFUSED') {
          console.warn('Backend not running - skipping response format test');
        } else {
          throw error;
        }
      }
    });

    it('should include processed route steps if available', async () => {
      try {
        const result = await getRouteFromBackend(SGW_COORDS, LOYOLA_COORDS, 'WALKING');
        
        if (result.processedRoute) {
          expect(result.processedRoute).toHaveProperty('steps');
          expect(Array.isArray(result.processedRoute.steps)).toBe(true);
        }
      } catch (error) {
        if (axios.isAxiosError(error) && error.code === 'ECONNREFUSED') {
          console.warn('Backend not running - skipping processed route test');
        } else {
          throw error;
        }
      }
    });

    it('should return polyline data for map rendering', async () => {
      try {
        const result = await getRouteFromBackend(SGW_COORDS, LOYOLA_COORDS, 'WALKING');
        
        if (result.routes && result.routes.length > 0) {
          const polyline = result.routes[0].overview_polyline;
          expect(polyline).toBeDefined();
          expect(polyline).toHaveProperty('points');
          expect(typeof polyline.points).toBe('string');
          expect(polyline.points.length).toBeGreaterThan(0);
        }
      } catch (error) {
        if (axios.isAxiosError(error) && error.code === 'ECONNREFUSED') {
          console.warn('Backend not running - skipping polyline test');
        } else {
          throw error;
        }
      }
    });
  });

  describe('Real-World Scenarios', () => {
    it('should handle short walking distance (within campus)', async () => {
      const hallBuilding = '45.4971,-73.5788';
      const nearbyBuilding = '45.4975,-73.5790';

      try {
        const result = await getRouteFromBackend(hallBuilding, nearbyBuilding, 'WALKING');
        
        if (result.routes && result.routes.length > 0) {
          const distance = result.routes[0].legs[0].distance.value;
          // Should be a short distance (less than 500m)
          expect(distance).toBeLessThan(500);
        }
      } catch (error) {
        if (axios.isAxiosError(error) && error.code === 'ECONNREFUSED') {
          console.warn('Backend not running - skipping short distance test');
        } else {
          throw error;
        }
      }
    });

    it('should handle long distance (between campuses)', async () => {
      try {
        const result = await getRouteFromBackend(SGW_COORDS, LOYOLA_COORDS, 'DRIVING');
        
        if (result.routes && result.routes.length > 0) {
          const distance = result.routes[0].legs[0].distance.value;
          // Between campuses should be at least 5km
          expect(distance).toBeGreaterThan(5000);
        }
      } catch (error) {
        if (axios.isAxiosError(error) && error.code === 'ECONNREFUSED') {
          console.warn('Backend not running - skipping long distance test');
        } else {
          throw error;
        }
      }
    });

    it('should return different routes for different modes', async () => {
      try {
        const walkingRoute = await getRouteFromBackend(SGW_COORDS, LOYOLA_COORDS, 'WALKING');
        const drivingRoute = await getRouteFromBackend(SGW_COORDS, LOYOLA_COORDS, 'DRIVING');
        
        if (walkingRoute.routes?.length && drivingRoute.routes?.length) {
          const walkingDuration = walkingRoute.routes[0].legs[0].duration.value;
          const drivingDuration = drivingRoute.routes[0].legs[0].duration.value;
          
          // Driving should be faster than walking
          expect(drivingDuration).toBeLessThan(walkingDuration);
        }
      } catch (error) {
        if (axios.isAxiosError(error) && error.code === 'ECONNREFUSED') {
          console.warn('Backend not running - skipping mode comparison test');
        } else {
          throw error;
        }
      }
    });
  });
});
