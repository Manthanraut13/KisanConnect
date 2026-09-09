const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.config');

const Grievance = sequelize.define('Grievance', {
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
  order_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: 'orders', key: 'id' },
  },
  category: {
    type: DataTypes.ENUM('payment', 'logistics', 'quality', 'fraud', 'other'),
    defaultValue: 'other',
  },
  severity: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
    defaultValue: 'medium',
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: { notEmpty: true },
  },
  status: {
    type: DataTypes.ENUM('open', 'in_progress', 'resolved', 'closed'),
    defaultValue: 'open',
  },
  assigned_to: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: 'users', key: 'id' },
  },
  resolution_note: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  sla_deadline: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  resolved_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'grievances',
  timestamps: true,
  underscored: true,
  indexes: [{ fields: ['user_id'] }],
});

module.exports = Grievance;
