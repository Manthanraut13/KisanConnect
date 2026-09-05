const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.config');

const DemandForecast = sequelize.define('DemandForecast', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  crop_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  district: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  state: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  forecast_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  predicted_price: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: true,
  },
  lower_bound: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: true,
  },
  upper_bound: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: true,
  },
  confidence_score: {
    type: DataTypes.DECIMAL(5, 4),
    allowNull: true,
  },
  demand_index: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  model_version: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
}, {
  tableName: 'demand_forecasts',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['crop_name', 'district', 'forecast_date'],
    },
  ],
});

module.exports = DemandForecast;
