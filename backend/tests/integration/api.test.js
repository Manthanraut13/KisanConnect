require('dotenv').config();
const request = require('supertest');
const app = require('../../src/app');
const { sequelize, User, Farmer } = require('../../src/models');
const { generateTokens } = require('../../src/utils/jwt.utils');

jest.setTimeout(30000);

describe('Express REST API Integration Tests', () => {
  let testUserToken;
  let testAdminToken;
  let testFarmerUserId;
  const uniqueSuffix = Date.now().toString().slice(-6);
  const testMobile = '98' + uniqueSuffix + '12';
  const testEmail = `testuser_${uniqueSuffix}@example.com`;

  beforeAll(async () => {
    await sequelize.authenticate();
    await sequelize.sync();
  }, 30000);

  afterAll(async () => {
    if (testFarmerUserId) {
      await Farmer.destroy({ where: { user_id: testFarmerUserId } });
      await User.destroy({ where: { id: testFarmerUserId } });
    }
  });

  describe('Health Check Endpoint', () => {
    it('GET /health returns 200 and health status', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('Kisan Connect API is running');
      expect(res.body).toHaveProperty('timestamp');
    });
  });

  describe('Authentication Endpoints', () => {
    it('POST /api/auth/register fails on validation error', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          full_name: 'A', // Too short
          mobile: '12345', // Invalid
          password: 'pass',
          role: 'farmer',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });

    it('POST /api/auth/register successfully registers a new farmer', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          full_name: 'Test Farmer',
          mobile: testMobile,
          email: testEmail,
          password: 'Password@123',
          role: 'farmer',
          district: 'Nashik',
          state: 'Maharashtra',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('access_token');
      expect(res.body.data.user.mobile).toBe(testMobile);

      testFarmerUserId = res.body.data.user.id;
      testUserToken = res.body.data.access_token;
    });

    it('POST /api/auth/register rejects duplicate mobile', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          full_name: 'Duplicate Farmer',
          mobile: testMobile,
          password: 'Password@123',
          role: 'farmer',
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('already registered');
    });

    it('POST /api/auth/login succeeds with correct credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          mobile: testMobile,
          password: 'Password@123',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('access_token');
      expect(res.body.data).toHaveProperty('refresh_token');
    });

    it('POST /api/auth/login fails with incorrect password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          mobile: testMobile,
          password: 'WrongPassword@123',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Protected Routes & Middleware', () => {
    it('GET /api/users/me rejects request without Authorization header', async () => {
      const res = await request(app).get('/api/users/me');
      expect(res.status).toBe(401);
      expect(res.body.message).toBe('No token provided');
    });

    it('GET /api/users/me rejects request with invalid token', async () => {
      const res = await request(app)
        .get('/api/users/me')
        .set('Authorization', 'Bearer invalid.token.payload');
      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Invalid token');
    });

    it('GET /api/users/me returns authenticated profile with valid token', async () => {
      const res = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(testFarmerUserId);
      expect(res.body.data.mobile).toBe(testMobile);
      expect(res.body.data).toHaveProperty('farmerProfile');
    });

    it('GET /api/admin/stats denies access to regular farmer role (RBAC)', async () => {
      const res = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Access denied');
    });
  });

  describe('Webhook Security Verification', () => {
    it('POST /api/webhooks/refresh-forecasts fails without valid secret header', async () => {
      const res = await request(app)
        .post('/api/webhooks/refresh-forecasts')
        .send({});

      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Invalid webhook secret');
    });
  });
});
