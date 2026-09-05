const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.config');

const FPO = sequelize.define('FPO', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  admin_user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'users', key: 'id' },
  },
  name: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: { notEmpty: true },
  },
  registration_number: {
    type: DataTypes.STRING(50),
    allowNull: true,
    unique: true,
  },
  district: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  state: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  contact_email: {
    type: DataTypes.STRING(150),
    allowNull: true,
  },
  contact_mobile: {
    type: DataTypes.STRING(15),
    allowNull: true,
  },
  is_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'fpos',
  timestamps: true,
  underscored: true,
});

module.exports = FPO;
