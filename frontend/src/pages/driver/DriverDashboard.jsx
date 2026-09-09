import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { driverService } from '../../services/driver.service';
import { useAuthStore } from '../../stores/authStore';
import { logger } from '../../lib/logger';

const STATUS_TONES = {
  assigned: 'bg-secondary-fixed text-on-secondary-fixed',
  in_transit: 'bg-tertiary-fixed text-on-tertiary-fixed',
  delivered: 'bg-primary-fixed text-on-primary-fixed',
  pending: 'bg-surface-container-highest text-on-surface-variant',
  default: 'bg-surface-container-highest text-on-surface-variant',
};

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

const WEEK_BARS = [
  { day: 'MON', active: [40, 30, 20], total: 92 },
  { day: 'TUE', active: [52, 30, 12], total: 104 },
  { day: 'WED', active: [30, 45, 25], total: 100 },
  { day: 'THU', active: [60, 24, 10], total: 88 },
  { day: 'FRI', active: [44, 36, 24], total: 112 },
  { day: 'SAT', active: [38, 44, 18], total: 98 },
  { day: 'SUN', active: [26, 22, 16], total: 64 },
];

const VEHICLES = [
  { id: 'VH-01', model: 'Gohar 5-Ton', status: 'MOVING', statusTone: 'bg-primary', battery: 86, odo: '742 km', fuel: '4.8 L/100km' },
  { id: 'VH-02', model: 'Anand Reefer 9-Ton', status: 'MOVING', statusTone: 'bg-primary', battery: 74, odo: '1,106 km', fuel: '5.2 L/100km' },
  { id: 'VH-03', model: 'Balwan Pickup 3-Ton', status: 'IDLE', statusTone: 'bg-secondary', battery: 91, odo: '318 km', fuel: '6.1 L/100km' },
  { id: 'VH-04', model: 'KhetPatrol 7-Ton', status: 'SERVICE', statusTone: 'bg-error', battery: 22, odo: '2,030 km', fuel: '—' },
];

const DriverDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [available, setAvailable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [routeFilter, setRouteFilter] = useState('All');
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const load = useCallback(async () => {
    try {
      const [dashRes, availRes] = await Promise.all([
        driverService.getDashboard(),
        driverService.getAvailableOrders(),
      ]);
      const dashData = dashRes?.data?.data || dashRes?.data;
      const availData = availRes?.data?.data || availRes?.data;
      setDashboard(dashData);
      setAvailable(Array.isArray(availData) ? availData : []);
      setError('');
      logger.info('DRIVER', 'Dashboard loaded', { summary: dashData?.summary, available: (Array.isArray(availData) ? availData : []).length });
    } catch (err) {
      logger.error('DRIVER', 'Failed to load dashboard', err);
      setDashboard(null);
      setAvailable([]);
      setError('Could not load dashboard.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const timer = setInterval(load, 30000);
    return () => clearInterval(timer);
  }, [load]);

  const toggleAvailability = async () => {
    setUpdatingStatus(true);
    try {
      const next = dashboard?.summary?.status === 'available' ? 'offline' : 'available';
      await driverService.updateStatus(next);
      toast.success(next === 'available' ? 'You are now Available' : 'You are now Offline');
      await load();
    } catch (err) {
      logger.error('DRIVER', 'Failed to update status', err);
      toast.error('Could not update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const acceptOrder = async (orderId) => {
    try {
      await driverService.acceptOrder(orderId);
      toast.success('Order accepted! Start delivery');
      await load();
    } catch (err) {
      logger.error('DRIVER', 'Accept failed', err);
      toast.error(err.response?.data?.message || err.response?.data?.error || 'Could not accept order');
      await load();
    }
  };

  const startDelivery = async (id) => {
    try {
      await driverService.updateDeliveryStatus(id, 'in_transit');
      toast.success('Delivery started');
      await load();
    } catch (err) {
      logger.error('DRIVER', 'Failed to start delivery', err);
      toast.error('Could not start delivery. Please try again.');
    }
  };

  const itemsText = (a) =>
    (a.order?.items || []).map((it) => `${it.crop_name} ${it.quantity_kg}kg`).join(', ');

  if (loading && !dashboard) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const summary = dashboard?.summary || {};
  const isAvailable = summary.status === 'available';
  const assignments = [...(dashboard?.active || []), ...(dashboard?.completed || [])];
  const trafficQueue = routeFilter === 'All' ? available : available.filter((o) => (o.delivery_address?.district || '').includes(routeFilter));
  const routeTags = [...new Set(available.map((o) => o.delivery_address?.district).filter(Boolean))];

  const symbol = (name, cls = '') => (
    <span className={`material-symbols ${cls}`} aria-hidden="true">{name}</span>
  );

  return (
    <div className="min-h-screen bg-surface p-4 sm:p-6 max-w-[1600px] mx-auto space-y-6">
      {/* PAGE HEADER / BREADCRUMB */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-label-sm text-label-sm text-on-surface-variant">
            Logistics Custody &gt; Dispatch Command Center &gt; Sector {summary.district || 'Midwest-Alpha'}
          </p>
          <h1 className="mt-1 font-display-lg text-display-lg text-on-surface tracking-tight">Active Fleet &amp; Dispatch Telematics</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-primary-fixed text-on-primary-fixed px-3 py-1.5 font-label-md text-label-md">
            {assignments.length} EN ROUTE
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-container-lowest border border-outline-variant px-3 py-1.5 font-label-md text-label-md text-on-surface">
            {symbol('gps_fixed', 'text-base text-primary')}GPS · {summary.lat ? `${summary.lat.toFixed(2)}, ${summary.lng?.toFixed(2)}` : 'SYNCED'}
          </span>
          <button
            onClick={toggleAvailability}
            disabled={updatingStatus}
            className="inline-flex items-center gap-1.5 h-10 px-4 rounded-lg bg-primary text-on-primary font-label-md text-label-md shadow-sm hover:bg-primary-container hover:text-on-primary-container transition-colors disabled:opacity-60"
          >
            {symbol(isAvailable ? 'power_settings_new' : 'power', 'text-base')}
            {isAvailable ? 'Go Offline' : 'Go Online'}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-error-container text-on-error-container px-4 py-3 font-body-sm text-body-sm flex items-center gap-2">
          {symbol('error', 'text-base')} {error}
        </div>
      )}

      {/* KPI RIBBON */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-xl bg-surface-container-lowest shadow-xs border border-outline-variant p-4">
          <p className="font-label-sm text-label-sm text-on-surface-variant">Total Earnings</p>
          <p className="mt-1 font-data-metric text-data-metric text-on-surface">₹{Number(summary.total_earnings || 0).toLocaleString('en-IN')}</p>
          <p className="mt-1 font-label-sm text-label-sm text-on-surface-variant">Lifetime payout · settled</p>
        </div>
        <div className="rounded-xl bg-surface-container-lowest shadow-xs border border-outline-variant p-4">
          <p className="font-label-sm text-label-sm text-on-surface-variant">Active Jobs</p>
          <p className="mt-1 font-data-metric text-data-metric text-on-surface">{summary.active_orders ?? 0}</p>
          <p className="mt-1 font-label-sm text-label-sm text-on-surface-variant">In dispatch right now</p>
        </div>
        <div className="rounded-xl bg-surface-container-lowest shadow-xs border border-outline-variant p-4">
          <p className="font-label-sm text-label-sm text-on-surface-variant">Today's Orders</p>
          <p className="mt-1 font-data-metric text-data-metric text-on-surface">{summary.today_orders ?? 0}</p>
          <p className="mt-1 font-label-sm text-label-sm text-on-surface-variant">{summary.completed_orders ?? 0} completed</p>
        </div>
        <div className="rounded-xl bg-surface-container-lowest shadow-xs border border-outline-variant p-4">
          <p className="font-label-sm text-label-sm text-on-surface-variant">Driver Rating</p>
          <p className="mt-1 font-data-metric text-data-metric text-on-surface">{Number(summary.rating || 0).toFixed(1)}</p>
          <p className="mt-1 font-label-sm text-label-sm text-on-surface-variant">{isAvailable ? '● Available' : '○ Offline'}</p>
        </div>
      </div>

      {/* DISPATCH QUEUE + MAP SPLIT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Dispatch queue */}
        <div className="lg:col-span-5 rounded-xl bg-surface-container-lowest shadow-xs border border-outline-variant overflow-hidden flex flex-col max-h-[560px]">
          <div className="p-4 border-b border-outline-variant">
            <div className="flex items-center justify-between">
              <p className="font-label-sm text-label-sm text-on-surface-variant">DISPATCH QUEUE</p>
              <span className="rounded-full bg-primary-container text-on-primary-container px-2 py-0.5 font-label-md text-label-md">{trafficQueue.length} ACTIVE</span>
            </div>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => setRouteFilter('All')}
                className={`rounded-full px-3 py-1 font-label-sm text-label-sm ${
                  routeFilter === 'All'
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container-low text-on-surface-variant'
                }`}
              >
                All
              </button>
              {routeTags.map((t) => (
                <button
                  key={t}
                  onClick={() => setRouteFilter(t)}
                  className={`rounded-full px-3 py-1 font-label-sm text-label-sm ${
                    routeFilter === t
                      ? 'bg-primary text-on-primary'
                      : 'bg-surface-container-low text-on-surface-variant'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-none divide-y divide-outline-variant/40">
            {trafficQueue.length === 0 ? (
              <p className="p-6 text-center font-body-md text-body-md text-on-surface-variant">
                No routes waiting in {summary.district || 'your sector'} right now
              </p>
            ) : (
              trafficQueue.map((o) => {
                const dl = o.delivery_address || {};
                const edge =
                  o.status === 'pending' ? 'border-l-primary' : o.status === 'in_transit' ? 'border-l-tertiary' : 'border-l-secondary';
                return (
                  <div key={o.id} className={`px-5 py-4 border-l-4 ${edge} bg-surface-container-lowest`}>
                    <div className="flex items-center justify-between">
                      <span className="font-label-md text-label-md text-on-surface">ROUTE {o.id.slice(0, 8).toUpperCase()}</span>
                      <span className={`rounded-full px-2 py-0.5 font-label-sm text-label-sm capitalize ${STATUS_TONES[o.status] || STATUS_TONES.default}`}>
                        {o.status}
                      </span>
                    </div>
                    <div className="mt-2 flex items-start gap-2 font-label-md text-label-md text-on-surface">
                      {symbol('trip_origin', 'text-base text-primary')}
                      {dl.full_address || 'Farm gate'}, {dl.district}
                    </div>
                    <div className="mt-1 flex items-start gap-2 font-label-md text-label-md text-on-surface">
                      {symbol('location_on', 'text-base text-secondary')}
                      {dl.full_name || 'Buyer'}
                    </div>
                    <div className="mt-2 inline-flex items-center gap-1.5 rounded-sm bg-surface-container-low px-2 py-1 font-label-sm text-label-sm text-on-surface-variant">
                      {symbol('package_2', 'text-sm')}
                      {(o.items || []).map((it) => `${it.crop_name} ${it.quantity_kg}kg`).join(', ') || '—'}
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <a
                        href={`tel:${dl.mobile}`}
                        className="h-9 px-3 rounded-md border border-outline-variant text-on-surface font-label-md text-label-md inline-flex items-center gap-1.5 hover:bg-surface-container-low transition-colors"
                      >
                        {symbol('call', 'text-sm')} Driver
                      </a>
                      <button
                        onClick={() => acceptOrder(o.id)}
                        disabled={summary.active_orders > 0}
                        className="h-9 flex-1 rounded-md bg-primary text-on-primary font-label-md text-label-md inline-flex items-center justify-center gap-1.5 hover:bg-primary-container hover:text-on-primary-container transition-colors disabled:opacity-50"
                      >
                        {summary.active_orders > 0 ? 'Finish current first' : 'Accept Route'}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Map panel */}
        <div className="lg:col-span-7 rounded-xl bg-surface-container-lowest shadow-xs border border-outline-variant overflow-hidden">
          <div className="relative aspect-[16/10] md:aspect-[16/9] bg-surface-container-low">
            <svg viewBox="0 0 800 420" className="w-full h-full">
              <defs>
                <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                  <path d="M60 0H0V60" fill="none" stroke="#d4e4f8" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="800" height="420" fill="#e3efff" />
              <rect width="800" height="420" fill="url(#grid)" />
              {/* River */}
              <path d="M 60 0 Q 120 160 60 420" fill="none" stroke="#8fcdfa" strokeWidth="14" opacity="0.5" />
              {/* Roads */}
              <path d="M 0 200 Q 200 120 400 200 T 800 160" fill="none" stroke="#ffffff" strokeWidth="10" />
              <path d="M 200 0 Q 260 200 240 420" fill="none" stroke="#ffffff" strokeWidth="8" />
              <path d="M 520 0 Q 500 200 560 420" fill="none" stroke="#ffffff" strokeWidth="8" />
              {/* Route */}
              <path d="M 180 150 Q 300 90 400 200 T 620 260" fill="none" stroke="#00685d" strokeWidth="4" strokeDasharray="10 6" opacity="0.9" />
              {[
                { x: 180, y: 150, label: 'PICK' },
                { x: 400, y: 200, label: 'HUB' },
                { x: 620, y: 260, label: 'DROP' },
              ].map((n) => (
                <g key={n.label}>
                  <polygon points={`${n.x},${n.y - 10} ${n.x + 10},${n.y + 6} ${n.x},${n.y + 2} ${n.x - 10},${n.y + 6}`} fill={n.label === 'PICK' ? '#00685d' : n.label === 'DROP' ? '#9b4504' : '#166289'} />
                  <text x={n.x} y={n.y - 16} textAnchor="middle" fontSize="11" fontWeight="600" fill="#0d1d2b">{n.label}</text>
                </g>
              ))}
              {/* Moving vehicles */}
              {[
                { x: 300, y: 145 },
                { x: 480, y: 228 },
              ].map((v, i) => (
                <circle key={i} cx={v.x} cy={v.y} r="6" fill="#00685d" className="animate-pulse">
                  <animate attributeName="opacity" values="1;0.4;1" dur="1.6s" repeatCount="indefinite" />
                </circle>
              ))}
              {[
                { x: 620, y: 60, label: 'MH/12/AX-4402 · ETA 6:14 PM', tone: '#00685d' },
                { x: 200, y: 340, label: 'MH/14/TR-9913 · IDLE', tone: '#9b4504' },
              ].map((tip, i) => (
                <g key={i}>
                  <rect x={tip.x} y={tip.y} width="190" height="26" rx="6" fill="#ffffff" stroke={tip.tone} strokeWidth="1" />
                  <text x={tip.x + 12} y={tip.y + 17} fontSize="11" fill="#0d1d2b">{tip.label}</text>
                </g>
              ))}
            </svg>
            {/* HUD badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-1.5">
              <span className="rounded-md bg-surface-container-lowest/90 backdrop-blur px-2.5 py-1 font-label-sm text-label-sm text-on-surface shadow-xs">TRUCK ICON · LIVE</span>
              <span className="rounded-md bg-primary-fixed px-2.5 py-1 font-label-sm text-label-sm text-on-primary-fixed shadow-xs">SECTOR {summary.district || 'MIDWEST-ALPHA'}</span>
            </div>
            <div className="absolute top-3 right-3 flex flex-col gap-1.5">
              <button className="w-8 h-8 rounded-md bg-surface-container-lowest/90 shadow-xs flex items-center justify-center text-on-surface">{symbol('add')}</button>
              <button className="w-8 h-8 rounded-md bg-surface-container-lowest/90 shadow-xs flex items-center justify-center text-on-surface">{symbol('remove')}</button>
            </div>
            {/* Legend */}
            <div className="absolute bottom-12 left-3 flex items-center gap-3 rounded-lg bg-surface-container-lowest/90 backdrop-blur px-3 py-2 shadow-xs">
              <span className="flex items-center gap-1.5 font-label-sm text-label-sm text-on-surface-variant">
                <span className="w-2.5 h-2.5 rounded-full bg-primary inline-block" /> In Transit
              </span>
              <span className="flex items-center gap-1.5 font-label-sm text-label-sm text-on-surface-variant">
                <span className="w-2.5 h-2.5 rounded-full bg-secondary inline-block" /> Idle
              </span>
              <span className="flex items-center gap-1.5 font-label-sm text-label-sm text-on-surface-variant">
                <span className="w-2.5 h-2.5 rounded-full bg-error inline-block" /> Service
              </span>
            </div>
            {/* Bottom strip */}
            <div className="absolute bottom-0 inset-x-0 h-11 bg-surface-container-lowest/95 backdrop-blur border-t border-outline-variant flex items-center justify-between px-4">
              <span className="font-label-sm text-label-sm text-on-surface-variant">{symbol('road', 'text-sm')} Route optimized · 2 reroutes today</span>
              <div className="flex items-center gap-3">
                <button className="font-label-md text-label-md text-primary hover:underline">Export Telemetry Log</button>
                <button className="inline-flex items-center gap-1 rounded-md bg-error-container text-on-error-container px-3 py-1 font-label-md text-label-md">
                  {symbol('warning', 'text-sm')} Emergency Override
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* VEHICLE STATUS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {VEHICLES.map((v) => (
          <div key={v.id} className="rounded-xl bg-surface-container-lowest shadow-xs border border-outline-variant p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-9 h-9 rounded-lg bg-surface-container-low flex items-center justify-center">{symbol('local_shipping', 'text-base text-primary')}</span>
                <div>
                  <p className="font-label-md text-label-md text-on-surface">{v.model}</p>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">{v.id}</p>
                </div>
              </div>
              <span className={`rounded-full px-2 py-0.5 font-label-sm text-label-sm text-on-surface ${v.statusTone}`}>{v.status}</span>
            </div>
            <div className="mt-3">
              <div className="flex justify-between font-label-sm text-label-sm text-on-surface-variant">
                <span>Battery</span>
                <span>{v.battery}%</span>
              </div>
              <div className="mt-1 h-1.5 rounded-full bg-surface-container-highest overflow-hidden">
                <div className={`h-full ${v.status === 'SERVICE' ? 'bg-error' : 'bg-primary'}`} style={{ width: `${v.battery}%` }} />
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 rounded-lg bg-surface-container-low p-2">
              <div>
                <p className="font-label-sm text-label-sm text-on-surface-variant">Odometer</p>
                <p className="font-label-md text-label-md text-on-surface">{v.odo}</p>
              </div>
              <div>
                <p className="font-label-sm text-label-sm text-on-surface-variant">Fuel</p>
                <p className="font-label-md text-label-md text-on-surface">{v.fuel}</p>
              </div>
            </div>
            <button className="mt-3 w-full h-9 rounded-md border border-outline-variant font-label-md text-label-md text-primary hover:bg-surface-container-low transition-colors">
              Telemetry
            </button>
          </div>
        ))}
      </div>

      {/* MY DELIVERIES TABLE STRIP */}
      <div className="rounded-xl bg-surface-container-lowest shadow-xs border border-outline-variant overflow-hidden">
        <div className="p-4 border-b border-outline-variant flex items-center justify-between">
          <p className="font-label-sm text-label-sm text-on-surface-variant">MY DELIVERIES</p>
          <span className="font-label-sm text-label-sm text-on-surface-variant">{assignments.length} total</span>
        </div>
        <div className="divide-y divide-outline-variant/40">
          {assignments.length === 0 ? (
            <p className="p-6 text-center font-body-md text-body-md text-on-surface-variant">No deliveries yet</p>
          ) : (
            assignments.map((a) => {
              const dl = a.delivery_location || {};
              return (
                <div key={a.id} className={`flex flex-wrap items-center gap-3 px-5 py-3 ${a.status === 'delivered' ? 'bg-surface-container-low' : ''}`}>
                  <span className="w-9 h-9 rounded-lg bg-tertiary-fixed text-tertiary flex items-center justify-center">{symbol('receipt_long', 'text-sm')}</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-label-md text-label-md text-on-surface truncate">#{a.order?.id?.slice(0, 8)} · {itemsText(a) || 'Produce run'}</p>
                    <p className="font-label-sm text-label-sm text-on-surface-variant">{dl.full_name || 'Buyer'} · {dl.district}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 font-label-sm text-label-sm capitalize ${STATUS_TONES[a.status] || STATUS_TONES.default}`}>
                    {(a.status || 'assigned').replace('_', ' ')}
                  </span>
                  {a.status === 'assigned' && (
                    <button
                      onClick={() => startDelivery(a.id)}
                      className="h-9 px-4 rounded-lg bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-container hover:text-on-primary-container transition-colors"
                    >
                      Start Delivery
                    </button>
                  )}
                  {a.status === 'in_transit' && (
                    <button
                      onClick={() => navigate(`/driver/delivery/${a.id}`)}
                      className="h-9 px-4 rounded-lg bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-container hover:text-on-primary-container transition-colors"
                    >
                      Mark as Delivered
                    </button>
                  )}
                  {a.status === 'delivered' && (
                    <span className="inline-flex items-center gap-1 font-label-md text-label-md text-on-surface-variant">
                      {symbol('check_circle', 'text-sm text-primary')} Completed
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* CALENDAR + PERFORMANCE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 rounded-xl bg-surface-container-lowest shadow-xs border border-outline-variant p-5">
          <p className="font-label-sm text-label-sm text-on-surface-variant">DAILY PLAN · SEPTEMBER</p>
          <div className="mt-3 grid grid-cols-7 gap-1.5">
            {DAYS.map((d, i) => (
              <button
                key={d}
                className={`py-2 rounded-md font-label-sm text-label-sm ${i === new Date().getDay() - 1 ? 'bg-primary text-on-primary' : 'text-on-surface-variant bg-surface-container-low'}`}
              >
                <span className="block font-caption-light text-caption-light">{d}</span>
                <span className="block font-label-md text-label-md">{7 + i}</span>
              </button>
            ))}
          </div>
          <div className="mt-4 rounded-lg bg-surface-container-low p-3 flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-on-surface-variant">Load today</span>
            <span className="rounded-full bg-primary-fixed px-2 py-0.5 font-label-md text-label-md text-on-primary-fixed">{summary.today_orders ?? 0} runs</span>
          </div>
        </div>
        <div className="lg:col-span-7 rounded-xl bg-surface-container-lowest shadow-xs border border-outline-variant p-5">
          <div className="flex items-center justify-between">
            <p className="font-label-sm text-label-sm text-on-surface-variant">DRIVER PERFORMANCE · WEEKLY</p>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 font-label-sm text-label-sm text-on-surface-variant"><span className="w-2.5 h-2.5 rounded-sm bg-primary inline-block" /> Load Served</span>
              <span className="flex items-center gap-1 font-label-sm text-label-sm text-on-surface-variant"><span className="w-2.5 h-2.5 rounded-sm bg-tertiary inline-block" /> Distance</span>
              <span className="flex items-center gap-1 font-label-sm text-label-sm text-on-surface-variant"><span className="w-2.5 h-2.5 rounded-sm bg-secondary inline-block" /> Idle</span>
            </div>
          </div>
          <div className="mt-4 flex items-end justify-between h-40">
            {WEEK_BARS.map((w) => (
              <div key={w.day} className="flex flex-col items-center gap-1.5 flex-1">
                <div className="w-full flex flex-col-reverse items-center gap-0.5 px-1" style={{ height: '120px' }}>
                  <div className="w-full rounded-t bg-secondary" style={{ height: `${w.active[2] * 0.7}px` }} />
                  <div className="w-full rounded-t bg-tertiary" style={{ height: `${w.active[1] * 0.7}px` }} />
                  <div className="w-full rounded-t bg-primary" style={{ height: `${w.active[0] * 0.7}px` }} />
                </div>
                <span className="font-label-sm text-label-sm text-on-surface-variant">{w.day}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverDashboard;