const {
  registerSchema,
  loginSchema,
  otpSchema,
  resetPasswordSchema,
} = require('../../src/middleware/validators/auth.validator');
const {
  createListingSchema,
  createOrderSchema,
} = require('../../src/middleware/validators/listing.validator');

describe('Joi Validators Unit Tests', () => {
  describe('Auth Validators', () => {
    it('validates a valid registration payload', () => {
      const valid = {
        full_name: 'Manthan Raut',
        mobile: '9876543210',
        email: 'manthan@example.com',
        password: 'Password@123',
        role: 'farmer',
      };
      const { error } = registerSchema.validate(valid);
      expect(error).toBeUndefined();
    });

    it('rejects registration with invalid Indian mobile number', () => {
      const invalid = {
        full_name: 'Manthan Raut',
        mobile: '1234567890', // Doesn't start with 6-9
        password: 'Password@123',
        role: 'farmer',
      };
      const { error } = registerSchema.validate(invalid);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('valid 10-digit Indian mobile number');
    });

    it('rejects registration with weak password', () => {
      const invalid = {
        full_name: 'Manthan Raut',
        mobile: '9876543210',
        password: 'password', // Missing uppercase and digits
        role: 'farmer',
      };
      const { error } = registerSchema.validate(invalid);
      expect(error).toBeDefined();
    });

    it('validates login with either mobile or email', () => {
      const loginMobile = { mobile: '9876543210', password: 'Password@123' };
      expect(loginSchema.validate(loginMobile).error).toBeUndefined();

      const loginEmail = { email: 'user@example.com', password: 'Password@123' };
      expect(loginSchema.validate(loginEmail).error).toBeUndefined();

      const invalidLogin = { password: 'Password@123' };
      expect(loginSchema.validate(invalidLogin).error).toBeDefined();
    });

    it('validates 6-digit numeric OTP', () => {
      expect(otpSchema.validate({ mobile: '9876543210', otp: '123456' }).error).toBeUndefined();
      expect(otpSchema.validate({ mobile: '9876543210', otp: '12345' }).error).toBeDefined();
      expect(otpSchema.validate({ mobile: '9876543210', otp: 'abcdef' }).error).toBeDefined();
    });
  });

  describe('Listing Validators', () => {
    it('validates a complete produce listing payload', () => {
      const validListing = {
        crop_name: 'Tomato',
        crop_category: 'Vegetables',
        variety: 'Desi',
        quantity_kg: 500,
        price_per_kg: 35,
        harvest_date: new Date(),
        district: 'Nashik',
        state: 'Maharashtra',
      };
      const { error } = createListingSchema.validate(validListing);
      expect(error).toBeUndefined();
    });

    it('rejects listing with missing mandatory fields', () => {
      const invalidListing = {
        crop_name: 'Tomato',
      };
      const { error } = createListingSchema.validate(invalidListing);
      expect(error).toBeDefined();
    });
  });

  describe('Order Validators', () => {
    it('validates a valid order payload', () => {
      const validOrder = {
        items: [
          { listing_id: '123e4567-e89b-12d3-a456-426614174000', quantity_kg: 10 },
        ],
        delivery_address: {
          street: '123 Main Road',
          city: 'Mumbai',
          state: 'Maharashtra',
          pin_code: '400001',
          latitude: 19.076,
          longitude: 72.8777,
        },
      };
      const { error } = createOrderSchema.validate(validOrder);
      expect(error).toBeUndefined();
    });

    it('rejects order with empty items list', () => {
      const emptyOrder = {
        items: [],
        delivery_address: {
          street: '123 Main Road',
          city: 'Mumbai',
          state: 'Maharashtra',
          pin_code: '400001',
          latitude: 19.076,
          longitude: 72.8777,
        },
      };
      const { error } = createOrderSchema.validate(emptyOrder);
      expect(error).toBeDefined();
    });
  });
});
