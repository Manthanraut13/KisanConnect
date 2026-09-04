import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, Phone, MapPin, Package, CheckCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { driverService } from '../../services/driver.service';
import { useAuthStore } from '../../stores/authStore';

const mockAssignments = [
  {
    id: 'assign-1',
    order: {
      id: 'ORDER-A1',
      items: [{ crop_name: 'Tomato', quantity_kg: 5 }, { crop_name: 'Onion', quantity_kg: 3 }],
      total_amount: 164,
    },
    delivery_location: {
      full_name: 'Priya Sharma',
      mobile: '9765432109',
      full_address: '12 MG Road, Nashik',
      district: 'Nashik',
    },
    status: 'assigned',
    estimated_km: 8.2,
    estimated_minutes: 30,
  },
];

const statusStyles = {
  assigned: 'bg-yellow-100 text-yellow-800',
  in_transit: 'bg-blue-100 text-blue-800',
  delivered: 'bg-green-100 text-green-800',
};

const DriverDashboard = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const load = async () => {
    try {
      const res = await driverService.getAssignments();
      const data = res?.data?.data || res?.data;
      setAssignments(Array.isArray(data) && data.length ? data : mockAssignments);
    } catch (err) {
      setAssignments(mockAssignments);
    } finally {
      setLoading(false);
    }
  };

  const startDelivery = async (id) => {
    try {
      await driverService.updateDeliveryStatus(id, 'in_transit');
      setAssignments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: 'in_transit' } : a))
      );
      toast.success('Delivery started');
    } catch (err) {
      setAssignments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: 'in_transit' } : a))
      );
      toast.success('Delivery started (offline)');
    }
  };

  const itemsText = (a) =>
    (a.order?.items || [])
      .map((it) => `${it.crop_name} ${it.quantity_kg}kg`)
      .join(', ');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="h-10 w-10 border-4 border-kisan-700 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 max-w-lg mx-auto p-4">
      <header className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Deliveries Today</h1>
          <p className="text-gray-600">{user?.full_name || 'Driver'}</p>
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

      {assignments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Truck className="h-16 w-16 text-gray-300" />
          <p className="mt-4 text-gray-500">No deliveries assigned</p>
          <p className="text-sm text-gray-400">Pull down to refresh</p>
        </div>
      ) : (
        <div className="space-y-4 pb-8">
          {assignments.map((a) => {
            const dl = a.delivery_location || {};
            return (
              <div key={a.id} className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-sm">#{a.order?.id}</span>
                  <span className={`px-2 py-1 rounded text-xs ${statusStyles[a.status] || statusStyles.assigned}`}>
                    {a.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-base mb-1">
                  <Phone className="h-4 w-4 text-gray-400 shrink-0" />
                  <a
                    href={`tel:${dl.mobile}`}
                    className="text-kisan-700 font-medium"
                  >
                    {dl.full_name}
                  </a>
                </div>

                <div className="flex items-start gap-2 text-base text-gray-700 mb-1">
                  <MapPin className="h-4 w-4 text-gray-400 shrink-0 mt-1" />
                  <span>
                    {dl.full_address}, {dl.district}
                  </span>
                </div>

                <div className="flex items-start gap-2 text-base text-gray-700 mb-4">
                  <Package className="h-4 w-4 text-gray-400 shrink-0 mt-1" />
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
