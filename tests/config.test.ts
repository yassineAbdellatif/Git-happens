import { config } from '../app/backend/src/config/config';

describe('config', () => {
    const ORIGINAL_ENV = process.env;

    beforeEach(() => {
        jest.resetModules();
        process.env = { ...ORIGINAL_ENV };
    });

    afterAll(() => {
        process.env = ORIGINAL_ENV;
    });

    it('uses PORT from environment variable when defined', async () => {
        process.env.PORT = '4000';
        const { config } = await import('../app/backend/src/config/config');
        expect(config.port).toBe(4000);
    });

    it('defaults to port 3000 when PORT is not defined', async () => {
        delete process.env.PORT;
        const { config } = await import('../app/backend/src/config/config');
        expect(config.port).toBe(3000);
    });

    it('exposes GOOGLE_MAPS_API_KEY', async () => {
        process.env.GOOGLE_MAPS_API_KEY = 'test-key';
        const { config } = await import('../app/backend/src/config/config');
        expect(config.googleMapsApiKey).toBe('test-key');
    });
});