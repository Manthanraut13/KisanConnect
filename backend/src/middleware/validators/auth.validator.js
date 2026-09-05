const Joi = require('joi');

const registerSchema = Joi.object({
  full_name: Joi.string().min(2).max(100).required(),
  mobile: Joi.string().pattern(/^[6-9]\d{9}$/).required().messages({
    'string.pattern.base': 'Enter a valid 10-digit Indian mobile number',
  }),
  email: Joi.string().email().optional(),
  password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).required().messages({
    'string.pattern.base': 'Password must have uppercase, lowercase, and a number',
  }),
  role: Joi.string().valid('farmer', 'consumer', 'bulk_buyer', 'logistics').required(),
  district: Joi.string().max(100).optional(),
  state: Joi.string().max(100).optional(),
  village: Joi.string().max(100).optional(),
  taluka: Joi.string().max(100).optional(),
  land_area_acres: Joi.number().optional(),
  business_name: Joi.string().max(200).optional(),
  gstin: Joi.string().max(15).optional(),
  business_type: Joi.string().optional(),
  vehicle_type: Joi.string().optional(),
  vehicle_number: Joi.string().optional(),
  license_number: Joi.string().optional(),
}).unknown(true);

const loginSchema = Joi.object({
  mobile: Joi.string().pattern(/^[6-9]\d{9}$/).optional(),
  email: Joi.string().email().optional(),
  password: Joi.string().required(),
}).or('mobile', 'email');

const otpSchema = Joi.object({
  mobile: Joi.string().pattern(/^[6-9]\d{9}$/).required(),
  otp: Joi.string().length(6).pattern(/^\d{6}$/).required(),
});

const sendOtpSchema = Joi.object({
  mobile: Joi.string().pattern(/^[6-9]\d{9}$/).required(),
});

const refreshTokenSchema = Joi.object({
  refresh_token: Joi.string().required(),
});

const forgotPasswordSchema = Joi.object({
  mobile: Joi.string().pattern(/^[6-9]\d{9}$/).required(),
});

const resetPasswordSchema = Joi.object({
  mobile: Joi.string().pattern(/^[6-9]\d{9}$/).required(),
  otp: Joi.string().length(6).pattern(/^\d{6}$/).required(),
  new_password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).required().messages({
    'string.pattern.base': 'Password must have uppercase, lowercase, and a number',
  }),
});

module.exports = {
  registerSchema,
  loginSchema,
  otpSchema,
  sendOtpSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
};
