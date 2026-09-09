import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import AdminLayout from '../../components/admin/AdminLayout';
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
  todaysRevenue: 0,
};

const DONUT_COLORS = ['#00685d', '#008376', '#387ba4', '#fe9251', '#d4e4f8'];
const ORDER_TONES = {
  delivered: 'bg-primary-fixed text-on-primary-fixed',
  packed: 'bg-tertiary-fixed text-on-tertiary-fixed',
  pending: 'bg-secondary-fixed text-on-secondary-fixed',
  paid: 'bg-secondary-fixed text-on-secondary-fixed',
  default: 'bg-surface-container-highest text-on-surface-variant',
};

const SERVICES = [
  { name: 'Auth Gateway', status: 'Operational', tone: 'bg-primary', uptime: 99.99 },
  { name: 'Listing & Grading API', status: 'Operational', tone: 'bg-primary', uptime: 99.97 },
  { name: 'Order & Escrow Engine', status: 'Operational', tone: 'bg-primary', uptime: 99.95 },
  { name: 'Logistics / Telematics', status: 'Operational', tone: 'bg-primary', uptime: 99.9 },
  { name: 'AI Demand Forecast', status: 'Degraded', tone: 'bg-error', uptime: 87.3 },
];

const AdminDashboard = () => {
  const [stats, setStats] = useState(emptyStats);
  const [recentGrievances, setRecentGrievances] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [analytics, setAnalytics] = useState({ dailyOrders: [], topCrops: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [moderation, setModeration] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [statsRes, grievancesRes, analyticsRes, ordersRes] = await Promise.all([
          adminService.getStats(),
          adminService.getGrievances({ limit: 8 }),
          adminService.getAnalytics(),
          adminService.getOrders({ page: 1, limit: 12 }),
        ]);
        if (cancelled) return;
        const liveStats = statsRes?.data?.data || statsRes?.data;
        const liveGrievances = grievancesRes?.data?.data || grievancesRes?.data;
        const liveAnalytics = analyticsRes?.data?.data || analyticsRes?.data;
        const ordersPayload = ordersRes?.data?.data || ordersRes?.data;
        const liveOrders = Array.isArray(ordersPayload)
          ? ordersPayload
          : ordersPayload?.items || ordersPayload?.orders || [];
        if (liveStats && typeof liveStats === 'object' && !Array.isArray(liveStats)) setStats(liveStats);
        if (Array.isArray(liveGrievances)) setRecentGrievances(liveGrievances);
        if (liveAnalytics) setAnalytics(liveAnalytics);
        if (Array.isArray(liveOrders)) {
          setRecentOrders(liveOrders);
          setModeration(liveOrders.filter((o) => o.status === 'pending' || o.status === 'paid').slice(0, 4));
        }
        setError('');
        logger.info('ADMIN_DASHBOARD', 'Data loaded', { stats: !!liveStats });
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

  const refresh = async () => {
    setRefreshing(true);
    try {
      const statsRes = await adminService.getStats();
      const liveStats = statsRes?.data?.data || statsRes?.data;
      if (liveStats) setStats(liveStats);
    } catch {
      /* silent */
    } finally {
      setRefreshing(false);
    }
  };

  const decide = (id, action) => setModeration((m) => m.filter((o) => o.id !== id));

  const daily = analytics.dailyOrders.slice(-7);
  const topCrops = Array.isArray(analytics.topCrops) ? analytics.topCrops : [];
  const symbol = (name, cls = '') => (
    <span className={`material-symbols ${cls}`} aria-hidden="true">{name}</span>
  );

  return (
    <AdminLayout pageTitle="Platform Governance">
      {/* PAGE HEADER */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-label-sm text-label-sm text-on-surface-variant">
            Root Access &gt; Executive Governance &gt; Platform Operations
          </p>
          <h1 className="mt-1 font-display-lg text-display-lg text-on-surface tracking-tight">Executive Platform Oversight</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={refresh}
            className="inline-flex items-center gap-1.5 rounded-full bg-surface-container-low text-on-surface-variant px-3 py-1.5 font-label-md text-label-md hover:text-on-surface transition-colors"
          >
            {symbol('sync', `text-base ${refreshing ? 'animate-spin' : ''}`)} Auto-refresh 45s
          </button>
          <button className="inline-flex items-center gap-1.5 rounded-full bg-surface-container-low text-on-surface-variant px-3 py-1.5 font-label-md text-label-md hover:text-on-surface transition-colors">
            {symbol('filter_list', 'text-base')} Filter View
          </button>
          <Link
            to="/admin/audit"
            className="inline-flex items-center gap-1.5 h-10 px-4 rounded-lg bg-primary text-on-primary font-label-md text-label-md shadow-sm hover:bg-primary-container hover:text-on-primary-container transition-colors"
          >
            {symbol('download', 'text-base')} Export Audit Log
          </Link>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-xl bg-error-container text-on-error-container px-4 py-3 font-body-sm text-body-sm flex items-center gap-2">
          {symbol('error', 'text-base')} {error}
        </div>
      )}

      {loading ? (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-surface-container-low animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          {/* METRIC GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="rounded-xl bg-surface-container-lowest shadow-xs border border-outline-variant p-4">
              <p className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1">
                {symbol('group', 'text-sm text-primary')} Total Users
              </p>
              <p className="mt-1 font-data-metric text-data-metric text-on-surface">{stats.totalUsers ?? 0}</p>
              <div className="mt-2 flex gap-1.5">
                <span className="rounded-full bg-surface-container-low px-2 py-0.5 font-label-sm text-label-sm text-on-surface-variant">{stats.totalFarmers ?? 0} Farmers</span>
                <span className="rounded-full bg-surface-container-low px-2 py-0.5 font-label-sm text-label-sm text-on-surface-variant">F+P+L</span>
              </div>
            </div>
            <div className="rounded-xl bg-surface-container-lowest shadow-xs border border-outline-variant p-4">
              <p className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1">
                {symbol('storefront', 'text-sm text-tertiary')} Active Listings
              </p>
              <p className="mt-1 font-data-metric text-data-metric text-on-surface">{stats.totalListings ?? 0}</p>
              <div className="mt-2 grid grid-cols-3 gap-1">
                {['Veg', 'Fruit', 'Grain'].map((c, i) => (
                  <div key={c} className="h-1.5 rounded-full bg-surface-container-highest overflow-hidden">
                    <div className={`h-full ${i === 1 ? 'w-2/3' : i === 2 ? 'w-1/2' : 'w-3/4'} bg-primary`} />
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-xl bg-surface-container-lowest shadow-xs border border-outline-variant p-4">
              <p className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1">
                {symbol('fact_check', 'text-sm text-secondary')} Orders Completed Today
              </p>
              <p className="mt-1 font-data-metric text-data-metric text-on-surface">{stats.todayOrders ?? 0}</p>
              <div className="mt-2 h-1.5 rounded-full bg-surface-container-highest overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full"
                  style={{ width: `${stats.totalOrders ? Math.min(100, ((stats.todayOrders ?? 0) / stats.totalOrders) * 100) : 0}%` }}
                />
              </div>
            </div>
            <div className="rounded-xl bg-surface-container-lowest shadow-xs border border-outline-variant p-4">
              <p className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1">
                {symbol('payments', 'text-sm text-primary')} GPV Today
              </p>
              <p className="mt-1 font-data-metric text-data-metric text-on-surface">
                ₹{Number(stats.todaysRevenue ?? 0).toLocaleString('en-IN')}
              </p>
              <p className="mt-2 font-label-sm text-label-sm text-on-surface-variant">+8.2% vs yesterday</p>
            </div>
            <div className="rounded-xl bg-surface-container-lowest shadow-xs border border-outline-variant p-4">
              <p className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1">
                {symbol('account_balance', 'text-sm text-tertiary')} Escrow Balance
              </p>
              <p className="mt-1 font-data-metric text-data-metric text-on-surface">₹{Number(stats.gmv ?? 0).toLocaleString('en-IN')}</p>
              <p className="mt-2 font-label-sm text-label-sm text-on-surface-variant">{stats.pendingOrders ?? 0} in settlement</p>
            </div>
            <div className="rounded-xl bg-surface-container-lowest shadow-xs border border-outline-variant p-4">
              <p className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1">
                {symbol('gavel', 'text-sm text-error')} Open Disputes
              </p>
              <p className="mt-1 font-data-metric text-data-metric text-on-surface">{stats.openGrievances ?? 0}</p>
              <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-error-container text-on-error-container px-2 py-0.5 font-label-sm text-label-sm">
                {symbol('warning', 'text-sm')} SLA clock running
              </span>
            </div>
            <div className="rounded-xl bg-surface-container-lowest shadow-xs border border-outline-variant p-4">
              <p className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1">
                {symbol('local_shipping', 'text-sm text-secondary')} Avg Fleet Delivery
              </p>
              <p className="mt-1 font-data-metric text-data-metric text-on-surface">
                {analytics.avgOrderValue ? `₹${analytics.avgOrderValue}` : '—'}
              </p>
              <p className="mt-2 font-label-sm text-label-sm text-on-surface-variant">Across {stats.totalOrders ?? 0} orders</p>
            </div>
            <div className="rounded-xl bg-surface-container-lowest shadow-xs border border-outline-variant p-4">
              <p className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1">
                {symbol('monitoring', 'text-sm text-primary')} Service Health
              </p>
              <p className="mt-1 font-data-metric text-data-metric text-on-surface">Operational</p>
              <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-primary-fixed text-on-primary-fixed px-2 py-0.5 font-label-sm text-label-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" /> All systems nominal
              </span>
            </div>
          </div>

          {/* TRIPLE PANEL */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-5 rounded-xl bg-surface-container-lowest shadow-xs border border-outline-variant p-5">
              <div className="flex items-center justify-between">
                <p className="font-label-sm text-label-sm text-on-surface-variant">DAILY VOLUME BY ROLE</p>
                <span className="rounded-full bg-surface-container-low px-2 py-0.5 font-label-sm text-label-sm text-on-surface-variant">7D</span>
              </div>
              <div className="mt-3 h-52">
                {daily.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={daily} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                      <defs>
                        <linearGradient id="vol" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#00685d" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="#00685d" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="vol2" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#387ba4" stopOpacity={0.25} />
                          <stop offset="100%" stopColor="#387ba4" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#d4e4f8" vertical={false} />
                      <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#3d4947' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: '#3d4947' }} axisLine={false} tickLine={false} width={38} />
                      <Tooltip />
                      <Area type="monotone" dataKey="orders" name="Farmer" stackId="1" stroke="#00685d" strokeWidth={2} fill="url(#vol)" />
                      {daily.some((d) => d.gmv != null) && (
                        <Area type="monotone" dataKey="gmv" name="Wholesale" stackId="1" stroke="#387ba4" strokeWidth={2} fill="url(#vol2)" />
                      )}
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-on-surface-variant pt-20 font-body-md text-body-md">No daily data yet</p>
                )}
              </div>
            </div>
            <div className="lg:col-span-3 rounded-xl bg-surface-container-lowest shadow-xs border border-outline-variant p-5">
              <p className="font-label-sm text-label-sm text-on-surface-variant">REVENUE BY CATEGORY</p>
              {topCrops.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={150}>
                    <PieChart>
                      <Pie data={topCrops} dataKey="count" nameKey="crop_name" cx="50%" cy="50%" innerRadius={40} outerRadius={64} paddingAngle={3}>
                        {topCrops.map((_, i) => (
                          <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-2 space-y-1.5">
                    {topCrops.slice(0, 4).map((c, i) => (
                      <div key={c.crop_name} className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-sm" style={{ background: DONUT_COLORS[i % DONUT_COLORS.length] }} />
                        <span className="capitalize flex-1 font-label-md text-label-md text-on-surface truncate">{c.crop_name}</span>
                        <span className="font-label-md text-label-md text-on-surface-variant">{c.count}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-on-surface-variant py-10 text-center font-body-md text-body-md">No category data yet</p>
              )}
            </div>
            <div className="lg:col-span-4 rounded-xl bg-surface-container-lowest shadow-xs border border-outline-variant flex flex-col">
              <div className="p-5 pb-3 flex items-center justify-between">
                <p className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1.5">
                  {symbol('bolt', 'text-base text-secondary')} LIVE EVENT STREAM
                </p>
                <Link to="/admin/orders" className="font-label-md text-label-md text-primary hover:underline">View all</Link>
              </div>
              <div className="flex-1 overflow-y-auto scrollbar-none divide-y divide-outline-variant/40 max-h-[300px]">
                {recentOrders.length === 0 ? (
                  <p className="p-6 text-center font-body-md text-body-md text-on-surface-variant">No recent activity</p>
                ) : (
                  recentOrders.slice(0, 8).map((o) => (
                    <div key={o.id} className="flex items-center gap-3 px-5 py-3 border-l-4 border-l-primary bg-surface-container-lowest">
                      <div className="min-w-0 flex-1">
                        <p className="font-label-md text-label-md text-on-surface truncate">
                          {o.buyer?.full_name || o.buyer_name || 'Order'} placed order
                        </p>
                        <p className="font-label-sm text-label-sm text-on-surface-variant">
                          #{String(o.id).slice(0, 8)} · {o.items?.[0]?.crop_name || '—'}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-label-md text-label-md text-on-surface">₹{o.amount ?? o.total ?? 0}</p>
                        <span className={`rounded-full px-2 py-0.5 font-label-sm text-label-sm capitalize ${ORDER_TONES[o.status] || ORDER_TONES.default}`}>
                          {o.status || '—'}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* DUAL OPS PANELS */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-7 rounded-xl bg-surface-container-lowest shadow-xs border border-outline-variant">
              <div className="p-5 pb-3 flex items-center justify-between">
                <p className="font-label-sm text-label-sm text-on-surface-variant">LISTING MODERATION QUEUE</p>
                <span className="rounded-full bg-secondary-fixed text-on-secondary-fixed px-2 py-0.5 font-label-sm text-label-sm">{moderation.length} PENDING</span>
              </div>
              <div className="divide-y divide-outline-variant/40">
                {moderation.length === 0 ? (
                  <p className="p-6 text-center font-body-md text-body-md text-on-surface-variant">Queue is clear</p>
                ) : (
                  moderation.map((o) => (
                    <div key={o.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
                      <span className="w-9 h-9 rounded-lg bg-tertiary-fixed text-tertiary flex items-center justify-center">
                        {symbol('storefront', 'text-sm')}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-label-md text-label-md text-on-surface truncate">{o.items?.[0]?.crop_name || 'Crop lot'} · #{String(o.id).slice(0, 8)}</p>
                        <p className="font-label-sm text-label-sm text-on-surface-variant">{o.buyer_name || o.buyer?.full_name || 'Farmer'} · ₹{o.amount ?? o.total ?? 0}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => decide(o.id, 'reject')}
                          className="h-9 px-3 rounded-md border border-outline-variant text-on-surface font-label-md text-label-md hover:bg-error-container hover:text-on-error-container transition-colors"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => decide(o.id, 'approve')}
                          className="h-9 px-3 rounded-md bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-container hover:text-on-primary-container transition-colors"
                        >
                          Approve
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="lg:col-span-5 rounded-xl bg-surface-container-lowest shadow-xs border border-outline-variant">
              <div className="p-5 pb-3 flex items-center justify-between">
                <p className="font-label-sm text-label-sm text-on-surface-variant">MICROSERVICES &amp; NODE HEALTH</p>
                <span className="rounded-full bg-primary-fixed text-on-primary-fixed px-2 py-0.5 font-label-sm text-label-sm">4/5 UP</span>
              </div>
              <div className="divide-y divide-outline-variant/40">
                {SERVICES.map((s) => (
                  <div key={s.name} className="flex items-center gap-3 px-5 py-3">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: 'currentColor' }} />
                    <div className="min-w-0 flex-1">
                      <p className="font-label-md text-label-md text-on-surface truncate">{s.name}</p>
                      <div className="mt-1.5 h-1 rounded-full bg-surface-container-highest overflow-hidden max-w-[200px]">
                        <div className={`h-full ${s.tone}`} style={{ width: `${s.uptime}%` }} />
                      </div>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 font-label-sm text-label-sm ${s.status === 'Operational' ? 'bg-primary-fixed text-on-primary-fixed' : 'bg-error-container text-on-error-container'}`}>
                      {s.status}
                    </span>
                  </div>
                ))}
                {recentGrievances.length > 0 && (
                  <div className="px-5 py-3 bg-surface-container-low">
                    <p className="font-label-sm text-label-sm text-on-surface-variant">
                      {symbol('support_agent', 'text-sm')} {recentGrievances.length} grievances in SLA queue
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminDashboard;