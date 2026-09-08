const { User, Farmer, Order, OrderItem, Listing, Payment, Grievance, BulkBuyer, LogisticsPartner, LogisticsAssignment } = require('../models');
const { redis } = require('../config/redis.config');
const { sendSMS, sendEmail, sendPush } = require('../services/notification.service');
const { sequelize } = require('../config/db.config');
const orderService = require('../services/order.service');
const { Op } = require('sequelize');
const AppError = require('../utils/AppError');

const getStats = async (req, res, next) => {
  try {
    const { refresh } = req.query;
    if (!refresh) {
      const cached = await redis.get('admin:stats');
      if (cached) {
        const data = typeof cached === 'string' ? JSON.parse(cached) : cached;
        return res.json({ success: true, message: 'Stats fetched (cached)', data });
      }
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [totalUsers, totalFarmers, totalOrders, totalListings, gmvResult, todayOrders, openGrievances, pendingOrders] = await Promise.all([
      User.count({ where: { is_active: true } }),
      Farmer.count(),
      Order.count(),
      Listing.count({ where: { is_active: true } }),
      Payment.sum('amount', { where: { status: 'captured' } }),
      Order.count({ where: { createdAt: { [Op.gte]: todayStart } } }),
      Grievance.count({ where: { status: { [Op.in]: ['open', 'in_progress'] } } }),
      Order.count({ where: { status: 'pending' } }),
    ]);

    const stats = { totalUsers, totalFarmers, totalOrders, totalListings, gmv: gmvResult || 0, todayOrders, openGrievances, pendingOrders };
    await redis.set('admin:stats', JSON.stringify(stats), { ex: 60 });

    return res.json({ success: true, message: 'Stats fetched', data: stats });
  } catch (error) {
    next(error);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, role, is_active, district } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (role) where.role = role;
    if (is_active !== undefined) where.is_active = is_active === 'true';
    if (district) where.district = district;

    const { rows, count } = await User.findAndCountAll({
      where,
      attributes: ['id', 'full_name', 'email', 'mobile', 'role', 'is_verified', 'is_active', 'profile_image', 'created_at'],
      include: [
        { model: Farmer, as: 'farmerProfile', attributes: ['district'], required: false },
        { model: BulkBuyer, as: 'bulkBuyerProfile', attributes: ['district'], required: false },
        { model: LogisticsPartner, as: 'logisticsProfile', attributes: ['district'], required: false },
      ],
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
      order: [['created_at', 'DESC']],
    });

    const data = rows.map((row) => {
      const json = row.toJSON();
      json.district = json.farmerProfile?.district || json.logisticsProfile?.district || json.bulkBuyerProfile?.district || null;
      return json;
    });

    return res.json({
      success: true,
      message: 'Users fetched',
      data,
      pagination: { page: parseInt(page, 10), limit: parseInt(limit, 10), total: count, totalPages: Math.ceil(count / limit) },
    });
  } catch (error) {
    next(error);
  }
};

const updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    const user = await User.findByPk(id);
    if (!user) throw new AppError('User not found', 404);

    await user.update({ is_active });

    if (!is_active) {
      await sendSMS(user.mobile, 'Your Kisan Connect account has been deactivated. Contact support for help.', user.id);
    }

    return res.json({ success: true, message: `User ${is_active ? 'activated' : 'deactivated'}` });
  } catch (error) {
    next(error);
  }
};

const getGrievances = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, category, severity } = req.query;
    const offset = (page - 1) * limit;
    const where = {};
    if (status) where.status = status;
    if (category) where.category = category;
    if (severity) where.severity = severity;

    const { rows, count } = await Grievance.findAndCountAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['id', 'full_name', 'mobile', 'email'] },
      ],
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
      order: [['created_at', 'DESC']],
    });

    return res.json({
      success: true,
      message: 'Grievances fetched',
      data: rows,
      pagination: { page: parseInt(page, 10), limit: parseInt(limit, 10), total: count, totalPages: Math.ceil(count / limit) },
    });
  } catch (error) {
    next(error);
  }
};

