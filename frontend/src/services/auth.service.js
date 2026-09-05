import api from './api';

export const authService = {
  login: async (data) => {
    const res = await api.post('/api/auth/login', data);
    return res.data;
  },

  register: async (data) => {
    const res = await api.post('/api/auth/register', data);
    return res.data;
  },

  sendOTP: async (mobile) => {
    const res = await api.post('/api/auth/send-otp', { mobile });
    return res.data;
  },

  verifyOTP: async (data) => {
    const res = await api.post('/api/auth/verify-otp', data);
    return res.data;
  },

  forgotPassword: async (mobile) => {
    const res = await api.post('/api/auth/forgot-password', { mobile });
    return res.data;
  },

  resetPassword: async (data) => {
    const res = await api.post('/api/auth/reset-password', data);
    return res.data;
  },

  logout: async () => {
    const res = await api.post('/api/auth/logout');
    return res.data;
  },

  refreshToken: async (refreshToken) => {
    const res = await api.post('/api/auth/refresh-token', { refresh_token: refreshToken });
    return res.data;
  },

  getCurrentUser: async () => {
    const res = await api.get('/api/users/me');
    return res.data;
  },

  updateProfile: async (data) => {
    const res = await api.put('/api/users/me', data);
    return res.data;
  },

  updatePassword: async (data) => {
    const res = await api.put('/api/users/me/password', data);
    return res.data;
  }
};
