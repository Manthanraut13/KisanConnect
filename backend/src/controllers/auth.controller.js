const bcrypt = require('bcryptjs');
const { User, Farmer, BulkBuyer, LogisticsPartner } = require('../models');
const { generateTokens, verifyRefreshToken, blacklistToken } = require('../utils/jwt.utils');
const { sendOTP, verifyOTP } = require('../services/otp.service');
const { sendSMS, sendEmail } = require('../services/notification.service');
const AppError = require('../utils/AppError');
const { redis } = require('../config/redis.config');

const createRoleProfile = async (user, role, body) => {
  if (role === 'farmer') {
    await Farmer.create({
      user_id: user.id,
      district: body.district || '',
      state: body.state || '',
      village: body.village,
      taluka: body.taluka,
      land_area_acres: body.land_area_acres,
    });
  } else if (role === 'bulk_buyer') {
    await BulkBuyer.create({
      user_id: user.id,
      business_name: body.business_name,
      gstin: body.gstin,
      business_type: body.business_type,
      district: body.district,
      state: body.state,
    });
  } else if (role === 'logistics') {
    await LogisticsPartner.create({
      user_id: user.id,
      vehicle_type: body.vehicle_type,
      vehicle_number: body.vehicle_number,
      license_number: body.license_number,
      district: body.district,
      state: body.state,
    });
  }
};

const register = async (req, res, next) => {
  try {
    const { full_name, mobile, email, password, role, ...profileData } = req.body;

    const existing = await User.findOne({ where: { mobile } });
    if (existing) {
      throw new AppError('Mobile number already registered', 409);
    }
    if (email) {
      const existingEmail = await User.findOne({ where: { email } });
      if (existingEmail) {
        throw new AppError('Email already registered', 409);
      }
    }

    const password_hash = await bcrypt.hash(password, 12);

    const user = await User.create({
      full_name,
      mobile,
      email,
      password_hash,
      role,
    });

    await createRoleProfile(user, role, profileData);

    const { accessToken, refreshToken } = await generateTokens(user.id, user.role);

    await sendSMS(mobile, `Welcome to Kisan Connect, ${full_name}! Your account is ready.`, user.id);

    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        user: { id: user.id, full_name, email, mobile, role },
        access_token: accessToken,
        refresh_token: refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { mobile, email, password } = req.body;

    const user = await User.findOne({
      where: mobile ? { mobile } : { email },
    });

    if (!user || !user.password_hash) {
      throw new AppError('Invalid credentials', 401);
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      throw new AppError('Invalid credentials', 401);
    }

    if (!user.is_active) {
      throw new AppError('Account is deactivated. Contact support.', 403);
    }

    const { accessToken, refreshToken } = await generateTokens(user.id, user.role);

    return res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: { id: user.id, full_name: user.full_name, email: user.email, mobile: user.mobile, role: user.role },
        access_token: accessToken,
        refresh_token: refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

const sendOtp = async (req, res, next) => {
  try {
    await sendOTP(req.body.mobile);
    return res.json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    next(error);
  }
};

const verifyOtp = async (req, res, next) => {
  try {
    const { mobile, otp } = req.body;
    await verifyOTP(mobile, otp);

    let user = await User.findOne({ where: { mobile } });
    let newUser = false;

    if (!user) {
      throw new AppError('No account found for this number. Please register.', 404);
    }

    if (!user.is_verified) {
      await user.update({ is_verified: true });
    }

    const { accessToken, refreshToken } = await generateTokens(user.id, user.role);

    return res.json({
      success: true,
      message: 'OTP verified',
      data: {
        user: { id: user.id, full_name: user.full_name, email: user.email, mobile: user.mobile, role: user.role, is_verified: true },
        access_token: accessToken,
        refresh_token: refreshToken,
        is_new_user: newUser,
      },
    });
  } catch (error) {
    next(error);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const { refresh_token } = req.body;
    if (!refresh_token) throw new AppError('Refresh token required', 400);

    const decoded = verifyRefreshToken(refresh_token);

    const stored = await redis.get(`refresh:${decoded.id}`);
    if (stored !== refresh_token) {
      throw new AppError('Invalid refresh token', 401);
    }

    const user = await User.findByPk(decoded.id);
    if (!user || !user.is_active) {
      throw new AppError('User not found or inactive', 401);
    }

    const tokens = await generateTokens(user.id, user.role);
    return res.json({ success: true, message: 'Token refreshed', data: tokens });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    const accessToken = req.headers.authorization.split(' ')[1];
    await blacklistToken(accessToken, 604800);
    await redis.del(`refresh:${req.user.id}`);
    return res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { mobile } = req.body;
    const user = await User.findOne({ where: { mobile } });
    if (!user) throw new AppError('No account found for this number', 404);

    await sendOTP(mobile);
    return res.json({ success: true, message: 'OTP sent for password reset' });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { mobile, otp, new_password } = req.body;
    await verifyOTP(mobile, otp);

    const user = await User.findOne({ where: { mobile } });
    if (!user) throw new AppError('No account found for this number', 404);

    const password_hash = await bcrypt.hash(new_password, 12);
    await user.update({ password_hash });

    await sendEmail(
      user.email,
      'Password Reset Successful — Kisan Connect',
      '<p>Your Kisan Connect password has been reset successfully.</p>',
      user.id
    );

    return res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  sendOtp,
  verifyOtp,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
};
