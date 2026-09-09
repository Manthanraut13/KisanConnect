import api from './api';

export const driverService = {
  getAssignments: () => api.get('/api/logistics/driver/assignments'),
  getDashboard: () => api.get('/api/logistics/driver/dashboard'),
  getAvailableOrders: () => api.get('/api/logistics/driver/available-orders'),
  acceptOrder: (orderId) => api.post(`/api/logistics/driver/accept/${orderId}`),
  updateStatus: (status, lat, lng) =>
    api.put('/api/logistics/driver/status', { status, lat, lng }),
  updateDeliveryStatus: (id, status) =>
    api.put(`/api/logistics/delivery/${id}/start`, { status }),
  confirmDelivery: (id, formData) =>
    api.put(`/api/logistics/delivery/${id}/confirm`, formData),
};