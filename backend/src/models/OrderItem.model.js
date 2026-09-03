const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.config');

const OrderItem = sequelize.define('OrderItem', {
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
  listing_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'listings', key: 'id' },
  },
  farmer_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'farmers', key: 'id' },
  },
  crop_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  quantity_kg: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  price_per_kg: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: false,
  },
  total_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  farmer_payout: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  platform_commission: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: true,
  },
}, {
  tableName: 'order_items',
  timestamps: true,
  underscored: true,
  indexes: [{ fields: ['order_id'] }],
});

module.exports = OrderItem;
