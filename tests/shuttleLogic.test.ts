import {
  getSegmentColor,
  getNextShuttleInfo,
  getOriginCampusFromLocation,
  buildShuttleRoute,
  SHUTTLE_TRAVEL_MINUTES,
} from '../app/frontend/src/features/map/utils/shuttleLogic';
import * as mapApiService from '../app/frontend/src/services/mapApiService';
import { SHUTTLE_SCHEDULE } from '../app/frontend/src/constants/shuttleSchedule';


// Mock the mapApiService and polylineDecoder
jest.mock('../app/frontend/src/services/mapApiService');
jest.mock('../app/frontend/src/utils/polylineDecoder', () => ({
  decodePolyline: jest.fn((encoded: string) => {
    // Return mock coordinates based on encoded string
    if (encoded === 'walkToStopPolyline') {
      return [{ latitude: 45.497, longitude: -73.578 }, { latitude: 45.497, longitude: -73.578 }];
    }
    if (encoded === 'shuttlePolyline') {
      return [{ latitude: 45.497, longitude: -73.578 }, { latitude: 45.458, longitude: -73.639 }];
    }
    if (encoded === 'walkToDestPolyline') {
      return [{ latitude: 45.458, longitude: -73.639 }, { latitude: 45.458, longitude: -73.639 }];
    }
    return [];
  }),
}));

