const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.config');

const LogisticsAssignment = sequelize.define('LogisticsAssignment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  order_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'orders', key: 'id' },
  },
  driver_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'logistics_partners', key: 'id' },
  },
  pickup_location: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  delivery_location: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  optimized_route: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  estimated_km: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: true,
  },
  estimated_minutes: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  actual_delivery_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('assigned', 'picked_up', 'in_transit', 'delivered', 'failed'),
    defaultValue: 'assigned',
  },
  proof_image: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  driver_earnings: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: true,
  },
}, {
  tableName: 'logistics_assignments',
  timestamps: true,
  underscored: true,
  indexes: [{ fields: ['order_id'] }],
});

module.exports = LogisticsAssignment;
