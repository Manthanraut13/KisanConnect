import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Package, ArrowRight } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { toast } from 'sonner';
import api from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';

function StatCard({ title, hindi, value, sub }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="font-hindi text-gray-700">{hindi}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm text-gray-500">{title}</p>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      </CardContent>
    </Card>
  );
}

function ForecastTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  const point = payload[0]?.payload;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm px-3 py-2 text-sm">
      <p className="font-medium">Date: {label}</p>
      {point && (
        <>
          <p>Predicted Price: ₹{point.predicted_price}</p>
          {point.range && <p className="text-gray-600">Range: {point.range}</p>}
        </>
      )}
    </div>
  );
}

export default function FarmerDashboard() {
  const navigate = useNavigate();
  const [farmerData, setFarmerData] = useState({
  full_name: "Ramesh Patil",
  farmerProfile: {
    total_earnings: 48500,
    district: "Nashik",
  },
});

const [forecastData, setForecastData] = useState({
  forecast: [
    { date: "2026-09-01", predicted_price: 22.5, lower_bound: 18.0, upper_bound: 27.0 },
    { date: "2026-09-02", predicted_price: 23.1, lower_bound: 18.5, upper_bound: 27.8 },
    { date: "2026-09-03", predicted_price: 21.8, lower_bound: 17.2, upper_bound: 26.4 },
    { date: "2026-09-04", predicted_price: 24.0, lower_bound: 19.1, upper_bound: 28.9 },
    { date: "2026-09-05", predicted_price: 25.2, lower_bound: 20.0, upper_bound: 30.4 },
    { date: "2026-09-06", predicted_price: 23.8, lower_bound: 18.9, upper_bound: 28.7 },
    { date: "2026-09-07", predicted_price: 22.1, lower_bound: 17.6, upper_bound: 26.6 },
  ],
  advisory: "Tomato prices expected to rise 12% this week in Nashik. Good time to sell.",
});

const [recentOrders, setRecentOrders] = useState([
  { id: "ORD001", crop_name: "Tomato", buyer_name: "Fresh Mart", amount: 4400, status: "pending" },
  { id: "ORD002", crop_name: "Onion", buyer_name: "City Traders", amount: 1800, status: "completed" },
]);

const [loading, setLoading] = useState(false);
const [activeListings, setActiveListings] = useState(1);

  /*useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const meRes = await api.get('/api/users/me');
        if (cancelled) return;
        const me = meRes.data ?? meRes;
        const profile = me.farmerProfile || {};
        setFarmerData(me);

        const [listingsRes, ordersRes] = await Promise.all([
          api.get('/api/listings/farmer/mine?limit=1'),
          api.get('/api/orders?limit=3'),
        ]);
        if (cancelled) return;

        const listingsData = listingsRes.data ?? listingsRes;
        const listingsArr =
          listingsData.listings ?? listingsData.items ?? listingsData.results ?? listingsData.data ?? [];
        setActiveListings(
          (listingsData.total ?? listingsData.totalCount ?? listingsArr.length) || 0
        );
        const primaryCrop = listingsArr[0]?.crop_name;

        const ordersData = ordersRes.data ?? ordersRes;
        setRecentOrders(
          ordersData.orders ?? ordersData.items ?? ordersData.results ?? ordersData.data ?? []
        );

        if (primaryCrop) {
          try {
            const forecastRes = await api.post('/ai/forecast/demand', {
              crop_name: primaryCrop,
              district: profile.district,
              forecast_days: 7,
            });
            if (!cancelled) setForecastData(forecastRes.data ?? forecastRes);
          } catch {
            if (!cancelled) setForecastData(null);
          }
        }
      } catch {
        if (!cancelled) toast.error('Could not load dashboard');
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);*/

  const profile = farmerData?.farmerProfile || {};
  const fullName = farmerData?.full_name || farmerData?.name || 'Farmer';
  const forecast = Array.isArray(forecastData?.forecast) ? forecastData.forecast : [];

  return (
    <div className="p-6 space-y-6">
      <h1 className="font-hindi text-2xl text-green-800">
        नमस्ते, {fullName}!🌾
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          hindi="कुल कमाई"
          title="Total Earnings"
          value={`₹${profile.total_earnings ?? 0}`}
        />
        <StatCard
          hindi="सक्रिय सूचियाँ"
          title="Active Listings"
          value={activeListings}
        />
        <StatCard
          hindi="लंबित ऑर्डर"
          title="Pending Orders"
          value={recentOrders.filter((o) => o.status === 'pending').length}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>7-Day Demand Forecast</CardTitle>
        </CardHeader>
        <CardContent>
          {forecast.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={forecast} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis dataKey="predicted_price" />
                <Tooltip content={<ForecastTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="predicted_price"
                  name="Predicted Price"
                  stroke="#2D7A2D"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 py-8 text-center">
              {farmerData ? 'No forecast available' : 'Loading...'}
            </p>
          )}

          {forecastData?.advisory && (
            <div className="mt-4 bg-green-50 border border-green-200 text-green-900 rounded-lg px-4 py-3">
              {forecastData.advisory}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Button onClick={() => navigate('/farmer/listings/new')}>
          <Plus /> Add New Listing
        </Button>
        <Button variant="outline" onClick={() => navigate('/farmer/orders')}>
          <Package /> View All Orders
        </Button>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {recentOrders.length === 0 ? (
            <p className="text-gray-500 py-8 text-center">No recent orders</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Crop</TableHead>
                  <TableHead>Buyer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-xs">
                      {(order.id || '').slice(0, 8)}
                    </TableCell>
                    <TableCell>{order.crop_name || order.crop || '-'}</TableCell>
                    <TableCell>{order.buyer_name || order.buyer?.full_name || '-'}</TableCell>
                    <TableCell>₹{order.amount ?? order.total ?? 0}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          order.status === 'delivered'
                            ? 'bg-green-100 text-green-700'
                            : order.status === 'pending'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-gray-200 text-gray-600'
                        }
                      >
                        {order.status || '-'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}