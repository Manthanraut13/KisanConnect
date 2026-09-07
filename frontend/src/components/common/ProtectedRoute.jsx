import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

// Where each logged-in role should be redirected when hitting a route they can't access
const roleHome = {
  admin: '/admin',
  logistics: '/driver',
  farmer: '/farmer/dashboard',
  consumer: '/marketplace',
  bulk_buyer: '/marketplace',
};

/**
 * ProtectedRoute - Guards routes behind authentication + role checks.
 * Props: { roles: string[] } - only allow these roles through.
 */
const ProtectedRoute = ({ roles }) => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && user && !roles.includes(user.role)) {
    // Logged in but wrong role — send to their own home
    const fallback = roleHome[user.role] || '/';
    return <Navigate to={fallback} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
