import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useCartStore } from '../stores/cartStore';
import { useTranslation } from 'react-i18next';
import cartService from '../services/cart.service';
import { logger } from '../lib/logger';
import KisanLogo from './brand/KisanLogo';

const ROLE_LINKS = {
  admin: [{ to: '/admin', label: 'Governance', icon: 'account_balance' }],
  logistics: [
    { to: '/driver', label: 'Dispatch', icon: 'local_shipping' },
    { to: '/driver/support', label: 'Support', icon: 'support_agent' },
  ],
  farmer: [
    { to: '/farmer/dashboard', label: 'Dashboard', icon: 'space_dashboard' },
    { to: '/farmer/listings', label: 'Crop Listings', icon: 'storefront' },
    { to: '/farmer/orders', label: 'Orders', icon: 'orders' },
    { to: '/farmer/advisory', label: 'Demand Advisory', icon: 'insights' },
    { to: '/farmer/support', label: 'Support', icon: 'support_agent' },
  ],
  fpo_admin: [
    { to: '/farmer/dashboard', label: 'Dashboard', icon: 'space_dashboard' },
    { to: '/farmer/listings', label: 'Crop Listings', icon: 'storefront' },
    { to: '/farmer/orders', label: 'Orders', icon: 'orders' },
    { to: '/farmer/advisory', label: 'Demand Advisory', icon: 'insights' },
    { to: '/farmer/support', label: 'Support', icon: 'support_agent' },
  ],
  consumer: [
    { to: '/marketplace', label: 'Marketplace', icon: 'storefront' },
    { to: '/orders', label: 'My Orders', icon: 'orders' },
    { to: '/support', label: 'Support', icon: 'support_agent' },
  ],
  bulk_buyer: [
    { to: '/marketplace', label: 'Marketplace', icon: 'storefront' },
    { to: '/orders', label: 'My Orders', icon: 'orders' },
    { to: '/support', label: 'Support', icon: 'support_agent' },
  ],
};

