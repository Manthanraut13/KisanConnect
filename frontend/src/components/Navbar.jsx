import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
<<<<<<< HEAD
import { ShoppingCart, LogOut, Menu, X } from 'lucide-react';
import { useCartStore } from '../stores/cartStore';
import { useTranslation } from 'react-i18next';
=======
import { ShoppingCart, User, LogOut, Menu, X } from 'lucide-react';
import { useCartStore } from '../stores/cartStore';
>>>>>>> dev
import { logger } from '../lib/logger';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const totalItems = useCartStore((s) => s.totalItems);
<<<<<<< HEAD
  const { t, i18n } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleLanguage = () => {
    const next = i18n.language === 'hi' ? 'en' : 'hi';
    i18n.changeLanguage(next);
    localStorage.setItem('kc_language', next);
  };

=======
  const [lang, setLang] = useState('en');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

>>>>>>> dev
  const handleLogout = () => {
    logger.auth.logout();
    logout();
    navigate('/');
    setDropdownOpen(false);
  };

  const initials = user?.full_name
    ? user.full_name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : '';

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-green-700">Kisan Connect</span>
          </Link>

          {/* Desktop center nav */}
          <div className="hidden md:flex items-center space-x-6">
<<<<<<< HEAD
            <Link to="/" className="text-gray-700 hover:text-green-700 font-medium">{t('nav.home')}</Link>
            <Link to="/marketplace" className="text-gray-700 hover:text-green-700 font-medium">{t('nav.marketplace')}</Link>
=======
            <Link to="/" className="text-gray-700 hover:text-green-700 font-medium">Home</Link>
            <Link to="/marketplace" className="text-gray-700 hover:text-green-700 font-medium">Marketplace</Link>
>>>>>>> dev
            {isAuthenticated && user?.role === 'admin' && (
              <Link to="/admin" className="text-gray-700 hover:text-green-700 font-medium">Admin</Link>
            )}
            {isAuthenticated && user?.role === 'logistics' && (
              <Link to="/driver" className="text-gray-700 hover:text-green-700 font-medium">Driver</Link>
            )}
            {isAuthenticated && ['farmer', 'fpo_admin'].includes(user?.role) && (
<<<<<<< HEAD
              <Link to="/farmer/dashboard" className="text-gray-700 hover:text-green-700 font-medium">{t('nav.dashboard')}</Link>
            )}
            {isAuthenticated && ['consumer', 'farmer', 'bulk_buyer'].includes(user?.role) && (
              <Link to="/orders" className="text-gray-700 hover:text-green-700 font-medium">{t('nav.orders')}</Link>
=======
              <Link to="/farmer/dashboard" className="text-gray-700 hover:text-green-700 font-medium">Dashboard</Link>
            )}
            {isAuthenticated && ['consumer', 'farmer', 'bulk_buyer'].includes(user?.role) && (
              <Link to="/orders" className="text-gray-700 hover:text-green-700 font-medium">Orders</Link>
>>>>>>> dev
            )}
          </div>

          {/* Desktop right */}
          <div className="hidden md:flex items-center space-x-4">
            <button
<<<<<<< HEAD
              onClick={toggleLanguage}
              className="px-2 py-1 text-xs font-bold bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
            >
              {i18n.language === 'hi' ? 'English' : 'हिंदी'}
=======
              onClick={() => setLang((l) => (l === 'en' ? 'hi' : 'en'))}
              className="px-2 py-1 text-xs font-bold bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
            >
              {lang === 'en' ? 'EN/HI' : 'HI/EN'}
