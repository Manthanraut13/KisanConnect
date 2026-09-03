import AdminSidebar from './AdminSidebar';
import { useAuthStore } from '../../stores/authStore';

const AdminLayout = ({ children, pageTitle }) => {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden ml-60">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
          <h1 className="text-xl font-semibold text-gray-800">{pageTitle}</h1>
          <div className="text-sm text-gray-600">
            {user?.full_name || user?.name || 'Admin'}
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
