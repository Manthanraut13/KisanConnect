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
import { useEffect, useState } from 'react';
import { IndianRupee, CalendarDays, MapPin } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminService, getResponseData } from '../../services/admin.service';

const emptyAnalytics = {
  avgOrderValue: 0,
  ordersThisMonth: 0,
  activeDistricts: 0,
  topCrops: [],
  dailyOrders: [],
};

const Analytics = () => {
  const [analytics, setAnalytics] = useState(emptyAnalytics);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const response = await adminService.getAnalytics();
        const data = getResponseData(response) || {};
        if (!cancelled) {
          setAnalytics({
            avgOrderValue: data.avgOrderValue ?? data.avg_order_value ?? 0,
            ordersThisMonth: data.ordersThisMonth ?? data.orders_this_month ?? 0,
            activeDistricts: data.activeDistricts ?? data.active_districts ?? 0,
            topCrops: data.topCrops || data.top_crops || [],
            dailyOrders: data.dailyOrders || data.daily_orders || [],
          });
        }
      } catch (err) {
        if (!cancelled) setError('Could not load analytics.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    const interval = setInterval(load, 30000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return (
    <AdminLayout pageTitle="Analytics">
      {loading && <p className="text-on-surface-variant mb-6">Loading...</p>}
      {error && <p className="mb-6 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-800">{error}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-outline-variant/60 p-5">
          <div className="flex items-center gap-3">
            <IndianRupee className="h-6 w-6 text-kisan-700" />
            <div>
              <p className="text-sm text-on-surface-variant">Avg Order Value</p>
              <p className="text-2xl font-bold">₹{analytics.avgOrderValue}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-outline-variant/60 p-5">
          <div className="flex items-center gap-3">
            <CalendarDays className="h-6 w-6 text-kisan-700" />
            <div>
              <p className="text-sm text-on-surface-variant">Orders This Month</p>
              <p className="text-2xl font-bold">{analytics.ordersThisMonth}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-outline-variant/60 p-5">
          <div className="flex items-center gap-3">
            <MapPin className="h-6 w-6 text-kisan-700" />
            <div>
              <p className="text-sm text-on-surface-variant">Active Districts</p>
              <p className="text-2xl font-bold">{analytics.activeDistricts}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-outline-variant/60 p-5">
          <h3 className="text-lg font-semibold mb-4">Top 5 Crops by Orders</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.topCrops} layout="vertical" margin={{ left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" />
              <YAxis type="category" dataKey="crop" width={70} />
              <Tooltip />
              <Bar dataKey="orders" fill="#00685d" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-outline-variant/60 p-5">
          <h3 className="text-lg font-semibold mb-4">Daily Orders (Last 14 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.dailyOrders}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="orders" stroke="#00685d" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Analytics;
