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
import { IndianRupee, CalendarDays, MapPin } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';

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
  const avgOrderValue = 214;
  const ordersThisMonth = 876;
  const activeDistricts = 28;

  return (
    <AdminLayout pageTitle="Analytics">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <IndianRupee className="h-6 w-6 text-kisan-700" />
            <div>
              <p className="text-sm text-gray-500">Avg Order Value</p>
              <p className="text-2xl font-bold">₹{avgOrderValue}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <CalendarDays className="h-6 w-6 text-kisan-700" />
            <div>
              <p className="text-sm text-gray-500">Orders This Month</p>
              <p className="text-2xl font-bold">{ordersThisMonth}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <MapPin className="h-6 w-6 text-kisan-700" />
            <div>
              <p className="text-sm text-gray-500">Active Districts</p>
              <p className="text-2xl font-bold">{activeDistricts}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-lg font-semibold mb-4">Top 5 Crops by Orders</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={mockTopCrops} layout="vertical" margin={{ left: 8 }}>
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
            <LineChart data={mockDailyOrders}>
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
