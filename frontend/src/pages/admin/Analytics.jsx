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

const mockTopCrops = [
  { crop: 'Tomato', orders: 145 },
  { crop: 'Onion', orders: 120 },
  { crop: 'Potato', orders: 98 },
  { crop: 'Rice', orders: 87 },
  { crop: 'Banana', orders: 76 },
];

const mockDailyOrders = Array.from({ length: 14 }, (_, i) => {
  const d = new Date(2026, 7, 13 + i);
  return {
    date: `${d.getDate()} ${d.toLocaleString('en', { month: 'short' })}`,
    orders: 8 + ((i * 7) % 22) + (i % 4),
  };
});

const Analytics = () => {
  const [analytics, setAnalytics] = useState({
    avgOrderValue: 214,
    ordersThisMonth: 876,
    activeDistricts: 28,
    topCrops: mockTopCrops,
    dailyOrders: mockDailyOrders,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const response = await adminService.getAnalytics();
        const data = getResponseData(response) || {};
        setAnalytics((current) => ({
          ...current,
          ...data,
          avgOrderValue: data.avgOrderValue ?? data.avg_order_value ?? current.avgOrderValue,
          ordersThisMonth: data.ordersThisMonth ?? data.orders_this_month ?? current.ordersThisMonth,
          activeDistricts: data.activeDistricts ?? data.active_districts ?? current.activeDistricts,
          topCrops: data.topCrops || data.top_crops || current.topCrops,
          dailyOrders: data.dailyOrders || data.daily_orders || current.dailyOrders,
        }));
      } catch (err) {
        setError('Could not load live analytics. Showing demo data.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <AdminLayout pageTitle="Analytics">
      {loading && <p className="text-gray-500 mb-6">Loading...</p>}
      {error && <p className="mb-6 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">{error}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <IndianRupee className="h-6 w-6 text-kisan-700" />
            <div>
              <p className="text-sm text-gray-500">Avg Order Value</p>
              <p className="text-2xl font-bold">₹{analytics.avgOrderValue}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <CalendarDays className="h-6 w-6 text-kisan-700" />
            <div>
              <p className="text-sm text-gray-500">Orders This Month</p>
              <p className="text-2xl font-bold">{analytics.ordersThisMonth}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <MapPin className="h-6 w-6 text-kisan-700" />
            <div>
              <p className="text-sm text-gray-500">Active Districts</p>
              <p className="text-2xl font-bold">{analytics.activeDistricts}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-lg font-semibold mb-4">Top 5 Crops by Orders</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.topCrops} layout="vertical" margin={{ left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" />
              <YAxis type="category" dataKey="crop" width={70} />
              <Tooltip />
              <Bar dataKey="orders" fill="#2D7A2D" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-lg font-semibold mb-4">Daily Orders (Last 14 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.dailyOrders}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="orders" stroke="#2D7A2D" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Analytics;
