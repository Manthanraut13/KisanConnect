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

const INDIA_DISTRICTS = {
  'Ahmednagar': 'Maharashtra', 'Akola': 'Maharashtra', 'Amravati': 'Maharashtra', 'Aurangabad': 'Maharashtra',
  'Beed': 'Maharashtra', 'Bhandara': 'Maharashtra', 'Buldhana': 'Maharashtra', 'Chandrapur': 'Maharashtra',
  'Dhule': 'Maharashtra', 'Gadchiroli': 'Maharashtra', 'Gondia': 'Maharashtra', 'Hingoli': 'Maharashtra',
  'Jalgaon': 'Maharashtra', 'Jalna': 'Maharashtra', 'Kolhapur': 'Maharashtra', 'Latur': 'Maharashtra',
  'Mumbai City': 'Maharashtra', 'Mumbai Suburban': 'Maharashtra', 'Nagpur': 'Maharashtra', 'Nanded': 'Maharashtra',
  'Nandurbar': 'Maharashtra', 'Nashik': 'Maharashtra', 'Osmanabad': 'Maharashtra', 'Palghar': 'Maharashtra',
  'Parbhani': 'Maharashtra', 'Pune': 'Maharashtra', 'Raigad': 'Maharashtra', 'Ratnagiri': 'Maharashtra',
  'Sangli': 'Maharashtra', 'Satara': 'Maharashtra', 'Sindhudurg': 'Maharashtra', 'Solapur': 'Maharashtra',
  'Thane': 'Maharashtra', 'Wardha': 'Maharashtra', 'Washim': 'Maharashtra', 'Yavatmal': 'Maharashtra',
  'Adilabad': 'Telangana', 'Hyderabad': 'Telangana', 'Karimnagar': 'Telangana', 'Khammam': 'Telangana',
  'Mahabubnagar': 'Telangana', 'Medak': 'Telangana', 'Nalgonda': 'Telangana', 'Nizamabad': 'Telangana',
  'Rangareddy': 'Telangana', 'Warangal': 'Telangana', 'Anantapur': 'Andhra Pradesh', 'Chittoor': 'Andhra Pradesh',
  'East Godavari': 'Andhra Pradesh', 'Guntur': 'Andhra Pradesh', 'Kadapa': 'Andhra Pradesh',
  'Krishna': 'Andhra Pradesh', 'Kurnool': 'Andhra Pradesh', 'Nellore': 'Andhra Pradesh',
  'Prakasam': 'Andhra Pradesh', 'Srikakulam': 'Andhra Pradesh', 'Visakhapatnam': 'Andhra Pradesh',
  'Vizianagaram': 'Andhra Pradesh', 'West Godavari': 'Andhra Pradesh', 'Agra': 'Uttar Pradesh',
  'Aligarh': 'Uttar Pradesh', 'Allahabad': 'Uttar Pradesh', 'Ambedkar Nagar': 'Uttar Pradesh', 'Amethi': 'Uttar Pradesh',
  'Bareilly': 'Uttar Pradesh', 'Basti': 'Uttar Pradesh', 'Bijnor': 'Uttar Pradesh', 'Budan': 'Uttar Pradesh',
  'Bulandshahr': 'Uttar Pradesh', 'Etawah': 'Uttar Pradesh', 'Faizabad': 'Uttar Pradesh', 'Firozabad': 'Uttar Pradesh',
  'Gautam Buddha Nagar': 'Uttar Pradesh', 'Ghaziabad': 'Uttar Pradesh', 'Gorakhpur': 'Uttar Pradesh',
  'Hapur': 'Uttar Pradesh', 'Hardoi': 'Uttar Pradesh', 'Jhansi': 'Uttar Pradesh', 'Kanpur': 'Uttar Pradesh',
  'Kushinagar': 'Uttar Pradesh', 'Lakhimpur Kheri': 'Uttar Pradesh', 'Lucknow': 'Uttar Pradesh',
  'Mathura': 'Uttar Pradesh', 'Meerut': 'Uttar Pradesh', 'Mirzapur': 'Uttar Pradesh', 'Moradabad': 'Uttar Pradesh',
  'Muzaffarnagar': 'Uttar Pradesh', 'Prayagraj': 'Uttar Pradesh', 'Rae Bareli': 'Uttar Pradesh',
  'Saharanpur': 'Uttar Pradesh', 'Shahjahanpur': 'Uttar Pradesh', 'Sitapur': 'Uttar Pradesh',
  'Sonbhadra': 'Uttar Pradesh', 'Sultanpur': 'Uttar Pradesh', 'Unnao': 'Uttar Pradesh',
  'Varanasi': 'Uttar Pradesh', 'Ambala': 'Haryana', 'Bhiwani': 'Haryana', 'Faridabad': 'Haryana',
  'Gurugram': 'Haryana', 'Hisar': 'Haryana', 'Jind': 'Haryana', 'Kaithal': 'Haryana', 'Karnal': 'Haryana',
  'Kurukshetra': 'Haryana', 'Mahendragarh': 'Haryana', 'Panipat': 'Haryana', 'Rohtak': 'Haryana',
  'Sirsa': 'Haryana', 'Sonipat': 'Haryana', 'Yamunanagar': 'Haryana', 'Amritsar': 'Punjab',
  'Bathinda': 'Punjab', 'Firozpur': 'Punjab', 'Gurdaspur': 'Punjab', 'Hoshiarpur': 'Punjab', 'Jalandhar': 'Punjab',
  'Kapurthala': 'Punjab', 'Ludhiana': 'Punjab', 'Moga': 'Punjab', 'Patiala': 'Punjab', 'Rupnagar': 'Punjab',
  'Sangrur': 'Punjab', 'Amritsar Sahib': 'Punjab', 'Alwar': 'Rajasthan', 'Barmer': 'Rajasthan',
  'Bharatpur': 'Rajasthan', 'Bikaner': 'Rajasthan', 'Chittorgarh': 'Rajasthan', 'Churu': 'Rajasthan',
  'Dausa': 'Rajasthan', 'Ganganagar': 'Rajasthan', 'Hanumangarh': 'Rajasthan', 'Jaipur': 'Rajasthan',
  'Jaisalmer': 'Rajasthan', 'Jalore': 'Rajasthan', 'Jhunjhunu': 'Rajasthan', 'Jodhpur': 'Rajasthan',
  'Kota': 'Rajasthan', 'Nagaur': 'Rajasthan', 'Pali': 'Rajasthan', 'Sikar': 'Rajasthan', 'Sirohi': 'Rajasthan',
  'Tonk': 'Rajasthan', 'Udaipur': 'Rajasthan', 'Ajmer': 'Rajasthan', 'Bhilwara': 'Rajasthan',
  'Banswara': 'Rajasthan', 'Ahmedabad': 'Gujarat', 'Amreli': 'Gujarat', 'Anand': 'Gujarat', 'Banaskantha': 'Gujarat',
  'Bharuch': 'Gujarat', 'Bhavnagar': 'Gujarat', 'Dahod': 'Gujarat', 'Gandhinagar': 'Gujarat', 'Jamnagar': 'Gujarat',
  'Junagadh': 'Gujarat', 'Kheda': 'Gujarat', 'Kutch': 'Gujarat', 'Mehsana': 'Gujarat', 'Narmada': 'Gujarat',
  'Navsari': 'Gujarat', 'Panchmahal': 'Gujarat', 'Patan': 'Gujarat', 'Porbandar': 'Gujarat', 'Rajkot': 'Gujarat',
  'Sabarkantha': 'Gujarat', 'Surat': 'Gujarat', 'Surendranagar': 'Gujarat', 'Tapi': 'Gujarat', 'Vadodara': 'Gujarat',
  'Valsad': 'Gujarat', 'Bengaluru Rural': 'Karnataka', 'Bengaluru Urban': 'Karnataka', 'Belgaum': 'Karnataka',
  'Bellary': 'Karnataka', 'Bidar': 'Karnataka', 'Chikmagalur': 'Karnataka', 'Chitradurga': 'Karnataka',
  'Dakshina Kannada': 'Karnataka', 'Davanagere': 'Karnataka', 'Dharwad': 'Karnataka', 'Gadag': 'Karnataka',
  'Gulbarga': 'Karnataka', 'Hassan': 'Karnataka', 'Haveri': 'Karnataka', 'Kodagu': 'Karnataka', 'Kolar': 'Karnataka',
  'Koppal': 'Karnataka', 'Mysuru': 'Karnataka', 'Raichur': 'Karnataka', 'Ramanagara': 'Karnataka',
  'Shimoga': 'Karnataka', 'Tumkur': 'Karnataka', 'Udupi': 'Karnataka', 'Uttara Kannada': 'Karnataka',
  'Vijayapura': 'Karnataka', 'Alappuzha': 'Kerala', 'Ernakulam': 'Kerala', 'Idukki': 'Kerala',
  'Kannur': 'Kerala', 'Kasaragod': 'Kerala', 'Kollam': 'Kerala', 'Kottayam': 'Kerala', 'Kozhikode': 'Kerala',
  'Malappuram': 'Kerala', 'Palakkad': 'Kerala', 'Pathanamthitta': 'Kerala', 'Thrissur': 'Kerala',
  'Thiruvananthapuram': 'Kerala', 'Wayanad': 'Kerala', 'Chennai': 'Tamil Nadu', 'Coimbatore': 'Tamil Nadu',
  'Cuddalore': 'Tamil Nadu', 'Dharmapuri': 'Tamil Nadu', 'Dindigul': 'Tamil Nadu', 'Erode': 'Tamil Nadu',
  'Kancheepuram': 'Tamil Nadu', 'Kanyakumari': 'Tamil Nadu', 'Madurai': 'Tamil Nadu', 'Nagapattinam': 'Tamil Nadu',
  'Namakkal': 'Tamil Nadu', 'Nilgiris': 'Tamil Nadu', 'Perambalur': 'Tamil Nadu', 'Pudukkottai': 'Tamil Nadu',
  'Ramanathapuram': 'Tamil Nadu', 'Salem': 'Tamil Nadu', 'Sivaganga': 'Tamil Nadu', 'Thanjavur': 'Tamil Nadu',
  'Theni': 'Tamil Nadu', 'Thoothukudi': 'Tamil Nadu', 'Tiruchirappalli': 'Tamil Nadu', 'Tirunelveli': 'Tamil Nadu',
  'Tiruppur': 'Tamil Nadu', 'Vellore': 'Tamil Nadu', 'Viluppuram': 'Tamil Nadu', 'Virudhunagar': 'Tamil Nadu',
  'Ariyalur': 'Tamil Nadu', 'Tiruvallur': 'Tamil Nadu', 'Patna': 'Bihar', 'Gaya': 'Bihar', 'Bhagalpur': 'Bihar',
  'Muzaffarpur': 'Bihar', 'Darbhanga': 'Bihar', 'Purnia': 'Bihar', 'Begusarai': 'Bihar', 'Aurangabad Bihar': 'Bihar',
  'Bhojpur': 'Bihar', 'Buxar': 'Bihar', 'Champaran East': 'Bihar', 'Champaran West': 'Bihar', 'Gopalganj': 'Bihar',
  'Jehanabad': 'Bihar', 'Kaimur': 'Bihar', 'Katihar': 'Bihar', 'Khagaria': 'Bihar', 'Kishanganj': 'Bihar',
  'Lakhisarai': 'Bihar', 'Madhepura': 'Bihar', 'Madhubani': 'Bihar', 'Munger': 'Bihar', 'Nalanda': 'Bihar',
  'Nawada': 'Bihar', 'Rohtas': 'Bihar', 'Saharsa': 'Bihar', 'Samastipur': 'Bihar', 'Saran': 'Bihar',
  'Sheikhpura': 'Bihar', 'Sheohar': 'Bihar', 'Sitamarhi': 'Bihar', 'Siwan': 'Bihar', 'Supaul': 'Bihar',
  'Vaishali': 'Bihar', 'Baleswar': 'Odisha', 'Bargarh': 'Odisha', 'Bhadrak': 'Odisha', 'Balangir': 'Odisha',
  'Cuttack': 'Odisha', 'Ganjam': 'Odisha', 'Jagatsinghpur': 'Odisha', 'Jajpur': 'Odisha', 'Jharsuguda': 'Odisha',
  'Kalahandi': 'Odisha', 'Kendrapara': 'Odisha', 'Keonjhar': 'Odisha', 'Khordha': 'Odisha', 'Koraput': 'Odisha',
  'Malkangiri': 'Odisha', 'Mayurbhanj': 'Odisha', 'Nabarangpur': 'Odisha', 'Nayagarh': 'Odisha', 'Nuaapada': 'Odisha',
  'Puri': 'Odisha', 'Rayagada': 'Odisha', 'Sambalpur': 'Odisha', 'Sonepur': 'Odisha', 'Sundergarh': 'Odisha',
  'Bhopal': 'Madhya Pradesh', 'Indore': 'Madhya Pradesh', 'Gwalior': 'Madhya Pradesh', 'Jabalpur': 'Madhya Pradesh',
  'Ujjain': 'Madhya Pradesh', 'Sagar': 'Madhya Pradesh', 'Dewas': 'Madhya Pradesh', 'Satna': 'Madhya Pradesh',
  'Ratlam': 'Madhya Pradesh', 'Rewa': 'Madhya Pradesh', 'Chhindwara': 'Madhya Pradesh', 'Betul': 'Madhya Pradesh',
  'Hoshangabad': 'Madhya Pradesh', 'Katni': 'Madhya Pradesh', 'Khargone': 'Madhya Pradesh', 'Mandsaur': 'Madhya Pradesh',
  'Morena': 'Madhya Pradesh', 'Narsinghpur': 'Madhya Pradesh', 'Neemuch': 'Madhya Pradesh', 'Panna': 'Madhya Pradesh',
  'Raipur': 'Chhattisgarh', 'Bilaspur': 'Chhattisgarh', 'Durg': 'Chhattisgarh', 'Rajnandgaon': 'Chhattisgarh',
  'Korba': 'Chhattisgarh', 'Jagdalpur': 'Chhattisgarh', 'Ambikapur': 'Chhattisgarh', 'Bhatapara': 'Chhattisgarh',
  'Dehradun': 'Uttarakhand', 'Haridwar': 'Uttarakhand', 'Nainital': 'Uttarakhand', 'Almora': 'Uttarakhand',
  'Pauri Garhwal': 'Uttarakhand', 'Tehri Garhwal': 'Uttarakhand', 'Udham Singh Nagar': 'Uttarakhand',
  'Shimla': 'Himachal Pradesh', 'Kangra': 'Himachal Pradesh', 'Kullu': 'Himachal Pradesh', 'Mandi': 'Himachal Pradesh',
  'Solan': 'Himachal Pradesh', 'Una': 'Himachal Pradesh', 'Hamirpur': 'Himachal Pradesh',
  'Jammu': 'Jammu and Kashmir', 'Srinagar': 'Jammu and Kashmir', 'Anantnag': 'Jammu and Kashmir',
  'Baramulla': 'Jammu and Kashmir', 'Pulwama': 'Jammu and Kashmir', 'Kathua': 'Jammu and Kashmir',
  'Udhampur': 'Jammu and Kashmir', 'Kupwara': 'Jammu and Kashmir', 'Shopian': 'Jammu and Kashmir',
  'Darjeeling': 'West Bengal', 'Kolkata': 'West Bengal', 'Howrah': 'West Bengal', 'Hooghly': 'West Bengal',
  'North 24 Parganas': 'West Bengal', 'South 24 Parganas': 'West Bengal', 'Bardhaman': 'West Bengal',
  'Maldah': 'West Bengal', 'Murshidabad': 'West Bengal', 'Nadia': 'West Bengal', 'Birbhum': 'West Bengal',
  'Bankura': 'West Bengal', 'Purulia': 'West Bengal', 'Cooch Behar': 'West Bengal', 'Jalpaiguri': 'West Bengal',
  'Guwahati': 'Assam', 'Nagaon': 'Assam', 'Dibrugarh': 'Assam', 'Silchar': 'Assam', 'Jorhat': 'Assam',
  'Tezpur': 'Assam', 'Kokrajhar': 'Assam', 'Bongaigaon': 'Assam', 'Dispur': 'Assam',
  'Thiruvananthapuram Taluk': 'Kerala',
};

