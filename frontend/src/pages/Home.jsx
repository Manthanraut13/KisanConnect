import { Link } from 'react-router-dom';
import { Sprout, Truck, Shield, TrendingUp, Users, Leaf } from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-kisan-800 via-kisan-700 to-kisan-600 text-white">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <Sprout className="h-20 w-20 mx-auto mb-6 text-kisan-200" />
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Fresh from Farm to Your Table
            </h1>
            <p className="text-xl md:text-2xl text-kisan-100 mb-8 max-w-3xl mx-auto">
              Connect directly with farmers, get fresh produce at fair prices, 
              and support sustainable agriculture with AI-powered marketplace.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="px-8 py-4 bg-white text-kisan-800 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors"
              >
                Get Started Free
              </Link>
              <Link
                to="/login"
                className="px-8 py-4 border-2 border-white text-white rounded-lg font-semibold text-lg hover:bg-white/10 transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50 to-transparent"></div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-kisan-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-kisan-700" />
              </div>
              <h3 className="text-xl font-semibold mb-2">1. Browse Fresh Produce</h3>
              <p className="text-gray-600">
                Browse listings from local farmers. Filter by category, location, or price.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-kisan-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="h-8 w-8 text-kisan-700" />
              </div>
              <h3 className="text-xl font-semibold mb-2">2. Order & Pay Securely</h3>
              <p className="text-gray-600">
                Add items to cart, checkout, and pay securely via Razorpay integration.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-kisan-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Leaf className="h-8 w-8 text-kisan-700" />
              </div>
              <h3 className="text-xl font-semibold mb-2">3. Receive Fresh Delivery</h3>
              <p className="text-gray-600">
                Get doorstep delivery within 3-5 days. Track your order in real-time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Why Choose Kisan Connect?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-green-700" />
              </div>
              <h3 className="font-semibold text-lg mb-2">No Middlemen</h3>
              <p className="text-gray-600 text-sm">
                Farmers sell directly to consumers. You get better prices, they earn more.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-blue-700" />
              </div>
              <h3 className="font-semibold text-lg mb-2">AI-Powered Pricing</h3>
              <p className="text-gray-600 text-sm">
                Smart price suggestions based on market trends, weather, and demand.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-purple-700" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Quality Guaranteed</h3>
              <p className="text-gray-600 text-sm">
                QR code traceability for every product. Track your produce from farm to table.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Truck className="h-6 w-6 text-orange-700" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Fast Delivery</h3>
              <p className="text-gray-600 text-sm">
                Reliable logistics network with real-time tracking and delivery updates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-kisan-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Shopping?</h2>
          <p className="text-xl text-kisan-100 mb-8">
            Join thousands of happy customers enjoying fresh, farm-direct produce.
          </p>
          <Link
            to="/register"
            className="inline-block px-8 py-4 bg-white text-kisan-800 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors"
          >
            Create Free Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sprout className="h-8 w-8 text-kisan-400" />
                <span className="text-xl font-bold text-white">Kisan Connect</span>
              </div>
              <p className="text-sm">
                Direct farm-to-consumer AI-powered marketplace. Empowering farmers, serving consumers.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">For Consumers</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/register" className="hover:text-white">Sign Up</Link></li>
                <li><Link to="/login" className="hover:text-white">Login</Link></li>
                <li><Link to="/orders" className="hover:text-white">Track Orders</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">For Farmers</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/register" className="hover:text-white">Sell Your Produce</Link></li>
                <li><Link to="#" className="hover:text-white">Pricing Guide</Link></li>
                <li><Link to="#" className="hover:text-white">Farmer Support</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Contact</h4>
              <ul className="space-y-2 text-sm">
                <li>support@kisanconnect.in</li>
                <li>WhatsApp: +91 98765 43210</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm">
            <p>© 2026 Kisan Connect. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;