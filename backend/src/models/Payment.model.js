const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.config');

const Payment = sequelize.define('Payment', {
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
  razorpay_order_id: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  razorpay_payment_id: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  razorpay_signature: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
  },
  currency: {
    type: DataTypes.STRING(5),
    defaultValue: 'INR',
  },
  status: {
    type: DataTypes.ENUM('pending', 'captured', 'failed', 'refunded'),
    defaultValue: 'pending',
  },
  method: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  refund_id: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
}, {
  tableName: 'payments',
  timestamps: true,
  underscored: true,
  indexes: [{ fields: ['order_id'] }],
});

module.exports = Payment;
