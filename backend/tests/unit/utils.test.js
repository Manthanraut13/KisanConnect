require('dotenv').config();
const AppError = require('../../src/utils/AppError');
const { successResponse, errorResponse } = require('../../src/utils/response.utils');
const { generateTokens, verifyAccessToken, verifyRefreshToken, blacklistToken, isTokenBlacklisted } = require('../../src/utils/jwt.utils');
const { generateQRCode } = require('../../src/utils/qrcode.utils');
const { generateInvoicePDF } = require('../../src/utils/invoice.utils');

describe('Utility Modules Unit Tests', () => {
  describe('AppError', () => {
    it('should correctly set message, statusCode, and isOperational flag', () => {
      const err = new AppError('Unauthorized access', 401);
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toBe('Unauthorized access');
      expect(err.statusCode).toBe(401);
      expect(err.isOperational).toBe(true);
    });
  });

  describe('Response Utils', () => {
    let res;
    beforeEach(() => {
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };
    });

    it('successResponse returns standardized payload', () => {
      successResponse(res, 'Operation successful', { id: 1 }, 200, { page: 1, total: 10 });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Operation successful',
        data: { id: 1 },
        pagination: { page: 1, total: 10 },
      });
    });

    it('errorResponse returns standardized error payload', () => {
      errorResponse(res, 'Invalid input', 400, [{ field: 'mobile', message: 'invalid' }]);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid input',
        errors: [{ field: 'mobile', message: 'invalid' }],
      });
    });
  });

  describe('JWT Utils', () => {
    const userId = '123e4567-e89b-12d3-a456-426614174000';
    const role = 'farmer';

    it('should generate valid access and refresh tokens', async () => {
      const tokens = await generateTokens(userId, role);
      expect(tokens).toHaveProperty('accessToken');
      expect(tokens).toHaveProperty('refreshToken');

      const decodedAccess = verifyAccessToken(tokens.accessToken);
      expect(decodedAccess.id).toBe(userId);
      expect(decodedAccess.role).toBe(role);

      const decodedRefresh = verifyRefreshToken(tokens.refreshToken);
      expect(decodedRefresh.id).toBe(userId);
    });

    it('should handle token blacklisting via Redis', async () => {
      const sampleToken = 'test-token-' + Date.now();
      expect(await isTokenBlacklisted(sampleToken)).toBe(false);

      await blacklistToken(sampleToken, 60);
      expect(await isTokenBlacklisted(sampleToken)).toBe(true);
    });
  });

  describe('QRCode Generator', () => {
    it('should generate a base64 Data URL string', async () => {
      const qr = await generateQRCode({ lot_number: 'KC-NAS-1234' });
      expect(qr).toMatch(/^data:image\/png;base64,/);
    });
  });

  describe('PDF Invoice Generator', () => {
    it('should generate a valid PDF Buffer', async () => {
      const mockOrder = {
        id: 'order-uuid-12345678',
        created_at: new Date(),
        subtotal: 1000,
        delivery_charge: 50,
        gst_amount: 50,
        total_amount: 1100,
      };
      const mockItems = [
        { crop_name: 'Tomato', quantity_kg: 20, price_per_kg: 50, total_price: 1000 },
      ];
      const mockFarmer = { full_name: 'Ramesh Patil' };

      const pdfBuffer = await generateInvoicePDF(mockOrder, mockItems, mockFarmer);
      expect(Buffer.isBuffer(pdfBuffer)).toBe(true);
      expect(pdfBuffer.length).toBeGreaterThan(500);
      expect(pdfBuffer.subarray(0, 4).toString()).toBe('%PDF');
    });
  });
});
