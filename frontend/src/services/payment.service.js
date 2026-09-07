import api from './api';

const paymentService = {
  createRazorpayOrder: (orderId) =>
    api.post('/api/payments/create-order', { order_id: orderId }),
  verifyPayment: (data) => api.post('/api/payments/verify', data),
};

export default paymentService;