const updateGrievance = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, resolution_note, assigned_to, severity, category, sla_deadline } = req.body;

    const grievance = await Grievance.findByPk(id);
    if (!grievance) throw new AppError('Grievance not found', 404);

    const updates = {};
    if (status) updates.status = status;
    if (resolution_note !== undefined) updates.resolution_note = resolution_note;
    if (assigned_to) updates.assigned_to = assigned_to;
    if (severity) updates.severity = severity;
    if (category) updates.category = category;
    if (sla_deadline) updates.sla_deadline = sla_deadline;
    if (status === 'resolved' || status === 'closed') updates.resolved_at = new Date();

    await grievance.update(updates);
    return res.json({ success: true, message: 'Grievance updated', data: { id: grievance.id, ...updates } });
  } catch (error) {
    next(error);
  }
};

const getOrdersReport = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const where = {};
    if (startDate && endDate) {
      where.created_at = { [sequelize.Sequelize.Op.between]: [startDate, endDate] };
    }

    const [orderVolume, revenue] = await Promise.all([
      Order.count({ where }),
      Order.sum('total_amount', { where: { ...where, payment_status: 'paid' } }),
    ]);

    return res.json({ success: true, message: 'Orders report', data: { orderVolume, revenue: revenue || 0 } });
  } catch (error) {
    next(error);
  }
};

const getTopFarmers = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;
    const farmers = await Farmer.findAll({
      include: [{ model: User, as: 'user', attributes: ['full_name', 'mobile'] }],
      order: [['total_earnings', 'DESC']],
      limit: parseInt(limit, 10),
    });

    return res.json({ success: true, message: 'Top farmers', data: farmers });
  } catch (error) {
    next(error);
  }
};

const broadcastNotification = async (req, res, next) => {
  try {
    const { role, title, message } = req.body;
    if (!title || !message) throw new AppError('title and message are required', 400);

    const users = await User.findAll({ where: { role, is_active: true }, attributes: ['id', 'mobile', 'email', 'fcm_token'] });

    let smsCount = 0;
    let emailCount = 0;
    let pushCount = 0;

    for (const user of users) {
      const sms = await sendSMS(user.mobile, message, user.id);
      if (sms.success) smsCount++;
      if (user.email) {
        const email = await sendEmail(user.email, title, `<p>${message}</p>`, user.id);
        if (email.success) emailCount++;
      }
      if (user.fcm_token) {
        const push = await sendPush(user.fcm_token, title, message, {}, user.id);
        if (push.success) pushCount++;
      }
    }

    return res.json({ success: true, message: 'Broadcast sent', data: { total: users.length, smsCount, emailCount, pushCount } });
  } catch (error) {
    next(error);
  }
};

const getOrdersAdmin = async (req, res, next) => {
  try {
    const { page = 1, limit = 15, status, payment_status, search } = req.query;
    const offset = (page - 1) * limit;
    const where = {};
    if (status) where.status = status;
    if (payment_status) where.payment_status = payment_status;

    const include = [
      { model: User, as: 'buyer', attributes: ['id', 'full_name', 'mobile'] },
      { model: OrderItem, as: 'items' },
      { model: LogisticsAssignment, as: 'logisticsAssignment', attributes: ['id', 'status'] },
    ];

    if (search) {
      include[0].where = {
        [Op.or]: [
          { full_name: { [Op.iLike]: `%${search}%` } },
          { mobile: { [Op.iLike]: `%${search}%` } },
        ],
      };
      include[0].required = true;
    }

    const { rows, count } = await Order.findAndCountAll({
      where,
      include,
      distinct: true,
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
      order: [['createdAt', 'DESC']],
    });

    return res.json({
      success: true,
      message: 'Orders fetched',
      data: rows,
      pagination: { page: parseInt(page, 10), limit: parseInt(limit, 10), total: count, totalPages: Math.ceil(count / limit) },
    });
  } catch (error) {
    next(error);
  }
};

const updateOrderAdminStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await orderService.updateOrderStatus(req.params.id, status, req.user.id, 'admin');
    return res.json({ success: true, message: 'Order status updated', data: order });
  } catch (error) {
    next(error);
  }
};

const getUserDetail = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: ['id', 'full_name', 'email', 'mobile', 'role', 'is_verified', 'is_active', 'profile_image', 'preferred_lang', 'created_at'],
      include: [
        { model: Farmer, as: 'farmerProfile', required: false },
        { model: BulkBuyer, as: 'bulkBuyerProfile', required: false },
        { model: LogisticsPartner, as: 'logisticsProfile', required: false },
      ],
    });
    if (!user) throw new AppError('User not found', 404);

    const [ordersCount, grievancesCount, listingsCount] = await Promise.all([
      Order.count({ where: { buyer_id: user.id } }),
      Grievance.count({ where: { user_id: user.id } }),
      Listing.count({ where: { farmer_id: user.farmerProfile?.id || null } }),
    ]);

    const data = {
      ...user.toJSON(),
      orders_count: ordersCount,
      grievances_count: grievancesCount,
      listings_count: listingsCount,
    };
    return res.json({ success: true, message: 'User detail fetched', data });
  } catch (error) {
    next(error);
  }
};

const getAnalytics = async (req, res, next) => {
  try {
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const daysAgo14 = new Date();
    daysAgo14.setDate(daysAgo14.getDate() - 13);
    daysAgo14.setHours(0, 0, 0, 0);

    const [avgRow, ordersThisMonth, topCrops, recentOrders] = await Promise.all([
      Order.findAll({
        where: { payment_status: 'paid' },
        attributes: [[sequelize.fn('AVG', sequelize.col('total_amount')), 'avg']],
        raw: true,
      }),
      Order.count({ where: { createdAt: { [Op.gte]: monthStart } } }),
      OrderItem.findAll({
        attributes: ['crop_name', [sequelize.fn('COUNT', sequelize.col('OrderItem.id')), 'orders']],
        group: ['crop_name'],
        order: [[sequelize.fn('COUNT', sequelize.col('OrderItem.id')), 'DESC']],
        limit: 5,
        raw: true,
      }),
      Order.findAll({
        where: { createdAt: { [Op.gte]: daysAgo14 } },
        attributes: ['createdAt', 'total_amount', 'payment_status', 'delivery_address'],
        raw: true,
      }),
    ]);

    const activeDistricts = new Set();
    const dailyMap = {};
    for (let i = 0; i < 14; i += 1) {
      const d = new Date(daysAgo14);
      d.setDate(daysAgo14.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      dailyMap[key] = { date: `${d.getDate()} ${d.toLocaleString('en', { month: 'short' })}`, orders: 0, gmv: 0 };
    }
    for (const o of recentOrders) {
      const created = new Date(o.createdAt);
      const key = `${created.getFullYear()}-${String(created.getMonth() + 1).padStart(2, '0')}-${String(created.getDate()).padStart(2, '0')}`;
      if (dailyMap[key]) dailyMap[key].orders += 1;
      if (o.payment_status === 'paid') {
        if (dailyMap[key]) dailyMap[key].gmv += Number(o.total_amount || 0);
        if (o.delivery_address?.district) activeDistricts.add(o.delivery_address.district);
      }
    }

    const analytics = {
      avgOrderValue: Math.round(Number(avgRow[0]?.avg || 0)),
      ordersThisMonth,
      activeDistricts: activeDistricts.size,
      topCrops: topCrops.map((c) => ({ crop: c.crop_name, orders: Number(c.orders) })),
      dailyOrders: Object.values(dailyMap),
    };

    return res.json({ success: true, message: 'Analytics fetched', data: analytics });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStats,
  getUsers,
  updateUserStatus,
  getGrievances,
  updateGrievance,
  getOrdersAdmin,
  updateOrderAdminStatus,
  getUserDetail,
  getAnalytics,
  getOrdersReport,
  getTopFarmers,
  broadcastNotification,
};
