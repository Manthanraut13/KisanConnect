import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import NotFound from './pages/NotFound';
import Marketplace from './pages/Marketplace';
import ProductDetail from './pages/ProductDetail';
import MyListings from './pages/farmer/MyListings';
import FarmerDashboard from './pages/farmer/FarmerDashboard';
import CreateListing from './pages/farmer/CreateListing';
import ConsumerLayout from './components/ConsumerLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import AdminOrders from './pages/admin/AdminOrders';
import Grievances from './pages/admin/Grievances';
import Analytics from './pages/admin/Analytics';
import DriverDashboard from './pages/driver/DriverDashboard';
import ActiveDelivery from './pages/driver/ActiveDelivery';
import ProtectedRoute from './components/common/ProtectedRoute';
import ChatbotWidget from './components/chatbot/ChatbotWidget';

const App = () => {
  return (
    <>
      <Routes>
        {/* Auth pages — standalone, no navbar */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Public pages with Navbar */}
        <Route element={<ConsumerLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/marketplace/:id" element={<ProductDetail />} />
        </Route>

        {/* Consumer shopping (requires consumer/farmer/bulk_buyer login) */}
        <Route element={<ConsumerLayout />}>
          <Route element={<ProtectedRoute roles={['consumer', 'farmer', 'bulk_buyer']} />}>
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-success/:id" element={<OrderSuccess />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/orders/:id" element={<OrderDetail />} />
          </Route>
        </Route>

        {/* Farmer portal (requires farmer/fpo_admin login) */}
        <Route element={<ConsumerLayout />}>
          <Route element={<ProtectedRoute roles={['farmer', 'fpo_admin']} />}>
            <Route path="/farmer/dashboard" element={<FarmerDashboard />} />
            <Route path="/farmer/listings" element={<MyListings />} />
            <Route path="/farmer/listings/new" element={<CreateListing />} />
          </Route>
        </Route>

        {/* Admin dashboard (admin only) */}
        <Route element={<ProtectedRoute roles={['admin']} />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/grievances" element={<Grievances />} />
          <Route path="/admin/analytics" element={<Analytics />} />
        </Route>

        {/* Driver portal (logistics only) */}
        <Route element={<ConsumerLayout />}>
          <Route element={<ProtectedRoute roles={['logistics']} />}>
            <Route path="/driver" element={<DriverDashboard />} />
            <Route path="/driver/delivery/:id" element={<ActiveDelivery />} />
          </Route>
        </Route>

        {/* 404 catch-all */}
        <Route element={<ConsumerLayout />}>
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
      <ChatbotWidget />
    </>
  );
};

export default App;