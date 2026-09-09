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
      const listing = await Listing.findByPk(item.listing_id, { transaction: t, lock: t.LOCK.UPDATE });
      if (!listing || !listing.is_active) {
        throw new AppError(`${item.crop_name} is no longer available`, 400);
      }
      if (Number(listing.available_kg) < item.quantity_kg) {
        throw new AppError(`Only ${listing.available_kg}kg of ${item.crop_name} available`, 400);
      }
      listingsMap[item.listing_id] = listing;
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
          listing_id: item.listing_id,
          farmer_id: item.farmer_id,
          crop_name: item.crop_name,
          quantity_kg: item.quantity_kg,
          price_per_kg: item.price_per_kg,
          total_price: itemTotal,
          farmer_payout: itemTotal * (1 - PLATFORM_COMMISSION_RATE),
          platform_commission: itemTotal * PLATFORM_COMMISSION_RATE,
        },
        { transaction: t }
      );

      const listing = listingsMap[item.listing_id];
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
  const itemWhere = {};

  if (role === 'consumer' || role === 'bulk_buyer') {
    where.buyer_id = userId;
  } else if (role === 'farmer' || role === 'fpo_admin') {
    const farmer = await Farmer.findOne({ where: { user_id: userId } });
    if (!farmer) return [];
    where['$items.farmer_id$'] = farmer.id;
    itemWhere.farmer_id = farmer.id;
  }

  if (filters.status) where.status = filters.status;

  const orders = await Order.findAll({
    where,
    include: [
      { model: User, as: 'buyer', attributes: ['id', 'full_name', 'mobile'] },
      {
        model: OrderItem,
        as: 'items',
        where: itemWhere,
        required: false,
        include: [
          {
            model: Listing,
            as: 'listing',
            attributes: ['id', 'crop_name', 'quantity_kg', 'available_kg', 'price_per_kg'],
          },
        ],
      },
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

const updateOrderStatus = async (orderId, newStatus, userId, role) => {
  const order = await Order.findByPk(orderId);
  if (!order) throw new AppError('Order not found', 404);

  const ALLOWED = ['pending', 'confirmed', 'packed', 'in_transit', 'delivered', 'cancelled', 'refunded'];
  if (!ALLOWED.includes(newStatus)) throw new AppError('Invalid order status', 400);

  // Farmer can only pack/unpack orders that contain their produce
  if (role === 'farmer' || role === 'fpo_admin') {
    const farmer = await Farmer.findOne({ where: { user_id: userId } });
    if (!farmer) throw new AppError('Farmer profile not found', 404);
    const itemCount = await OrderItem.count({ where: { order_id: orderId, farmer_id: farmer.id } });
    if (!itemCount) throw new AppError('No items from this order belong to you', 403);

    if (!['confirmed', 'packed', 'pending'].includes(order.status)) {
      throw new AppError('Order cannot be packed/unpacked at this stage', 400);
    }
  }

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