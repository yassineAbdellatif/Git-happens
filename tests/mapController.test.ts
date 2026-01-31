import { Request, Response } from 'express';
import * as mapService from '../app/backend/src/services/mapService';
import { getRoute } from '../app/backend/src/controllers/mapController';

jest.mock('../app/backend/src/services/mapService');

describe('mapController', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;

    beforeEach(() => {
        mockRequest = {
            query: {},
        };
        mockResponse = {
            json: jest.fn().mockReturnThis(),
            status: jest.fn().mockReturnThis(),
        };
        jest.clearAllMocks();
    });

    describe('getRoute', () => {
        it('should return directions with valid parameters', async () => {
            const mockDirections = { routes: [] };
            (mapService.getDirections as jest.Mock).mockResolvedValue(mockDirections);
            mockRequest.query = { origin: 'New York', destination: 'Boston', mode: 'driving' };

            await getRoute(mockRequest as Request, mockResponse as Response);

            expect(mapService.getDirections).toHaveBeenCalledWith('New York', 'Boston', 'driving');
            expect(mockResponse.json).toHaveBeenCalledWith(mockDirections);
        });

        it('should return 500 error when service fails', async () => {
            (mapService.getDirections as jest.Mock).mockRejectedValue(new Error('API error'));
            mockRequest.query = { origin: 'New York', destination: 'Boston', mode: 'driving' };

            await getRoute(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Failed to fetch directions' });
        });

        it('should handle missing query parameters', async () => {
            (mapService.getDirections as jest.Mock).mockResolvedValue({ routes: [] });
            mockRequest.query = {};

            await getRoute(mockRequest as Request, mockResponse as Response);

            expect(mapService.getDirections).toHaveBeenCalledWith(undefined, undefined, undefined);
        });
    });
});