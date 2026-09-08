const { sequelize } = require('../config/db.config');
const { Order, OrderItem, Listing, User, Farmer } = require('../models');
const cartService = require('./cart.service');
const AppError = require('../utils/AppError');
const { generateInvoice } = require('../utils/invoice.utils');
const { Op } = require('sequelize');

const PLATFORM_COMMISSION_RATE = 0.05;
const DELIVERY_CHARGE_FLAT = 30;
const GST_RATE_FRESH_PRODUCE = 0.00;

const placeOrder = async (userId, deliveryAddress, deliverySlot) => {
  const t = await sequelize.transaction();
  try {
    // 1. Get cart
    const cart = await cartService.getCart(userId);
    if (!cart || cart.length === 0) throw new AppError('Cart is empty', 400);

    // 2. Validate stock for each item (with row lock)
    const listingsMap = {};
    for (const item of cart) {
      const listing = await Listing.findByPk(item.listingId, { transaction: t, lock: t.LOCK.UPDATE });
      if (!listing || !listing.is_active) {
        throw new AppError(`${item.crop_name} is no longer available`, 400);
      }
      if (Number(listing.available_kg) < item.quantity_kg) {
        throw new AppError(`Only ${listing.available_kg}kg of ${item.crop_name} available`, 400);
      }
      listingsMap[item.listingId] = listing;
    }

    // 3. Calculate totals
    const subtotal = cart.reduce((sum, i) => sum + i.quantity_kg * i.price_per_kg, 0);
    const delivery_charge = DELIVERY_CHARGE_FLAT;
    const gst_amount = subtotal * GST_RATE_FRESH_PRODUCE;
    const total_amount = subtotal + delivery_charge + gst_amount;

    // 4. Create Order
    const order = await Order.create(
      {
        buyer_id: userId,
        status: 'pending',
        order_type: 'retail',
        subtotal,
        delivery_charge,
        gst_amount,
        total_amount,
        delivery_address: deliveryAddress,
        delivery_slot: deliverySlot,
        payment_status: 'pending',
      },
      { transaction: t }
    );

    // 5. Create OrderItems + deduct stock
    for (const item of cart) {
      const itemTotal = item.quantity_kg * item.price_per_kg;

      await OrderItem.create(
        {
          order_id: order.id,
          listing_id: item.listingId,
          farmer_id: item.farmerId,
          crop_name: item.crop_name,
          quantity_kg: item.quantity_kg,
          price_per_kg: item.price_per_kg,
          total_price: itemTotal,
          farmer_payout: itemTotal * (1 - PLATFORM_COMMISSION_RATE),
          platform_commission: itemTotal * PLATFORM_COMMISSION_RATE,
        },
        { transaction: t }
      );

      const listing = listingsMap[item.listingId];
      const newAvailable = Number(listing.available_kg) - item.quantity_kg;

      await listing.update(
        {
          available_kg: newAvailable,
          is_active: newAvailable > 0,
        },
        { transaction: t }
      );
    }

    await t.commit();

    // 6. Clear cart (after commit, non-critical if it fails)
    await cartService.clearCart(userId);

    return order;
  } catch (err) {
    await t.rollback();
    throw err;
  }
};

const getOrders = async (userId, role, filters = {}) => {
  const where = {};

  if (role === 'consumer' || role === 'bulk_buyer') {
    where.buyer_id = userId;
  }
  // farmer/admin filtering can be extended later via OrderItem join

  if (filters.status) where.status = filters.status;

  const orders = await Order.findAll({
    where,
    include: [
      { model: User, as: 'buyer', attributes: ['id', 'full_name', 'mobile'] },
      { model: OrderItem, as: 'items' },
    ],
    order: [['created_at', 'DESC']],
  });

  return orders;
};

const getOrderById = async (orderId, userId, role) => {
  const order = await Order.findByPk(orderId, {
    include: [
      { model: User, as: 'buyer', attributes: ['id', 'full_name', 'mobile'] },
      { model: OrderItem, as: 'items' },
    ],
  });

  if (!order) throw new AppError('Order not found', 404);

  if (role !== 'admin' && order.buyer_id !== userId) {
    throw new AppError('Unauthorized to view this order', 403);
  }

  return order;
};

const cancelOrder = async (orderId, userId) => {
  const order = await Order.findByPk(orderId);
  if (!order) throw new AppError('Order not found', 404);
  if (order.buyer_id !== userId) throw new AppError('Unauthorized', 403);

  if (!['pending', 'confirmed'].includes(order.status)) {
    throw new AppError('Order cannot be cancelled at this stage', 400);
  }

  const t = await sequelize.transaction();
  try {
    // Restore stock
    const items = await OrderItem.findAll({ where: { order_id: orderId }, transaction: t });
    for (const item of items) {
      const listing = await Listing.findByPk(item.listing_id, { transaction: t, lock: t.LOCK.UPDATE });
      if (listing) {
        await listing.update(
          { available_kg: Number(listing.available_kg) + Number(item.quantity_kg), is_active: true },
          { transaction: t }
        );
      }
    }

    await order.update({ status: 'cancelled' }, { transaction: t });
    await t.commit();
    return order;
  } catch (err) {
    await t.rollback();
    throw err;
  }
};

const updateOrderStatus = async (orderId, newStatus) => {
  const order = await Order.findByPk(orderId);
  if (!order) throw new AppError('Order not found', 404);

  await order.update({ status: newStatus });
  return order;
};

module.exports = {
  placeOrder,
  getOrders,
  getOrderById,
  cancelOrder,
  updateOrderStatus,
};