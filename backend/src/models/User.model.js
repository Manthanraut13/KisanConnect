const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.config');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  full_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: { notEmpty: true, len: [2, 100] },
  },
  email: {
    type: DataTypes.STRING(150),
    allowNull: true,
    unique: true,
    validate: { isEmail: true },
  },
  mobile: {
    type: DataTypes.STRING(15),
    allowNull: false,
    unique: true,
    validate: { notEmpty: true },
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  role: {
    type: DataTypes.ENUM('farmer', 'fpo_admin', 'consumer', 'bulk_buyer', 'logistics', 'admin'),
    allowNull: false,
  },
  is_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  profile_image: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  preferred_lang: {
    type: DataTypes.STRING(10),
    defaultValue: 'hi',
  },
  fcm_token: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
}, {
  tableName: 'users',
  timestamps: true,
  underscored: true,
  indexes: [{ unique: true, fields: ['mobile'] }],
});

module.exports = User;
