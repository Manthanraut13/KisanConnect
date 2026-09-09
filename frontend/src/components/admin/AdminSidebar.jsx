import { NavLink, useNavigate } from 'react-router-dom';
import { LogOut, X } from 'lucide-react';
import KisanLogo from '../brand/KisanLogo';
import { useAuthStore } from '../../stores/authStore';

const navItems = [
  { label: 'Dashboard', icon: 'dashboard', to: '/admin' },
  { label: 'Users', icon: 'group', to: '/admin/users' },
  { label: 'Orders', icon: 'orders', to: '/admin/orders' },
  { label: 'Grievances', icon: 'support_agent', to: '/admin/grievances' },
  { label: 'Analytics', icon: 'monitoring', to: '/admin/analytics' },
];

const symbol = (name, cls = '') => (
  <span className={`material-symbols ${cls}`} aria-hidden="true">{name}</span>
);

const SidebarContent = ({ collapsed = false, onNavigate }) => {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    logout();
    navigate('/login');
    if (onNavigate) onNavigate();
  };

  return (
    <div className="flex flex-col h-full bg-primary text-on-primary">
      <div className={`flex items-center gap-2.5 px-5 h-16 border-b border-on-primary/15 ${collapsed ? 'justify-center px-3' : ''}`}>
        <KisanLogo size={30} />
        {!collapsed && (
          <div className="leading-tight">
            <p className="font-bold tracking-tight">Kisan Connect</p>
            <span className="text-[0.6rem] uppercase tracking-[0.16em] text-on-primary/75">Platform Admin</span>
          </div>
        )}
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(({ label, icon, to }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/admin'}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl text-sm font-medium transition-colors ${
                collapsed ? 'justify-center px-2 py-3' : 'px-3.5 py-2.5'
              } ${isActive ? 'bg-on-primary text-primary' : 'hover:bg-on-primary/10 hover:text-on-primary'}`
            }
            title={collapsed ? label : undefined}
          >
            {symbol(icon, 'text-[20px]')}
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-on-primary/15">
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 w-full rounded-xl text-sm font-medium hover:bg-on-primary/10 transition-colors ${
            collapsed ? 'justify-center px-2 py-3' : 'px-3.5 py-2.5'
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
        className={`hidden lg:block fixed left-0 top-0 h-screen bg-primary transition-all duration-300 z-40 ${
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
          <aside className="absolute left-0 top-0 h-full w-64 bg-primary shadow-xl">
            <button
              onClick={onNavigate}
              className="absolute top-4 right-4 text-on-primary/70 hover:text-on-primary"
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