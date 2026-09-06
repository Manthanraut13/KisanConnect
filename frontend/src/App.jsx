import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
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
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Consumer Routes */}
        <Route element={<ProtectedRoute roles={['consumer', 'farmer', 'bulk_buyer', 'logistics']} />}>
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-success/:id" element={<OrderSuccess />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/:id" element={<OrderDetail />} />
        </Route>

        {/* Admin Routes */}
        <Route element={<ProtectedRoute roles={['admin']} />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/grievances" element={<Grievances />} />
          <Route path="/admin/analytics" element={<Analytics />} />
        </Route>

        {/* Driver Routes */}
        <Route element={<ProtectedRoute roles={['logistics']} />}>
          <Route path="/driver" element={<DriverDashboard />} />
          <Route path="/driver/delivery/:id" element={<ActiveDelivery />} />
        </Route>
      </Routes>
      <ChatbotWidget />
    </>
  );
};

export default App;
