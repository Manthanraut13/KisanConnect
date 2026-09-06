const { LogisticsPartner, LogisticsAssignment, Order, OrderItem, Farmer, User } = require('../models');
const AppError = require('../utils/AppError');
const axios = require('axios');
const { cloudinary } = require('../config/cloudinary.config');

const DRIVER_COMMISSION_RATE = 0.80; // 80% of delivery charge

const assignDriver = async (orderId) => {
  const order = await Order.findByPk(orderId, { include: [{ model: OrderItem, as: 'items' }] });
  if (!order) throw new AppError('Order not found', 404);
  if (order.payment_status !== 'paid') throw new AppError('Order must be paid before assigning driver', 400);

  const deliveryDistrict = order.delivery_address.district;

  // Find nearest available driver in same district
  const driver = await LogisticsPartner.findOne({
    where: { status: 'available', district: deliveryDistrict },
    order: [['rating', 'DESC']],
  });

  if (!driver) {
    // No driver available — mark as packed, admin assigns manually later
    await order.update({ status: 'packed' });
    return { assigned: false, message: 'No driver available, order marked as packed' };
  }

  // Get farmer location for pickup
  const firstItem = order.items[0];
  const farmer = await Farmer.findByPk(firstItem.farmer_id);

  // Call AI service for route optimization (non-blocking fallback)
  let routeData = null;
  try {
    const aiUrl = process.env.AI_SERVICE_URL;
    const aiResp = await axios.post(
      `${aiUrl}/ai/logistics/optimize-route`,
      {
        driver_location: { lat: driver.current_lat, lng: driver.current_lng },
        orders: [
          {
            id: orderId,
            lat: order.delivery_address.latitude || 20.0,
            lng: order.delivery_address.longitude || 73.8,
            address: order.delivery_address.full_address,
          },
        ],
      },
      { timeout: 8000 }
    );
    routeData = aiResp.data.data;
  } catch (err) {
    console.warn('AI route optimization unavailable, using fallback estimates');
  }

  const assignment = await LogisticsAssignment.create({
    order_id: orderId,
    driver_id: driver.id,
    pickup_location: { lat: farmer?.latitude, lng: farmer?.longitude },
    delivery_location: order.delivery_address,
    optimized_route: routeData,
    estimated_km: routeData?.clusters?.[0]?.total_km || 10,
    estimated_minutes: routeData?.clusters?.[0]?.total_minutes || 40,
    driver_earnings: Number(order.delivery_charge) * DRIVER_COMMISSION_RATE,
  });

  await driver.update({ status: 'busy' });
  await order.update({ status: 'in_transit' });

  return { assigned: true, assignment };
};

const getDriverAssignments = async (userId) => {
  const driver = await LogisticsPartner.findOne({ where: { user_id: userId } });
  if (!driver) throw new AppError('Logistics partner profile not found', 404);

  return LogisticsAssignment.findAll({
    where: { driver_id: driver.id },
    include: [{ model: Order, as: 'order' }],
    order: [['created_at', 'DESC']],
  });
};

const startDelivery = async (assignmentId, userId) => {
  const driver = await LogisticsPartner.findOne({ where: { user_id: userId } });
  const assignment = await LogisticsAssignment.findByPk(assignmentId);

  if (!assignment) throw new AppError('Assignment not found', 404);
  if (!driver || assignment.driver_id !== driver.id) throw new AppError('Unauthorized', 403);

  await assignment.update({ status: 'picked_up' });
  return assignment;
};

const confirmDelivery = async (assignmentId, userId, proofImageUrl) => {
  const driver = await LogisticsPartner.findOne({ where: { user_id: userId } });
  const assignment = await LogisticsAssignment.findByPk(assignmentId);

  if (!assignment) throw new AppError('Assignment not found', 404);
  if (!driver || assignment.driver_id !== driver.id) throw new AppError('Unauthorized', 403);

  await assignment.update({
    status: 'delivered',
    actual_delivery_at: new Date(),
    proof_image: proofImageUrl,
  });

  await Order.update({ status: 'delivered' }, { where: { id: assignment.order_id } });
  await driver.update({ status: 'available' });

  // Credit driver earnings
  await driver.increment('total_earnings', { by: Number(assignment.driver_earnings) });

  return assignment;
};

const trackOrder = async (orderId) => {
  const assignment = await LogisticsAssignment.findOne({
    where: { order_id: orderId },
    include: [{ model: LogisticsPartner, as: 'driver', include: [{ model: User, as: 'user', attributes: ['full_name', 'mobile'] }] }],
  });

  if (!assignment) throw new AppError('No logistics assignment found for this order', 404);
  return assignment;
};

const updateDriverStatus = async (userId, status, lat, lng) => {
  const driver = await LogisticsPartner.findOne({ where: { user_id: userId } });
  if (!driver) throw new AppError('Logistics partner profile not found', 404);

  const updates = { status };
  if (lat !== undefined) updates.current_lat = lat;
  if (lng !== undefined) updates.current_lng = lng;

  await driver.update(updates);
  return driver;
};

module.exports = {
  assignDriver,
  getDriverAssignments,
  startDelivery,
  confirmDelivery,
  trackOrder,
  updateDriverStatus,
};