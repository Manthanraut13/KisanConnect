import api from './api';

export const listingService = {
  getAll: (params) => api.get('/api/listings', { params }),
  getById: (id) => api.get(`/api/listings/${id}`),
  create: (formData) => api.post('/api/listings', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id, data) => api.put(`/api/listings/${id}`, data),
  delete: (id) => api.delete(`/api/listings/${id}`),
  getMyListings: (params) => api.get('/api/listings/farmer/mine', { params }),
  search: (query) => api.get('/api/listings/search', { params: { q: query } }),
};