jest.mock('axios');
jest.mock('../app/backend/src/config/config', () => ({
  config: { googleMapsApiKey: 'fake-api-key' },
}));

import axios from 'axios';
import { getDirections } from '../app/backend/src/services/mapService';

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('getDirections', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls axios with correct URL for SHUTTLE mode', async () => {
    mockedAxios.get.mockResolvedValue({ data: { routes: [] } });

    await getDirections('A', 'B', 'SHUTTLE');

    expect(mockedAxios.get).toHaveBeenCalledWith(
      expect.stringContaining('origin=A&destination=B&mode=transit&key=fake-api-key')
    );
  });

  it('calls axios with lowercase mode for other modes', async () => {
    mockedAxios.get.mockResolvedValue({ data: { routes: [] } });

    await getDirections('X', 'Y', 'DRIVING');

    expect(mockedAxios.get).toHaveBeenCalledWith(
      expect.stringContaining('origin=X&destination=Y&mode=driving&key=fake-api-key')
    );
  });

  it('returns the data from axios', async () => {
    const mockData = { routes: ['route1'] };
    mockedAxios.get.mockResolvedValue({ data: mockData });

    const result = await getDirections('A', 'B', 'DRIVING');
    expect(result).toEqual(mockData);
  });

  it('propagates axios errors', async () => {
    const error = new Error('Network error');
    mockedAxios.get.mockRejectedValue(error);

    await expect(getDirections('A', 'B', 'DRIVING')).rejects.toThrow('Network error');
  });
});