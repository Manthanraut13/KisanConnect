const { sequelize } = require('../config/db.config');

const User = require('./User.model');
const Farmer = require('./Farmer.model');
const FPO = require('./FPO.model');
const BulkBuyer = require('./BulkBuyer.model');
const LogisticsPartner = require('./LogisticsPartner.model');
const Listing = require('./Listing.model');
const Order = require('./Order.model');
const OrderItem = require('./OrderItem.model');
const Payment = require('./Payment.model');
const LogisticsAssignment = require('./LogisticsAssignment.model');
const Grievance = require('./Grievance.model');
const NotificationLog = require('./NotificationLog.model');
const DemandForecast = require('./DemandForecast.model');
const WorkflowLog = require('./WorkflowLog.model');

// ===== User associations =====
User.hasOne(Farmer, { foreignKey: 'user_id', as: 'farmerProfile' });
Farmer.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasOne(BulkBuyer, { foreignKey: 'user_id', as: 'bulkBuyerProfile' });
BulkBuyer.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasOne(LogisticsPartner, { foreignKey: 'user_id', as: 'logisticsProfile' });
LogisticsPartner.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(Order, { foreignKey: 'buyer_id', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'buyer_id', as: 'buyer' });

User.hasMany(Grievance, { foreignKey: 'user_id', as: 'grievances' });
Grievance.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(NotificationLog, { foreignKey: 'user_id', as: 'notifications' });
NotificationLog.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// ===== FPO associations =====
User.hasOne(FPO, { foreignKey: 'admin_user_id', as: 'administeredFpo' });
FPO.belongsTo(User, { foreignKey: 'admin_user_id', as: 'adminUser' });

FPO.hasMany(Farmer, { foreignKey: 'fpo_id', as: 'members' });
Farmer.belongsTo(FPO, { foreignKey: 'fpo_id', as: 'fpo' });

// ===== Farmer associations =====
Farmer.hasMany(Listing, { foreignKey: 'farmer_id', as: 'listings' });
Listing.belongsTo(Farmer, { foreignKey: 'farmer_id', as: 'farmer' });

Farmer.hasMany(OrderItem, { foreignKey: 'farmer_id', as: 'orderItems' });
OrderItem.belongsTo(Farmer, { foreignKey: 'farmer_id', as: 'farmer' });

// ===== Listing associations =====
Listing.hasMany(OrderItem, { foreignKey: 'listing_id', as: 'orderItems' });
OrderItem.belongsTo(Listing, { foreignKey: 'listing_id', as: 'listing' });

// ===== Order associations =====
Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

Order.hasOne(Payment, { foreignKey: 'order_id', as: 'payment' });
Payment.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

Order.hasOne(LogisticsAssignment, { foreignKey: 'order_id', as: 'logisticsAssignment' });
LogisticsAssignment.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

Order.hasMany(Grievance, { foreignKey: 'order_id', as: 'grievances' });
Grievance.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

// ===== Logistics associations =====
LogisticsPartner.hasMany(LogisticsAssignment, { foreignKey: 'driver_id', as: 'assignments' });
LogisticsAssignment.belongsTo(LogisticsPartner, { foreignKey: 'driver_id', as: 'driver' });

module.exports = {
  sequelize,
  User,
  Farmer,
  FPO,
  BulkBuyer,
  LogisticsPartner,
  Listing,
  Order,
  OrderItem,
  Payment,
  LogisticsAssignment,
  Grievance,
  NotificationLog,
  DemandForecast,
  WorkflowLog,
};
