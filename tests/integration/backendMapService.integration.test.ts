const mockGet = jest.fn();

jest.mock('../../app/backend/node_modules/axios', () => ({
  __esModule: true,
  default: {
    get: mockGet,
  },
  get: mockGet,
}));

describe('Backend mapService integration coverage', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('uses configured PORT and GOOGLE_MAPS_API_KEY when present', async () => {
    process.env.PORT = '4100';
    process.env.GOOGLE_MAPS_API_KEY = 'backend-test-key';

    const { config } = await import('../../app/backend/src/config/config');

    expect(config.port).toBe(4100);
    expect(config.googleMapsApiKey).toBe('backend-test-key');
  });

  it('defaults PORT and warns when GOOGLE_MAPS_API_KEY is missing', async () => {
    delete process.env.PORT;
    delete process.env.GOOGLE_MAPS_API_KEY;

    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);

    const { config } = await import('../../app/backend/src/config/config');

    expect(config.port).toBe(3000);
    expect(config.googleMapsApiKey).toBeUndefined();
    expect(warnSpy).toHaveBeenCalledWith(
      'WARNING: GOOGLE_MAPS_API_KEY is missing in .env file!',
    );

    warnSpy.mockRestore();
  });

  it('maps nearby places and applies response defaults', async () => {
    process.env.GOOGLE_MAPS_API_KEY = 'backend-test-key';

    mockGet.mockResolvedValueOnce({
      data: {
        status: 'OK',
        results: [
          {
            place_id: 'place-1',
            name: 'Library',
            vicinity: '123 Main St',
            rating: 4.7,
            user_ratings_total: 42,
            geometry: { location: { lat: 1.23, lng: 4.56 } },
            icon: 'icon-a',
            opening_hours: { open_now: true },
          },
          {
            place_id: 'place-2',
            name: 'Cafe',
            vicinity: null,
            geometry: { location: { lat: 7.89, lng: 0.12 } },
          },
        ],
      },
    });

    const { getNearbyPlaces } = await import('../../app/backend/src/services/mapService');

    const result = await getNearbyPlaces('45.497,-73.578', 750, 'library', 1);

    expect(mockGet).toHaveBeenCalledWith(
      'https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=45.497,-73.578&radius=750&type=library&key=backend-test-key',
    );
    expect(result).toEqual([
      {
        placeId: 'place-1',
        name: 'Library',
        vicinity: '123 Main St',
        rating: 4.7,
        userRatingsTotal: 42,
        location: { latitude: 1.23, longitude: 4.56 },
        icon: 'icon-a',
        openNow: true,
      },
    ]);
  });

  it('throws for unsupported nearby places statuses', async () => {
    process.env.GOOGLE_MAPS_API_KEY = 'backend-test-key';

    mockGet.mockResolvedValueOnce({
      data: {
        status: 'OVER_QUERY_LIMIT',
        results: [],
      },
    });

    const { getNearbyPlaces } = await import('../../app/backend/src/services/mapService');

    await expect(
      getNearbyPlaces('45.497,-73.578', 750, 'library', 10),
    ).rejects.toThrow('Places API error: OVER_QUERY_LIMIT');
  });

  it('returns processed directions when Google responds with a route', async () => {
    process.env.GOOGLE_MAPS_API_KEY = 'backend-test-key';

    mockGet.mockResolvedValueOnce({
      data: {
        status: 'OK',
        routes: [
          {
            overview_polyline: { points: 'encoded-polyline' },
            bounds: { northeast: { lat: 2, lng: 2 }, southwest: { lat: 1, lng: 1 } },
            legs: [
              {
                distance: { text: '1.2 km', value: 1200 },
                duration: { text: '15 mins', value: 900 },
                start_address: 'Start',
                end_address: 'End',
                steps: [
                  {
                    html_instructions: '<b>Walk</b> to stop',
                    distance: { text: '100 m' },
                    duration: { text: '1 min' },
                    maneuver: 'turn-left',
                    start_location: { lat: 1, lng: 1 },
                    end_location: { lat: 1.1, lng: 1.1 },
                  },
                  {
                    html_instructions: 'Head north',
                    distance: { text: '900 m' },
                    duration: { text: '14 mins' },
                    start_location: { lat: 1.1, lng: 1.1 },
                    end_location: { lat: 2, lng: 2 },
                  },
                ],
              },
            ],
          },
        ],
      },
    });

    const { getDirections } = await import('../../app/backend/src/services/mapService');

    const result = await getDirections('origin', 'destination', 'SHUTTLE');

    expect(mockGet).toHaveBeenCalledWith(
      'https://maps.googleapis.com/maps/api/directions/json?origin=origin&destination=destination&mode=TRANSIT&key=backend-test-key',
    );
    expect(result.processedRoute.steps).toEqual([
      {
        stepNumber: 1,
        instruction: 'Walk to stop',
        distance: '100 m',
        duration: '1 min',
        maneuver: 'turn-left',
        startLocation: { lat: 1, lng: 1 },
        endLocation: { lat: 1.1, lng: 1.1 },
      },
      {
        stepNumber: 2,
        instruction: 'Head north',
        distance: '900 m',
        duration: '14 mins',
        maneuver: 'straight',
        startLocation: { lat: 1.1, lng: 1.1 },
        endLocation: { lat: 2, lng: 2 },
      },
    ]);
    expect(result.processedRoute.totalDistance).toBe('1.2 km');
    expect(result.processedRoute.totalDuration).toBe('15 mins');
  });

  it('returns raw directions payload when no route is available', async () => {
    process.env.GOOGLE_MAPS_API_KEY = 'backend-test-key';

    mockGet.mockResolvedValueOnce({
      data: {
        status: 'ZERO_RESULTS',
        routes: [],
      },
    });

    const { getDirections } = await import('../../app/backend/src/services/mapService');

    const result = await getDirections('origin', 'destination', 'WALKING');

    expect(result).toEqual({
      status: 'ZERO_RESULTS',
      routes: [],
    });
  });
});