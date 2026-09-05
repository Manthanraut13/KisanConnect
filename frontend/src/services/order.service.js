import api from './api';

export const orderService = {
  createOrder: async (data) => {
    const res = await api.post('/api/orders', data);
    return res.data;
  },

  getOrders: async (params = {}) => {
    const res = await api.get('/api/orders', { params });
    return res.data;
  },

  getOrderById: async (orderId) => {
    const res = await api.get(`/api/orders/${orderId}`);
    return res.data;
  },

  cancelOrder: async (orderId) => {
    const res = await api.put(`/api/orders/${orderId}/cancel`);
    return res.data;
  },

  updateOrderStatus: async (orderId, status) => {
    const res = await api.put(`/api/orders/${orderId}/status`, { status });
    return res.data;
  }
};
