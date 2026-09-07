import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import orderService from '../services/order.service';
import { logger } from '../lib/logger';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await orderService.getOrders();
      const data = response.data?.data ?? response.data;
      const ordersData = Array.isArray(data) ? data : data?.orders || [];
      logger.info('ORDERS', 'Orders loaded', { count: ordersData.length });
      setOrders(ordersData);
    } catch (error) {
      logger.error('ORDERS', 'Failed to fetch orders', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      packed: 'bg-purple-100 text-purple-800',
      in_transit: 'bg-orange-100 text-orange-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const filteredOrders = filter === 'all'
    ? orders
    : orders.filter(o => o.status === filter);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-kisan-700 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">My Orders</h1>

        <div className="flex flex-wrap gap-2 mb-6">
          {['all', 'pending', 'confirmed', 'in_transit', 'delivered', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg capitalize text-sm font-medium ${
                filter === status
                  ? 'bg-green-700 text-white'
                  : 'bg-white border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {status.replace('_', ' ')}
            </button>
          ))}
        </div>

        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No Orders Found</h2>
            <p className="text-gray-600">You haven't placed any orders yet.</p>
            <button
              onClick={() => navigate('/marketplace')}
              className="mt-4 bg-kisan-700 text-white px-6 py-2 rounded-lg hover:bg-kisan-800"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                onClick={() => navigate(`/orders/${order.id}`)}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg cursor-pointer transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm font-mono text-gray-800">Order #{order.id?.slice(0, 8).toUpperCase()}</p>
                    <p className="text-sm text-gray-500">{new Date(order.createdAt || order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {order.status?.replace('_', ' ') || 'Pending'}
                  </span>
                </div>

                <div className="space-y-1 mb-4">
                  {order.items?.slice(0, 3).map((item, idx) => (
                    <p key={idx} className="text-sm text-gray-700">
                      {item.crop_name || item.listing?.crop_name} × {item.quantity_kg}kg
                    </p>
                  ))}
                  {order.items?.length > 3 && (
                    <p className="text-sm text-gray-500">+{order.items.length - 3} more items</p>
                  )}
                </div>

                <div className="border-t pt-4 flex justify-between items-center">
                  <span className="text-gray-600">Total</span>
                  <span className="text-xl font-bold text-green-700">₹{order.total_amount || order.totalAmount}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
