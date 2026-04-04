describe('Frontend mapApiService integration coverage', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  const loadService = async (platform: 'ios' | 'android') => {
    jest.doMock('react-native', () => ({ Platform: { OS: platform } }), { virtual: true });
    return import('../../app/frontend/src/services/mapApiService');
  };

  it('uses localhost when no base URL or host override is configured', async () => {
    delete process.env.EXPO_PUBLIC_API_BASE_URL;
    delete process.env.EXPO_PUBLIC_API_HOST;
    delete process.env.EXPO_PUBLIC_API_PORT;

    const service = await loadService('ios');
    const getMock = jest.fn().mockResolvedValueOnce({ data: { results: [{ placeId: 'p1' }] } });
    service.__setMapApiHttpClientForTests({ get: getMock, post: jest.fn() });

    const result = await service.getNearbyPlaces(45.5, -73.6, 'cafe');

    expect(getMock).toHaveBeenCalledWith(
      'http://localhost:3000/api/places/nearby',
      {
        params: { location: '45.5,-73.6', radius: 1500, type: 'cafe', maxResults: 10 },
        timeout: 10000,
      },
    );
    expect(result).toEqual([{ placeId: 'p1' }]);
  });

  it('uses configured API host when base URL is not configured', async () => {
    delete process.env.EXPO_PUBLIC_API_BASE_URL;
    process.env.EXPO_PUBLIC_API_HOST = 'api.internal';
    delete process.env.EXPO_PUBLIC_API_PORT;

    const service = await loadService('android');
    const getMock = jest.fn().mockResolvedValueOnce({ data: { routes: [] } });
    service.__setMapApiHttpClientForTests({ get: getMock, post: jest.fn() });

    await service.getRouteFromBackend('origin', 'destination', 'WALKING');

    expect(getMock).toHaveBeenCalledWith(
      'http://api.internal:3000/api/directions',
      {
        params: {
          origin: 'origin',
          destination: 'destination',
          mode: 'WALKING',
        },
        timeout: 10000,
      },
    );
  });

  it('uses configured base URL when provided', async () => {
    process.env.EXPO_PUBLIC_API_BASE_URL = 'https://api.example.com';

    const service = await loadService('ios');
    const getMock = jest.fn().mockResolvedValueOnce({ data: { results: [] } });
    service.__setMapApiHttpClientForTests({ get: getMock, post: jest.fn() });

    await service.getNearbyPlaces(1, 2, 'library', 3, 400);

    expect(getMock).toHaveBeenCalledWith(
      'https://api.example.com/api/places/nearby',
      {
        params: { location: '1,2', radius: 400, type: 'library', maxResults: 3 },
        timeout: 10000,
      },
    );
  });

  it('throws when the frontend Google API key is missing', async () => {
    delete process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

    const service = await loadService('ios');

    await expect(
      service.getNearbyPlacesFromGoogle({ lat: 45.5, lng: -73.6, type: 'cafe' }),
    ).rejects.toThrow('EXPO_PUBLIC_GOOGLE_MAPS_API_KEY is missing');
  });

  it('maps Google nearby results and honors the result limit', async () => {
    process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY = 'frontend-test-key';

    const service = await loadService('ios');
    const postMock = jest.fn().mockResolvedValueOnce({
      data: {
        status: 'OK',
        results: [
          {
            place_id: 'google-1',
            name: 'Cafe One',
            geometry: { location: { lat: 1.1, lng: 2.2 } },
            vicinity: 'Vicinity One',
            types: ['cafe'],
            rating: 4.8,
            user_ratings_total: 30,
            opening_hours: { open_now: true },
          },
          {
            place_id: 'google-2',
            name: 'Cafe Two',
            geometry: { location: { lat: 3.3, lng: 4.4 } },
            formatted_address: 'Formatted Two',
            types: 'invalid',
          },
        ],
      },
    });
    service.__setMapApiHttpClientForTests({ get: jest.fn(), post: postMock });

    const result = await service.getNearbyPlacesFromGoogle({
      lat: 45.5,
      lng: -73.6,
      type: 'cafe',
      limit: 1,
      radius: 250,
      keyword: 'coffee',
    });

    expect(postMock).toHaveBeenCalledWith(
      'https://maps.googleapis.com/maps/api/place/nearbysearch/json',
      {},
      {
        params: {
          location: '45.5,-73.6',
          type: 'cafe',
          radius: 250,
          keyword: 'coffee',
        },
        headers: { 'X-API-Key': 'frontend-test-key' },
        timeout: 10000,
      },
    );
    expect(result).toEqual({
      status: 'OK',
      results: [
        {
          id: 'google-1',
          name: 'Cafe One',
          location: { lat: 1.1, lng: 2.2 },
          address: 'Vicinity One',
          types: ['cafe'],
          rating: 4.8,
          userRatingsTotal: 30,
          isOpenNow: true,
        },
      ],
    });
  });

  it('throws when Google Places request is denied', async () => {
    process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY = 'frontend-test-key';

    const service = await loadService('ios');
    const postMock = jest.fn().mockResolvedValueOnce({
      data: {
        status: 'REQUEST_DENIED',
        error_message: 'Denied by Google',
      },
    });
    service.__setMapApiHttpClientForTests({ get: jest.fn(), post: postMock });

    await expect(
      service.getNearbyPlacesFromGoogle({ lat: 45.5, lng: -73.6, type: 'cafe' }),
    ).rejects.toThrow('Denied by Google');
  });

  it('throws when Google Places returns an unexpected status', async () => {
    process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY = 'frontend-test-key';

    const service = await loadService('ios');
    const postMock = jest.fn().mockResolvedValueOnce({
      data: {
        status: 'OVER_QUERY_LIMIT',
        results: [],
      },
    });
    service.__setMapApiHttpClientForTests({ get: jest.fn(), post: postMock });

    await expect(
      service.getNearbyPlacesFromGoogle({ lat: 45.5, lng: -73.6, type: 'cafe' }),
    ).rejects.toThrow('Google Places failed with status: OVER_QUERY_LIMIT');
  });

  it('rethrows axios errors from Google Places lookups', async () => {
    process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY = 'frontend-test-key';

    const service = await loadService('ios');
    const postMock = jest.fn().mockRejectedValueOnce(new Error('network down'));
    service.__setMapApiHttpClientForTests({ get: jest.fn(), post: postMock });

    await expect(
      service.getNearbyPlacesFromGoogle({ lat: 45.5, lng: -73.6, type: 'cafe' }),
    ).rejects.toThrow('network down');
  });

  it('rethrows backend errors from getRouteFromBackend', async () => {
    delete process.env.EXPO_PUBLIC_API_BASE_URL;

    const service = await loadService('ios');
    const getMock = jest.fn().mockRejectedValueOnce(new Error('backend unavailable'));
    service.__setMapApiHttpClientForTests({ get: getMock, post: jest.fn() });

    await expect(
      service.getRouteFromBackend('origin', 'destination', 'DRIVING'),
    ).rejects.toThrow('backend unavailable');
  });
});