const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.config');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  buyer_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'users', key: 'id' },
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'packed', 'in_transit', 'delivered', 'cancelled', 'refunded'),
    defaultValue: 'pending',
  },
  order_type: {
    type: DataTypes.ENUM('retail', 'bulk'),
    defaultValue: 'retail',
  },
  subtotal: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
  },
  delivery_charge: {
    type: DataTypes.DECIMAL(8, 2),
    defaultValue: 0,
  },
  discount: {
    type: DataTypes.DECIMAL(8, 2),
    defaultValue: 0,
  },
  gst_amount: {
    type: DataTypes.DECIMAL(8, 2),
    defaultValue: 0,
  },
  total_amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
  },
  delivery_address: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  delivery_slot: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  payment_status: {
    type: DataTypes.ENUM('pending', 'paid', 'refunded', 'failed'),
    defaultValue: 'pending',
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  invoice_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  razorpay_order_id: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
}, {
  tableName: 'orders',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['buyer_id'] },
    { fields: ['status'] },
  ],
});

module.exports = Order;
