import api from './api';

const authService = {
  login: (mobile, password) => api.post('/api/auth/login', { mobile, password }),
  register: (data) => api.post('/api/auth/register', data),
  getProfile: () => api.get('/api/users/me'),
  logout: () => api.post('/api/auth/logout'),
};

export default authService;
