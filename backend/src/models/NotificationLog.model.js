const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.config');

const NotificationLog = sequelize.define('NotificationLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: 'users', key: 'id' },
  },
  channel: {
    type: DataTypes.ENUM('sms', 'email', 'push'),
    allowNull: false,
  },
  recipient: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  subject: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
  body: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('sent', 'failed'),
    allowNull: false,
  },
  error_message: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'notification_logs',
  timestamps: true,
  underscored: true,
});

module.exports = NotificationLog;
