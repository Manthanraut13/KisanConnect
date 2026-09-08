import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import orderService from '../services/order.service';
import { logger } from '../lib/logger';

const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const response = await orderService.getOrderById(id);
      const orderData = response.data?.data || response.data;
      logger.info('ORDER_DETAIL', 'Order loaded', { id, hasItems: !!orderData?.items?.length });
      setOrder(orderData);
    } catch (error) {
      logger.error('ORDER_DETAIL', 'Failed to load order', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusSteps = () => {
    const steps = [
      { id: 'pending', label: 'Order Placed', desc: 'Order received' },
      { id: 'confirmed', label: 'Confirmed', desc: 'Payment verified' },
      { id: 'packed', label: 'Packed', desc: 'Preparing shipment' },
      { id: 'in_transit', label: 'Out for Delivery', desc: 'On the way' },
      { id: 'delivered', label: 'Delivered', desc: 'Received' },
    ];

    const statusMap = { pending: 0, confirmed: 1, packed: 2, in_transit: 3, delivered: 4, cancelled: -1 };
    const currentIndex = statusMap[order?.status] ?? -1;

    if (order?.status === 'cancelled') {
      return steps.map((step, idx) => ({ ...step, completed: false, current: false }));
    }

    return steps.map((step, idx) => ({
      ...step,
      completed: idx <= currentIndex,
      current: idx === currentIndex,
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-kisan-700 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">Order not found</h2>
          <Link to="/orders" className="text-kisan-700 mt-4 block">Back to Orders</Link>
        </div>
      </div>
    );
  }

  const statusSteps = getStatusSteps();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/orders" className="text-gray-600 hover:text-gray-800">
            ← Back to Orders
          </Link>
          <h1 className="text-2xl font-bold">Order #{order.id?.slice(0, 8).toUpperCase()}</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Status Timeline */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Order Status</h2>
              <div className="relative">
                <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-gray-200"></div>
                {statusSteps.map((step, idx) => (
                  <div key={step.id} className="relative pl-12 pb-6 last:pb-0">
                    <div className={`absolute left-0 top-0 w-8 h-8 rounded-full flex items-center justify-center border-4 ${
                      step.completed
                        ? 'bg-green-700 border-green-700 text-white'
                        : step.current
                          ? 'bg-white border-green-500 text-green-500 animate-pulse'
                          : 'bg-gray-100 border-gray-200 text-gray-400'
                    }`}>
                      {step.completed ? '✓' : idx + 1}
                    </div>
                    <div className="flex flex-col">
                      <span className={`font-medium ${step.current ? 'text-green-700' : step.completed ? 'text-green-700' : 'text-gray-800'}`}>
                        {step.label}
                      </span>
                      <span className="text-sm text-gray-500">{step.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Items Ordered</h2>
              <div className="space-y-4">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="flex gap-4 py-3 border-b border-gray-100 last:border-0">
                    <div className="w-16 h-16 bg-gray-100 rounded-md flex-shrink-0 overflow-hidden">
                      {item.images?.[0] && <img src={item.images[0]} alt="" className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{item.crop_name || item.listing?.crop_name}</h3>
                      <p className="text-sm text-gray-600">
                        ₹{item.price_per_kg || 0} × {item.quantity_kg}kg = ₹{item.total_price || (item.price_per_kg * item.quantity_kg)}
                      </p>
                      <p className="text-sm text-gray-500">by {item.farmer_name || 'Farmer'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Delivery Address</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-medium">{order.delivery_address?.full_name || order.user?.full_name}</p>
                <p className="text-gray-600">{order.delivery_address?.full_address}</p>
                <p className="text-gray-600">
                  {order.delivery_address?.district}, {order.delivery_address?.state} - {order.delivery_address?.pin_code}
                </p>
                <p className="text-gray-600">Mobile: {order.delivery_address?.mobile || order.user?.mobile}</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order ID</span>
                  <span className="font-mono">#{order.id?.slice(0, 8).toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date</span>
                  <span>{new Date(order.createdAt || order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                    order.status === 'in_transit' ? 'bg-orange-100 text-orange-800' :
                    order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {order.status?.replace('_', ' ') || 'Pending'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment</span>
                  <span className="text-green-600 font-medium">Paid via Razorpay</span>
                </div>
              </div>

              <div className="border-t pt-4 mt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>₹{order.subtotal || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery</span>
                  <span>{order.delivery_charge === 0 ? 'Free' : `₹${order.delivery_charge}`}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2">
                  <span>Total</span>
                  <span className="text-green-700">₹{order.total_amount || order.totalAmount}</span>
                </div>
              </div>

              {order.invoice_url && (
                <a
                  href={order.invoice_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full mt-4 bg-kisan-700 text-white py-2 rounded-lg hover:bg-kisan-800 text-center text-sm"
                >
                  Download Invoice
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
