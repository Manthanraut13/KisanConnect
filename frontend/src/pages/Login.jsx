import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuthStore } from '../stores/authStore';

const Login = () => {
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!mobile || !password) {
      toast.error('Enter mobile and password');
      return;
    }
    // Demo login - auto-authenticate with the matching role
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
    toast.success('Logged in');
    navigate(role === 'admin' ? '/admin' : role === 'logistics' ? '/driver' : '/');
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
            className="w-full py-2 bg-kisan-700 text-white rounded-lg hover:bg-kisan-800"
          >
            Login
          </button>
        </form>

        <div className="mt-6 text-xs text-gray-400 bg-gray-50 rounded p-3">
          <p>Demo admin: mobile <b>9000000000</b></p>
          <p className="mt-1">Demo driver: mobile <b>8000000000</b></p>
          <p className="mt-1">Any other mobile = consumer</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
