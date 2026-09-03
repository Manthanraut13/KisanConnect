import { useEffect, useState } from 'react';
import { Search, User as UserIcon } from 'lucide-react';
import { toast } from 'sonner';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminService } from '../../services/admin.service';

const mockUsers = [
  { id: '1', full_name: 'Ramesh Patil', mobile: '9876543210', role: 'farmer', district: 'Nashik', is_active: true, email: 'ramesh@example.com' },
  { id: '2', full_name: 'Priya Sharma', mobile: '9765432109', role: 'consumer', district: 'Pune', is_active: true, email: 'priya@example.com' },
  { id: '3', full_name: 'Rajesh Kumar', mobile: '9654321098', role: 'bulk_buyer', district: 'Amritsar', is_active: false, email: 'rajesh@example.com' },
  { id: '4', full_name: 'Sunita Devi', mobile: '9543210987', role: 'logistics', district: 'Nagpur', is_active: true, email: 'sunita@example.com' },
];

const roleStyles = {
  farmer: 'bg-green-100 text-green-800',
  consumer: 'bg-blue-100 text-blue-800',
  bulk_buyer: 'bg-purple-100 text-purple-800',
  logistics: 'bg-orange-100 text-orange-800',
  admin: 'bg-red-100 text-red-800',
};

const roleOptions = ['All', 'Farmer', 'Consumer', 'Bulk Buyer', 'Logistics', 'Admin'];

const UserManagement = () => {
  const [users, setUsers] = useState(mockUsers);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);

  const normRole = (r) =>
    ({ bulk_buyer: 'Bulk Buyer', farmer: 'Farmer', consumer: 'Consumer', logistics: 'Logistics', admin: 'Admin' }[r] || r);

  useEffect(() => {
    const load = async () => {
      try {
        const params = {
          page,
          limit: 20,
          search: searchQuery || undefined,
          role: roleFilter !== 'all' ? roleFilter.toLowerCase().replace(' ', '_') : undefined,
        };
        const res = await adminService.getUsers(params);
        if (res?.data?.data) setUsers(res.data.data);
      } catch (err) {
        // API not ready - keep mock data
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [page, searchQuery, roleFilter]);

  const handleToggle = async (user) => {
    const nextActive = !user.is_active;
    // Optimistic update
    setUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, is_active: nextActive } : u))
    );
    try {
      await adminService.updateUserStatus(user.id, nextActive);
      toast.success(`${user.full_name} ${nextActive ? 'activated' : 'deactivated'}`);
    } catch (err) {
      // Revert on failure
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, is_active: user.is_active } : u))
      );
      toast.error('Failed to update status');
    }
  };

  const filteredUsers = searchQuery || roleFilter !== 'all' ? users : users;

  return (
    <AdminLayout pageTitle="User Management">
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name or mobile"
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-kisan-500"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-kisan-500"
        >
          {roleOptions.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="py-3 px-4">Full Name</th>
                <th className="py-3 px-4">Mobile</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">District</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.id} className="border-b border-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      {u.profile_image ? (
                        <img src={u.profile_image} alt="" className="h-8 w-8 rounded-full object-cover" />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                          <UserIcon className="h-4 w-4 text-gray-500" />
                        </div>
                      )}
                      <span className="font-medium">{u.full_name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-500">{u.mobile}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs ${roleStyles[u.role] || roleStyles.consumer}`}>
                      {normRole(u.role)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-500">{u.district}</td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleToggle(u)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        u.is_active ? 'bg-kisan-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          u.is_active ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => setSelectedUser(u)}
                      className="px-3 py-1 border border-kisan-700 text-kisan-700 text-xs rounded hover:bg-kisan-50"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex items-center justify-between mt-4 text-sm">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="px-3 py-1 border border-gray-300 rounded disabled:opacity-40"
        >
          Previous
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={page >= totalPages}
          className="px-3 py-1 border border-gray-300 rounded disabled:opacity-40"
        >
          Next
        </button>
      </div>

      {selectedUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setSelectedUser(null)}>
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              {selectedUser.profile_image ? (
                <img src={selectedUser.profile_image} alt="" className="h-12 w-12 rounded-full object-cover" />
              ) : (
                <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                  <UserIcon className="h-6 w-6 text-gray-500" />
                </div>
              )}
              <div>
                <h3 className="font-semibold">{selectedUser.full_name}</h3>
                <span className={`px-2 py-0.5 rounded text-xs ${roleStyles[selectedUser.role] || roleStyles.consumer}`}>
                  {normRole(selectedUser.role)}
                </span>
              </div>
            </div>
            <div className="space-y-2 text-sm text-gray-700">
              <p><span className="text-gray-500">Mobile:</span> {selectedUser.mobile}</p>
              <p><span className="text-gray-500">Email:</span> {selectedUser.email || '—'}</p>
              <p><span className="text-gray-500">District:</span> {selectedUser.district || '—'}</p>
              <p><span className="text-gray-500">Status:</span> {selectedUser.is_active ? 'Active' : 'Inactive'}</p>
            </div>
            <button
              onClick={() => setSelectedUser(null)}
              className="mt-5 w-full py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default UserManagement;