>>>>>>> dev
            </button>

            {isAuthenticated && ['consumer', 'farmer', 'bulk_buyer'].includes(user?.role) && (
              <Link to="/cart" className="relative p-2 text-gray-600 hover:text-green-700">
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Link>
            )}

            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-9 h-9 rounded-full bg-green-700 text-white flex items-center justify-center text-sm font-bold hover:bg-green-800"
                >
                  {initials}
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{user.full_name}</p>
                      <p className="text-xs text-gray-500">{user.role}</p>
                    </div>
                    <Link
                      to="/orders"
                      onClick={() => setDropdownOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
<<<<<<< HEAD
                      {t('nav.orders')}
=======
                      My Orders
>>>>>>> dev
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
<<<<<<< HEAD
                      <LogOut className="h-4 w-4" /> {t('nav.logout')}
=======
                      <LogOut className="h-4 w-4" /> Logout
>>>>>>> dev
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
<<<<<<< HEAD
                <Link to="/login" className="text-sm text-gray-700 hover:text-green-700 font-medium">{t('nav.login')}</Link>
=======
                <Link to="/login" className="text-sm text-gray-700 hover:text-green-700 font-medium">Login</Link>
>>>>>>> dev
                <Link
                  to="/register"
                  className="text-sm bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800 font-medium"
                >
<<<<<<< HEAD
                  {t('nav.register')}
=======
                  Register
>>>>>>> dev
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-gray-600"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white py-4 px-4 space-y-3">
<<<<<<< HEAD
          <Link to="/" onClick={() => setMobileOpen(false)} className="block py-2 text-gray-700 hover:text-green-700">{t('nav.home')}</Link>
          <Link to="/marketplace" onClick={() => setMobileOpen(false)} className="block py-2 text-gray-700 hover:text-green-700">{t('nav.marketplace')}</Link>
=======
          <Link to="/" onClick={() => setMobileOpen(false)} className="block py-2 text-gray-700 hover:text-green-700">Home</Link>
          <Link to="/marketplace" onClick={() => setMobileOpen(false)} className="block py-2 text-gray-700 hover:text-green-700">Marketplace</Link>
>>>>>>> dev
          {isAuthenticated && ['consumer', 'farmer', 'bulk_buyer'].includes(user?.role) && (
            <Link to="/cart" onClick={() => setMobileOpen(false)} className="block py-2 text-gray-700 hover:text-green-700">
              Cart {totalItems > 0 && `(${totalItems})`}
            </Link>
          )}
          {isAuthenticated && ['consumer', 'farmer', 'bulk_buyer'].includes(user?.role) && (
<<<<<<< HEAD
            <Link to="/orders" onClick={() => setMobileOpen(false)} className="block py-2 text-gray-700 hover:text-green-700">{t('nav.orders')}</Link>
          )}
          {isAuthenticated && ['farmer', 'fpo_admin'].includes(user?.role) && (
            <Link to="/farmer/dashboard" onClick={() => setMobileOpen(false)} className="block py-2 text-gray-700 hover:text-green-700">{t('nav.dashboard')}</Link>
=======
            <Link to="/orders" onClick={() => setMobileOpen(false)} className="block py-2 text-gray-700 hover:text-green-700">Orders</Link>
          )}
          {isAuthenticated && ['farmer', 'fpo_admin'].includes(user?.role) && (
            <Link to="/farmer/dashboard" onClick={() => setMobileOpen(false)} className="block py-2 text-gray-700 hover:text-green-700">Dashboard</Link>
>>>>>>> dev
          )}
          {isAuthenticated && user?.role === 'admin' && (
            <Link to="/admin" onClick={() => setMobileOpen(false)} className="block py-2 text-gray-700 hover:text-green-700">Admin</Link>
          )}
<<<<<<< HEAD
          <button
            onClick={toggleLanguage}
            className="block w-full text-left py-2 text-gray-700 hover:text-green-700"
          >
            {i18n.language === 'hi' ? 'English' : 'हिंदी'}
          </button>
          {isAuthenticated ? (
            <button onClick={handleLogout} className="block w-full text-left py-2 text-red-600 hover:bg-red-50 rounded">{t('nav.logout')}</button>
          ) : (
            <div className="flex gap-3 pt-2">
              <Link to="/login" onClick={() => setMobileOpen(false)} className="px-4 py-2 border border-green-700 text-green-700 rounded-lg hover:bg-green-50 text-sm font-medium">{t('nav.login')}</Link>
              <Link to="/register" onClick={() => setMobileOpen(false)} className="px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 text-sm font-medium">{t('nav.register')}</Link>
=======
          {isAuthenticated ? (
            <button onClick={handleLogout} className="block w-full text-left py-2 text-red-600 hover:bg-red-50 rounded">Logout</button>
          ) : (
            <div className="flex gap-3 pt-2">
              <Link to="/login" onClick={() => setMobileOpen(false)} className="px-4 py-2 border border-green-700 text-green-700 rounded-lg hover:bg-green-50 text-sm font-medium">Login</Link>
              <Link to="/register" onClick={() => setMobileOpen(false)} className="px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 text-sm font-medium">Register</Link>
>>>>>>> dev
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;