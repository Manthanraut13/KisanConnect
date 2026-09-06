import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '../stores/cartStore';
import { toast } from 'sonner';

const Checkout = () => {
  const { items, totalAmount, clearCart } = useCartStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    mobile: '',
    email: '',
    street: '',
    city: '',
    state: '',
    pin_code: '',
  });
  const [loadingRazorpay, setLoadingRazorpay] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
    }
  }, [items, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    if (!formData.full_name || !formData.street || !formData.pin_code) {
      toast.error('Please fill all required address fields');
      return;
    }

    setLoadingRazorpay(true);
    toast.info('Initializing payment...');

    try {
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        toast.error('Razorpay SDK failed to load. Check your internet connection.');
        setLoadingRazorpay(false);
        return;
      }

      // Step 1: Create order with backend
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/payments/razorpay/order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          amount: totalAmount * 100, // Razorpay expects amount in paise
          currency: 'INR',
          receipt: `order_${Date.now()}`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Payment order creation failed');
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency,
        name: 'Kisan Connect',
        description: 'Farm to Consumer Marketplace',
        image: { logo: { url: 'https://placehold.co/100' } },
        order_id: data.order_id,
        callback_url: `${import.meta.env.VITE_API_URL}/api/payments/razorpay/callback`,
        prefill: {
          name: formData.full_name,
          email: formData.email,
          contact: formData.mobile,
        },
        theme: {
          color: '#0f766e',
        },
        modal: {
          ondismiss: () => {
            setLoadingRazorpay(false);
            toast.info('Payment cancelled');
          },
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();
      setLoadingRazorpay(false);

      razorpayInstance.on('payment.failed', (response) => {
        toast.error(`Payment failed: ${response.error.description}`);
      });
    } catch (error) {
      toast.error(error.message || 'Payment initialization failed');
      setLoadingRazorpay(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Create order first
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          items: items.map(item => ({
            listing_id: item.listing_id,
            quantity_kg: item.quantity_kg,
          })),
          delivery_address: {
            street: formData.street,
            city: formData.city,
            state: formData.state,
            pin_code: formData.pin_code,
            latitude: 0,
            longitude: 0,
          },
          delivery_slot: null,
          notes: '',
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Order creation failed');
      }

      clearCart();
      navigate(`/order-success/${result.data.order_id}`);
    } catch (error) {
      toast.error(error.message || 'Order creation failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Delivery Address Form */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">Delivery Address</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-kisan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">Mobile</label>
                    <input
                      type="text"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleChange}
                      required
                      maxLength={10}
                      className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-kisan-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-kisan-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-1">Street Address</label>
                  <input
                    type="text"
                    name="street"
                    value={formData.street}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-kisan-500"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-gray-700 mb-1">City</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-kisan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">State</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-kisan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">Pin Code</label>
                    <input
                      type="text"
                      name="pin_code"
                      value={formData.pin_code}
                      onChange={handleChange}
                      required
                      maxLength={6}
                      className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-kisan-500"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isProcessing || items.length === 0}
                  className="w-full bg-kisan-700 text-white py-3 rounded-lg hover:bg-kisan-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isProcessing ? 'Processing...' : 'Place Order'}
                </button>
              </form>
            </div>

            {/* Payment Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Payment Options</h2>
              <div className="flex flex-col gap-3">
                <button
                  onClick={handlePayment}
                  disabled={loadingRazorpay || items.length === 0}
                  className="w-full border border-gray-300 rounded-lg p-4 flex items-center gap-4 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <img
                    src="https://razorpay.com/favicon.ico"
                    alt="Razorpay"
                    className="w-8 h-8"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold">Pay with Razorpay</h3>
                    <p className="text-sm text-gray-600">
                      Credit Card, Debit Card, UPI, Net Banking, Wallets
                    </p>
                  </div>
                  <div className="font-bold text-lg">₹{totalAmount}</div>
                </button>
              </div>
              {loadingRazorpay && (
                <div className="mt-4 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-kisan-700 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Redirecting to Razorpay...</p>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.listing_id} className="flex justify-between text-sm">
                    <span className="max-w-[200px] truncate">{item.crop_name}</span>
                    <span>{item.quantity_kg}kg × ₹{item.price_per_kg} = ₹{item.total_price || (item.price_per_kg * item.quantity_kg)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>₹{useCartStore.getState().subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery</span>
                  <span>{useCartStore.getState().deliveryCharge === 0 ? 'Free' : `₹${useCartStore.getState().deliveryCharge}`}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">GST (5%)</span>
                  <span>₹{useCartStore.getState().gstAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2">
                  <span>Total</span>
                  <span>₹{totalAmount.toFixed(2)}</span>
                </div>
              </div>
              <Link
                to="/cart"
                className="block w-full mt-4 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 text-center text-sm"
              >
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
