const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.config');

const Listing = sequelize.define('Listing', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  farmer_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'farmers', key: 'id' },
  },
  crop_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: { notEmpty: true },
  },
  crop_category: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  variety: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  quantity_kg: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: { min: 0.01 },
  },
  available_kg: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: { min: 0 },
  },
  price_per_kg: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: false,
    validate: { min: 0 },
  },
  ai_suggested_price: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: true,
  },
  min_order_kg: {
    type: DataTypes.DECIMAL(8, 2),
    defaultValue: 1,
  },
  quality_grade: {
    type: DataTypes.ENUM('A', 'B', 'C'),
    defaultValue: 'B',
  },
  harvest_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  expiry_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  images: {
    type: DataTypes.ARRAY(DataTypes.TEXT),
    allowNull: true,
    defaultValue: [],
  },
  is_organic: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  district: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  state: {
    type: DataTypes.STRING(100),
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
  qr_code_url: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  lot_number: {
    type: DataTypes.STRING(50),
    allowNull: true,
    unique: true,
  },
  views_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  tableName: 'listings',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['crop_name'] },
    { fields: ['district'] },
    { fields: ['farmer_id'] },
  ],
});

module.exports = Listing;
