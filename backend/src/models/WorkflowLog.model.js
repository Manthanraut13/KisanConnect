const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.config');

const WorkflowLog = sequelize.define('WorkflowLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  workflow_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  trigger_type: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('success', 'failed'),
    allowNull: false,
  },
  execution_time_ms: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  payload: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  error_message: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'workflow_logs',
  timestamps: true,
  underscored: true,
});

module.exports = WorkflowLog;
