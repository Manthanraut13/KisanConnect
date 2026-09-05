import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
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

        <Route element={<ProtectedRoute roles={['admin']} />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/grievances" element={<Grievances />} />
          <Route path="/admin/analytics" element={<Analytics />} />
        </Route>

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
