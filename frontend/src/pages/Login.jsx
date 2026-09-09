import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { getRoleHome } from '../lib/roles';
import api from '../services/api';
import { logger } from '../lib/logger';
import Frontispiece from '../components/brand/Frontispiece';

const ROLE_CONFIGS = {
  farmer: {
    name: 'Farmer',
    badgeText: 'Farmer Node',
    badgeIcon: 'yard',
    badgeBg: 'bg-surface-container',
    badgeTextColor: 'text-primary',
    ctaBg: 'bg-primary',
    ctaHover: 'hover:bg-primary-container',
    ctaText: 'Sign in as Farmer',
    inputLabel: 'Farm Registration ID',
    inputHint: 'USDA/FSA Standard',
    inputIcon: 'badge',
    inputPlaceholder: 'e.g. FSA-8829-01TX',
    registerText: 'Register as Farmer',
    linkColor: 'text-primary',
    tabActiveClasses: 'bg-surface-container-lowest text-primary shadow-sm',
  },
  consumer: {
    name: 'Consumer',
    badgeText: 'Buyer / Retail Node',
    badgeIcon: 'shopping_basket',
    badgeBg: 'bg-secondary-fixed',
    badgeTextColor: 'text-secondary',
    ctaBg: 'bg-secondary',
    ctaHover: 'hover:bg-on-secondary-container',
    ctaText: 'Sign in as Consumer',
    inputLabel: 'Phone Number or Buyer ID',
    inputHint: 'E.164 Format or BID',
    inputIcon: 'contact_phone',
    inputPlaceholder: '+1 (555) 019-2831',
    registerText: 'Register as Consumer',
    linkColor: 'text-secondary',
    tabActiveClasses: 'bg-surface-container-lowest text-secondary shadow-sm',
  },
  logistics: {
    name: 'Logistics',
    badgeText: 'Fleet / Carrier Node',
    badgeIcon: 'local_shipping',
    badgeBg: 'bg-tertiary-fixed',
    badgeTextColor: 'text-tertiary',
    ctaBg: 'bg-tertiary',
    ctaHover: 'hover:bg-tertiary-container',
    ctaText: 'Sign in as Logistics Operator',
    inputLabel: 'Carrier DOT / Operator License No',
    inputHint: 'USDOT or MC/FF Num',
    inputIcon: 'commute',
    inputPlaceholder: 'DOT #3928102-X',
    registerText: 'Register as Carrier Fleet',
    linkColor: 'text-tertiary',
    tabActiveClasses: 'bg-surface-container-lowest text-tertiary shadow-sm',
  },
  admin: {
    name: 'Admin',
    badgeText: 'Authority & Auditor',
    badgeIcon: 'shield_person',
    badgeBg: 'bg-surface-container-highest',
    badgeTextColor: 'text-on-surface',
    ctaBg: 'bg-inverse-surface',
    ctaHover: 'hover:bg-on-surface',
    ctaText: 'Sign in as Admin',
    inputLabel: 'Hardware MFA / Admin Access Token',
    inputHint: 'FIPS 140-2 Key',
    inputIcon: 'key',
    inputPlaceholder: 'SEC-KEY-9941-XXXX',
    registerText: 'Request System Credentials',
    linkColor: 'text-on-surface',
    tabActiveClasses: 'bg-surface-container-lowest text-on-surface shadow-sm',
  },
};

