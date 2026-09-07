import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import orderService from '../services/order.service';
import { useCartStore } from '../stores/cartStore';
import { logger } from '../lib/logger';

const OrderSuccess = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const clearCart = useCartStore((s) => s.clearCart);

  useEffect(() => {
    clearCart();
    loadOrder();
  }, [id]);

  const loadOrder = async () => {
    try {
      const response = await orderService.getOrderById(id);
      const orderData = response.data?.data || response.data;
      logger.info('ORDER_DETAIL', 'Order loaded', { id, hasItems: !!orderData?.items?.length });
      setOrder(orderData);
    } catch (error) {
      logger.error('ORDER_DETAIL', 'Failed to load order', error);
    } finally {
      setLoading(false);
    }
  };

  const estimatedDelivery = new Date();
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 2);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-kisan-700"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-lg shadow-md p-8 text-center">
        <div className="text-6xl mb-4">✅</div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Order Placed Successfully!</h1>
        <p className="text-gray-500 mb-6">
          Your order #{id?.slice(0, 8).toUpperCase()} has been confirmed.
        </p>

        {order && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold mb-3">Order Details</h3>
            <div className="space-y-2 text-sm">
              {order.items?.map((item, idx) => (
                <div key={idx} className="flex justify-between">
                  <span className="text-gray-600">{item.crop_name || item.listing?.crop_name}</span>
                  <span>{item.quantity_kg}kg × ₹{item.price_per_kg}</span>
                </div>
              ))}
              <div className="border-t pt-2 mt-2 flex justify-between font-bold">
                <span>Total Paid</span>
                <span>₹{order.total_amount || order.totalAmount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Estimated Delivery</span>
                <span>{estimatedDelivery.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery To</span>
                <span>{order.delivery_address?.district}, {order.delivery_address?.state}</span>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <Link
            to={`/orders/${id}`}
            className="block w-full bg-kisan-700 text-white py-3 rounded-lg hover:bg-kisan-800"
          >
            Track Order
          </Link>
          <Link
            to="/marketplace"
            className="block w-full border border-kisan-700 text-kisan-700 py-3 rounded-lg hover:bg-green-50"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
