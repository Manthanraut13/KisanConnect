import { create } from 'zustand';
import { logger } from '../lib/logger';

export const useCartStore = create((set, get) => ({
  items: [],
  totalItems: 0,
  subtotal: 0,
  deliveryCharge: 0,
  gstAmount: 0,
  totalAmount: 0,

  setCart: (newItems) => {
    logger.cart.load(newItems?.length || 0);
    set({ items: newItems });
    get().calculateTotals();
  },

  addToCart: (item) => {
    logger.cart.add(item);
    const { items } = get();
    const existingItem = items.find((i) => i.listing_id === item.listing_id);

    if (existingItem) {
      set({
        items: items.map((i) =>
          i.listing_id === item.listing_id
            ? { ...i, quantity_kg: i.quantity_kg + item.quantity_kg }
            : i
        ),
      });
    } else {
      set({ items: [...items, item] });
    }
    get().calculateTotals();
  },

  removeFromCart: (listingId) => {
    logger.cart.remove(listingId);
    set({ items: get().items.filter((i) => i.listing_id !== listingId) });
    get().calculateTotals();
  },

  updateQuantity: (listingId, quantityKg) => {
    logger.cart.update(listingId, quantityKg);
    set({
      items: get().items.map((i) =>
        i.listing_id === listingId ? { ...i, quantity_kg: quantityKg } : i
      ),
    });
    get().calculateTotals();
  },

  clearCart: () => {
    logger.cart.clear();
    set({ items: [] });
    get().calculateTotals();
  },

  calculateTotals: () => {
    const { items } = get();
    const subtotal = items.reduce((sum, item) => sum + (item.total_price || item.price_per_kg * item.quantity_kg), 0);
    const deliveryCharge = 30;
    const gstAmount = 0;
    const totalAmount = subtotal + deliveryCharge + gstAmount;

    set({
      subtotal,
      deliveryCharge,
      gstAmount,
      totalAmount,
      totalItems: items.length,
    });
  },
}));
