const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.config');

const LogisticsPartner = sequelize.define('LogisticsPartner', {
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
  vehicle_type: {
    type: DataTypes.ENUM('bike', 'auto', 'mini_truck', 'truck'),
    allowNull: true,
  },
  vehicle_number: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  license_number: {
    type: DataTypes.STRING(20),
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
  current_lat: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true,
  },
  current_lng: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('available', 'busy', 'offline'),
    defaultValue: 'offline',
  },
  is_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  total_earnings: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0,
  },
  rating: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0,
  },
}, {
  tableName: 'logistics_partners',
  timestamps: true,
  underscored: true,
});

module.exports = LogisticsPartner;
