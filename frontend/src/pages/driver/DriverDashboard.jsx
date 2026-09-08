import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Truck,
  Phone,
  MapPin,
  Package,
  CheckCircle,
  RefreshCw,
  Wallet,
  Star,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import { driverService } from '../../services/driver.service';
import { useAuthStore } from '../../stores/authStore';
import { logger } from '../../lib/logger';

const statusStyles = {
  assigned: 'bg-yellow-100 text-yellow-800',
  in_transit: 'bg-blue-100 text-blue-800',
  delivered: 'bg-green-100 text-green-800',
};

const DriverDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [available, setAvailable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
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
      logger.info('DRIVER', 'Dashboard loaded', {
        summary: dashData?.summary,
        available: (Array.isArray(availData) ? availData : []).length,
      });
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

  const _toggleAvailability = async () => {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="h-10 w-10 border-4 border-kisan-700 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const summary = dashboard?.summary || {};
  const isAvailable = summary.status === 'available';
  const assignments = [...(dashboard?.active || []), ...(dashboard?.completed || [])];

  return (
    <div className="min-h-screen bg-gray-50 max-w-lg mx-auto p-4 pb-10">
      <header className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Driver Dashboard</h1>
          <p className="text-gray-600">{user?.full_name || 'Driver'} · {summary.district || 'District not set'}</p>
        </div>
        <button
          onClick={load}
          className="p-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50"
          aria-label="Refresh"
          title="Refresh"
        >
          <RefreshCw className="h-5 w-5 text-kisan-700" />
        </button>
      </header>

      {error && <p className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">{error}</p>}

      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-white rounded-xl shadow-sm p-3">
          <Wallet className="h-5 w-5 text-green-600 mb-1" />
          <p className="text-lg font-bold">₹{Number(summary.total_earnings || 0).toLocaleString('en-IN')}</p>
          <p className="text-xs text-gray-500">Total Earnings</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-3">
          <Package className="h-5 w-5 text-blue-600 mb-1" />
          <p className="text-lg font-bold">{summary.active_orders ?? 0}</p>
          <p className="text-xs text-gray-500">Active Jobs</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-3">
          <CheckCircle className="h-5 w-5 text-emerald-600 mb-1" />
          <p className="text-lg font-bold">{summary.today_orders ?? 0}</p>
          <p className="text-xs text-gray-500">Today · {summary.completed_orders ?? 0} total</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 mb-4 flex items-center justify-between">
        <div>
          <p className="font-semibold flex items-center gap-1">
            <span className={`h-2.5 w-2.5 rounded-full ${isAvailable ? 'bg-green-500' : 'bg-gray-400'}`} />
            {isAvailable ? 'Available for deliveries' : 'Offline'}
          </p>
          <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
            <Star className="h-3 w-3 text-amber-500" /> {Number(summary.rating || 0).toFixed(1)} rating
          </p>
        </div>
        <button
          onClick={_toggleAvailability}
          disabled={updatingStatus}
          className={`px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-60 ${
            isAvailable ? 'bg-gray-200 text-gray-700' : 'bg-kisan-700 text-white'
          }`}
        >
          {isAvailable ? 'Go Offline' : 'Go Online'}
        </button>
      </div>

      {isAvailable && (
        <>
          <h2 className="font-bold text-lg mb-2 mt-6 flex items-center gap-1">
            <Zap className="h-5 w-5 text-amber-500" /> Orders Near You ({available.length})
          </h2>
          {available.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-6 text-center text-gray-400 text-sm mb-4">
              No paid orders waiting in {summary.district} right now
            </div>
          ) : (
            <div className="space-y-3 mb-6">
              {available.map((o) => {
                const dl = o.delivery_address || {};
                return (
                  <div key={o.id} className="bg-white rounded-xl shadow-sm p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-sm">#{o.id.slice(0, 8)}</span>
                      <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-700">Paid · {o.status}</span>
                    </div>
                    <p className="flex items-start gap-2 text-gray-700 mb-2">
                      <MapPin className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
                      {dl.full_address}, {dl.district}
                    </p>
                    <p className="flex items-start gap-2 text-gray-700 mb-3">
                      <Package className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
                      {(o.items || []).map((it) => `${it.crop_name} ${it.quantity_kg}kg`).join(', ') || '-'}
                    </p>
                    <div className="flex gap-2">
                      <a href={`tel:${dl.mobile}`} className="flex-1 min-h-12 border border-kisan-700 text-kisan-700 text-base rounded-lg flex items-center justify-center gap-1 hover:bg-kisan-50">
                        <Phone className="h-4 w-4" /> Call
                      </a>
                      <button
                        onClick={() => acceptOrder(o.id)}
                        disabled={summary.active_orders > 0}
                        className="flex-1 min-h-12 bg-kisan-700 text-white text-base rounded-lg hover:bg-kisan-800 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {summary.active_orders > 0 ? 'Finish Current First' : 'Accept'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      <div className="flex items-center justify-between mb-2 mt-4">
        <h2 className="font-bold text-lg">My Deliveries</h2>
        <span className="text-xs text-gray-500">{assignments.length} total</span>
      </div>

      {assignments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Truck className="h-16 w-16 text-gray-300" />
          <p className="mt-4 text-gray-500">No deliveries yet</p>
          <p className="text-sm text-gray-400">Nearby paid orders will appear above</p>
        </div>
      ) : (
        <div className="space-y-4 pb-8">
          {assignments.map((a) => {
            const dl = a.delivery_location || {};
            return (
              <div key={a.id} className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-sm">#{a.order?.id?.slice(0, 8)}</span>
                  <span className={`px-2 py-1 rounded text-xs ${statusStyles[a.status] || statusStyles.assigned}`}>
                    {(a.status || 'assigned').replace('_', ' ')}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-base mb-1">
                  <Phone className="h-4 w-4 text-gray-400 shrink-0" />
                  <a href={`tel:${dl.mobile}`} className="text-kisan-700 font-medium">
                    {dl.full_name}
                  </a>
                </div>

                <div className="flex items-start gap-2 text-base text-gray-700 mb-1">
                  <MapPin className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
                  <span>{dl.full_address}, {dl.district}</span>
                </div>

                <div className="flex items-start gap-2 text-base text-gray-700 mb-4">
                  <Package className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
                  <span>{itemsText(a)}</span>
                </div>

                {a.status === 'assigned' && (
                  <button
                    onClick={() => startDelivery(a.id)}
                    className="w-full min-h-12 bg-kisan-700 text-white text-base rounded-lg hover:bg-kisan-800"
                  >
                    Start Delivery
                  </button>
                )}
                {a.status === 'in_transit' && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => navigate(`/driver/delivery/${a.id}`)}
                      className="flex-1 min-h-12 bg-kisan-700 text-white text-base rounded-lg hover:bg-kisan-800"
                    >
                      Mark as Delivered
                    </button>
                    <button
                      onClick={() => navigate(`/driver/delivery/${a.id}`)}
                      className="flex-1 min-h-12 border border-kisan-700 text-kisan-700 text-base rounded-lg hover:bg-kisan-50"
                    >
                      View Route
                    </button>
                  </div>
                )}
                {a.status === 'delivered' && (
                  <button
                    disabled
                    className="w-full min-h-12 bg-gray-200 text-gray-500 text-base rounded-lg flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="h-5 w-5" /> Completed
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DriverDashboard;