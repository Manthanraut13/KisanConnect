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
import { logger } from '../../lib/logger';

const emptyStats = {
  totalUsers: 0,
  totalFarmers: 0,
  totalOrders: 0,
  totalListings: 0,
  gmv: 0,
  todayOrders: 0,
  openGrievances: 0,
  pendingOrders: 0,
};

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
  const [stats, setStats] = useState(emptyStats);
  const [recentGrievances, setRecentGrievances] = useState([]);
  const [analytics, setAnalytics] = useState({ dailyOrders: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const userName = (grievance) => grievance.user?.full_name || grievance.user?.name || grievance.user_name || 'Unknown user';

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [statsRes, grievancesRes, analyticsRes] = await Promise.all([
          adminService.getStats(),
          adminService.getGrievances({ limit: 5 }),
          adminService.getAnalytics(),
        ]);
        if (cancelled) return;
        const liveStats = statsRes?.data?.data || statsRes?.data;
        const liveGrievances = grievancesRes?.data?.data || grievancesRes?.data;
        const liveAnalytics = analyticsRes?.data?.data || analyticsRes?.data;
        logger.info('ADMIN_DASHBOARD', 'Data loaded', { hasStats: !!liveStats, grievances: liveGrievances?.length, analytics: !!liveAnalytics });
        if (liveStats && typeof liveStats === 'object' && !Array.isArray(liveStats)) {
          setStats(liveStats);
        }
        if (Array.isArray(liveGrievances)) setRecentGrievances(liveGrievances);
        if (liveAnalytics) setAnalytics(liveAnalytics);
        setError('');
      } catch (err) {
        if (!cancelled) setError('Could not load live dashboard data.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    const interval = setInterval(load, 45000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const ordersChartData = analytics.dailyOrders.slice(-7);
  const gmvChartData = analytics.dailyOrders.slice(-7).map((d) => ({ ...d, gmv: d.gmv }));
  const gmvValue = `₹${(stats.gmv || 0).toLocaleString('en-IN')}`;

  return (
    <AdminLayout pageTitle="Dashboard">
      {error && <p className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">{error}</p>}
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard title="Total Users" value={stats.totalUsers} icon={Users} color="bg-blue-100" />
            <StatCard title="Active Listings" value={stats.totalListings} icon={Package} color="bg-green-100" />
            <StatCard title="Total Orders" value={stats.totalOrders} icon={ShoppingBag} color="bg-purple-100" />
            <StatCard title="Platform GMV" value={gmvValue} icon={TrendingUp} color="bg-amber-100" />
            <StatCard title="Orders Today" value={stats.todayOrders} icon={ShoppingBag} color="bg-teal-100" />
            <StatCard title="Open Grievances" value={stats.openGrievances} icon={AlertCircle} color="bg-rose-100" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h3 className="text-lg font-semibold mb-4">Orders (Last 7 Days)</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={ordersChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="orders" fill="#2D7A2D" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h3 className="text-lg font-semibold mb-4">Revenue (Last 7 Days, ₹)</h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={gmvChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" />
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
                      g.sla_deadline &&
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
                          {g.sla_deadline ? new Date(g.sla_deadline).toLocaleDateString('en-IN') : '—'}
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
