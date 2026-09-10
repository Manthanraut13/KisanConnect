import api from './api';

const cartService = {
  getCart: () => api.get('/api/cart'),
  addItem: (listingId, quantityKg) =>
    api.post('/api/cart/add', { listingId, quantity_kg: quantityKg, }),
  updateItem: (itemId, quantityKg) => api.put('/api/cart/items/' + itemId, { quantity_kg: quantityKg }),
  removeItem: (itemId) => api.delete('/api/cart/items/' + itemId),
  clearCart: () => api.delete('/api/cart/clear'),
  getSummary: () => api.get('/api/cart/summary'),
};

export default cartService;
