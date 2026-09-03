const { User, Farmer, Order, Listing, Payment, Grievance } = require('../models');
const { redis } = require('../config/redis.config');
const { sendSMS, sendEmail, sendPush } = require('../services/notification.service');
const { sequelize } = require('../config/db.config');
const AppError = require('../utils/AppError');

const getStats = async (req, res, next) => {
  try {
    const cached = await redis.get('admin:stats');
    if (cached) return res.json({ success: true, message: 'Stats fetched (cached)', data: JSON.parse(cached) });

    const [totalUsers, totalFarmers, totalOrders, totalListings, gmvResult] = await Promise.all([
      User.count({ where: { is_active: true } }),
      Farmer.count(),
      Order.count(),
      Listing.count({ where: { is_active: true } }),
      Payment.sum('amount', { where: { status: 'captured' } }),
    ]);

    const stats = { totalUsers, totalFarmers, totalOrders, totalListings, gmv: gmvResult || 0 };
    await redis.set('admin:stats', JSON.stringify(stats), { ex: 300 });

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
      attributes: ['id', 'full_name', 'email', 'mobile', 'role', 'is_verified', 'is_active', 'created_at'],
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
      order: [['created_at', 'DESC']],
    });

    return res.json({
      success: true,
      message: 'Users fetched',
      data: rows,
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

module.exports = {
  getStats,
  getUsers,
  updateUserStatus,
  getGrievances,
  updateGrievance,
  getOrdersReport,
  getTopFarmers,
  broadcastNotification,
};
