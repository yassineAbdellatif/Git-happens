import * as request from 'supertest';
import * as express from 'express';
import mapRoutes from '../../app/backend/src/routes/mapRoutes';
import * as mapService from '../../app/backend/src/services/mapService';

// Mock the mapService to avoid real API calls
jest.mock('../../app/backend/src/services/mapService');

describe('Map Routes Integration Tests', () => {
  let app: express.Application;

  beforeAll(() => {
    // Create Express app with routes
    app = express();
    app.use(express.json());
    app.use('/api', mapRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/directions', () => {
    it('should return 200 and directions data with valid parameters', async () => {
      const mockDirections = {
        routes: [
          {
            overview_polyline: {
              points: 'u~ttGba_`L_AtC@u@NcBRmB'
            },
            legs: [
              {
                distance: { text: '2.5 km', value: 2500 },
                duration: { text: '15 mins', value: 900 }
              }
            ]
          }
        ],
        status: 'OK'
      };

      (mapService.getDirections as jest.Mock).mockResolvedValue(mockDirections);

      const response = await request(app)
        .get('/api/directions')
        .query({
          origin: '45.4971,-73.5788',
          destination: '45.4582,-73.6405',
          mode: 'WALKING'
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockDirections);
      expect(mapService.getDirections).toHaveBeenCalledWith(
        '45.4971,-73.5788',
        '45.4582,-73.6405',
        'WALKING'
      );
    });

    it('should handle DRIVING mode', async () => {
      const mockDirections = {
        routes: [
          {
            overview_polyline: { points: 'encoded_polyline' }
          }
        ]
      };

      (mapService.getDirections as jest.Mock).mockResolvedValue(mockDirections);

      const response = await request(app)
        .get('/api/directions')
        .query({
          origin: '45.4971,-73.5788',
          destination: '45.4582,-73.6405',
          mode: 'DRIVING'
        });

      expect(response.status).toBe(200);
      expect(mapService.getDirections).toHaveBeenCalledWith(
        '45.4971,-73.5788',
        '45.4582,-73.6405',
        'DRIVING'
      );
    });

    it('should handle TRANSIT mode', async () => {
      const mockDirections = {
        routes: [
          {
            overview_polyline: { points: 'encoded_polyline' }
          }
        ]
      };

      (mapService.getDirections as jest.Mock).mockResolvedValue(mockDirections);

      const response = await request(app)
        .get('/api/directions')
        .query({
          origin: '45.4971,-73.5788',
          destination: '45.4582,-73.6405',
          mode: 'TRANSIT'
        });

      expect(response.status).toBe(200);
      expect(mapService.getDirections).toHaveBeenCalledWith(
        '45.4971,-73.5788',
        '45.4582,-73.6405',
        'TRANSIT'
      );
    });

    it('should return 500 when service throws an error', async () => {
      (mapService.getDirections as jest.Mock).mockRejectedValue(
        new Error('Google Maps API error')
      );

      const response = await request(app)
        .get('/api/directions')
        .query({
          origin: '45.4971,-73.5788',
          destination: '45.4582,-73.6405',
          mode: 'WALKING'
        });

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Failed to fetch directions');
    });

    it('should handle requests with undefined parameters', async () => {
      const mockDirections = { routes: [] };
      (mapService.getDirections as jest.Mock).mockResolvedValue(mockDirections);

      const response = await request(app)
        .get('/api/directions')
        .query({});

      // Controller should handle undefined parameters
      expect(response.status).toBe(200);
      expect(mapService.getDirections).toHaveBeenCalledWith(
        undefined,
        undefined,
        undefined
      );
    });

    it('should preserve query parameter types', async () => {
      const mockDirections = { routes: [] };
      (mapService.getDirections as jest.Mock).mockResolvedValue(mockDirections);

      const origin = '45.497,-73.578';
      const destination = '45.458,-73.640';
      const mode = 'BICYCLING';

      const response = await request(app)
        .get('/api/directions')
        .query({ origin, destination, mode });

      expect(response.status).toBe(200);
      expect(mapService.getDirections).toHaveBeenCalledWith(
        origin,
        destination,
        mode
      );
    });
  });

  describe('Route error handling', () => {
    it('should return JSON error response on service failure', async () => {
      (mapService.getDirections as jest.Mock).mockRejectedValue(
        new Error('Network timeout')
      );

      const response = await request(app)
        .get('/api/directions')
        .query({
          origin: '45.4971,-73.5788',
          destination: '45.4582,-73.6405',
          mode: 'WALKING'
        });

      expect(response.status).toBe(500);
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toEqual({
        error: 'Failed to fetch directions'
      });
    });
  });

  describe('HTTP method validation', () => {
    it('should only accept GET requests', async () => {
      const mockDirections = { routes: [] };
      (mapService.getDirections as jest.Mock).mockResolvedValue(mockDirections);

      // POST should not be allowed
      const postResponse = await request(app)
        .post('/api/directions')
        .send({
          origin: '45.4971,-73.5788',
          destination: '45.4582,-73.6405',
          mode: 'WALKING'
        });

      expect(postResponse.status).not.toBe(200);
    });
  });

  describe('GET /api/places/nearby', () => {
    it('should return 200 and nearby places with explicit radius/maxResults', async () => {
      const mockPlaces = [
        {
          placeId: 'id-1',
          name: 'Concordia Library',
          vicinity: '1455 De Maisonneuve Blvd W',
          rating: 4.5,
          userRatingsTotal: 120,
          location: { latitude: 45.4971, longitude: -73.5788 },
          icon: null,
          openNow: true,
        },
      ];

      (mapService.getNearbyPlaces as jest.Mock).mockResolvedValue(mockPlaces);

      const response = await request(app)
        .get('/api/places/nearby')
        .query({
          location: '45.4971,-73.5788',
          type: 'library',
          radius: '500',
          maxResults: '5',
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ results: mockPlaces });
      expect(mapService.getNearbyPlaces).toHaveBeenCalledWith(
        '45.4971,-73.5788',
        500,
        'library',
        5,
      );
    });

    it('should use default radius and maxResults when omitted', async () => {
      (mapService.getNearbyPlaces as jest.Mock).mockResolvedValue([]);

      const response = await request(app)
        .get('/api/places/nearby')
        .query({
          location: '45.4582,-73.6405',
          type: 'cafe',
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ results: [] });
      expect(mapService.getNearbyPlaces).toHaveBeenCalledWith(
        '45.4582,-73.6405',
        1500,
        'cafe',
        10,
      );
    });

    it('should return 400 when location is missing', async () => {
      const response = await request(app)
        .get('/api/places/nearby')
        .query({
          type: 'restaurant',
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'location and type are required' });
      expect(mapService.getNearbyPlaces).not.toHaveBeenCalled();
    });

    it('should return 400 when type is missing', async () => {
      const response = await request(app)
        .get('/api/places/nearby')
        .query({
          location: '45.4971,-73.5788',
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'location and type are required' });
      expect(mapService.getNearbyPlaces).not.toHaveBeenCalled();
    });

    it('should return 500 when nearby places service throws', async () => {
      (mapService.getNearbyPlaces as jest.Mock).mockRejectedValue(
        new Error('Places API failed'),
      );

      const response = await request(app)
        .get('/api/places/nearby')
        .query({
          location: '45.4971,-73.5788',
          type: 'restaurant',
        });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Failed to fetch nearby places' });
    });
  });
});