const Navbar = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const totalItems = useCartStore((s) => s.totalItems);
  const setCart = useCartStore((s) => s.setCart);
  const { t, i18n } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !['consumer', 'farmer', 'bulk_buyer'].includes(user?.role)) return;
    let cancelled = false;
    cartService
      .getCart()
      .then((res) => {
        if (cancelled) return;
        const data = res.data?.data ?? res.data;
        const items = Array.isArray(data) ? data : data?.items ?? [];
        setCart(items);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, user]);

  const toggleLanguage = () => {
    const next = i18n.language === 'hi' ? 'en' : 'hi';
    i18n.changeLanguage(next);
    localStorage.setItem('kc_language', next);
  };

  const handleLogout = () => {
    logger.auth.logout();
    logout();
    navigate('/');
    setDropdownOpen(false);
  };

  const initials = user?.full_name
    ? user.full_name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : '';

  const canShop = isAuthenticated && ['consumer', 'farmer', 'bulk_buyer'].includes(user?.role);
  const links = user?.role ? ROLE_LINKS[user.role] || [] : [];

  const profilePath =
    user?.role === 'farmer' || user?.role === 'fpo_admin'
      ? '/farmer/support'
      : user?.role === 'logistics'
        ? '/driver/support'
        : '/support';

  const symbol = (name, cls = '') => (
    <span className={`material-symbols ${cls}`} aria-hidden="true">{name}</span>
  );

  return (
    <header className="sticky top-0 z-50 bg-surface-container-lowest/90 backdrop-blur-md border-b border-outline-variant">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 h-16 flex items-center gap-3">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <KisanLogo size={34} />
          <span className="hidden sm:flex flex-col leading-none">
            <span className="font-headline-sm text-headline-sm tracking-tight text-on-surface">Kisan Connect</span>
            <span className="font-label-sm text-label-sm tracking-[0.16em] uppercase text-on-surface-variant">
              Commodity Logistics
            </span>
          </span>
        </Link>

        {/* Center pill nav */}
        {links.length > 0 && (
          <nav className="hidden lg:flex items-center gap-1 mx-auto rounded-full bg-surface-container-low p-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 font-label-md text-label-md rounded-full text-on-surface-variant hover:bg-surface-container-lowest hover:text-primary transition-colors"
              >
                {symbol(l.icon, 'text-base')}
                {l.label}
              </Link>
            ))}
          </nav>
        )}

        {/* Right controls */}
        <div className="flex items-center gap-1.5 ml-auto shrink-0">
          {isAuthenticated && user && (
            <span className="hidden md:inline-flex rounded-full bg-primary-fixed text-on-primary-fixed px-2.5 py-1 font-label-sm text-label-sm capitalize">
              {user.role.replace('_', ' ')} node
            </span>
          )}
          <button
            onClick={toggleLanguage}
            className="hidden md:flex px-3 py-1.5 font-label-md text-label-md bg-surface-container-low text-on-surface-variant rounded-full hover:bg-surface-container-highest transition-colors"
          >
            {i18n.language === 'hi' ? 'English' : 'हिंदी'}
          </button>

          <button
            className="p-2 text-on-surface-variant hover:bg-surface-container-low rounded-full transition-colors"
            aria-label="Notifications"
          >
            {symbol('notifications')}
          </button>

          {canShop && (
            <Link to="/cart" className="relative p-2 text-on-surface-variant hover:bg-surface-container-low rounded-full transition-colors" aria-label="Cart">
              {symbol('shopping_bag')}
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-secondary text-on-secondary text-[0.6rem] font-label-sm rounded-full h-[18px] min-w-[18px] px-1 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
          )}

          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-9 h-9 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-md text-label-md hover:bg-primary-container hover:text-on-primary-container transition-colors"
              >
                {initials}
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-surface-container-lowest rounded-xl shadow-xl ring-1 ring-outline-variant py-1 z-50">
                  <div className="px-4 py-2.5 border-b border-outline-variant/60">
                    <p className="font-label-md text-label-md text-on-surface">{user.full_name}</p>
                    <p className="font-label-sm text-label-sm capitalize text-on-surface-variant">{user.role.replace('_', ' ')}</p>
                  </div>
                  <Link to={profilePath} onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2 font-label-md text-label-md text-on-surface hover:bg-surface-container-low">
                    {symbol('support_agent', 'text-[18px]')} Support
                  </Link>
                  <Link to="/orders" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2 font-label-md text-label-md text-on-surface hover:bg-surface-container-low">
                    {symbol('receipt_long', 'text-[18px]')} {t('nav.orders')}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left flex items-center gap-2 px-4 py-2 font-label-md text-label-md text-error hover:bg-error-container/50"
                  >
                    {symbol('logout', 'text-[18px]')} {t('nav.logout')}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link to="/login" className="px-3.5 py-1.5 font-label-md text-label-md text-on-surface-variant hover:text-primary rounded-full hover:bg-surface-container-low transition-colors">
                {t('nav.login')}
              </Link>
              <Link to="/register" className="px-4 py-1.5 font-label-md text-label-md bg-primary text-on-primary rounded-full hover:bg-primary-container hover:text-on-primary-container transition-colors">
                {t('nav.register')}
              </Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button className="lg:hidden p-2 text-on-surface-variant" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
            {symbol(mobileOpen ? 'close' : 'menu')}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-outline-variant bg-surface-container-lowest px-4 py-3 space-y-1">
          {links.map((l) => (
            <Link key={l.to} to={l.to} onClick={() => setMobileOpen(false)} className="flex items-center gap-2 py-2 font-label-md text-label-md text-on-surface hover:text-primary">
              {symbol(l.icon, 'text-base')} {l.label}
            </Link>
          ))}
          {canShop && (
            <Link to="/cart" onClick={() => setMobileOpen(false)} className="block py-2 font-label-md text-label-md text-on-surface">
              Cart {totalItems > 0 && `(${totalItems})`}
            </Link>
          )}
          <button onClick={toggleLanguage} className="block w-full text-left py-2 font-label-md text-label-md text-on-surface">
            {i18n.language === 'hi' ? 'English' : 'हिंदी'}
          </button>
          {isAuthenticated ? (
            <button onClick={handleLogout} className="block w-full text-left py-2 font-label-md text-label-md text-error">{t('nav.logout')}</button>
          ) : (
            <div className="flex gap-3 pt-2">
              <Link to="/login" onClick={() => setMobileOpen(false)} className="px-4 py-2 rounded-full border border-primary text-primary font-label-md text-label-md">{t('nav.login')}</Link>
              <Link to="/register" onClick={() => setMobileOpen(false)} className="px-4 py-2 rounded-full bg-primary text-on-primary font-label-md text-label-md">{t('nav.register')}</Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;