const jwt = require('jsonwebtoken');
const { redis } = require('../config/redis.config');

const generateTokens = async (userId, role) => {
  const accessToken = jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  const refreshToken = jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
  );

  await redis.set(`refresh:${userId}`, refreshToken, { ex: 2592000 });

  return { accessToken, refreshToken };
};

const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
};

const blacklistToken = async (token, expiresInSeconds) => {
  await redis.set(`blacklist:${token}`, '1', { ex: expiresInSeconds || 604800 });
};

const isTokenBlacklisted = async (token) => {
  const result = await redis.get(`blacklist:${token}`);
  return result !== null;
};

module.exports = {
  generateTokens,
  verifyAccessToken,
  verifyRefreshToken,
  blacklistToken,
  isTokenBlacklisted,
};
