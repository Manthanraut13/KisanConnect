import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { logger } from '../lib/logger';
import Frontispiece from '../components/brand/Frontispiece';

const ROLE_CHIPS = [
  { id: 'farmer', label: 'Farmer', icon: 'styler' },
  { id: 'consumer', label: 'Consumer', icon: 'shopping_basket' },
  { id: 'bulk_buyer', label: 'Bulk Buyer', icon: 'business_center' },
  { id: 'logistics', label: 'Logistics', icon: 'local_shipping' },
];

const Register = () => {
  const [role, setRole] = useState('consumer');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const [form, setForm] = useState({
    full_name: '',
    mobile: '',
    email: '',
    password: '',
    district: '',
    state: '',
  });

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await api.post('/api/auth/register', { ...form, role });
      logger.form.submit('Register', { mobile: form.mobile, role });
      navigate('/login');
    } catch (err) {
      logger.auth.error('register', err);
      setError(err.response?.data?.message || err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const inputCls =
    'w-full h-11 pl-4 pr-4 rounded-lg bg-surface-container-lowest text-on-surface font-body-md text-body-md shadow-sm outline-none focus:bg-surface-bright focus:shadow-md transition-all';

  return (
    <div className="w-full max-w-[1600px] mx-auto min-h-screen lg:min-h-[920px] grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
      <Frontispiece />
      {/* RIGHT PANEL: Role-Aware Registration */}
      <div className="lg:col-span-5 bg-surface flex items-center justify-center p-6 sm:p-10 lg:p-12">
        <div className="w-full max-w-md bg-surface-container-lowest rounded-2xl shadow-xl p-8 sm:p-9 transition-all duration-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline">Ecosystem Onboarding</span>
              <h1 className="font-headline-lg text-headline-lg text-on-background mt-0.5">Create Your Portal Node</h1>
            </div>
            <div className="px-3 py-1 rounded-full text-label-sm font-label-sm bg-surface-container text-primary flex items-center gap-1.5">
              <span className="material-symbols text-sm">person_add</span>
              <span>New Node</span>
            </div>
          </div>
          {/* Segmented Role Chips */}
          <div className="bg-surface-container-low p-1 rounded-xl mb-6 flex items-center gap-1">
            {ROLE_CHIPS.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setRole(r.id)}
                className={`flex-1 py-2 rounded-lg text-center font-label-md text-label-md transition-all duration-150 flex items-center justify-center gap-1 ${
                  role === r.id
                    ? 'bg-surface-container-lowest text-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="material-symbols text-base">{r.icon}</span>
                {r.label}
              </button>
            ))}
          </div>
          {/* Form Elements */}
          <form className="space-y-4" onSubmit={onSubmit}>
            <div>
              <label className="block font-label-md text-label-md text-on-surface-variant mb-1.5">Full Name</label>
              <input className={inputCls} placeholder="e.g. Marcus Vance" type="text" value={form.full_name} onChange={set('full_name')} required />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-label-md text-label-md text-on-surface-variant mb-1.5">Mobile Number</label>
                <input className={inputCls} placeholder="9876543210" type="tel" maxLength={10} value={form.mobile} onChange={set('mobile')} required />
              </div>
              <div>
                <label className="block font-label-md text-label-md text-on-surface-variant mb-1.5">Email (Optional)</label>
                <input className={inputCls} placeholder="you@agri-coop.org" type="email" value={form.email} onChange={set('email')} />
              </div>
            </div>
            <div>
              <label className="block font-label-md text-label-md text-on-surface-variant mb-1.5">Password</label>
              <input className={inputCls} placeholder="••••••••••••" type="password" value={form.password} onChange={set('password')} required autoComplete="new-password" />
              <span className="font-caption-light text-caption-light text-outline">Min 8 chars with uppercase, lowercase &amp; a number</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-label-md text-label-md text-on-surface-variant mb-1.5">District</label>
                <input className={inputCls} placeholder="e.g. Nashik" type="text" value={form.district} onChange={set('district')} required />
              </div>
              <div>
                <label className="block font-label-md text-label-md text-on-surface-variant mb-1.5">State</label>
                <input className={inputCls} placeholder="e.g. Maharashtra" type="text" value={form.state} onChange={set('state')} required />
              </div>
            </div>
            {error && (
              <div className="flex items-start gap-2 rounded-lg bg-error-container text-on-error-container px-4 py-2.5 text-body-sm font-body-sm">
                <span className="material-symbols text-base">error</span>
                <span>{error}</span>
              </div>
            )}
            <div className="pt-2">
              <button
                className="w-full h-12 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-headline-sm text-headline-sm flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all duration-150 active:scale-[0.99] disabled:opacity-60"
                type="submit"
                disabled={isLoading}
              >
                <span>{isLoading ? 'Creating node...' : 'Create Account'}</span>
                <span className="material-symbols text-xl">arrow_forward</span>
              </button>
            </div>
          </form>
          {/* Footer Link */}
          <div className="mt-7 text-center">
            <p className="font-body-md text-body-md text-on-surface-variant">
              Already have a node?{' '}
              <Link to="/login" className={`font-label-lg text-label-lg hover:underline ml-1 text-primary`}>
                Sign in
              </Link>
            </p>
          </div>
          {/* Regulatory Notice Stamp */}
          <div className="mt-6 pt-4 border-t-0 bg-surface-container-low rounded-lg p-2.5 flex items-center gap-2 text-outline">
            <span className="material-symbols text-base text-primary">verified_user</span>
            <span className="font-label-sm text-label-sm">FSA &amp; CFTC Encrypted Compliance Gateway • v4.9.2</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;