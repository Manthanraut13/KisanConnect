import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuthStore } from '../stores/authStore';
import api from '../services/api';

const Login = () => {
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);

  const demoLogin = () => {
    let role = 'consumer';
    let name = 'Demo User';
    if (mobile === '9000000000') {
      role = 'admin';
      name = 'Admin Demo';
    } else if (mobile === '8000000000') {
      role = 'logistics';
      name = 'Driver Demo';
    }
    setUser({ mobile, role, full_name: name }, 'demo-token');
    toast.success('Logged in (demo)');
    navigate(role === 'admin' ? '/admin' : role === 'logistics' ? '/driver' : '/');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!mobile || !password) {
      toast.error('Enter mobile and password');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/api/auth/login', {
        mobile,
        password,
      });
      const data = res?.data?.data || res?.data;
      const token = data?.access_token || data?.token;
      const user = data?.user || data;
      if (token && user) {
        setUser(user, token);
        toast.success('Logged in');
        navigate(user.role === 'admin' ? '/admin' : user.role === 'logistics' ? '/driver' : '/');
      } else {
        throw new Error('Invalid response');
      }
    } catch (err) {
      // Backend not available / login failed - use demo fallback
      console.warn('Login API unavailable, using demo fallback');
      demoLogin();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-kisan-800 mb-1">Kisan Connect</h1>
        <p className="text-gray-500 mb-6">Sign in to continue</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Mobile</label>
            <input
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="10-digit mobile"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-kisan-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-kisan-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-kisan-700 text-white rounded-lg hover:bg-kisan-800 disabled:opacity-60"
          >
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>

        <div className="mt-6 text-xs text-gray-400 bg-gray-50 rounded p-3">
          <p className="font-medium text-gray-500">Demo logins (backend offline):</p>
          <p>Admin: mobile <b>9000000000</b></p>
          <p className="mt-1">Driver: mobile <b>8000000000</b></p>
          <p className="mt-1">Any other mobile = consumer</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
