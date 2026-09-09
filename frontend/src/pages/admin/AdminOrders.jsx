import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { toast } from 'sonner';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminService } from '../../services/admin.service';

const statusStyles = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  packed: 'bg-purple-100 text-purple-800',
  in_transit: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  refunded: 'bg-surface-container text-on-surface',
};

const paymentStyles = {
  paid: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  failed: 'bg-red-100 text-red-800',
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const params = {
          page,
          limit: 15,
          search: search.trim() || undefined,
          status: statusFilter || undefined,
        };
        const res = await adminService.getOrders(params);
        if (cancelled) return;
        const data = res?.data?.data || res?.data;
        if (Array.isArray(data)) setOrders(data);
        const total = res?.data?.pagination?.total;
        if (typeof total === 'number') setTotalPages(Math.max(1, Math.ceil(total / params.limit)));
      } catch (err) {
        if (!cancelled) setError('Could not load orders.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [page, search, statusFilter]);

  const shortId = (id) => String(id || 'unknown').slice(0, 8);
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
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant/70" />
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search by buyer name or mobile"
          className="w-full pl-10 pr-3 py-2 border border-outline rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-kisan-500"
        />
      </div>
      <div className="relative mb-4 max-w-sm">
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="w-full px-3 py-2 border border-outline rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-kisan-500"
        >
          <option value="">All statuses</option>
          {Object.keys(statusStyles).map((s) => (
            <option key={s} value={s}>{s.replace('_', ' ')}</option>
          ))}
        </select>
      </div>
      {error && <p className="mb-4 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-800">{error}</p>}

      {loading ? (
        <p className="text-on-surface-variant">Loading...</p>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-outline-variant/60 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-on-surface-variant border-b border-outline-variant/60">
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
              {orders.length === 0 ? (
                <tr><td colSpan="7" className="py-8 text-center text-on-surface-variant">No orders found.</td></tr>
              ) : orders.map((o) => (
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
                  <td className="py-3 px-4 text-on-surface-variant">{orderDate(o)}</td>
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
          <div className="flex items-center justify-between mt-4 text-sm">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 border border-outline rounded disabled:opacity-40"
            >
              Previous
            </button>
            <span>Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= totalPages}
              className="px-3 py-1 border border-outline rounded disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </>
      )}

      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setSelected(null)}>
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-semibold text-lg mb-2">Order #{shortId(selected.id)}</h3>
            <p className="text-sm text-on-surface mb-4">
              Buyer: {buyerName(selected)} · ₹{(selected.total_amount || 0).toLocaleString('en-IN')}
            </p>
            <div className="border border-outline-variant/60 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-surface text-left text-on-surface-variant">
                    <th className="py-2 px-3">Item</th>
                    <th className="py-2 px-3">Qty (kg)</th>
                    <th className="py-2 px-3">Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {(selected.items || []).map((it, i) => (
                    <tr key={i} className="border-t border-outline-variant/60">
                      <td className="py-2 px-3">{it.crop_name}</td>
                      <td className="py-2 px-3">{it.quantity_kg}</td>
                      <td className="py-2 px-3">₹{it.price_per_kg}/kg</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 space-y-1 text-sm text-on-surface">
              <p><span className="text-on-surface-variant">Buyer:</span> {buyerName(selected)} <span className="text-on-surface-variant/70">({selected.buyer?.mobile || '—'})</span></p>
              <p><span className="text-on-surface-variant">Payment:</span> {selected.payment_status} {selected.payment_method ? `· ${selected.payment_method}` : ''}</p>
              <p><span className="text-on-surface-variant">Status:</span> {orderStatus(selected).replace('_', ' ')} {selected.logisticsAssignment?.status ? `· Delivery: ${selected.logisticsAssignment.status.replace('_', ' ')}` : ''}</p>
              {selected.delivery_address?.district && (
                <p><span className="text-on-surface-variant">Deliver to:</span> {selected.delivery_address.district}{selected.delivery_address.city ? `, ${selected.delivery_address.city}` : ''}</p>
              )}
              <p><span className="text-on-surface-variant">Date:</span> {orderDate(selected)}</p>
            </div>
            <button
              onClick={() => setSelected(null)}
              className="mt-5 w-full py-2 bg-surface-container rounded-xl text-sm hover:bg-surface-high"
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
