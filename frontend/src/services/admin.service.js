import api from './api';

export const adminService = {
  getStats: () => api.get('/api/admin/stats'),
  getUsers: (params) => api.get('/api/admin/users', { params }),
  getUserDetail: (id) => api.get(`/api/admin/users/${id}`),
  updateUserStatus: (id, isActive) =>
    api.put(`/api/admin/users/${id}/status`, { is_active: isActive }),
  getOrders: (params) => api.get('/api/admin/orders', { params }),
  updateOrderStatus: (id, status) =>
    api.put(`/api/admin/orders/${id}/status`, { status }),
  getGrievances: (params) => api.get('/api/admin/grievances', { params }),
  resolveGrievance: (id, note) =>
    api.put(`/api/admin/grievances/${id}`, {
      status: 'resolved',
      resolution_note: note,
    }),
  getAnalytics: () => api.get('/api/admin/reports/analytics'),
};

export const getResponseData = (response) => response?.data?.data || response?.data;

export const getPaginatedData = (response) => {
  const data = getResponseData(response);
  if (Array.isArray(data)) {
    return {
      items: data,
      total: response?.data?.pagination?.total ?? response?.data?.total ?? data.length,
    };
  }

  return {
    items: data?.items || data?.users || data?.orders || data?.grievances || [],
    total: data?.total ?? response?.data?.pagination?.total ?? response?.data?.total ?? 0,
  };
};
