const paymentService = require('../services/payment.service');
const { successResponse } = require('../utils/response.utils');

const createOrder = async (req, res, next) => {
  try {
    const { order_id } = req.body;
    const result = await paymentService.createRazorpayOrder(order_id, req.user.id);
    return successResponse(res, 'Razorpay order created', result, 201);
  } catch (err) {
    next(err);
  }
};

const verify = async (req, res, next) => {
  try {
    const result = await paymentService.verifyPayment(req.body);
    return successResponse(res, 'Payment verified successfully', result);
  } catch (err) {
    next(err);
  }
};

const webhook = async (req, res, next) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const result = await paymentService.handleWebhook(req.body, signature);
    return res.json(result);
  } catch (err) {
    next(err);
  }
};

const getHistory = async (req, res, next) => {
  try {
    const payments = await paymentService.getPaymentHistory(req.user.id);
    return successResponse(res, 'Payment history fetched successfully', payments);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createOrder,
  verify,
  webhook,
  getHistory,
};