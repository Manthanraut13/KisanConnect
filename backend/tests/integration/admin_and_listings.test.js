require('dotenv').config();
const request = require('supertest');
const app = require('../../src/app');
const { sequelize, User, Farmer, Listing, Grievance } = require('../../src/models');
const { generateTokens } = require('../../src/utils/jwt.utils');
const { createListing, getListings } = require('../../src/services/listing.service');

jest.setTimeout(30000);

describe('Admin, Listings & AI Webhook Tests', () => {
  let adminToken;
  let adminUserId;
  let farmerUserId;
  let farmerRecord;
  let createdListingId;
  const suffix = Date.now().toString().slice(-6);

  beforeAll(async () => {
    // 1. Create a test admin user and generate token
    const adminUser = await User.create({
      full_name: 'Test Admin',
      mobile: '97' + suffix + '01',
      email: `admin_${suffix}@example.com`,
      role: 'admin',
      is_active: true,
      is_verified: true,
    });
    adminUserId = adminUser.id;
    const adminTokens = await generateTokens(adminUser.id, 'admin');
    adminToken = adminTokens.accessToken;

    // 2. Create a test farmer user + farmer profile
    const farmerUser = await User.create({
      full_name: 'Listing Farmer',
      mobile: '97' + suffix + '02',
      email: `farmer_${suffix}@example.com`,
      role: 'farmer',
      is_active: true,
      is_verified: true,
    });
    farmerUserId = farmerUser.id;

    farmerRecord = await Farmer.create({
      user_id: farmerUser.id,
      district: 'Nashik',
      state: 'Maharashtra',
      village: 'Ozar',
      rating: 4.8,
    });
  });

  afterAll(async () => {
    if (createdListingId) {
      await Listing.destroy({ where: { id: createdListingId } });
    }
    if (farmerRecord) {
      await Farmer.destroy({ where: { id: farmerRecord.id } });
    }
    if (farmerUserId) {
      await User.destroy({ where: { id: farmerUserId } });
    }
    if (adminUserId) {
      await User.destroy({ where: { id: adminUserId } });
    }
  });

  describe('Listing Service Operations', () => {
    it('creates a produce listing with automatic QR code and lot number', async () => {
      const listingData = {
        crop_name: 'Tomato Test Crop',
        crop_category: 'Vegetables',
        variety: 'Desi Red',
        quantity_kg: 250,
        price_per_kg: 28.5,
        harvest_date: new Date(),
      };

      const listing = await createListing(listingData, farmerUserId, ['https://images.unsplash.com/test.jpg']);
      expect(listing).toBeDefined();
      expect(listing.id).toBeDefined();
      expect(listing.crop_name).toBe('Tomato Test Crop');
      expect(listing.qr_code_url).toMatch(/^data:image\/png;base64,/);
      expect(listing.lot_number).toContain('KC-NAS-');

      createdListingId = listing.id;
    });

    it('retrieves listings with filter by crop_name', async () => {
      const { listings, total } = await getListings({ crop_name: 'Tomato Test' });
      expect(total).toBeGreaterThanOrEqual(1);
      expect(listings.some((l) => l.id === createdListingId)).toBe(true);
    });
  });

  describe('Admin Endpoints (with valid Admin Bearer Token)', () => {
    it('GET /api/admin/stats returns aggregate platform statistics', async () => {
      const res = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('totalUsers');
      expect(res.body.data).toHaveProperty('totalFarmers');
      expect(res.body.data).toHaveProperty('totalOrders');
      expect(res.body.data).toHaveProperty('totalListings');
      expect(res.body.data).toHaveProperty('gmv');
    });

    it('GET /api/admin/users returns paginated user records', async () => {
      const res = await request(app)
        .get('/api/admin/users?page=1&limit=5')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body).toHaveProperty('pagination');
    });
  });

  describe('AI Webhook Grievance Triage (Groq Integration)', () => {
    it('POST /api/webhooks/new-grievance triages complaint with LLM when key present', async () => {
      if (!process.env.GROQ_API_KEY) {
        return;
      }

      // Create a dummy grievance first
      const g = await Grievance.create({
        user_id: farmerUserId,
        description: 'Payment was deducted from bank account but order is still showing pending since yesterday.',
        category: 'other',
        status: 'open',
      });

      const res = await request(app)
        .post('/api/webhooks/new-grievance')
        .set('x-webhook-secret', process.env.WEBHOOK_SECRET || 'Manthanraut13')
        .send({
          grievance_id: g.id,
          description: g.description,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('classification');
      expect(res.body.data).toHaveProperty('sla_deadline');

      // Cleanup
      await Grievance.destroy({ where: { id: g.id } });
    });
  });
});
