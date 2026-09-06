import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCartStore } from '../stores/cartStore';

const Cart = () => {
  const { items, updateQuantity, removeFromCart, clearCart, totalAmount, subtotal, deliveryCharge, gstAmount } = useCartStore();
  const [isEditing, setIsEditing] = useState(false);

  const handleQuantityChange = (listingId, newQuantity) => {
    if (newQuantity > 0) {
      updateQuantity(listingId, newQuantity);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Your Cart is Empty</h2>
            <p className="text-gray-600 mb-6">Looks like you haven't added any products to your cart yet.</p>
            <Link
              to="/"
              className="inline-block bg-kisan-700 text-white px-6 py-3 rounded-lg hover:bg-kisan-800"
            >
              Start Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Shopping Cart</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.listing_id} className="bg-white rounded-lg shadow-md p-4 flex gap-4">
                <img
                  src={item.images?.[0] || 'https://placehold.co/100'}
                  alt={item.crop_name}
                  className="w-24 h-24 object-cover rounded-md"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{item.crop_name}</h3>
                  <p className="text-gray-600 text-sm">{item.farmer_name || 'Farmer'}</p>
                  <p className="text-kisan-700 font-medium mt-1">
                    ₹{item.price_per_kg || 0} / kg
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <button
                      onClick={() => handleQuantityChange(item.listing_id, item.quantity_kg - 1)}
                      className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center hover:bg-gray-300"
                      disabled={item.quantity_kg <= 1}
                    >
                      -
                    </button>
                    <span className="w-12 text-center">{item.quantity_kg} kg</span>
                    <button
                      onClick={() => handleQuantityChange(item.listing_id, item.quantity_kg + 1)}
                      className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center hover:bg-gray-300"
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeFromCart(item.listing_id)}
                      className="ml-auto text-red-500 text-sm hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              
              <div className="space-y-2 text-gray-600 mb-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Charge</span>
                  <span>{deliveryCharge === 0 ? 'Free' : `₹${deliveryCharge}`}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST (5%)</span>
                  <span>₹{gstAmount.toFixed(2)}</span>
                </div>
              </div>

              <div className="border-t pt-4 mb-4 flex justify-between items-center">
                <span className="text-lg font-bold">Total</span>
                <span className="text-xl font-bold text-kisan-700">₹{totalAmount.toFixed(2)}</span>
              </div>

              <Link
                to="/checkout"
                className="w-full bg-kisan-700 text-white py-3 rounded-lg hover:bg-kisan-800 text-center block"
              >
                Proceed to Checkout
              </Link>

              <Link
                to="/"
                className="w-full mt-3 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 text-center block"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
