describe('Backend bootstrap (index.ts)', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('configures middleware, mounts routes, registers health, and starts server', () => {
    const dotenvConfigMock = jest.fn();
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);

    const corsMiddleware = (_req: unknown, _res: unknown, next: () => void) => next();
    const mapRoutesMock = (_req: unknown, _res: unknown, next: () => void) => next();

    let healthHandler: ((req: unknown, res: { send: (value: string) => void }) => void) | undefined;
    let useSpy: jest.SpyInstance;
    let getSpy: jest.SpyInstance;
    let listenSpy: jest.SpyInstance;
    let jsonSpy: jest.SpyInstance;

    jest.isolateModules(() => {
      const express = require('../app/backend/node_modules/express');

      useSpy = jest.spyOn(express.application, 'use');
      getSpy = jest
        .spyOn(express.application, 'get')
        .mockImplementation(function (this: unknown, path: string, handler: typeof healthHandler) {
          if (path === '/health') {
            healthHandler = handler;
          }
          return this;
        });
      listenSpy = jest
        .spyOn(express.application, 'listen')
        .mockImplementation(function (this: unknown, _port: number, callback?: () => void) {
          if (callback) {
            callback();
          }
          return this;
        });
      jsonSpy = jest.spyOn(express, 'json');

      jest.doMock('express', () => express);
      jest.doMock('dotenv', () => ({ config: dotenvConfigMock }), { virtual: true });
      jest.doMock('cors', () => jest.fn(() => corsMiddleware), { virtual: true });
      jest.doMock('../app/backend/src/routes/mapRoutes', () => ({
        __esModule: true,
        default: mapRoutesMock,
      }));

      require('../app/backend/src/index');
    });

    expect(dotenvConfigMock).toHaveBeenCalledTimes(1);
    expect(jsonSpy!).toHaveBeenCalledTimes(1);
    expect(useSpy!).toHaveBeenNthCalledWith(1, corsMiddleware);
    expect(useSpy!).toHaveBeenNthCalledWith(2, expect.any(Function));
    expect(useSpy!).toHaveBeenNthCalledWith(3, '/api', mapRoutesMock);

    expect(getSpy!).toHaveBeenCalledWith('/health', expect.any(Function));
    expect(listenSpy!).toHaveBeenCalledWith(3000, expect.any(Function));

    const sendMock = jest.fn();
    expect(healthHandler).toBeDefined();
    healthHandler?.({}, { send: sendMock });
    expect(sendMock).toHaveBeenCalledWith('Campus Guide Backend is running ');

    expect(consoleLogSpy).toHaveBeenCalledWith('Server running on http://localhost:3000');

    useSpy!.mockRestore();
    getSpy!.mockRestore();
    listenSpy!.mockRestore();
    jsonSpy!.mockRestore();
    consoleLogSpy.mockRestore();
  });
});
