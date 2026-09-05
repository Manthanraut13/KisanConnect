const crypto = require('crypto');
const { razorpay } = require('../config/razorpay.config');
const { cloudinary } = require('../config/cloudinary.config');
const { Order, OrderItem, Payment, Farmer, User } = require('../models');
const { generateInvoicePDF } = require('../utils/invoice.utils');
const AppError = require('../utils/AppError');
const axios = require('axios');

// Step 1: Create Razorpay order
const createRazorpayOrder = async (orderId, userId) => {
  const order = await Order.findOne({ where: { id: orderId, buyer_id: userId } });
  if (!order) throw new AppError('Order not found', 404);
  if (order.payment_status !== 'pending') throw new AppError('Order already paid', 400);

  const rzpOrder = await razorpay.orders.create({
    amount: Math.round(Number(order.total_amount) * 100), // paise
    currency: 'INR',
    receipt: order.id.slice(0, 40),
    notes: { order_id: order.id, buyer_id: userId },
  });

  await order.update({ razorpay_order_id: rzpOrder.id });

  return {
    razorpay_order_id: rzpOrder.id,
    amount: rzpOrder.amount,
    currency: rzpOrder.currency,
    key_id: process.env.RAZORPAY_KEY_ID,
  };
};

// Helper: upload PDF buffer to Cloudinary
const uploadInvoicePDF = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'kisan-connect/invoices', resource_type: 'raw', format: 'pdf' },
      (err, result) => (err ? reject(err) : resolve(result.secure_url))
    );
    stream.end(buffer);
  });
};

// Helper: trigger order notification webhook (internal call)
const triggerOrderNotification = async (order, items) => {
  try {
    const buyer = await User.findByPk(order.buyer_id);
    const firstFarmer = await Farmer.findByPk(items[0].farmer_id, { include: [{ model: User, as: 'user' }] });

    await axios.post(
      `${process.env.APP_URL || 'http://localhost:5000'}/api/webhooks/order-placed`,
      {
        order_id: order.id,
        farmer_mobile: firstFarmer?.user?.mobile,
        consumer_mobile: buyer?.mobile,
        farmer_name: firstFarmer?.user?.full_name,
        crop: items.map((i) => i.crop_name).join(', '),
        quantity: items.reduce((sum, i) => sum + Number(i.quantity_kg), 0),
        amount: order.total_amount,
      },
      { headers: { 'x-webhook-secret': process.env.ANTIGRAVITY_WEBHOOK_SECRET }, timeout: 5000 }
    );
  } catch (err) {
    console.warn('Order notification webhook failed (non-critical):', err.message);
  }
};

// Step 2: Verify payment signature after Razorpay checkout success
const verifyPayment = async ({ razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id }) => {
  const body = razorpay_order_id + '|' + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    throw new AppError('Invalid payment signature', 400);
  }

  const order = await Order.findByPk(order_id);
  if (!order) throw new AppError('Order not found', 404);

  await order.update({ payment_status: 'paid', status: 'confirmed' });

  await Payment.create({
    order_id,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    amount: order.total_amount,
    status: 'captured',
  });

  // Generate + upload invoice (non-critical if it fails)
  try {
    const items = await OrderItem.findAll({ where: { order_id } });
    const invoiceBuffer = await generateInvoicePDF(order, items, null);
    const invoiceUrl = await uploadInvoicePDF(invoiceBuffer);
    await order.update({ invoice_url: invoiceUrl });

    await triggerOrderNotification(order, items);
  } catch (err) {
    console.warn('Invoice/notification generation failed (non-critical):', err.message);
  }

  return { success: true, order_id };
};

// Step 3: Razorpay webhook (backup confirmation)
const handleWebhook = async (payload, signature) => {
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(JSON.stringify(payload))
    .digest('hex');

  if (expectedSignature !== signature) {
    throw new AppError('Invalid webhook signature', 400);
  }

  if (payload.event === 'payment.captured') {
    const orderId = payload.payload.payment.entity.notes?.order_id;
    if (orderId) {
      const order = await Order.findByPk(orderId);
      if (order && order.payment_status !== 'paid') {
        await order.update({ payment_status: 'paid', status: 'confirmed' });
      }
    }
  }

  return { success: true };
};

const getPaymentHistory = async (userId) => {
  const orders = await Order.findAll({ where: { buyer_id: userId }, attributes: ['id'] });
  const orderIds = orders.map((o) => o.id);
  return Payment.findAll({ where: { order_id: orderIds }, order: [['created_at', 'DESC']] });
};

module.exports = {
  createRazorpayOrder,
  verifyPayment,
  handleWebhook,
  getPaymentHistory,
};