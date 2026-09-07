import api from './api';

const orderService = {
  placeOrder: (deliveryAddress, deliverySlot) =>
    api.post('/api/orders', { delivery_address: deliveryAddress, delivery_slot: deliverySlot }),
  getOrders: () => api.get('/api/orders'),
  getOrderById: (id) => api.get('/api/orders/' + id),
};

export default orderService;