const stateOptions = [...new Set(Object.values(INDIA_DISTRICTS))].sort();

const Checkout = () => {
  const { items, totalAmount, clearCart, subtotal, deliveryCharge } = useCartStore();
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
      if (name === 'district' && INDIA_DISTRICTS[value]) {
        next.state = INDIA_DISTRICTS[value];
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

    if (!formData.full_name || !formData.full_address || !formData.district || !formData.state || !formData.pin_code) {
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
        formData.delivery_slot || null
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
                    <input list="india-districts" type="text" name="district" value={formData.district} onChange={handleChange} required className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-600" placeholder="Start typing your district" />
                    <datalist id="india-districts">
                      {Object.keys(INDIA_DISTRICTS).map((d) => (
                        <option key={d} value={d} />
                      ))}
                    </datalist>
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">State *</label>
                    <input list="india-states" type="text" name="state" value={formData.state} onChange={handleChange} required className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-600" placeholder="Auto-filled or type" />
                    <datalist id="india-states">
                      {stateOptions.map((s) => (
                        <option key={s} value={s} />
                      ))}
                    </datalist>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 mb-1">PIN Code *</label>
                    <input type="text" name="pin_code" value={formData.pin_code} onChange={handleChange} required maxLength={6} pattern="\d{6}" className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-600" />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">Delivery Date</label>
                    <input type="date" name="delivery_slot" value={formData.delivery_slot} onChange={handleChange} min={minDate} className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-600" />
                    <p className="text-xs text-gray-400 mt-1">Optional — leave blank for ASAP delivery</p>
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
                  <span>₹{deliveryCharge.toFixed(2)}</span>
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
