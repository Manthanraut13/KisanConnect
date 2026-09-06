import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const user = null; // Replace with actual auth store integration

  return (
    <nav className="bg-kisan-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">Kisan Connect</span>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            <button onClick={() => navigate('/')} className="hover:text-kisan-400">
              Home
            </button>
            {user && user.role === 'consumer' && (
              <>
                <button onClick={() => navigate('/cart')} className="hover:text-kisan-400">
                  Cart
                </button>
                <button onClick={() => navigate('/orders')} className="hover:text-kisan-400">
                  Orders
                </button>
              </>
            )}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <button onClick={() => navigate('/login')} className="text-sm">
                Logout
              </button>
            ) : (
              <>
                <button onClick={() => navigate('/login')} className="text-sm">
                  Login
                </button>
                <button onClick={() => navigate('/register')} className="text-sm">
                  Register
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
