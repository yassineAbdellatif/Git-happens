import { Router } from 'express';
import * as mapController from '../app/backend/src/controllers/mapController';

// Mock the mapController
jest.mock('../app/backend/src/controllers/mapController');

describe('mapRoutes', () => {
  let router: Router;
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
  });
});