describe('shuttleLogic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('SHUTTLE_TRAVEL_MINUTES', () => {
    it('should be defined as 40 minutes', () => {
      expect(SHUTTLE_TRAVEL_MINUTES).toBe(40);
    });
  });

  describe('getSegmentColor', () => {
    it('should return blue for WALKING mode', () => {
      expect(getSegmentColor('WALKING')).toBe('#4285F4');
    });

    it('should return red for SHUTTLE mode', () => {
      expect(getSegmentColor('SHUTTLE')).toBe('#912338');
    });

    it('should return default color for unknown mode', () => {
      expect(getSegmentColor('UNKNOWN')).toBe('#912338');
    });

    it('should handle lowercase mode', () => {
      expect(getSegmentColor('walking')).toBe('#4285F4');
      expect(getSegmentColor('shuttle')).toBe('#912338');
    });

    it('should handle undefined mode', () => {
      expect(getSegmentColor(undefined)).toBe('#912338');
    });

    it('should handle mixed case', () => {
      expect(getSegmentColor('WaLkInG')).toBe('#4285F4');
    });
  });

  describe('getNextShuttleInfo', () => {
    it('should return no schedule available when active semester schedule is missing', () => {
      const semesters = (SHUTTLE_SCHEDULE as any).semesters;
      const activeSemester = (SHUTTLE_SCHEDULE as any).activeSemester;
      const previousSchedule = semesters?.[activeSemester]?.Schedule;

      if (semesters?.[activeSemester]) {
        semesters[activeSemester].Schedule = undefined;
      }

      const result = getNextShuttleInfo('LOYOLA', 'SGW', new Date('2026-03-02T09:00:00'));

      expect(result.title).toBe('No schedule available');
      expect(result.subtitle).toContain('Check back later');

      if (semesters?.[activeSemester]) {
        semesters[activeSemester].Schedule = previousSchedule;
      }
    });

    it('should return message when no origin or destination', () => {
      const result = getNextShuttleInfo(null, null);
      
      expect(result.title).toBe('Select origin and destination');
      expect(result.subtitle).toContain('Shuttle schedules');
    });

    it('should return message when origin and destination are same', () => {
      const result = getNextShuttleInfo('SGW', 'SGW');
      
      expect(result.title).toBe('Shuttle runs between campuses only');
    });

    it('should return next shuttle time for Monday morning from LOYOLA', () => {
      const monday9AM = new Date('2026-03-02T09:00:00'); // Monday
      const result = getNextShuttleInfo('LOYOLA', 'SGW', monday9AM);
      
      expect(result.title).toContain('Next shuttle at');
      expect(result.title).toContain('9:15');
      expect(result.subtitle).toContain('LOYOLA to SGW');
    });

    it('should return next shuttle time for Monday morning from SGW', () => {
      const monday9AM = new Date('2026-03-02T09:00:00'); // Monday
      const result = getNextShuttleInfo('SGW', 'LOYOLA', monday9AM);
      
      expect(result.title).toContain('Next shuttle at');
      expect(result.title).toContain('9:30');
      expect(result.subtitle).toContain('SGW to LOYOLA');
    });

    it('should return next shuttle time for Friday from LOYOLA', () => {
      const friday9AM = new Date('2026-03-06T09:00:00'); // Friday
      const result = getNextShuttleInfo('LOYOLA', 'SGW', friday9AM);
      
      expect(result.title).toContain('Next shuttle at');
      expect(result.title).toContain('9:15');
    });

    it('should calculate correct minutes until departure', () => {
      const monday9_10AM = new Date('2026-03-02T09:10:00'); // Monday 9:10
      const result = getNextShuttleInfo('LOYOLA', 'SGW', monday9_10AM);
      
      expect(result.subtitle).toContain('in 5 min');
    });

    it('should return no more shuttles for late evening', () => {
      const monday9PM = new Date('2026-03-02T21:00:00'); // Monday 9 PM
      const result = getNextShuttleInfo('LOYOLA', 'SGW', monday9PM);
      
      expect(result.title).toBe('No more shuttles today');
      expect(result.subtitle).toContain('Try again tomorrow');
    });

    it('should return no service on Saturday', () => {
      const saturday = new Date('2026-03-07T10:00:00'); // Saturday
      const result = getNextShuttleInfo('LOYOLA', 'SGW', saturday);
      
      expect(result.title).toBe('No shuttle service today');
      expect(result.subtitle).toContain('Monday to Friday');
    });

    it('should return no service on Sunday', () => {
      const sunday = new Date('2026-03-08T10:00:00'); // Sunday
      const result = getNextShuttleInfo('LOYOLA', 'SGW', sunday);
      
      expect(result.title).toBe('No shuttle service today');
    });

    it('should handle exact departure time', () => {
      const monday9_15AM = new Date('2026-03-02T09:15:00'); // Monday 9:15
      const result = getNextShuttleInfo('LOYOLA', 'SGW', monday9_15AM);
      
      expect(result.title).toContain('Next shuttle at 9:15');
      expect(result.subtitle).toContain('in 0 min');
    });
  });

  describe('getOriginCampusFromLocation', () => {
    const sgwRegion = { latitude: 45.497, longitude: -73.578 };
    const loyolaRegion = { latitude: 45.458, longitude: -73.639 };

    it('should return campus from currentBuildingCampus if provided', () => {
      const result = getOriginCampusFromLocation(
        'SGW',
        { latitude: 45.458, longitude: -73.639 },
        sgwRegion,
        loyolaRegion
      );
      
      expect(result).toBe('SGW');
    });

    it('should return null if no currentBuildingCampus and no userLocation', () => {
      const result = getOriginCampusFromLocation(
        null,
        null,
        sgwRegion,
        loyolaRegion
      );
      
      expect(result).toBeNull();
    });

    it('should return SGW when user is closer to SGW', () => {
      const userNearSGW = { latitude: 45.497, longitude: -73.578 };
      const result = getOriginCampusFromLocation(
        null,
        userNearSGW,
        sgwRegion,
        loyolaRegion
      );
      
      expect(result).toBe('SGW');
    });

    it('should return LOYOLA when user is closer to Loyola', () => {
      const userNearLoyola = { latitude: 45.458, longitude: -73.639 };
      const result = getOriginCampusFromLocation(
        null,
        userNearLoyola,
        sgwRegion,
        loyolaRegion
      );
      
      expect(result).toBe('LOYOLA');
    });

    it('should handle user exactly at SGW', () => {
      const result = getOriginCampusFromLocation(
        null,
        sgwRegion,
        sgwRegion,
        loyolaRegion
      );
      
      expect(result).toBe('SGW');
    });

    it('should handle user exactly at Loyola', () => {
      const result = getOriginCampusFromLocation(
        null,
        loyolaRegion,
        sgwRegion,
        loyolaRegion
      );
      
      expect(result).toBe('LOYOLA');
    });
  });

  describe('buildShuttleRoute', () => {
    const mockWalkToStopResponse = {
      routes: [
        {
          legs: [{ distance: { value: 500, text: '500 m' }, duration: { value: 360, text: '6 min' } }],
          overview_polyline: { points: 'walkToStopPolyline' },
        },
      ],
      processedRoute: {
        steps: [
          { instruction: 'Walk to stop', distance: '500 m', duration: '6 min' },
        ],
      },
    };

    const mockShuttleResponse = {
      routes: [
        {
          legs: [{ distance: { value: 10000, text: '10 km' }, duration: { value: 2400, text: '40 min' } }],
          overview_polyline: { points: 'shuttlePolyline' },
        },
      ],
    };

    const mockWalkToDestResponse = {
      routes: [
        {
          legs: [{ distance: { value: 300, text: '300 m' }, duration: { value: 240, text: '4 min' } }],
          overview_polyline: { points: 'walkToDestPolyline' },
        },
      ],
      processedRoute: {
        steps: [
          { instruction: 'Walk to destination', distance: '300 m', duration: '4 min' },
        ],
      },
    };

    beforeEach(() => {
      (mapApiService.getRouteFromBackend as jest.Mock)
        .mockResolvedValueOnce(mockWalkToStopResponse)
        .mockResolvedValueOnce(mockShuttleResponse)
        .mockResolvedValueOnce(mockWalkToDestResponse);
    });

    it('should build complete shuttle route', async () => {
      const input = {
        originCoords: { latitude: 45.497, longitude: -73.578 },
        destinationCoords: { latitude: 45.458, longitude: -73.639 },
        originCampus: 'SGW' as const,
        destinationCampus: 'LOYOLA' as const,
      };

      const result = await buildShuttleRoute(input);

      expect(result).not.toBeNull();
      expect(result?.segments).toHaveLength(3);
      expect(result?.segments[0].mode).toBe('WALKING');
      expect(result?.segments[1].mode).toBe('SHUTTLE');
      expect(result?.segments[2].mode).toBe('WALKING');
    });

    it('should make three API calls', async () => {
      const input = {
        originCoords: { latitude: 45.497, longitude: -73.578 },
        destinationCoords: { latitude: 45.458, longitude: -73.639 },
        originCampus: 'SGW' as const,
        destinationCampus: 'LOYOLA' as const,
      };

      await buildShuttleRoute(input);

      expect(mapApiService.getRouteFromBackend).toHaveBeenCalledTimes(3);
    });

    it('should call API with correct parameters for walk to stop', async () => {
      const input = {
        originCoords: { latitude: 45.497, longitude: -73.578 },
        destinationCoords: { latitude: 45.458, longitude: -73.639 },
        originCampus: 'SGW' as const,
        destinationCampus: 'LOYOLA' as const,
      };

      await buildShuttleRoute(input);

      expect(mapApiService.getRouteFromBackend).toHaveBeenNthCalledWith(
        1,
        '45.497,-73.578',
        '45.49712075217211,-73.57852254228162',
        'WALKING'
      );
    });

    it('should return null if any leg is missing', async () => {
      (mapApiService.getRouteFromBackend as jest.Mock)
        .mockReset()
        .mockResolvedValueOnce({ routes: [] })
        .mockResolvedValueOnce(mockShuttleResponse)
        .mockResolvedValueOnce(mockWalkToDestResponse);

      const input = {
        originCoords: { latitude: 45.497, longitude: -73.578 },
        destinationCoords: { latitude: 45.458, longitude: -73.639 },
        originCampus: 'SGW' as const,
        destinationCampus: 'LOYOLA' as const,
      };

      const result = await buildShuttleRoute(input);

      expect(result).toBeNull();
    });

    it('should calculate total distance correctly', async () => {
      const input = {
        originCoords: { latitude: 45.497, longitude: -73.578 },
        destinationCoords: { latitude: 45.458, longitude: -73.639 },
        originCampus: 'SGW' as const,
        destinationCampus: 'LOYOLA' as const,
      };

      const result = await buildShuttleRoute(input);

      // Total: 500 + 10000 + 300 = 10800 meters = 10.8 km
      expect(result?.distance).toBe('10.8 km');
    });

    it('should calculate total duration correctly', async () => {
      const input = {
        originCoords: { latitude: 45.497, longitude: -73.578 },
        destinationCoords: { latitude: 45.458, longitude: -73.639 },
        originCampus: 'SGW' as const,
        destinationCampus: 'LOYOLA' as const,
      };

      const result = await buildShuttleRoute(input);

      // Total: 6 min (walk) + 40 min (shuttle) + 4 min (walk) = 50 min
      expect(result?.duration).toBe('50 min');
    });

    it('should format distance in meters for short distances', async () => {
      (mapApiService.getRouteFromBackend as jest.Mock)
        .mockReset()
        .mockResolvedValueOnce({
          ...mockWalkToStopResponse,
          routes: [{ ...mockWalkToStopResponse.routes[0], legs: [{ distance: { value: 100, text: '100 m' }, duration: { value: 60 } }] }],
        })
        .mockResolvedValueOnce({
          ...mockShuttleResponse,
          routes: [{ ...mockShuttleResponse.routes[0], legs: [{ distance: { value: 200, text: '200 m' }, duration: { value: 120 } }] }],
        })
        .mockResolvedValueOnce({
          ...mockWalkToDestResponse,
          routes: [{ ...mockWalkToDestResponse.routes[0], legs: [{ distance: { value: 300, text: '300 m' }, duration: { value: 180 } }] }],
        });

      const input = {
        originCoords: { latitude: 45.497, longitude: -73.578 },
        destinationCoords: { latitude: 45.458, longitude: -73.639 },
        originCampus: 'SGW' as const,
        destinationCampus: 'LOYOLA' as const,
      };

      const result = await buildShuttleRoute(input);

      // Total: 100 + 200 + 300 = 600 meters
      expect(result?.distance).toBe('600 m');
    });

    it('should format duration in hours for long durations', async () => {
      (mapApiService.getRouteFromBackend as jest.Mock)
        .mockReset()
        .mockResolvedValueOnce({
          ...mockWalkToStopResponse,
          routes: [{ ...mockWalkToStopResponse.routes[0], legs: [{ distance: { value: 1000 }, duration: { value: 1200 } }] }],
        })
        .mockResolvedValueOnce({
          ...mockShuttleResponse,
          routes: [{ ...mockShuttleResponse.routes[0], legs: [{ distance: { value: 10000 }, duration: { value: 2400 } }] }],
        })
        .mockResolvedValueOnce({
          ...mockWalkToDestResponse,
          routes: [{ ...mockWalkToDestResponse.routes[0], legs: [{ distance: { value: 1000 }, duration: { value: 1200 } }] }],
        });

      const input = {
        originCoords: { latitude: 45.497, longitude: -73.578 },
        destinationCoords: { latitude: 45.458, longitude: -73.639 },
        originCampus: 'SGW' as const,
        destinationCampus: 'LOYOLA' as const,
      };

      const result = await buildShuttleRoute(input);

      // Total: 20 min (walk) + 40 min (shuttle) + 20 min (walk) = 80 min = 1 hr 20 min
      expect(result?.duration).toBe('1 hr 20 min');
    });

    it('should apply fallback values for missing optional route fields', async () => {
      (mapApiService.getRouteFromBackend as jest.Mock)
        .mockReset()
        .mockResolvedValueOnce({
          routes: [
            {
              legs: [{ duration: { value: 600 } }],
            },
          ],
        })
        .mockResolvedValueOnce({
          routes: [
            {
              legs: [{}],
            },
          ],
        })
        .mockResolvedValueOnce({
          routes: [
            {
              legs: [{ duration: { value: 600 } }],
            },
          ],
        });

      const input = {
        originCoords: { latitude: 45.497, longitude: -73.578 },
        destinationCoords: { latitude: 45.458, longitude: -73.639 },
        originCampus: 'SGW' as const,
        destinationCampus: 'LOYOLA' as const,
      };

      const result = await buildShuttleRoute(input);

      expect(result).not.toBeNull();
      expect(result?.coords).toEqual([]);
      expect(result?.segments).toEqual([]);
      expect(result?.distance).toBe('0 m');
      expect(result?.duration).toBe('1 hr');
      expect(result?.steps).toHaveLength(1);
      expect(result?.steps[0].distance).toBe('');
      expect(result?.steps[0].duration).toBe('40 min');
    });
  });
});
