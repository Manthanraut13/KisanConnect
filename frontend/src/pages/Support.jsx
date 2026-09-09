import { useEffect, useState, useCallback } from 'react';
import {
  Ticket,
  Plus,
  LifeBuoy,
  RefreshCw,
  Clock,
  CheckCircle2,
  MessageSquareText,
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../services/api';
import { useAuthStore } from '../stores/authStore';
import { logger } from '../lib/logger';

const CATEGORIES = ['payment', 'logistics', 'quality', 'fraud', 'other'];
const SEVERITIES = ['low', 'medium', 'high', 'critical'];

const categoryStyles = {
  payment: 'bg-blue-100 text-blue-800',
  logistics: 'bg-orange-100 text-orange-800',
  quality: 'bg-primary-container/25 text-primary',
  fraud: 'bg-red-100 text-red-800',
  other: 'bg-surface-container text-on-surface',
};

const severityStyles = {
  critical: 'bg-red-100 text-red-800',
  high: 'bg-orange-100 text-orange-800',
  medium: 'bg-yellow-100 text-yellow-800',
  low: 'bg-surface-container text-on-surface',
};

const statusStyles = {
  open: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-blue-100 text-blue-800',
  resolved: 'bg-primary-container/25 text-primary',
  closed: 'bg-surface-container text-on-surface',
};

export default function Support() {
  const user = useAuthStore((s) => s.user);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('list');
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ category: 'other', severity: 'medium', description: '' });

  const loadTickets = useCallback(async () => {
    try {
      const res = await api.get('/api/grievances');
      const data = res.data ?? res;
      const list = data.data ?? data.grievances ?? data.items ?? data.results ?? data;
      setTickets(Array.isArray(list) ? list : []);
      logger.info('SUPPORT', 'Tickets loaded', { count: Array.isArray(list) ? list.length : 0 });
    } catch (err) {
      logger.error('SUPPORT', 'Failed to load tickets', err);
      toast.error('Could not load your tickets');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTickets();
    const timer = setInterval(loadTickets, 30000);
    return () => clearInterval(timer);
  }, [loadTickets]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.description.trim()) {
      toast.error('Please describe the issue');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post('/api/grievances', {
        category: form.category,
        severity: form.severity,
        description: form.description.trim(),
      });
      toast.success(res.data?.message || 'Ticket raised. Our team will reach out.');
      setForm({ category: 'other', severity: 'medium', description: '' });
      setActiveTab('list');
      await loadTickets();
    } catch (err) {
      logger.error('SUPPORT', 'Failed to raise ticket', err);
      toast.error(err.response?.data?.message || 'Could not raise ticket');
    } finally {
      setSubmitting(false);
    }
  };

  const initials = (user?.full_name || 'U')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="min-h-screen bg-surface pb-10">
      <div className="max-w-3xl mx-auto pt-8 px-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary text-on-primary flex items-center justify-center text-sm font-bold">
              {initials}
            </div>
            <div>
              <h1 className="text-2xl font-bold">Help & Support</h1>
              <p className="text-sm text-on-surface-variant">{user?.full_name || 'User'} · {user?.role || ''}</p>
            </div>
          </div>
          <button
            onClick={loadTickets}
            className="p-2 bg-white border border-outline-variant/80 rounded-xl text-on-surface-variant hover:bg-surface"
            title="Refresh"
          >
            <RefreshCw className="h-5 w-5 text-primary" />
          </button>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('list')}
            className={`px-4 py-2 rounded-xl text-sm font-medium ${
              activeTab === 'list' ? 'bg-primary text-on-primary' : 'bg-white border border-outline-variant/80 text-on-surface'
            }`}
          >
            <Ticket className="h-4 w-4 inline mr-1" /> My Tickets ({tickets.length})
          </button>
          <button
            onClick={() => setActiveTab('new')}
            className={`px-4 py-2 rounded-xl text-sm font-medium ${
              activeTab === 'new' ? 'bg-primary text-on-primary' : 'bg-white border border-outline-variant/80 text-on-surface'
            }`}
          >
            <Plus className="h-4 w-4 inline mr-1" /> Raise New
          </button>
        </div>

        {activeTab === 'list' ? (
          loading && tickets.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-10 text-center text-on-surface-variant/70">Loading tickets...</div>
          ) : tickets.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-10 text-center">
              <LifeBuoy className="h-12 w-12 text-on-surface-variant/60 mx-auto mb-3" />
              <p className="text-on-surface-variant">No tickets yet. Need help? Raise one in 30 seconds.</p>
              <button
                onClick={() => setActiveTab('new')}
                className="mt-4 px-4 py-2 bg-primary text-on-primary rounded-xl text-sm hover:bg-primary-container"
              >
                <Plus className="h-4 w-4 inline mr-1" /> Raise a Ticket
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {tickets.map((t) => (
                <div key={t.id} className="bg-white rounded-xl shadow-sm border border-outline-variant/60 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-on-surface-variant">#{t.id.slice(0, 8)}</span>
                      <span className={`px-2 py-1 rounded text-xs ${categoryStyles[t.category] || categoryStyles.other}`}>
                        {t.category}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs ${severityStyles[t.severity] || severityStyles.medium}`}>
                        {t.severity}
                      </span>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${statusStyles[t.status] || statusStyles.open}`}>
                      {t.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-on-surface text-sm mb-2">{t.description}</p>
                  {t.order && (
                    <p className="text-xs text-on-surface-variant mb-2">
                      Order #{t.order.id.slice(0, 8)} · ₹{t.order.total_amount}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-4 text-xs text-on-surface-variant/70 border-t border-outline-variant/60 pt-2 mt-2">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Raised {new Date(t.created_at || Date.now()).toLocaleDateString('en-IN')}
                    </span>
                    {t.sla_deadline && (
                      <span className="flex items-center gap-1">
                        Target resolution {new Date(t.sla_deadline).toLocaleDateString('en-IN')}
                      </span>
                    )}
                    {['resolved', 'closed'].includes(t.status) && (
                      <span className="flex items-center gap-1 text-primary">
                        <CheckCircle2 className="h-3 w-3" /> Resolved
                      </span>
                    )}
                  </div>
                  {t.resolution_note && (
                    <div className="mt-2 bg-surface-container border border-outline-variant/60 text-on-surface rounded-xl px-3 py-2 text-sm flex gap-2">
                      <MessageSquareText className="h-4 w-4 shrink-0 mt-0.5" />
                      {t.resolution_note}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-outline-variant/60 p-6">
            <h2 className="font-semibold text-lg mb-4">Raise a Ticket</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm text-on-surface-variant mb-1">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-outline rounded-xl text-sm"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-on-surface-variant mb-1">Severity</label>
                <select
                  value={form.severity}
                  onChange={(e) => setForm((f) => ({ ...f, severity: e.target.value }))}
                  className="w-full px-3 py-2 border border-outline rounded-xl text-sm"
                >
                  {SEVERITIES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm text-on-surface-variant mb-1">Describe the issue</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={4}
                placeholder="Tell us what went wrong..."
                className="w-full border border-outline rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto px-6 py-2.5 bg-primary text-on-primary rounded-xl text-sm hover:bg-primary-container disabled:opacity-60"
            >
              {submitting ? 'Submitting...' : 'Submit Ticket'}
            </button>
            <p className="text-xs text-on-surface-variant/70 mt-3">
              Our team will respond within 48 hours. You can track status here.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}