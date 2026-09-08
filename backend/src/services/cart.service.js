const { redis } = require('../config/redis.config');
const { Listing, Farmer, User } = require('../models');
const AppError = require('../utils/AppError');

const CART_TTL_SECONDS = 2 * 60 * 60; // 2 hours

const getCartKey = (userId) => `cart:${userId}`;

// Get raw cart array from Redis, normalizing legacy listingId keys
const getRawCart = async (userId) => {
  const cart = (await redis.get(getCartKey(userId))) || [];
  return cart.map((item) => ({
    listing_id: item.listing_id || item.listingId,
    quantity_kg: Number(item.quantity_kg),
  }));
};

// Enrich cart items with live listing data (price, stock, images, farmer)
const enrichCart = async (rawItems) => {
  const items = [];
  for (const item of rawItems) {
    if (!item.listing_id) continue;
    const listing = await Listing.findByPk(item.listing_id, {
      include: [
        {
          model: Farmer,
          as: 'farmer',
          include: [{ model: User, as: 'user', attributes: ['full_name', 'mobile'] }],
        },
      ],
    });
    if (!listing) continue;
    const price = Number(listing.price_per_kg);
    items.push({
      listing_id: listing.id,
      farmer_id: listing.farmer_id,
      crop_name: listing.crop_name,
      crop_category: listing.crop_category,
      price_per_kg: price,
      quantity_kg: item.quantity_kg,
      available_kg: Number(listing.available_kg),
      images: listing.images || [],
      farmer_name: listing.farmer?.user?.full_name || 'Farmer',
      quality_grade: listing.quality_grade,
      is_organic: listing.is_organic,
      total_price: price * item.quantity_kg,
    });
  }
  return items;
};

// Get enriched cart for a user
const getCart = async (userId) => {
  return enrichCart(await getRawCart(userId));
};

const addToCart = async (userId, listingId, quantityKg) => {
  const qty = Number(quantityKg);
  if (!qty || qty <= 0) throw new AppError('Quantity must be a positive number', 400);

  const listing = await Listing.findByPk(listingId);
  if (!listing || !listing.is_active) throw new AppError('Listing not available', 400);
  if (Number(listing.available_kg) < qty) {
    throw new AppError(`Only ${listing.available_kg}kg available`, 400);
  }

  const cart = await getRawCart(userId);
  const existingIndex = cart.findIndex((item) => item.listing_id === listingId);

  if (existingIndex > -1) {
    const newQty = cart[existingIndex].quantity_kg + qty;
    if (newQty > Number(listing.available_kg)) {
      throw new AppError(`Cannot add more, only ${listing.available_kg}kg available`, 400);
    }
    cart[existingIndex].quantity_kg = newQty;
  } else {
    cart.push({ listing_id: listingId, quantity_kg: qty });
  }

  await redis.set(getCartKey(userId), cart, { ex: CART_TTL_SECONDS });
  return getCart(userId);
};

const updateCartItem = async (userId, listingId, quantityKg) => {
  const qty = Number(quantityKg);
  if (!qty || qty <= 0) throw new AppError('Quantity must be a positive number', 400);

  const listing = await Listing.findByPk(listingId);
  if (listing && Number(listing.available_kg) < qty) {
    throw new AppError(`Only ${listing.available_kg}kg available`, 400);
  }

  const cart = await getRawCart(userId);
  const index = cart.findIndex((item) => item.listing_id === listingId);
  if (index === -1) throw new AppError('Item not found in cart', 404);

  cart[index].quantity_kg = qty;
  await redis.set(getCartKey(userId), cart, { ex: CART_TTL_SECONDS });
  return getCart(userId);
};

const removeCartItem = async (userId, listingId) => {
  const cart = await getRawCart(userId);
  const filtered = cart.filter((item) => item.listing_id !== listingId);
  await redis.set(getCartKey(userId), filtered, { ex: CART_TTL_SECONDS });
  return getCart(userId);
};

const clearCart = async (userId) => {
  await redis.del(getCartKey(userId));
  return true;
};

const getCartSummary = async (userId) => {
  const items = await getCart(userId);
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