const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.config');

const BulkBuyer = sequelize.define('BulkBuyer', {
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
  business_name: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
  gstin: {
    type: DataTypes.STRING(15),
    allowNull: true,
  },
  business_type: {
    type: DataTypes.ENUM('hotel', 'restaurant', 'canteen', 'school', 'exporter', 'retailer', 'other'),
    allowNull: true,
  },
  district: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  state: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  is_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'bulk_buyers',
  timestamps: true,
  underscored: true,
});

module.exports = BulkBuyer;
