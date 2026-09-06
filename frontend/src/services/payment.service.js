import api from './api';

export const paymentService = {
  createRazorpayOrder: async (amount, currency = 'INR') => {
    const res = await api.post('/api/payments/razorpay/order', { amount, currency });
    return res.data;
  },

  verifyPayment: async (paymentId, orderId, signature) => {
    const res = await api.post('/api/payments/razorpay/verify', {
      payment_id: paymentId,
      order_id: orderId,
      signature: signature
    });
    return res.data;
  },

  getPaymentHistory: async () => {
    const res = await api.get('/api/payments/history');
    return res.data;
  },

  downloadReceipt: async (paymentId) => {
    const res = await api.get(`/api/payments/receipt/${paymentId}`, {
      responseType: 'blob'
    });
    return res;
  }
};
