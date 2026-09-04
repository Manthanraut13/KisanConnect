import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  MessageSquare,
  BarChart2,
  LogOut,
  Sprout,
  X,
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/admin' },
  { label: 'Users', icon: Users, to: '/admin/users' },
  { label: 'Orders', icon: ShoppingBag, to: '/admin/orders' },
  { label: 'Grievances', icon: MessageSquare, to: '/admin/grievances' },
  { label: 'Analytics', icon: BarChart2, to: '/admin/analytics' },
];

const SidebarContent = ({ collapsed = false, onNavigate }) => {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    logout();
    navigate('/login');
    if (onNavigate) onNavigate();
  };

  return (
    <div className="flex flex-col h-full bg-kisan-900 text-white">
      <div className={`flex items-center gap-2 px-5 py-5 border-b border-white/10 ${collapsed ? 'justify-center px-3' : ''}`}>
        <Sprout className="h-8 w-8 text-kisan-300 shrink-0" />
        {!collapsed && (
          <div>
            <p className="font-bold leading-tight">Kisan Connect</p>
            <span className="text-xs uppercase tracking-wide text-kisan-300">Admin</span>
          </div>
        )}
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(({ label, icon: Icon, to }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/admin'}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg text-sm transition-colors ${
                collapsed ? 'justify-center px-2 py-3' : 'px-3 py-3'
              } ${isActive ? 'bg-kisan-700 text-white' : 'hover:bg-kisan-800'}`
            }
            title={collapsed ? label : undefined}
          >
            <Icon className="h-5 w-5 shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-white/10">
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 w-full rounded-lg text-sm hover:bg-kisan-800 transition-colors ${
            collapsed ? 'justify-center px-2 py-3' : 'px-3 py-3'
          }`}
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
};

const AdminSidebar = ({ collapsed = false, mobileOpen = false, onNavigate = null }) => {
  return (
    <>
      {/* Desktop sidebar: fixed, collapsible width */}
      <aside
        className={`hidden lg:block fixed left-0 top-0 h-screen bg-kisan-900 transition-all duration-300 z-40 ${
          collapsed ? 'w-16' : 'w-60'
        }`}
      >
        <SidebarContent collapsed={collapsed} onNavigate={onNavigate} />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={onNavigate}
          />
          <aside className="absolute left-0 top-0 h-full w-64 bg-kisan-900 shadow-xl">
            <button
              onClick={onNavigate}
              className="absolute top-4 right-4 text-white/70 hover:text-white"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
            <SidebarContent onNavigate={onNavigate} />
          </aside>
        </div>
      )}
    </>
  );
};

export default AdminSidebar;
