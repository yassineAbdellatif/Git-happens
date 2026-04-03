import { Request, Response } from 'express';
import * as mapService from '../app/backend/src/services/mapService';
import { getNearbyPlaces, getRoute } from '../app/backend/src/controllers/mapController';

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

    describe('getNearbyPlaces', () => {
        it('returns 400 when location is missing', async () => {
            mockRequest.query = { type: 'cafe' };

            await getNearbyPlaces(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({ error: 'location and type are required' });
            expect(mapService.getNearbyPlaces).not.toHaveBeenCalled();
        });

        it('returns 400 when type is missing', async () => {
            mockRequest.query = { location: '45.497,-73.579' };

            await getNearbyPlaces(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({ error: 'location and type are required' });
            expect(mapService.getNearbyPlaces).not.toHaveBeenCalled();
        });

        it('uses default radius and maxResults when omitted', async () => {
            const mockPlaces = [{ name: 'Cafe A' }];
            (mapService.getNearbyPlaces as jest.Mock).mockResolvedValue(mockPlaces);
            mockRequest.query = {
                location: '45.497,-73.579',
                type: 'cafe',
            };

            await getNearbyPlaces(mockRequest as Request, mockResponse as Response);

            expect(mapService.getNearbyPlaces).toHaveBeenCalledWith('45.497,-73.579', 1500, 'cafe', 10);
            expect(mockResponse.json).toHaveBeenCalledWith({ results: mockPlaces });
        });

        it('parses provided radius and maxResults values', async () => {
            const mockPlaces = [{ name: 'Library A' }];
            (mapService.getNearbyPlaces as jest.Mock).mockResolvedValue(mockPlaces);
            mockRequest.query = {
                location: '45.497,-73.579',
                type: 'library',
                radius: '2200',
                maxResults: '6',
            };

            await getNearbyPlaces(mockRequest as Request, mockResponse as Response);

            expect(mapService.getNearbyPlaces).toHaveBeenCalledWith('45.497,-73.579', 2200, 'library', 6);
            expect(mockResponse.json).toHaveBeenCalledWith({ results: mockPlaces });
        });

        it('returns 500 when nearby places service throws', async () => {
            (mapService.getNearbyPlaces as jest.Mock).mockRejectedValue(new Error('API error'));
            mockRequest.query = {
                location: '45.497,-73.579',
                type: 'restaurant',
            };

            await getNearbyPlaces(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Failed to fetch nearby places' });
        });
    });
});