const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.config');

const Farmer = sequelize.define('Farmer', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'users', key: 'id' },
  },
  aadhaar_hash: {
    type: DataTypes.STRING(64),
    allowNull: true,
  },
  bank_account: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  bank_ifsc: {
    type: DataTypes.STRING(11),
    allowNull: true,
  },
  bank_name: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  village: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  taluka: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  district: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  state: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  pin_code: {
    type: DataTypes.STRING(6),
    allowNull: true,
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true,
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true,
  },
  land_area_acres: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: true,
  },
  is_kyc_done: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  kyc_document_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  total_earnings: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
  },
  rating: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0,
  },
  rating_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  fpo_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: 'fpos', key: 'id' },
  },
}, {
  tableName: 'farmers',
  timestamps: true,
  underscored: true,
});

module.exports = Farmer;
