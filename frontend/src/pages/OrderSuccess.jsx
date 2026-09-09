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
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-kisan-700"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-xl shadow-md p-8 text-center">
        <div className="text-6xl mb-4">✅</div>
        <h1 className="text-3xl font-bold text-on-surface mb-2">Order Placed Successfully!</h1>
        <p className="text-on-surface-variant mb-6">
          Your order #{id?.slice(0, 8).toUpperCase()} has been confirmed.
        </p>

        {order && (
          <div className="bg-surface rounded-xl p-4 mb-6 text-left">
            <h3 className="font-semibold mb-3">Order Details</h3>
            <div className="space-y-2 text-sm">
              {order.items?.map((item, idx) => (
                <div key={idx} className="flex justify-between">
                  <span className="text-on-surface-variant">{item.crop_name || item.listing?.crop_name}</span>
                  <span>{item.quantity_kg}kg × ₹{item.price_per_kg}</span>
                </div>
              ))}
              <div className="border-t pt-2 mt-2 flex justify-between font-bold">
                <span>Total Paid</span>
                <span>₹{order.total_amount || order.totalAmount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Estimated Delivery</span>
                <span>{estimatedDelivery.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Delivery To</span>
                <span>{order.delivery_address?.district}, {order.delivery_address?.state}</span>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <Link
            to={`/orders/${id}`}
            className="block w-full bg-kisan-700 text-white py-3 rounded-xl hover:bg-kisan-800"
          >
            Track Order
          </Link>
          <Link
            to="/marketplace"
            className="block w-full border border-kisan-700 text-kisan-700 py-3 rounded-xl hover:bg-green-50"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
