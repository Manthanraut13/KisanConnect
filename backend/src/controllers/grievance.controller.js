const { Grievance, User, Order } = require('../models');
const { sendGrievanceAcknowledgement } = require('../services/notification.service');
const AppError = require('../utils/AppError');

const createGrievance = async (req, res, next) => {
  try {
    const { order_id, category, description } = req.body;
    if (!description) throw new AppError('Description is required', 400);

    const grievance = await Grievance.create({
      user_id: req.user.id,
      order_id: order_id || null,
      category: category || 'other',
      description,
    });

    const fullGrievance = await Grievance.findByPk(grievance.id, {
      include: [{ model: User, as: 'user' }],
    });

    await sendGrievanceAcknowledgement(fullGrievance, req.user).catch(() => {});

    return res.status(201).json({
      success: true,
      message: 'Grievance submitted. Our team will reach out soon.',
      data: grievance,
    });
  } catch (error) {
    next(error);
  }
};

const getMyGrievances = async (req, res, next) => {
  try {
    const grievances = await Grievance.findAll({
      where: { user_id: req.user.id },
      order: [['created_at', 'DESC']],
    });
    return res.json({ success: true, message: 'Grievances fetched', data: grievances });
  } catch (error) {
    next(error);
  }
};

const getGrievance = async (req, res, next) => {
  try {
    const { id } = req.params;
    const grievance = await Grievance.findOne({
      where: { id },
      include: [{ model: User, as: 'user', attributes: ['id', 'full_name', 'mobile', 'email'] }],
    });
    if (!grievance) throw new AppError('Grievance not found', 404);

    if (req.user.role !== 'admin' && grievance.user_id !== req.user.id) {
      throw new AppError('Access denied', 403);
    }

    return res.json({ success: true, message: 'Grievance fetched', data: grievance });
  } catch (error) {
    next(error);
  }
};

module.exports = { createGrievance, getMyGrievances, getGrievance };
