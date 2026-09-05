import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Package,
  ShoppingBag,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import AdminLayout from '../../components/admin/AdminLayout';
import StatCard from '../../components/admin/StatCard';
import { adminService } from '../../services/admin.service';

const mockStats = {
  totalUsers: 1247,
  totalFarmers: 342,
  totalOrders: 876,
  totalListings: 519,
  gmv: 2847500,
};

const mockGrievances = [
  { id: 'grievance-uuid-0001', user: { full_name: 'Priya Sharma' }, category: 'payment', severity: 'high', description: 'Payment was deducted but order not confirmed.', status: 'open', sla_deadline: '2026-09-03' },
  { id: 'grievance-uuid-0002', user: { full_name: 'Ramesh Patil' }, category: 'logistics', severity: 'medium', description: 'Driver did not arrive for pickup.', status: 'in_progress', sla_deadline: '2026-09-05' },
  { id: 'grievance-uuid-0003', user: { full_name: 'Anita Singh' }, category: 'quality', severity: 'low', description: 'Tomatoes were slightly damaged on delivery.', status: 'resolved', sla_deadline: '2026-09-04' },
];

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const severityStyles = {
  critical: 'bg-red-100 text-red-800',
  high: 'bg-orange-100 text-orange-800',
  medium: 'bg-yellow-100 text-yellow-800',
  low: 'bg-gray-100 text-gray-700',
};

const statusStyles = {
  open: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-blue-100 text-blue-800',
  resolved: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-700',
};

const AdminDashboard = () => {
  const [stats, setStats] = useState(mockStats);
  const [recentGrievances, setRecentGrievances] = useState(mockGrievances);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const userName = (grievance) => grievance.user?.full_name || grievance.user?.name || grievance.user_name || 'Unknown user';

  const ordersChartData = days.map((day, i) => ({
    day,
    orders: 8 + ((i * 5) % 20) + (i % 3),
  }));
  const gmvChartData = days.map((day, i) => ({
    day,
    gmv: 6000 + ((i * 3200) % 14000) + (i % 4) * 500,
  }));

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, grievancesRes] = await Promise.all([
          adminService.getStats(),
          adminService.getGrievances({ limit: 5 }),
        ]);
        const liveStats = statsRes?.data?.data || statsRes?.data;
        const liveGrievances = grievancesRes?.data?.data || grievancesRes?.data;
        if (liveStats && typeof liveStats === 'object' && !Array.isArray(liveStats)) {
          setStats((current) => ({
            ...current,
            ...liveStats,
            totalUsers: liveStats.totalUsers ?? liveStats.total_users ?? current.totalUsers,
            totalListings: liveStats.totalListings ?? liveStats.total_listings ?? current.totalListings,
            totalOrders: liveStats.totalOrders ?? liveStats.total_orders ?? current.totalOrders,
            gmv: liveStats.gmv ?? liveStats.total_gmv ?? current.gmv,
          }));
        }
        if (Array.isArray(liveGrievances)) setRecentGrievances(liveGrievances);
      } catch (err) {
        setError('Could not load live dashboard data. Showing demo data.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const gmvValue = `₹${(stats.gmv || 0).toLocaleString('en-IN')}`;

  return (
    <AdminLayout pageTitle="Dashboard">
      {error && <p className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">{error}</p>}
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Total Users" value={stats.totalUsers} icon={Users} color="bg-blue-100" />
            <StatCard title="Active Listings" value={stats.totalListings} icon={Package} color="bg-green-100" />
            <StatCard title="Total Orders" value={stats.totalOrders} icon={ShoppingBag} color="bg-purple-100" />
            <StatCard title="Platform GMV" value={gmvValue} icon={TrendingUp} color="bg-amber-100" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h3 className="text-lg font-semibold mb-4">Orders This Week</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={ordersChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="orders" fill="#2D7A2D" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h3 className="text-lg font-semibold mb-4">Revenue This Week (₹)</h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={gmvChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="gmv" stroke="#2D7A2D" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Recent Grievances</h3>
              <Link to="/admin/grievances" className="text-sm text-kisan-700 hover:underline">
                View All
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b border-gray-100">
                    <th className="pb-2">User</th>
                    <th className="pb-2">Category</th>
                    <th className="pb-2">Severity</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2">SLA Deadline</th>
                    <th className="pb-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentGrievances.map((g) => {
                    const overdue =
                      g.status !== 'resolved' &&
                      g.status !== 'closed' &&
                      new Date(g.sla_deadline) < new Date();
                    return (
                      <tr key={g.id} className="border-b border-gray-50">
                        <td className="py-3">{userName(g)}</td>
                        <td className="py-3 capitalize">{g.category}</td>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded text-xs ${severityStyles[g.severity]}`}>
                            {g.severity}
                          </span>
                        </td>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded text-xs ${statusStyles[g.status]}`}>
                            {(g.status || 'open').replace('_', ' ')}
                          </span>
                        </td>
                        <td className={`py-3 ${overdue ? 'text-red-600 flex items-center gap-1' : ''}`}>
                          {g.sla_deadline}
                          {overdue && <AlertCircle className="h-4 w-4" />}
                        </td>
                        <td className="py-3">
                          <Link
                            to="/admin/grievances"
                            className="px-3 py-1 bg-kisan-700 text-white text-xs rounded hover:bg-kisan-800"
                          >
                            Resolve
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
};

export default AdminDashboard;
