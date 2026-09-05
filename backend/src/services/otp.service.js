const { redis } = require('../config/redis.config');
const AppError = require('../utils/AppError');
const { sendSMS } = require('./notification.service');

const OTP_TTL = parseInt(process.env.OTP_EXPIRY_MINUTES, 10) * 60 || 600;
const MAX_ATTEMPTS = 3;
const LOCKOUT_DURATION = parseInt(process.env.LOCKOUT_DURATION_MINUTES, 10) * 60 || 1800;

const sendOTP = async (mobile) => {
  const lockKey = `lock:${mobile}`;
  const locked = await redis.get(lockKey);
  if (locked) {
    throw new AppError('Too many OTP attempts. Try again after 30 minutes.', 429);
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpKey = `otp:${mobile}`;
  await redis.set(otpKey, JSON.stringify({ otp, attempts: 0 }), { ex: OTP_TTL });

  const message = `Your Kisan Connect OTP is ${otp}. Valid for 10 minutes. Do not share it with anyone.`;
  await sendSMS(mobile, message);

  return { success: true };
};

const verifyOTP = async (mobile, otp) => {
  const otpKey = `otp:${mobile}`;
  const data = await redis.get(otpKey);
  if (!data) {
    throw new AppError('OTP expired. Please request a new one.', 400);
  }

  const parsed = typeof data === 'string' ? JSON.parse(data) : data;
  if (parsed.otp !== otp) {
    parsed.attempts += 1;
    if (parsed.attempts >= MAX_ATTEMPTS) {
      await redis.del(otpKey);
      await redis.set(`lock:${mobile}`, '1', { ex: LOCKOUT_DURATION });
      throw new AppError('Too many incorrect attempts. Account locked for 30 minutes.', 429);
    }
    await redis.set(otpKey, JSON.stringify(parsed), { ex: OTP_TTL });
    throw new AppError('Invalid OTP. Please try again.', 400);
  }

  await redis.del(otpKey);
  return { success: true };
};

module.exports = { sendOTP, verifyOTP };
