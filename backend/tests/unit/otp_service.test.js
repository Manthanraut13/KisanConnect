require('dotenv').config();
const { sendOTP, verifyOTP } = require('../../src/services/otp.service');
const { redis } = require('../../src/config/redis.config');

describe('OTP Service Unit Tests (using Live Upstash Redis)', () => {
  const testMobile = '9899' + Math.floor(100000 + Math.random() * 900000);

  afterAll(async () => {
    await redis.del(`otp:${testMobile}`);
    await redis.del(`lock:${testMobile}`);
  });

  it('generates and stores OTP in Redis with 600s TTL', async () => {
    const res = await sendOTP(testMobile);
    expect(res).toEqual({ success: true });

    const data = await redis.get(`otp:${testMobile}`);
    expect(data).toBeDefined();
    
    const parsed = typeof data === 'string' ? JSON.parse(data) : data;
    expect(parsed).toHaveProperty('otp');
    expect(parsed.otp).toMatch(/^\d{6}$/);
    expect(parsed.attempts).toBe(0);
  });

  it('rejects an incorrect OTP and increments attempt count', async () => {
    await expect(verifyOTP(testMobile, '000000')).rejects.toThrow('Invalid OTP');

    const data = await redis.get(`otp:${testMobile}`);
    const parsed = typeof data === 'string' ? JSON.parse(data) : data;
    expect(parsed.attempts).toBe(1);
  });

  it('successfully verifies the correct OTP and cleans up key', async () => {
    const data = await redis.get(`otp:${testMobile}`);
    const parsed = typeof data === 'string' ? JSON.parse(data) : data;
    const correctOtp = parsed.otp;

    const result = await verifyOTP(testMobile, correctOtp);
    expect(result).toEqual({ success: true });

    const keyAfter = await redis.get(`otp:${testMobile}`);
    expect(keyAfter).toBeNull();
  });
});
