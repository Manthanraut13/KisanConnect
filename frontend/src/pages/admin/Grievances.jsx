import { useEffect, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminService } from '../../services/admin.service';

const mockGrievances = [
  { id: 'grievance-uuid-0001', user: { full_name: 'Priya Sharma' }, category: 'payment', severity: 'critical', description: 'Payment was deducted but order not confirmed. Money not refunded yet.', status: 'open', sla_deadline: '2026-09-03' },
  { id: 'grievance-uuid-0002', user: { full_name: 'Ramesh Patil' }, category: 'logistics', severity: 'high', description: 'Driver did not arrive for pickup at the scheduled time.', status: 'in_progress', sla_deadline: '2026-09-05' },
  { id: 'grievance-uuid-0003', user: { full_name: 'Anita Singh' }, category: 'quality', severity: 'low', description: 'Tomatoes were slightly damaged on delivery.', status: 'resolved', sla_deadline: '2026-09-04' },
  { id: 'grievance-uuid-0004', user: { full_name: 'Rahul Verma' }, category: 'fraud', severity: 'critical', description: 'Suspicious account activity reported on my profile.', status: 'open', sla_deadline: '2026-09-02' },
];

const categoryStyles = {
  payment: 'bg-blue-100 text-blue-800',
  logistics: 'bg-orange-100 text-orange-800',
  quality: 'bg-green-100 text-green-800',
  fraud: 'bg-red-100 text-red-800',
  other: 'bg-gray-100 text-gray-700',
};

const severityStyles = {
  critical: 'bg-red-100 text-red-800 font-bold',
  high: 'bg-orange-100 text-orange-800',
  medium: 'bg-yellow-100 text-yellow-800',
  low: 'bg-gray-100 text-gray-700',
};

const statusStyles = {
  open: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-blue-100 text-blue-800',
  resolved: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-700',
};

const Grievances = () => {
  const [grievances, setGrievances] = useState(mockGrievances);
  const [selected, setSelected] = useState(null);
  const [resolveNote, setResolveNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [error, setError] = useState('');
  const userName = (grievance) => grievance.user?.full_name || grievance.user?.name || grievance.user_name || 'Unknown user';

  useEffect(() => {
    const load = async () => {
      try {
        const res = await adminService.getGrievances();
        const data = res?.data?.data || res?.data;
        if (Array.isArray(data)) setGrievances(data);
      } catch (err) {
        setError('Could not load live grievances. Showing demo data.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = grievances.filter(
    (g) =>
      (statusFilter === 'all' || g.status === statusFilter) &&
      (severityFilter === 'all' || g.severity === severityFilter)
  );

  const openResolve = (g) => {
    setSelected(g);
    setResolveNote('');
  };

  const handleResolve = async () => {
    if (!selected) return;
    try {
      await adminService.resolveGrievance(selected.id, resolveNote);
      setGrievances((prev) =>
        prev.map((g) =>
          g.id === selected.id ? { ...g, status: 'resolved' } : g
        )
      );
      toast.success(`Grievance #${selected.id.slice(0, 8)} resolved`);
      setSelected(null);
      setResolveNote('');
    } catch (err) {
      toast.error('Failed to resolve grievance');
    }
  };

  return (
    <AdminLayout pageTitle="Grievances">
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="all">All Status</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="all">All Severity</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>
      {error && <p className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">{error}</p>}

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="py-3 px-4">Ticket #</th>
                <th className="py-3 px-4">User Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">SLA Deadline</th>
                <th className="py-3 px-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan="8" className="py-8 text-center text-gray-500">No grievances found.</td></tr>
              ) : filtered.map((g) => {
                const overdue =
                  g.status !== 'resolved' &&
                  g.status !== 'closed' &&
                  new Date(g.sla_deadline) < new Date();
                const resolved = g.status === 'resolved' || g.status === 'closed';
                return (
                  <tr key={g.id} className="border-b border-gray-50">
                    <td className="py-3 px-4 font-mono text-xs">
                      #{String(g.id || 'unknown').replace('grievance-uuid-', '').slice(0, 8)}
                    </td>
                    <td className="py-3 px-4">{userName(g)}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs ${categoryStyles[g.category] || categoryStyles.other}`}>
                        {g.category}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs ${severityStyles[g.severity]}`}>
                        {g.severity}
                      </span>
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <span
                        className="truncate block"
                        title={g.description || ''}
                      >
                        {(g.description || 'No description').length > 45
                          ? `${(g.description || '').slice(0, 45)}...`
                          : g.description || 'No description'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs ${statusStyles[g.status]}`}>
                        {(g.status || 'open').replace('_', ' ')}
                      </span>
                    </td>
                    <td className={`py-3 px-4 ${overdue ? 'text-red-600' : ''}`}>
                      <span className="flex items-center gap-1">
                        {g.sla_deadline}
                        {overdue && <AlertCircle className="h-4 w-4" />}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => openResolve(g)}
                        disabled={resolved}
                        className="px-3 py-1 bg-kisan-700 text-white text-xs rounded hover:bg-kisan-800 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Resolve
                      </button>
                    </td>
                  </tr>
                );
              })}
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
            <h3 className="font-semibold text-lg mb-4">
              Resolve Grievance #{String(selected.id || 'unknown').replace('grievance-uuid-', '').slice(0, 8)}
            </h3>
            <div className="text-sm text-gray-700 space-y-1 mb-4">
              <p><span className="text-gray-500">User:</span> {userName(selected)}</p>
              <p><span className="text-gray-500">Category:</span> {selected.category}</p>
              <p><span className="text-gray-500">Severity:</span> {selected.severity}</p>
              <p><span className="text-gray-500">Description:</span> {selected.description || 'No description'}</p>
            </div>
            <textarea
              value={resolveNote}
              onChange={(e) => setResolveNote(e.target.value)}
              placeholder="Resolution note..."
              rows={3}
              className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-kisan-500"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setSelected(null)}
                className="flex-1 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleResolve}
                className="flex-1 py-2 bg-kisan-700 text-white rounded-lg text-sm hover:bg-kisan-800"
              >
                Mark Resolved
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default Grievances;
