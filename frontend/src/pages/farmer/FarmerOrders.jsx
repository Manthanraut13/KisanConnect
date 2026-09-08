import { useEffect, useState, useCallback } from 'react';
import { Package, ArrowLeft, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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

const STATUS_STYLES = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-blue-100 text-blue-700',
  packed: 'bg-violet-100 text-violet-700',
  in_transit: 'bg-cyan-100 text-cyan-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  refunded: 'bg-gray-200 text-gray-600',
};

function itemQty(item) {
  const q = Number(item?.quantity_kg ?? 0);
  return Number.isFinite(q) ? q : 0;
}

export default function FarmerOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/orders?limit=100');
      const data = res.data ?? res;
      const list = data.orders ?? data.items ?? data.results ?? data.data ?? [];
      setOrders(list);
      logger.info('FARMER_ORDERS', 'Orders loaded', { count: list.length });
    } catch (err) {
      logger.error('FARMER_ORDERS', 'Failed to load orders', err);
      toast.error('Could not load orders');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const updateStatus = async (order, nextStatus) => {
    try {
      const res = await api.put(`/api/orders/${order.id}/status`, { status: nextStatus });
      toast.success(res.data?.message ?? `Order ${nextStatus}`);
      await loadOrders();
    } catch (err) {
      logger.error('FARMER_ORDERS', 'Status update failed', err);
      toast.error(err.response?.data?.error || err.response?.data?.message || 'Status update failed');
    }
  };

  const totalPackedQty = (order) => (order.items || []).reduce((s, it) => s + itemQty(it), 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-green-800">Farm Orders</h1>
          <p className="text-sm text-gray-500 mt-1">
            Pack the confirmed orders and track your available stock in real time
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/farmer/dashboard')}>
            <ArrowLeft className="h-4 w-4" /> Dashboard
          </Button>
          <Button variant="outline" onClick={loadOrders}>
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Orders ({orders.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading && orders.length === 0 ? (
            <p className="text-gray-500 py-12 text-center">Loading orders...</p>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No orders for your produce yet</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Buyer</TableHead>
                  <TableHead>Items (Packed Qty)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <div className="font-mono text-xs">{(order.id || '').slice(0, 8)}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(order.created_at || Date.now()).toLocaleDateString('en-IN')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{order.buyer?.full_name || '-'}</div>
                      <div className="text-xs text-gray-500">{order.buyer?.mobile || ''} · {order.delivery_address?.district || ''}</div>
                    </TableCell>
                    <TableCell>
                      {(order.items || []).map((item) => (
                        <div key={item.id} className="text-sm flex items-center justify-between gap-4 border-b border-gray-100 last:border-0 py-1">
                          <span className="font-medium">{item.crop_name}</span>
                          <span className="text-gray-600">
                            {itemQty(item)} kg · ₹{Number(item.price_per_kg ?? 0)}/kg
                          </span>
                          <span className="text-xs text-gray-500 whitespace-nowrap">
                            left: {Number(item.listing?.available_kg ?? '-')} kg
                          </span>
                        </div>
                      ))}
                      <div className="text-xs text-gray-400 mt-1">Total pack qty: {totalPackedQty(order)} kg</div>
                    </TableCell>
                    <TableCell>
                      <Badge className={STATUS_STYLES[order.status] || 'bg-gray-200 text-gray-600'}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {['confirmed', 'pending'].includes(order.status) && (
                        <Button size="sm" onClick={() => updateStatus(order, 'packed')} className="bg-violet-600 hover:bg-violet-700">
                          Mark Packed
                        </Button>
                      )}
                      {order.status === 'packed' && (
                        <Button size="sm" variant="outline" onClick={() => updateStatus(order, 'confirmed')}>
                          Mark Unpacked
                        </Button>
                      )}
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