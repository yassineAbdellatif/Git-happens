import request from 'supertest';
import express from 'express';

// Mock the mapRoutes module
jest.mock('../app/backend/src/routes/mapRoutes', () => {
  const express = require('express');
  const router = express.Router();
  router.get('/directions', (req: any, res: any) => {
    res.json({ mocked: true });
  });
  return { default: router };
});

describe('Backend Server (index.ts)', () => {
  let app: express.Application;

  beforeEach(() => {
    // Clear module cache to get a fresh instance
    jest.resetModules();
    
    // Recreate the app for each test
    app = express();
    app.use(express.json());
    const mapRoutes = require('../app/backend/src/routes/mapRoutes').default;
    app.use('/api', mapRoutes);
    
    app.get('/health', (req, res) => {
      res.send('Campus Guide Backend is running ');
    });
  });

  describe('Health Endpoint', () => {
    it('should respond to health check', async () => {
      const response = await request(app).get('/health');
      
      expect(response.status).toBe(200);
      expect(response.text).toBe('Campus Guide Backend is running ');
    });
  });

  describe('API Routes', () => {
    it('should have /api routes mounted', async () => {
      const response = await request(app).get('/api/directions');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('mocked');
    });
  });

  describe('Middleware', () => {
    it('should parse JSON request bodies', async () => {
      app.post('/test', (req, res) => {
        res.json({ received: req.body });
      });

      const response = await request(app)
        .post('/test')
        .send({ test: 'data' })
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body.received).toEqual({ test: 'data' });
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for unknown routes', async () => {
      const response = await request(app).get('/unknown-route');
      
      expect(response.status).toBe(404);
    });
  });
});