const Login = () => {
  const [role, setRole] = useState('farmer');
  const [email, setEmail] = useState('');
  const [roleId, setRoleId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [ctaLabel, setCtaLabel] = useState('Sign in as Farmer');
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);

  const config = ROLE_CONFIGS[role];

  const selectRole = (r) => {
    setRole(r);
    setRoleId('');
    setError('');
  };

  const handleGoogleLogin = () => {
    setError('Google OAuth is not enabled for this deployment. Sign in with your registered email.');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setCtaLabel('Verifying Credentials...');

    try {
      const isMobile = /^[6-9]\d{9}$/.test(email.replace(/[\s-]/g, ''));
      const payload = isMobile ? { mobile: email.replace(/[\s-]/g, ''), password } : { email, password };
      const result = await api.post('/api/auth/login', payload);
      logger.form.submit('Login', { role, isMobile });

      setCtaLabel('Authorized - Redirecting...');
      setUser(result.data.data.user, result.data.data.access_token);
      setTimeout(() => navigate(getRoleHome(result.data.data.user.role)), 600);
    } catch (err) {
      logger.auth.error('login', err);
      setError(err.response?.data?.message || err.message || 'Login failed. Please try again.');
      setCtaLabel(config.ctaText);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto min-h-screen lg:min-h-[920px] grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
      <Frontispiece />
      {/* RIGHT PANEL: Role-Aware Login & Portal Access */}
      <div className="lg:col-span-5 bg-surface flex items-center justify-center p-6 sm:p-10 lg:p-12">
        <div className="w-full max-w-md bg-surface-container-lowest rounded-2xl shadow-xl p-8 sm:p-9 transition-all duration-200">
          {/* Header & Live Role Indicator */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline">Access Authentication</span>
              <h1 className="font-headline-lg text-headline-lg text-on-background mt-0.5">KisanConnect Portal</h1>
            </div>
            <div className={`px-3 py-1 rounded-full text-label-sm font-label-sm flex items-center gap-1.5 transition-colors duration-150 ${config.badgeBg} ${config.badgeTextColor}`}>
              <span className="material-symbols text-sm">{config.badgeIcon}</span>
              <span>{config.badgeText}</span>
            </div>
          </div>
          {/* Segmented Role Selection Tabs */}
          <div className="bg-surface-container-low p-1 rounded-xl mb-6 flex items-center gap-1">
            {Object.entries(ROLE_CONFIGS).map(([key, c]) => (
              <button
                key={key}
                type="button"
                onClick={() => selectRole(key)}
                className={`flex-1 py-2 rounded-lg text-center font-label-md text-label-md transition-all duration-150 ${
                  role === key ? c.tabActiveClasses : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
          {/* Form Elements */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Identity Field (email or mobile) */}
            <div>
              <label className="block font-label-md text-label-md text-on-surface-variant mb-1.5">Enterprise Email</label>
              <div className="relative">
                <span className="material-symbols absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-lg">mail</span>
                <input
                  className="w-full h-11 pl-10 pr-4 rounded-lg bg-surface-container-lowest text-on-surface font-body-md text-body-md shadow-sm outline-none focus:bg-surface-bright focus:shadow-md transition-all"
                  placeholder="name@agri-coop.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="username"
                />
              </div>
            </div>
            {/* Role-Specific Identifier Field (Dynamic) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-label-md text-label-md text-on-surface-variant">{config.inputLabel}</label>
                <span className="font-caption-light text-caption-light text-outline">{config.inputHint}</span>
              </div>
              <div className="relative">
                <span className="material-symbols absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-lg">{config.inputIcon}</span>
                <input
                  className="w-full h-11 pl-10 pr-4 rounded-lg bg-surface-container-lowest text-on-surface font-body-md text-body-md shadow-sm outline-none focus:bg-surface-bright focus:shadow-md transition-all"
                  placeholder={config.inputPlaceholder}
                  value={roleId}
                  onChange={(e) => setRoleId(e.target.value)}
                />
              </div>
            </div>
            {/* Password Field with Show/Hide Toggle */}
            <div>
              <label className="block font-label-md text-label-md text-on-surface-variant mb-1.5">Password</label>
              <div className="relative">
                <span className="material-symbols absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-lg">lock</span>
                <input
                  className="w-full h-11 pl-10 pr-12 rounded-lg bg-surface-container-lowest text-on-surface font-body-md text-body-md shadow-sm outline-none focus:bg-surface-bright focus:shadow-md transition-all"
                  placeholder="••••••••••••"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  aria-label="Toggle password visibility"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface p-1 flex items-center justify-center"
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                >
                  <span className="material-symbols text-lg">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>
            {/* Aux Row: Remember Me & Forgot Password */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input className="w-4 h-4 rounded text-primary accent-primary focus:ring-0 cursor-pointer" type="checkbox" />
                <span className="font-body-sm text-body-sm text-on-surface-variant">Remember device</span>
              </label>
              <Link to="/support" className="font-label-md text-label-md text-primary hover:underline">Forgot password?</Link>
            </div>
            {error && (
              <div className="flex items-start gap-2 rounded-lg bg-error-container text-on-error-container px-4 py-2.5 text-body-sm font-body-sm">
                <span className="material-symbols text-base">error</span>
                <span>{error}</span>
              </div>
            )}
            {/* Dynamic Role CTA Submit Button */}
            <div className="pt-2">
              <button
                className={`w-full h-12 rounded-lg text-on-primary font-headline-sm text-headline-sm flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all duration-150 active:scale-[0.99] ${config.ctaBg} ${config.ctaHover} disabled:opacity-60`}
                type="submit"
                disabled={isLoading}
              >
                <span>{ctaLabel}</span>
                <span className="material-symbols text-xl">arrow_forward</span>
              </button>
            </div>
            {/* Divider */}
            <div className="flex items-center my-4">
              <div className="flex-grow h-px bg-surface-container-highest"></div>
              <span className="px-3 font-label-sm text-label-sm text-outline uppercase tracking-wider">or authenticate with</span>
              <div className="flex-grow h-px bg-surface-container-highest"></div>
            </div>
            {/* Google OAuth Secondary Button */}
            <button
              className="w-full h-11 rounded-lg bg-surface-container-lowest hover:bg-surface-container-low text-on-surface font-label-lg text-label-lg flex items-center justify-center gap-3 shadow-sm hover:shadow transition-all duration-150"
              type="button"
              onClick={handleGoogleLogin}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z" fill="#4285F4"></path>
                <path d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z" fill="#34A853"></path>
                <path d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z" fill="#FBBC05"></path>
                <path d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" fill="#EA4335"></path>
              </svg>
              <span>Continue with Google</span>
            </button>
          </form>
          {/* Footer Link (Dynamic based on selected role) */}
          <div className="mt-7 text-center">
            <p className="font-body-md text-body-md text-on-surface-variant">
              Don't have an account?{' '}
              <Link to="/register" className={`font-label-lg text-label-lg hover:underline ml-1 ${config.linkColor}`}>
                {config.registerText}
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

export default Login;