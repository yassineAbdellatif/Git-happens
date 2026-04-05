import { Router } from 'express';
import * as mapController from '../app/backend/src/controllers/mapController';

// Mock the mapController
jest.mock('../app/backend/src/controllers/mapController');

describe('mapRoutes', () => {
  let mapRoutes: Router;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Import fresh instance
    jest.isolateModules(() => {
      mapRoutes = require('../app/backend/src/routes/mapRoutes').default;
    });
  });

  it('should export a Router instance', () => {
    expect(mapRoutes).toBeDefined();
  });

  it('should have GET /directions route configured', () => {
    // Check that the router has the stack with the route
    const stack = (mapRoutes as any).stack;
    const directionsRoute = stack.find((layer: any) => 
      layer.route && layer.route.path === '/directions'
    );

    expect(directionsRoute).toBeDefined();
    expect(directionsRoute.route.methods.get).toBe(true);
  });

  it('should use getRoute controller for /directions', () => {
    // Verify the route is properly configured
    const stack = (mapRoutes as any).stack;
    const directionsRoute = stack.find((layer: any) => 
      layer.route && layer.route.path === '/directions'
    );

    expect(directionsRoute).toBeDefined();
    expect(directionsRoute.route.stack).toBeDefined();
    expect(directionsRoute.route.stack.length).toBeGreaterThan(0);
    expect(directionsRoute.route.stack[0].handle).toBe(mapController.getRoute);
  });

  it('should have GET /places/nearby route configured', () => {
    const stack = (mapRoutes as any).stack;
    const nearbyRoute = stack.find((layer: any) =>
      layer.route && layer.route.path === '/places/nearby'
    );

    expect(nearbyRoute).toBeDefined();
    expect(nearbyRoute.route.methods.get).toBe(true);
  });

  it('should use getNearbyPlaces controller for /places/nearby', () => {
    const stack = (mapRoutes as any).stack;
    const nearbyRoute = stack.find((layer: any) =>
      layer.route && layer.route.path === '/places/nearby'
    );

    expect(nearbyRoute).toBeDefined();
    expect(nearbyRoute.route.stack).toBeDefined();
    expect(nearbyRoute.route.stack.length).toBeGreaterThan(0);
    expect(nearbyRoute.route.stack[0].handle).toBe(mapController.getNearbyPlaces);
  });
});
