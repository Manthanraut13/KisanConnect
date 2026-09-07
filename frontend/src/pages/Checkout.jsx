import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '../stores/cartStore';
import { useAuthStore } from '../stores/authStore';
import { toast } from 'sonner';
import api from '../services/api';
import orderService from '../services/order.service';
import paymentService from '../services/payment.service';
import authService from '../services/auth.service';
import { logger } from '../lib/logger';

const DISTRICT_STATE_MAP = {
  'Nashik': 'Maharashtra',
  'Pune': 'Maharashtra',
  'Amritsar': 'Punjab',
  'Ludhiana': 'Punjab',
  'Coimbatore': 'Tamil Nadu',
  'Mysuru': 'Karnataka',
  'Guntur': 'Andhra Pradesh',
  'Jaipur': 'Rajasthan',
  'Indore': 'Madhya Pradesh',
  'Varanasi': 'Uttar Pradesh',
};

const Checkout = () => {
  const { items, totalAmount, clearCart, subtotal, deliveryCharge, gstAmount } = useCartStore();
  const user = useAuthStore((s) => s.user);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const navigate = useNavigate();

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    full_name: '',
    mobile: '',
    full_address: '',
    district: '',
    state: '',
    pin_code: '',
    delivery_slot: minDate,
    notes: '',
  });

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        full_name: user.full_name || '',
        mobile: user.mobile || '',
      }));
    }
  }, [user]);

  useEffect(() => {
    if (items.length === 0 && !isProcessing) {
      navigate('/cart');
    }
  }, [items, navigate, isProcessing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      if (name === 'district' && DISTRICT_STATE_MAP[value]) {
        next.state = DISTRICT_STATE_MAP[value];
      }
      return next;
    });
  };

  const loadRazorpay = () =>
    new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const s = document.createElement('script');
      s.src = 'https://checkout.razorpay.com/v1/checkout.js';
      s.onload = () => resolve(true);
      s.onerror = () => resolve(false);
      document.body.appendChild(s);
    });

  const handlePayment = async (e) => {
    e.preventDefault();

    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    if (!formData.full_name || !formData.full_address || !formData.district || !formData.pin_code) {
      toast.error('Please fill all required delivery fields');
      return;
    }

    setPaymentLoading(true);
    logger.payment.start('pending', totalAmount);

    try {
      // Step 1: Place order
      const orderRes = await orderService.placeOrder(
        {
          full_name: formData.full_name,
          mobile: formData.mobile,
          full_address: formData.full_address,
          district: formData.district,
          state: formData.state,
          pin_code: formData.pin_code,
        },
        formData.delivery_slot
      );

      const orderId = orderRes.data?.data?.order_id || orderRes.data?.data?.id;
      logger.info('CHECKOUT', 'Order placed', { orderId });

      // Step 2: Create Razorpay order
      const rpRes = await paymentService.createRazorpayOrder(orderId);
      const rpData = rpRes.data?.data || rpRes.data;

      // Step 3: Load Razorpay script
      const scriptLoaded = await loadRazorpay();
      if (!scriptLoaded) {
        toast.error('Payment gateway failed to load. Check your internet.');
        setPaymentLoading(false);
        return;
      }

      // Step 4: Open Razorpay modal
      const options = {
        key: rpData.key_id || import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: rpData.amount,
        currency: rpData.currency || 'INR',
        name: 'Kisan Connect',
        description: 'Fresh Produce Order',
        order_id: rpData.razorpay_order_id || rpData.order_id,
        handler: async (response) => {
          try {
            await paymentService.verifyPayment({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              order_id: orderId,
            });
            logger.payment.success(orderId, response.razorpay_payment_id);
            clearCart();
            navigate('/order-success/' + orderId);
          } catch {
            clearCart();
            navigate('/order-success/' + orderId);
          }
        },
        prefill: {
          name: formData.full_name,
          contact: formData.mobile,
        },
        theme: { color: '#2D7A2D' },
        modal: {
          ondismiss: () => {
            setPaymentLoading(false);
            toast.info('Payment cancelled');
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', () => {
        toast.error('Payment failed. Please try again.');
        setPaymentLoading(false);
      });
      rzp.open();
    } catch (error) {
      toast.error(error.message || error?.data?.message || 'Payment failed. Try again.');
      setPaymentLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <form onSubmit={handlePayment} className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">Delivery Details</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 mb-1">Full Name *</label>
                    <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} required className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-600" />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">Mobile *</label>
                    <input type="text" name="mobile" value={formData.mobile} onChange={handleChange} required maxLength={10} className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-600" />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Full Address *</label>
                  <textarea name="full_address" value={formData.full_address} onChange={handleChange} required minLength={10} rows={3} className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-600" placeholder="House no, street, landmark..." />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 mb-1">District *</label>
                    <select name="district" value={formData.district} onChange={handleChange} required className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-600">
                      <option value="">Select District</option>
                      {Object.keys(DISTRICT_STATE_MAP).map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">State</label>
                    <input type="text" name="state" value={formData.state} readOnly className="w-full px-3 py-2 border rounded-md bg-gray-50" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 mb-1">PIN Code *</label>
                    <input type="text" name="pin_code" value={formData.pin_code} onChange={handleChange} required maxLength={6} pattern="\d{6}" className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-600" />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">Delivery Date *</label>
                    <input type="date" name="delivery_slot" value={formData.delivery_slot} onChange={handleChange} min={minDate} required className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-600" />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Order Notes (optional)</label>
                  <textarea name="notes" value={formData.notes} onChange={handleChange} rows={2} className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-600" />
                </div>
              </div>

              <button
                type="submit"
                disabled={paymentLoading || items.length === 0}
                className="w-full mt-6 bg-green-700 text-white py-3 rounded-lg hover:bg-green-800 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
              >
                {paymentLoading ? 'Processing Payment...' : `Pay ₹${totalAmount.toFixed(2)}`}
              </button>
            </form>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.listing_id} className="flex justify-between text-sm">
                    <span className="max-w-[200px] truncate">{item.crop_name}</span>
                    <span>{item.quantity_kg}kg × ₹{item.price_per_kg}</span>
                  </div>
                ))}
              </div>
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery</span>
                  <span>{deliveryCharge === 0 ? 'Free' : `₹${deliveryCharge}`}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">GST (5%)</span>
                  <span>₹{gstAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2">
                  <span>Total</span>
                  <span>₹{totalAmount.toFixed(2)}</span>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-3">0% GST on fresh produce</p>
              <Link to="/cart" className="block w-full mt-4 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 text-center text-sm">
                Edit Cart
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
