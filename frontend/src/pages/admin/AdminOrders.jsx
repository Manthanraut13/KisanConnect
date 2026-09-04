import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { toast } from 'sonner';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminService } from '../../services/admin.service';

const mockOrders = [
  { id: 'order-uuid-0001', buyer: { full_name: 'Priya Sharma' }, total_amount: 220, status: 'delivered', payment_status: 'paid', createdAt: '2026-08-26', items: [{ crop_name: 'Tomato', quantity_kg: 5, price_per_kg: 22 }] },
  { id: 'order-uuid-0002', buyer: { full_name: 'Rajesh Kumar' }, total_amount: 94, status: 'in_transit', payment_status: 'paid', createdAt: '2026-08-27', items: [{ crop_name: 'Onion', quantity_kg: 5, price_per_kg: 18 }] },
  { id: 'order-uuid-0003', buyer: { full_name: 'Anita Singh' }, total_amount: 310, status: 'pending', payment_status: 'pending', createdAt: '2026-08-28', items: [{ crop_name: 'Potato', quantity_kg: 10, price_per_kg: 25 }, { crop_name: 'Tomato', quantity_kg: 3, price_per_kg: 20 }] },
];

const statusStyles = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  in_transit: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const paymentStyles = {
  paid: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  failed: 'bg-red-100 text-red-800',
};

const AdminOrders = () => {
  const [orders, setOrders] = useState(mockOrders);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await adminService.getOrders();
        const data = res?.data?.data || res?.data;
        if (Array.isArray(data)) setOrders(data);
      } catch (err) {
        setError('Could not load live orders. Showing demo data.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(
    () =>
      orders.filter(
        (o) =>
          !search ||
          String(o.id || '').toLowerCase().includes(search.toLowerCase()) ||
          (o.buyer?.full_name || o.buyer?.name || o.buyer_name || 'Unknown buyer').toLowerCase().includes(search.toLowerCase())
      ),
    [orders, search]
  );

  const shortId = (id) => String(id || 'unknown').replace('order-uuid-', '').slice(0, 8);
  const buyerName = (order) => order.buyer?.full_name || order.buyer?.name || order.buyer_name || 'Unknown buyer';
  const orderDate = (order) => (order.createdAt || order.created_at || '').slice(0, 10) || '—';
  const orderStatus = (order) => order.status || 'pending';

  const handleStatusChange = async (order, status) => {
    if (status === orderStatus(order)) return;
    setUpdatingId(order.id);
    try {
      await adminService.updateOrderStatus(order.id, status);
      setOrders((current) => current.map((item) => (
        item.id === order.id ? { ...item, status } : item
      )));
      setSelected((current) => current?.id === order.id ? { ...current, status } : current);
      toast.success('Order status updated');
    } catch (err) {
      toast.error('Could not update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <AdminLayout pageTitle="Orders">
      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by order ID or buyer"
          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-kisan-500"
        />
      </div>
      {error && <p className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">{error}</p>}

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Buyer Name</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan="7" className="py-8 text-center text-gray-500">No orders found.</td></tr>
              ) : filtered.map((o) => (
                <tr key={o.id} className="border-b border-gray-50">
                  <td className="py-3 px-4 font-mono text-xs">#{shortId(o.id)}</td>
                  <td className="py-3 px-4">{buyerName(o)}</td>
                  <td className="py-3 px-4">₹{(o.total_amount || 0).toLocaleString('en-IN')}</td>
                  <td className="py-3 px-4">
                    <select
                      value={orderStatus(o)}
                      onChange={(event) => handleStatusChange(o, event.target.value)}
                      disabled={updatingId === o.id}
                      aria-label={`Update status for order ${o.id}`}
                      className={`px-2 py-1 rounded text-xs border-0 ${statusStyles[orderStatus(o)] || statusStyles.pending}`}
                    >
                      {Object.keys(statusStyles).map((status) => (
                        <option key={status} value={status}>{status.replace('_', ' ')}</option>
                      ))}
                    </select>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs ${paymentStyles[o.payment_status] || paymentStyles.pending}`}>
                      {o.payment_status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-500">{orderDate(o)}</td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => setSelected(o)}
                      className="px-3 py-1 border border-kisan-700 text-kisan-700 text-xs rounded hover:bg-kisan-50"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setSelected(null)}>
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-semibold text-lg mb-2">Order #{shortId(selected.id)}</h3>
            <p className="text-sm text-gray-700 mb-4">
              Buyer: {buyerName(selected)} · ₹{(selected.total_amount || 0).toLocaleString('en-IN')}
            </p>
            <div className="border border-gray-100 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left text-gray-500">
                    <th className="py-2 px-3">Item</th>
                    <th className="py-2 px-3">Qty (kg)</th>
                    <th className="py-2 px-3">Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {(selected.items || []).map((it, i) => (
                    <tr key={i} className="border-t border-gray-100">
                      <td className="py-2 px-3">{it.crop_name}</td>
                      <td className="py-2 px-3">{it.quantity_kg}</td>
                      <td className="py-2 px-3">₹{it.price_per_kg}/kg</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              onClick={() => setSelected(null)}
              className="mt-5 w-full py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminOrders;
