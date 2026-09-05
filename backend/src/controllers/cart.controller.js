const cartService = require('../services/cart.service');
const { successResponse } = require('../utils/response.utils');

const addToCart = async (req, res, next) => {
  try {
    const { listingId, quantity_kg } = req.body;
    const cart = await cartService.addToCart(req.user.id, listingId, quantity_kg);
    return successResponse(res, 'Item added to cart', cart, 201);
  } catch (err) {
    next(err);
  }
};

const getCart = async (req, res, next) => {
  try {
    const cart = await cartService.getCart(req.user.id);
    return successResponse(res, 'Cart fetched successfully', cart);
  } catch (err) {
    next(err);
  }
};

const updateCartItem = async (req, res, next) => {
  try {
    const { listingId } = req.params;
    const { quantity_kg } = req.body;
    const cart = await cartService.updateCartItem(req.user.id, listingId, quantity_kg);
    return successResponse(res, 'Cart item updated', cart);
  } catch (err) {
    next(err);
  }
};

const removeCartItem = async (req, res, next) => {
  try {
    const { listingId } = req.params;
    const cart = await cartService.removeCartItem(req.user.id, listingId);
    return successResponse(res, 'Item removed from cart', cart);
  } catch (err) {
    next(err);
  }
};

const clearCart = async (req, res, next) => {
  try {
    await cartService.clearCart(req.user.id);
    return successResponse(res, 'Cart cleared successfully');
  } catch (err) {
    next(err);
  }
};

const getCartSummary = async (req, res, next) => {
  try {
    const summary = await cartService.getCartSummary(req.user.id);
    return successResponse(res, 'Cart summary fetched successfully', summary);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  addToCart,
  getCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  getCartSummary,
};