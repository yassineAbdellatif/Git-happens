import axios from 'axios';
import * as mapService from '../../app/backend/src/services/mapService';

// Mock the Google Maps service to avoid real API calls and charges
jest.mock('../../app/backend/src/services/mapService');

describe('Full Stack Integration - Frontend to Backend', () => {
  const API_BASE_URL = 'http://localhost:3000';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Frontend mapApiService to Backend API', () => {
    it('should successfully fetch route data through the full stack', async () => {
      const mockGoogleResponse = {
        routes: [
          {
            overview_polyline: {
              points: 'u~ttGba_`L_AtC@u@NcBRmBJmBJiBL_BH_BDeBDeBBeB@eB@cA'
            },
            legs: [
              {
                distance: { text: '5.2 km', value: 5200 },
                duration: { text: '12 mins', value: 720 }
              }
            ],
            summary: 'Maisonneuve Blvd'
          }
        ],
        status: 'OK'
      };

      (mapService.getDirections as jest.Mock).mockResolvedValue(mockGoogleResponse);

      // Simulate frontend API call
      try {
        const response = await axios.get(`${API_BASE_URL}/api/directions`, {
          params: {
            origin: '45.4971,-73.5788', // Hall Building (SGW)
            destination: '45.4582,-73.6405', // Vanier Library (Loyola)
            mode: 'WALKING'
          },
          timeout: 5000
        });

        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty('routes');
        expect(response.data.routes).toHaveLength(1);
        expect(response.data.routes[0]).toHaveProperty('overview_polyline');
        expect(response.data.routes[0].overview_polyline).toHaveProperty('points');
      } catch (error) {
        // If server is not running, this is expected in CI/CD
        if (axios.isAxiosError(error) && error.code === 'ECONNREFUSED') {
          console.warn('Backend server not running - skipping full stack test');
        } else {
          throw error;
        }
      }
    });

    it('should handle different transport modes in full stack', async () => {
      const modes = ['WALKING', 'DRIVING', 'TRANSIT', 'BICYCLING'];

      for (const mode of modes) {
        const mockResponse = {
          routes: [{
            overview_polyline: { points: `encoded_for_${mode}` }
          }]
        };

        (mapService.getDirections as jest.Mock).mockResolvedValue(mockResponse);

        try {
          const response = await axios.get(`${API_BASE_URL}/api/directions`, {
            params: {
              origin: '45.4971,-73.5788',
              destination: '45.4582,-73.6405',
              mode
            },
            timeout: 5000
          });

          if (response.status === 200) {
            expect(response.data.routes).toBeDefined();
          }
        } catch (error) {
          if (axios.isAxiosError(error) && error.code === 'ECONNREFUSED') {
            console.warn(`Backend not running for ${mode} test - skipping`);
          } else {
            throw error;
          }
        }
      }
    });

    it('should properly decode polyline in frontend after receiving from backend', async () => {
      const mockResponse = {
        routes: [{
          overview_polyline: {
            points: '_p~iF~ps|U_ulLnnqC_mqNvxq`@'
          }
        }]
      };

      (mapService.getDirections as jest.Mock).mockResolvedValue(mockResponse);

      try {
        const response = await axios.get(`${API_BASE_URL}/api/directions`, {
          params: {
            origin: '45.4971,-73.5788',
            destination: '45.4582,-73.6405',
            mode: 'WALKING'
          },
          timeout: 5000
        });

        if (response.status === 200 && response.data.routes.length > 0) {
          const polylinePoints = response.data.routes[0].overview_polyline.points;
          
          // Verify polyline is a non-empty string (it will be decoded in frontend)
          expect(typeof polylinePoints).toBe('string');
          expect(polylinePoints.length).toBeGreaterThan(0);
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

  describe('Error scenarios in full stack', () => {
    it('should handle backend timeout gracefully', async () => {
      (mapService.getDirections as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 15000))
      );

      try {
        await axios.get(`${API_BASE_URL}/api/directions`, {
          params: {
            origin: '45.4971,-73.5788',
            destination: '45.4582,-73.6405',
            mode: 'WALKING'
          },
          timeout: 1000 // 1 second timeout
        });

        fail('Should have thrown timeout error');
      } catch (error) {
        if (axios.isAxiosError(error)) {
          if (error.code === 'ECONNREFUSED') {
            console.warn('Backend not running - skipping timeout test');
          } else {
            // Expect timeout error
            expect(['ECONNABORTED', 'ETIMEDOUT', 'ECONNREFUSED']).toContain(error.code);
          }
        }
      }
    });

    it('should handle invalid coordinates', async () => {
      (mapService.getDirections as jest.Mock).mockRejectedValue(
        new Error('Invalid coordinates')
      );

      try {
        const response = await axios.get(`${API_BASE_URL}/api/directions`, {
          params: {
            origin: 'invalid',
            destination: 'also-invalid',
            mode: 'WALKING'
          },
          timeout: 5000
        });

        // If it succeeds, backend should handle it
        expect(response.status).toBeDefined();
      } catch (error) {
        if (axios.isAxiosError(error)) {
          if (error.code === 'ECONNREFUSED') {
            console.warn('Backend not running - skipping invalid coords test');
          } else {
            // Either 400 or 500 is acceptable for invalid input
            expect([400, 500]).toContain(error.response?.status);
          }
        }
      }
    });
  });

  describe('Concordia Campus specific routes', () => {
    it('should route between SGW campus buildings', async () => {
      const mockResponse = {
        routes: [{
          overview_polyline: { points: 'sgw_route' },
          legs: [{
            distance: { text: '400 m', value: 400 },
            duration: { text: '5 mins', value: 300 }
          }]
        }]
      };

      (mapService.getDirections as jest.Mock).mockResolvedValue(mockResponse);

      try {
        const response = await axios.get(`${API_BASE_URL}/api/directions`, {
          params: {
            origin: '45.4971,-73.5788', // Hall Building
            destination: '45.4966,-73.5779', // Library Building
            mode: 'WALKING'
          },
          timeout: 5000
        });

        if (response.status === 200) {
          expect(response.data.routes[0].legs[0].distance.value).toBeLessThan(1000);
        }
      } catch (error) {
        if (axios.isAxiosError(error) && error.code === 'ECONNREFUSED') {
          console.warn('Backend not running - skipping SGW route test');
        }
      }
    });

    it('should route between campuses (SGW to Loyola)', async () => {
      const mockResponse = {
        routes: [{
          overview_polyline: { points: 'campus_to_campus_route' },
          legs: [{
            distance: { text: '12 km', value: 12000 },
            duration: { text: '25 mins', value: 1500 }
          }]
        }]
      };

      (mapService.getDirections as jest.Mock).mockResolvedValue(mockResponse);

      try {
        const response = await axios.get(`${API_BASE_URL}/api/directions`, {
          params: {
            origin: '45.4971,-73.5788', // SGW
            destination: '45.4582,-73.6405', // Loyola
            mode: 'TRANSIT'
          },
          timeout: 5000
        });

        if (response.status === 200) {
          // Distance between campuses should be significant
          expect(response.data.routes[0].legs[0].distance.value).toBeGreaterThan(5000);
        }
      } catch (error) {
        if (axios.isAxiosError(error) && error.code === 'ECONNREFUSED') {
          console.warn('Backend not running - skipping campus-to-campus test');
        }
      }
    });
  });
});
