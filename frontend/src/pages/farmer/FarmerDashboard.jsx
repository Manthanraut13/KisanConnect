import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { toast } from 'sonner';
import api from '../../services/api';
import { logger } from '../../lib/logger';

const STATUS_TONE = {
  delivered: 'bg-primary-fixed text-on-primary-fixed',
  packed: 'bg-tertiary-fixed text-on-tertiary-fixed',
  pending: 'bg-secondary-fixed text-on-secondary-fixed',
  default: 'bg-surface-container-highest text-on-surface-variant',
};

const PHASES = [
  { label: 'Sowing', pct: 100 },
  { label: 'Growing', pct: 100 },
  { label: 'Harvest', pct: 100 },
  { label: 'Stocked', pct: 80 },
];

function StatusPill({ status }) {
  return (
    <span className={`rounded-full px-2.5 py-1 font-label-sm text-label-sm inline-block capitalize ${STATUS_TONE[status] || STATUS_TONE.default}`}>
      {status || '—'}
    </span>
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
  const [orderQuery, setOrderQuery] = useState('');

  const load = useCallback(async (full) => {
    try {
      const [meRes, dashboardRes, listingsRes, ordersRes] = await Promise.all([
        api.get('/api/users/me'),
        api.get('/api/users/me/dashboard'),
        api.get('/api/listings/farmer/mine?limit=50'),
        api.get('/api/orders?limit=50'),
      ]);

      const me = meRes.data ?? meRes;
      setFarmerData(me);

      const dash = dashboardRes.data ?? dashboardRes;
      const sum = dash.summary ?? dash.data?.summary ?? null;
      setSummary(sum);

      const listingsData = listingsRes.data ?? listingsRes;
      setMyListings(
        listingsData.listings ?? listingsData.items ?? listingsData.results ?? listingsData.data ?? []
      );

      const ordersData = ordersRes.data ?? ordersRes;
      const ordersArr = ordersData.orders ?? ordersData.items ?? ordersData.results ?? ordersData.data ?? [];
      setRecentOrders(ordersArr);

      if (full) {
        const primaryCrop = listingsData.listings?.[0]?.crop_name;
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
      logger.info('FARMER_DASHBOARD', 'Dashboard loaded', { summary: sum });
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
  const district = farmerData?.farmerProfile?.district || 'Nashik';
  const farmerId = farmerData?.farmerProfile?.id;
  const forecast = Array.isArray(forecastData?.forecast) ? forecastData.forecast : [];
  const pendingOrders = (summary?.pending_orders ?? 0) + (summary?.packed_orders ?? 0);

  // Calculate farmer's earnings from an order (sum of farmer_payout for this farmer's items)
  const getFarmerEarnings = (order) => {
    if (!farmerId || !order.items) return 0;
    return order.items
      .filter((item) => item.farmer_id === farmerId)
      .reduce((sum, item) => sum + (Number(item.farmer_payout) || 0), 0);
  };

  const filteredOrders = useMemo(() => {
    if (!orderQuery) return recentOrders.slice(0, 5);
    const q = orderQuery.toLowerCase();
    return recentOrders
      .filter(
        (o) =>
          (o.items?.[0]?.crop_name || o.crop_name || '').toLowerCase().includes(q) ||
          String(o.id || '').toLowerCase().includes(q)
      )
      .slice(0, 5);
  }, [recentOrders, orderQuery]);

  const symbol = (name, cls = '') => (
    <span className={`material-symbols ${cls}`} aria-hidden="true">{name}</span>
  );

  return (
    <div className="p-4 sm:p-6 max-w-[1600px] mx-auto">
      {loading && !farmerData ? (
        <div className="mt-6 space-y-6">
          <div className="h-52 rounded-2xl bg-surface-container-low animate-pulse" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-28 rounded-xl bg-surface-container-low animate-pulse" />
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* MAIN COLUMN */}
          <div className="lg:col-span-8 space-y-6">
            {/* OPERATIONAL HEADER CARD */}
            <div className="rounded-2xl bg-gradient-to-tr from-surface-container-lowest via-surface-container-low to-surface-container-high p-6 sm:p-8 border border-outline-variant relative overflow-hidden">
              <span className="absolute top-4 right-4 rounded-full bg-surface-container-lowest/80 backdrop-blur px-3 py-1.5 font-label-sm text-label-sm text-primary flex items-center gap-1.5">
                {symbol('verified')}
                Certified Organic Producer
              </span>
              <p className="font-label-md text-label-md text-on-surface-variant">FARMER OPERATIONS · CROP MANAGEMENT</p>
              <h1 className="mt-1 font-display-lg text-display-lg text-on-surface tracking-tight">
                नमस्ते, {fullName} <span className="text-primary">/</span> Priority Producer
              </h1>
              <p className="mt-1.5 font-body-md text-body-md text-on-surface-variant">
                Farm parcel · {district}, Maharashtra · Grades verified: 8.9/10
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <button
                  onClick={() => navigate('/farmer/listings/new')}
                  className="inline-flex items-center gap-1.5 h-10 px-4 rounded-lg bg-primary text-on-primary font-label-md text-label-md shadow-sm hover:bg-primary-container hover:text-on-primary-container transition-colors"
                >
                  {symbol('add', 'text-base')}New Crop Batch
                </button>
                <button
                  onClick={() => navigate('/farmer/listings/new')}
                  className="inline-flex items-center gap-1.5 h-10 px-4 rounded-lg bg-surface-container-lowest text-on-surface font-label-md text-label-md border border-outline-variant hover:bg-surface-container-high transition-colors"
                >
                  {symbol('storefront', 'text-base')}Create Market Listing
                </button>
                <button className="inline-flex items-center gap-1.5 h-10 px-4 rounded-lg bg-surface-container-lowest text-on-surface font-label-md text-label-md border border-outline-variant hover:bg-surface-container-high transition-colors">
                  {symbol('water_drop', 'text-base text-tertiary')}Log Irrigation
                </button>
              </div>
            </div>

            {/* STAT TILES */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="rounded-xl bg-surface-container-lowest shadow-xs border border-outline-variant p-4">
                <p className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1">
                  {symbol('storefront', 'text-sm text-primary')} Active Listings
                </p>
                <p className="mt-1 font-data-metric text-data-metric text-on-surface">
                  {summary?.active_listings ?? 0}
                </p>
                <svg viewBox="0 0 80 24" className="mt-2 w-full h-6">
                  <polyline points="0,18 16,12 32,14 48,8 64,10 80,4" fill="none" stroke="#00685d" strokeWidth="2" />
                </svg>
              </div>
              <div className="rounded-xl bg-surface-container-lowest shadow-xs border border-outline-variant p-4">
                <p className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1">
                  {symbol('inbox', 'text-sm text-tertiary')} Pending Orders
                </p>
                <p className="mt-1 font-data-metric text-data-metric text-on-surface">{pendingOrders}</p>
                <p className="mt-2 font-label-sm text-label-sm text-on-surface-variant">₹{Number(summary?.pending_earnings ?? 0).toLocaleString('en-IN')} escrow</p>
              </div>
              <div className="rounded-xl bg-surface-container-lowest shadow-xs border border-outline-variant p-4">
                <p className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1">
                  {symbol('savings', 'text-sm text-secondary')} Month-to-Date Revenue
                </p>
                <p className="mt-1 font-data-metric text-data-metric text-on-surface">
                  ₹{Number(summary?.total_earnings ?? 0).toLocaleString('en-IN')}
                </p>
                <p className="mt-2 font-label-sm text-label-sm text-on-surface-variant">{summary?.total_sold_kg ?? 0} kg sold</p>
              </div>
              <div className="rounded-xl bg-surface-container-lowest shadow-xs border border-outline-variant p-4">
                <p className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1">
                  {symbol('heart_plus', 'text-sm text-error')} Crop Health Alerts
                </p>
                <p className="mt-1 font-data-metric text-data-metric text-on-surface">{summary?.delivered_orders ?? 0}</p>
                <p className="mt-2 font-label-sm text-label-sm text-on-surface-variant">All zones nominal</p>
              </div>
            </div>

            {/* ACTIVE CROPS */}
            <div>
              <div className="flex items-end justify-between">
                <p className="font-label-sm text-label-sm text-on-surface-variant">CROP ROTATION</p>
                <button
                  onClick={() => navigate('/farmer/listings')}
                  className="font-label-md text-label-md text-primary hover:underline inline-flex items-center gap-1"
                >
                  View all {symbol('arrow_forward', 'text-sm')}
                </button>
              </div>
              <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-3">
                {myListings.slice(0, 3).map((l) => (
                  <div key={l.id} className="rounded-xl bg-surface-container-lowest shadow-xs border border-outline-variant overflow-hidden">
                    <div className="relative h-32 bg-surface-container">
                      {l.images?.[0] ? (
                        <img src={l.images[0]} alt={l.crop_name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          {symbol('eco', 'text-4xl text-outline')}
                        </div>
                      )}
                      <span className="absolute top-2 left-2 rounded-sm bg-surface-container-lowest/90 px-1.5 py-0.5 font-label-sm text-label-sm text-on-surface">
                        {district}
                      </span>
                      <span className="absolute top-2 right-2 rounded-sm bg-primary-fixed px-1.5 py-0.5 font-label-sm text-label-sm text-on-primary-fixed">
                        {l.quality_grade ? `Grade ${l.quality_grade}` : 'Planted'}
                      </span>
                    </div>
                    <div className="p-3">
                      <h4 className="font-headline-sm text-headline-sm text-on-surface">{l.crop_name}</h4>
                      <p className="font-label-sm text-label-sm text-on-surface-variant">BATCH #KC-{String(l.id).slice(-4)}</p>
                      <div className="mt-2 grid grid-cols-4 gap-1">
                        {PHASES.map((ph, i) => (
                          <div key={ph.label} className="flex flex-col items-center">
                            <div className="w-full h-1.5 rounded-full bg-surface-container-highest overflow-hidden">
                              <div className={`h-full ${i < 3 ? 'bg-primary' : 'bg-tertiary'}`} style={{ width: `${ph.pct}%` }} />
                            </div>
                            <span className="mt-1 font-caption-light text-caption-light text-on-surface-variant">{ph.label}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="font-label-md text-label-md text-primary">₹{l.price_per_kg}/kg</span>
                        <button
                          onClick={() => navigate(`/farmer/listings/${l.id}/edit`)}
                          className="inline-flex items-center gap-1 font-label-md text-label-md text-on-surface hover:text-primary"
                        >
                          {symbol('tune', 'text-sm')} Manage
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {myListings.length === 0 && (
                  <div className="md:col-span-3 rounded-xl bg-surface-container-low p-6 text-center">
                    <p className="font-body-md text-body-md text-on-surface-variant">No active crops yet.</p>
                    <button
                      onClick={() => navigate('/farmer/listings/new')}
                      className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-primary text-on-primary h-10 px-4 font-label-md text-label-md"
                    >
                      {symbol('add')} New Crop Batch
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* EARNINGS CHART */}
            <div className="rounded-xl bg-surface-container-lowest shadow-xs border border-outline-variant p-5">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <p className="font-label-sm text-label-sm text-on-surface-variant">PRICE TREND · PRIMARY CROP</p>
                <div className="flex items-center rounded-lg bg-surface-container-low p-0.5">
                  {['7D', '30D', '12M'].map((t, i) => (
                    <button
                      key={t}
                      className={`px-3 py-1.5 rounded-md font-label-md text-label-md ${
                        i === 0 ? 'bg-primary text-on-primary' : 'text-on-surface-variant'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mt-3">
                {forecast.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={forecast} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
                      <defs>
                        <linearGradient id="fc" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#00685d" stopOpacity={0.22} />
                          <stop offset="100%" stopColor="#00685d" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#d4e4f8" vertical={false} />
                      <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#3d4947' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: '#3d4947' }} axisLine={false} tickLine={false} width={40} />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="predicted_price"
                        name="Predicted Price"
                        stroke="#00685d"
                        strokeWidth={2}
                        fill="url(#fc)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-on-surface-variant py-12 font-body-md text-body-md">
                    {farmerData ? 'No forecast available for your primary crop yet.' : 'Loading forecast…'}
                  </p>
                )}
              </div>
              {forecastData?.advisory && (
                <div className="mt-3 rounded-lg bg-primary-fixed px-4 py-2.5 flex items-center gap-2 font-body-sm text-body-sm text-on-primary-fixed">
                  {symbol('lightbulb', 'text-sm')}
                  {forecastData.advisory}
                </div>
              )}
            </div>
          </div>

          {/* SIDE COLUMN */}
          <div className="lg:col-span-4 space-y-6">
            {/* RECENT ORDERS */}
            <div className="rounded-xl bg-surface-container-lowest shadow-xs border border-outline-variant overflow-hidden">
              <div className="p-5 pb-3">
                <div className="flex items-center justify-between">
                  <p className="font-label-sm text-label-sm text-on-surface-variant">ORDER INBOX</p>
                  <button onClick={() => navigate('/farmer/orders')} className="font-label-md text-label-md text-primary hover:underline">
                    View all
                  </button>
                </div>
                <div className="mt-3 flex items-center gap-2 h-9 rounded-lg bg-surface-container-low px-3">
                  {symbol('search', 'text-sm text-outline')}
                  <input
                    value={orderQuery}
                    onChange={(e) => setOrderQuery(e.target.value)}
                    placeholder="Search orders or lots..."
                    className="flex-1 bg-transparent outline-none font-body-sm text-body-sm text-on-surface placeholder:text-outline"
                  />
                </div>
              </div>
              <div className="divide-y divide-outline-variant/40">
                {filteredOrders.length === 0 ? (
                  <p className="p-6 text-center font-body-md text-body-md text-on-surface-variant">No recent orders</p>
                ) : (
                  filteredOrders.map((order, idx) => (
                    <div key={order.id} className={`flex items-center gap-3 px-5 py-3 ${idx % 2 === 1 ? 'bg-surface-container-low' : ''}`}>
                      <span className="w-9 h-9 rounded-lg bg-tertiary-fixed text-tertiary flex items-center justify-center shrink-0">
                        {symbol('receipt_long', 'text-sm')}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-label-md text-label-md text-on-surface truncate">
                          {order.items?.[0]?.crop_name || order.crop_name || 'Order'}
                        </p>
                        <p className="font-label-sm text-label-sm text-on-surface-variant">
                          {order.buyer_name || order.buyer?.full_name || 'Buyer'} · #{(order.id || '').slice(0, 8)}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-data-metric text-data-metric text-on-surface">₹{getFarmerEarnings(order).toLocaleString('en-IN')}</p>
                        <StatusPill status={order.status} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}