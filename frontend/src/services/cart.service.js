import api from './api';

export const cartService = {
  getCartItems: async () => {
    const res = await api.get('/api/cart/items');
    return res.data;
  },

  addToCart: async (data) => {
    const res = await api.post('/api/cart/items', data);
    return res.data;
  },

  updateQuantity: async (itemId, quantityKg) => {
    const res = await api.put(`/api/cart/items/${itemId}`, { quantity_kg: quantityKg });
    return res.data;
  },

  removeFromCart: async (itemId) => {
    const res = await api.delete(`/api/cart/items/${itemId}`);
    return res.data;
  },

  clearCart: async () => {
    const res = await api.delete('/api/cart/items');
    return res.data;
  },

  calculateTotals: async (items) => {
    const res = await api.post('/api/cart/totals', { items });
    return res.data;
  }
};
