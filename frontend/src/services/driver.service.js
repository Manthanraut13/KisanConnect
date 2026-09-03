import api from './api';

export const driverService = {
  getAssignments: () => api.get('/api/logistics/driver/assignments'),
  updateDeliveryStatus: (id, status) =>
    api.put(`/api/logistics/delivery/${id}/start`, { status }),
  confirmDelivery: (id, formData) =>
    api.put(`/api/logistics/delivery/${id}/confirm`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};
