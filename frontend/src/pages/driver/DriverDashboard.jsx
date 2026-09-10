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
      {/* PAGE HEADER */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-label-sm text-label-sm text-on-surface-variant">
            Logistics > Dispatch Command > Sector {summary.district || 'Nashik'}
          </p>
          <h1 className="mt-1 font-display-lg text-display-lg text-on-surface tracking-tight">Active Fleet & Dispatch</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-primary-fixed text-on-primary-fixed px-3 py-1.5 font-label-md text-label-md">
            {assignments.length} EN ROUTE
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
          <p className="mt-1 font-label-sm text-label-sm text-on-surface-variant">{isAvailable ? 'Available' : 'Offline'}</p>
        </div>
      </div>

      {/* DISPATCH QUEUE */}
      <div className="rounded-xl bg-surface-container-lowest shadow-xs border border-outline-variant overflow-hidden flex flex-col max-h-[560px]">
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
                    {(o.items || []).map((it) => `${it.crop_name} ${it.quantity_kg}kg`).join(', ') || '&mdash;'}
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <a
                      href={`tel:${dl.mobile}`}
                      className="h-9 px-3 rounded-md border border-outline-variant text-on-surface font-label-md text-label-md inline-flex items-center gap-1.5 hover:bg-surface-container-low transition-colors"
                    >
                      {symbol('call', 'text-sm')} Call
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

      {/* MY DELIVERIES */}
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
                    <p className="font-label-md text-label-md text-on-surface truncate">#{a.order?.id?.slice(0, 8)} &middot; {itemsText(a) || 'Produce run'}</p>
                    <p className="font-label-sm text-label-sm text-on-surface-variant">{dl.full_name || 'Buyer'} &middot; {dl.district}</p>
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

      {/* DAILY PLAN */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 rounded-xl bg-surface-container-lowest shadow-xs border border-outline-variant p-5">
          <p className="font-label-sm text-label-sm text-on-surface-variant">DAILY PLAN</p>
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
          <p className="font-label-sm text-label-sm text-on-surface-variant">YOUR EARNINGS THIS WEEK</p>
          <p className="mt-2 font-data-metric text-data-metric text-on-surface">₹{Number(summary.weekly_earnings || 0).toLocaleString('en-IN')}</p>
          <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">{summary.today_orders ?? 0} runs completed today</p>
        </div>
      </div>
    </div>
  );
};

export default DriverDashboard;