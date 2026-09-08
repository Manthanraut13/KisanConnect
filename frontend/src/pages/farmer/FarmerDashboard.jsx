import { useEffect, useState, useCallback } from 'react';
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
import { logger } from '../../lib/logger';

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
  const [farmerData, setFarmerData] = useState(null);
  const [summary, setSummary] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [myListings, setMyListings] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async (full) => {
    try {
      const [meRes, dashboardRes, listingsRes, ordersRes] = await Promise.all([
        api.get('/api/users/me'),
        api.get('/api/users/me/dashboard'),
        api.get('/api/listings/farmer/mine?limit=50'),
        api.get('/api/orders?limit=5'),
      ]);

      const me = meRes.data ?? meRes;
      setFarmerData(me);

      const dash = dashboardRes.data ?? dashboardRes;
      const sum = dash.summary ?? dash.data?.summary ?? null;
      setSummary(sum);

      const listingsData = listingsRes.data ?? listingsRes;
      const listingsArr =
        listingsData.listings ?? listingsData.items ?? listingsData.results ?? listingsData.data ?? [];
      setMyListings(listingsArr);

      const ordersData = ordersRes.data ?? ordersRes;
      const recentOrdersData = ordersData.orders ?? ordersData.items ?? ordersData.results ?? ordersData.data ?? [];
      setRecentOrders(recentOrdersData.slice(0, 5));

      if (full) {
        const primaryCrop = listingsArr[0]?.crop_name;
        const profile = me.farmerProfile || {};
        if (primaryCrop) {
          try {
            const forecastRes = await api.post('/ai/forecast/demand', {
              crop_name: primaryCrop,
              district: profile.district,
              forecast_days: 7,
            });
            setForecastData(forecastRes.data ?? forecastRes);
          } catch {
            setForecastData(null);
          }
        }
      }

      logger.info('FARMER_DASHBOARD', 'Dashboard loaded', {
        farmerName: me.full_name,
        summary: sum,
        recentOrders: recentOrdersData.length,
      });
    } catch (err) {
      logger.error('FARMER_DASHBOARD', 'Failed to load dashboard', err);
      toast.error('Could not load dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    load(true);
    const timer = setInterval(() => load(false), 45000);
    return () => clearInterval(timer);
  }, [load]);

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
          value={loading && !summary ? '...' : `₹${Number(summary?.total_earnings ?? 0).toLocaleString('en-IN')}`}
          sub={summary ? `${summary.total_sold_kg ?? 0} kg sold · ${summary.delivered_orders ?? 0} delivered` : undefined}
        />
        <StatCard
          hindi="सक्रिय सूचियाँ"
          title="Active Listings"
          value={loading && !summary ? '...' : summary?.active_listings ?? 0}
          sub={summary ? `${summary.available_stock_kg ?? 0} kg available now` : undefined}
        />
        <StatCard
          hindi="लंबित ऑर्डर"
          title="Pending Orders"
          value={loading && !summary ? '...' : (summary?.pending_orders ?? 0) + (summary?.packed_orders ?? 0)}
          sub={summary ? `₹${Number(summary?.pending_earnings ?? 0).toLocaleString('en-IN')} yet to settle` : undefined}
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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Button onClick={() => navigate('/farmer/listings/new')}>
          <Plus /> Add New Listing
        </Button>
        <Button variant="outline" onClick={() => navigate('/farmer/listings')}>
          <Package /> View All Listings
        </Button>
        <Button variant="outline" onClick={() => navigate('/farmer/orders')}>
          <Package /> View All Orders
        </Button>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>My Listings</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/farmer/listings')}
            className="text-green-700 hover:bg-green-50"
          >
            <ArrowRight className="h-4 w-4" /> View All
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {myListings.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">You have no listings yet</p>
              <Button onClick={() => navigate('/farmer/listings/new')}>
                <Plus /> Create Your First Listing
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Crop</TableHead>
                  <TableHead>Price/kg</TableHead>
                  <TableHead>Available</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myListings.map((listing) => (
                  <TableRow key={listing.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {listing.images?.[0] ? (
                          <img
                            src={listing.images[0]}
                            alt={listing.crop_name}
                            className="h-10 w-10 rounded object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded bg-green-100 flex items-center justify-center text-green-700">
                            <Package className="h-5 w-5" />
                          </div>
                        )}
                        <span className="font-medium">{listing.crop_name}</span>
                      </div>
                    </TableCell>
                    <TableCell>₹{listing.price_per_kg}/kg</TableCell>
                    <TableCell>{listing.available_kg} kg</TableCell>
                    <TableCell>
                      {listing.quality_grade && (
                        <Badge variant="outline">{listing.quality_grade}</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          listing.is_active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-200 text-gray-600'
                        }
                      >
                        {listing.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

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
                    <TableCell>{order.items?.[0]?.crop_name || order.crop_name || '-'}</TableCell>
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