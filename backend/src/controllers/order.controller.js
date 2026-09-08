const orderService = require('../services/order.service');
const { successResponse } = require('../utils/response.utils');

const placeOrder = async (req, res, next) => {
  try {
    const { delivery_address, delivery_slot } = req.body;
    const order = await orderService.placeOrder(req.user.id, delivery_address, delivery_slot);
    return successResponse(res, 'Order placed successfully', order, 201);
  } catch (err) {
    next(err);
  }
};

const getOrders = async (req, res, next) => {
  try {
    const orders = await orderService.getOrders(req.user.id, req.user.role, req.query);
    return successResponse(res, 'Orders fetched successfully', orders);
  } catch (err) {
    next(err);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const order = await orderService.getOrderById(req.params.id, req.user.id, req.user.role);
    return successResponse(res, 'Order fetched successfully', order);
  } catch (err) {
    next(err);
  }
};

const cancelOrder = async (req, res, next) => {
  try {
    const order = await orderService.cancelOrder(req.params.id, req.user.id);
    return successResponse(res, 'Order cancelled successfully', order);
  } catch (err) {
    next(err);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await orderService.updateOrderStatus(req.params.id, status);
    return successResponse(res, 'Order status updated successfully', order);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  placeOrder,
  getOrders,
  getOrderById,
  cancelOrder,
  updateOrderStatus,
};