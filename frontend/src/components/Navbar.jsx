import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '../stores/cartStore';
import { useTranslation } from 'react-i18next';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const totalItems = useCartStore((s) => s.totalItems);
  const { t, i18n } = useTranslation();
  const toggleLanguage = () => {
    const next = i18n.language === 'hi' ? 'en' : 'hi';
    i18n.changeLanguage(next);
    localStorage.setItem('kc_language', next);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-kisan-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold">Kisan Connect</span>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="hover:text-kisan-200">{t('nav.home')}</Link>
	    <Link to="/marketplace" className="hover:text-kisan-200">{t('nav.marketplace')}</Link>
            {isAuthenticated && user && user.role === 'admin' && (
              <Link to="/admin" className="hover:text-kisan-200">Admin</Link>
            )}
            {isAuthenticated && user && user.role === 'logistics' && (
              <Link to="/driver" className="hover:text-kisan-200">Driver</Link>
            )}
            {isAuthenticated && user && ['farmer', 'fpo_admin'].includes(user.role) && (
              <Link to="/farmer/dashboard" className="hover:text-kisan-200">{t('nav.dashboard')}</Link>
            )}
            {isAuthenticated && user && ['consumer', 'farmer', 'bulk_buyer'].includes(user.role) && (
              <Link to="/orders" className="hover:text-kisan-200">{t('nav.orders')}</Link>
            )}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {['consumer', 'farmer', 'bulk_buyer'].includes(user?.role) && (
              <Link to="/cart" className="relative p-2 hover:text-kisan-200">
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Link>
            )}
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-kisan-200">{user.full_name}</span>
                <button
  onClick={handleLogout}
  className="text-sm bg-kisan-700 px-4 py-2 rounded-lg hover:bg-kisan-600"
>
  {t('nav.logout')}
</button>
              </div>
            ) : (
              <>
                <Link to="/login" className="text-sm hover:text-kisan-200">{t('nav.login')}</Link>
		<Link
  			to="/register"
  			className="text-sm bg-kisan-700 px-4 py-2 rounded-lg hover:bg-kisan-600"
			>
  				{t('nav.register')}
		</Link>
              </>
            )}
	    <button
  onClick={toggleLanguage}
  className="text-sm bg-kisan-700 px-3 py-2 rounded-lg hover:bg-kisan-600"
>
  {i18n.language === 'hi' ? 'English' : 'हिंदी'}
</button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;