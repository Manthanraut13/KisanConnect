import { Link } from 'react-router-dom';
import { Sprout, Truck, Shield, TrendingUp, Users, Leaf } from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen bg-canvas">
      {/* Hero Section */}
      <section className="relative bg-evergreen text-canvas">
        <div className="absolute inset-0 bg-gradient-to-br from-evergreen via-evergreen to-forest"></div>
        <div className="absolute inset-0 bg-evergreen opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <Sprout className="h-20 w-20 mx-auto mb-6 text-amber" />
            <h1 className="font-serif text-4xl md:text-6xl font-bold mb-6">
              Fresh from Farm to Your Table
            </h1>
            <p className="text-xl md:text-2xl text-canvas/85 mb-8 max-w-3xl mx-auto">
              Connect directly with farmers, get fresh produce at fair prices, 
              and support sustainable agriculture with AI-powered marketplace.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="px-8 py-4 bg-terracotta text-canvas rounded-xl font-semibold text-lg hover:bg-terracotta-dark transition-colors"
              >
                Get Started Free
              </Link>
              <Link
                to="/login"
                className="px-8 py-4 border-2 border-canvas/40 text-canvas rounded-xl font-semibold text-lg hover:bg-canvas/10 transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-canvas to-transparent"></div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-canvas">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-3xl font-bold text-center text-evergreen mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-wash-forest rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-forest" />
              </div>
              <h3 className="font-serif text-xl font-semibold mb-2">1. Browse Fresh Produce</h3>
              <p className="text-mutedtext">
                Browse listings from local farmers. Filter by category, location, or price.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-wash-amber rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="h-8 w-8 text-amber" />
              </div>
              <h3 className="font-serif text-xl font-semibold mb-2">2. Order & Pay Securely</h3>
              <p className="text-mutedtext">
                Add items to cart, checkout, and pay securely via Razorpay integration.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-wash-terracotta rounded-full flex items-center justify-center mx-auto mb-4">
                <Leaf className="h-8 w-8 text-terracotta" />
              </div>
              <h3 className="font-serif text-xl font-semibold mb-2">3. Receive Fresh Delivery</h3>
              <p className="text-mutedtext">
                Get doorstep delivery within 3-5 days. Track your order in real-time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-sand">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-3xl font-bold text-center text-evergreen mb-12">Why Choose Kisan Connect?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white ring-1 ring-linen rounded-2xl shadow-card hover:shadow-card-hover transition-shadow p-6">
              <div className="w-12 h-12 bg-wash-forest rounded-xl flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-forest" />
              </div>
              <h3 className="font-serif text-lg font-semibold mb-2">No Middlemen</h3>
              <p className="text-mutedtext text-sm">
                Farmers sell directly to consumers. You get better prices, they earn more.
              </p>
            </div>
            <div className="bg-white ring-1 ring-linen rounded-2xl shadow-card hover:shadow-card-hover transition-shadow p-6">
              <div className="w-12 h-12 bg-wash-amber rounded-xl flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-amber" />
              </div>
              <h3 className="font-serif text-lg font-semibold mb-2">AI-Powered Pricing</h3>
              <p className="text-mutedtext text-sm">
                Smart price suggestions based on market trends, weather, and demand.
              </p>
            </div>
            <div className="bg-white ring-1 ring-linen rounded-2xl shadow-card hover:shadow-card-hover transition-shadow p-6">
              <div className="w-12 h-12 bg-wash-terracotta rounded-xl flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-terracotta" />
              </div>
              <h3 className="font-serif text-lg font-semibold mb-2">Quality Guaranteed</h3>
              <p className="text-mutedtext text-sm">
                QR code traceability for every product. Track your produce from farm to table.
              </p>
            </div>
            <div className="bg-white ring-1 ring-linen rounded-2xl shadow-card hover:shadow-card-hover transition-shadow p-6">
              <div className="w-12 h-12 bg-wash-muted rounded-xl flex items-center justify-center mb-4">
                <Truck className="h-6 w-6 text-evergreen" />
              </div>
              <h3 className="font-serif text-lg font-semibold mb-2">Fast Delivery</h3>
              <p className="text-mutedtext text-sm">
                Reliable logistics network with real-time tracking and delivery updates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-forest text-canvas">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-serif text-3xl font-bold mb-4">Ready to Start Shopping?</h2>
          <p className="text-xl text-canvas/85 mb-8">
            Join thousands of happy customers enjoying fresh, farm-direct produce.
          </p>
          <Link
            to="/register"
            className="inline-block px-8 py-4 bg-terracotta text-canvas rounded-xl font-semibold text-lg hover:bg-terracotta-dark transition-colors"
          >
            Create Free Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-evergreen text-canvas/70 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sprout className="h-8 w-8 text-amber" />
                <span className="font-serif text-xl font-bold text-canvas">Kisan Connect</span>
              </div>
              <p className="text-sm text-canvas/70">
                Direct farm-to-consumer AI-powered marketplace. Empowering farmers, serving consumers.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-canvas mb-4">For Consumers</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/register" className="hover:text-canvas">Sign Up</Link></li>
                <li><Link to="/login" className="hover:text-canvas">Login</Link></li>
                <li><Link to="/orders" className="hover:text-canvas">Track Orders</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-canvas mb-4">For Farmers</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/register" className="hover:text-canvas">Sell Your Produce</Link></li>
                <li><Link to="#" className="hover:text-canvas">Pricing Guide</Link></li>
                <li><Link to="#" className="hover:text-canvas">Farmer Support</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-canvas mb-4">Contact</h4>
              <ul className="space-y-2 text-sm">
                <li>support@kisanconnect.in</li>
                <li>WhatsApp: +91 98765 43210</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-canvas/10 mt-8 pt-8 text-center text-sm">
            <p>© 2026 Kisan Connect. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;