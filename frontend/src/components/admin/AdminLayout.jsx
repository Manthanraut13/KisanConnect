import { useState } from 'react';
import { Menu, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import AdminSidebar from './AdminSidebar';
import { useAuthStore } from '../../stores/authStore';

const AdminLayout = ({ children, pageTitle }) => {
  const user = useAuthStore((s) => s.user);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const desktopContentClass = collapsed ? 'lg:ml-16' : 'lg:ml-60';

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <AdminSidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onNavigate={() => setMobileOpen(false)}
      />

      <div className={`flex-1 flex flex-col overflow-hidden ${desktopContentClass}`}>
        <header className="h-16 bg-white border-b border-gray-200 flex items-center gap-4 px-4 sm:px-6 shrink-0">
          <button
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5 text-gray-700" />
          </button>
          <button
            className="hidden lg:block p-2 hover:bg-gray-100 rounded-lg"
            onClick={() => setCollapsed((c) => !c)}
            aria-label="Toggle sidebar"
          >
            {collapsed ? (
              <PanelLeftOpen className="h-5 w-5 text-gray-700" />
            ) : (
              <PanelLeftClose className="h-5 w-5 text-gray-700" />
            )}
          </button>
          <h1 className="text-xl font-semibold text-gray-800 flex-1">
            {pageTitle}
          </h1>
          <div className="text-sm text-gray-600 whitespace-nowrap">
            {user?.full_name || user?.name || 'Admin'}
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
