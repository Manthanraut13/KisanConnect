const { redis } = require('../config/redis.config');
const { Listing } = require('../models');
const AppError = require('../utils/AppError');

const CART_TTL_SECONDS = 2 * 60 * 60; // 2 hours

const getCartKey = (userId) => `cart:${userId}`;

// Get raw cart array from Redis
const getCart = async (userId) => {
  const cart = await redis.get(getCartKey(userId));
  return cart || [];
};

const addToCart = async (userId, listingId, quantityKg) => {
  const listing = await Listing.findByPk(listingId);
  if (!listing || !listing.is_active) throw new AppError('Listing not available', 400);
  if (Number(listing.available_kg) < quantityKg) {
    throw new AppError(`Only ${listing.available_kg}kg available`, 400);
  }

  const cart = await getCart(userId);
  const existingIndex = cart.findIndex((item) => item.listingId === listingId);

  if (existingIndex > -1) {
    const newQty = cart[existingIndex].quantity_kg + Number(quantityKg);
    if (newQty > Number(listing.available_kg)) {
      throw new AppError(`Cannot add more, only ${listing.available_kg}kg available`, 400);
    }
    cart[existingIndex].quantity_kg = newQty;
  } else {
    cart.push({
      listingId,
      farmerId: listing.farmer_id,
      crop_name: listing.crop_name,
      price_per_kg: Number(listing.price_per_kg),
      quantity_kg: Number(quantityKg),
    });
  }

  await redis.set(getCartKey(userId), cart, { ex: CART_TTL_SECONDS });
  return cart;
};

const updateCartItem = async (userId, listingId, quantityKg) => {
  const cart = await getCart(userId);
  const index = cart.findIndex((item) => item.listingId === listingId);
  if (index === -1) throw new AppError('Item not found in cart', 404);

  cart[index].quantity_kg = Number(quantityKg);
  await redis.set(getCartKey(userId), cart, { ex: CART_TTL_SECONDS });
  return cart;
};

const removeCartItem = async (userId, listingId) => {
  let cart = await getCart(userId);
  cart = cart.filter((item) => item.listingId !== listingId);
  await redis.set(getCartKey(userId), cart, { ex: CART_TTL_SECONDS });
  return cart;
};

const clearCart = async (userId) => {
  await redis.del(getCartKey(userId));
  return true;
};

const getCartSummary = async (userId) => {
  const cart = await getCart(userId);
  if (cart.length === 0) {
    return { items: [], subtotal: 0, delivery_charge: 0, gst_amount: 0, total: 0 };
  }

  // Refresh prices from DB in case they changed
  const items = [];
  for (const item of cart) {
    const listing = await Listing.findByPk(item.listingId);
    items.push({
      ...item,
      current_price: listing ? Number(listing.price_per_kg) : item.price_per_kg,
      total_price: (listing ? Number(listing.price_per_kg) : item.price_per_kg) * item.quantity_kg,
    });
  }

  const subtotal = items.reduce((sum, i) => sum + i.total_price, 0);
  const delivery_charge = 30;
  const gst_amount = 0;
  const total = subtotal + delivery_charge + gst_amount;

  return { items, subtotal, delivery_charge, gst_amount, total };
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  getCartSummary,
};