import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  MessageSquare,
  BarChart2,
  LogOut,
  Sprout,
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/admin' },
  { label: 'Users', icon: Users, to: '/admin/users' },
  { label: 'Orders', icon: ShoppingBag, to: '/admin/orders' },
  { label: 'Grievances', icon: MessageSquare, to: '/admin/grievances' },
  { label: 'Analytics', icon: BarChart2, to: '/admin/analytics' },
];

const AdminSidebar = () => {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-kisan-900 text-white flex flex-col">
      <div className="flex items-center gap-2 px-5 py-5 border-b border-white/10">
        <Sprout className="h-8 w-8 text-kisan-300" />
        <div>
          <p className="font-bold leading-tight">Kisan Connect</p>
          <span className="text-xs uppercase tracking-wide text-kisan-300">Admin</span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ label, icon: Icon, to }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/admin'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-colors ${
                isActive ? 'bg-kisan-700 text-white' : 'hover:bg-kisan-800'
              }`
            }
          >
            <Icon className="h-5 w-5" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-3 w-full rounded-lg text-sm hover:bg-kisan-800 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
