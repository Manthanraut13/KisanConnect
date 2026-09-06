import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const loginSchema = z.object({
  mobile: z.string().length(10, 'Mobile must be 10 digits').regex(/^[6-9]\d{9}$/, 'Enter a valid Indian mobile number').optional(),
  email: z.string().email('Enter a valid email').optional(),
  password: z.string().min(1, 'Password is required'),
}).refine((data) => data.mobile || data.email, {
  message: 'Either mobile or email is required',
  path: ['mobile'],
});

//type LoginForm = z.infer<typeof loginSchema>;

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [loginMode, setLoginMode] = useState('password');
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { password: '' },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Login failed');
      }

      localStorage.setItem('token', result.data.access_token);
      localStorage.setItem('refreshToken', result.data.refresh_token);
      localStorage.setItem('user', JSON.stringify(result.data.user));

      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPLogin = async (data) => {
    setIsLoading(true);
    setError('');

    try {
      // Step 1: Send OTP
      const sendOtpResponse = await fetch('http://localhost:5000/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: data.mobile }),
      });

      if (!sendOtpResponse.ok) {
        throw new Error('Failed to send OTP');
      }

      // Step 2: Get OTP from user and verify
      const otp = prompt('Enter the OTP sent to your mobile:');
      if (!otp) return;

      const verifyResponse = await fetch('http://localhost:5000/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: data.mobile, otp }),
      });

      const result = await verifyResponse.json();

      if (!verifyResponse.ok) {
        throw new Error(result.message || 'OTP verification failed');
      }

      localStorage.setItem('token', result.data.access_token);
      localStorage.setItem('refreshToken', result.data.refresh_token);
      localStorage.setItem('user', JSON.stringify(result.data.user));

      navigate('/');
    } catch (err) {
      setError(err.message || 'OTP login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-center text-kisan-800 mb-6">
          {loginMode === 'otp' ? 'OTP Login' : 'Login to Kisan Connect'}
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(loginMode === 'password' ? onSubmit : handleOTPLogin)} className="space-y-4">
          {loginMode === 'password' ? (
            <>
              <div>
                <label className="block text-gray-700 mb-1">Mobile Number</label>
                <input
                  type="text"
                  {...register('mobile')}
                  maxLength={10}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-kisan-500"
                />
                {errors.mobile && <p className="text-red-500 text-sm mt-1">{errors.mobile.message}</p>}
              </div>

              <div>
                <label className="block text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  {...register('password')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-kisan-500"
                />
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
              </div>
            </>
          ) : (
            <div>
              <label className="block text-gray-700 mb-1">Mobile Number</label>
              <input
                type="text"
                {...register('mobile')}
                maxLength={10}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-kisan-500"
              />
              {errors.mobile && <p className="text-red-500 text-sm mt-1">{errors.mobile.message}</p>}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-kisan-700 text-white py-2 rounded-md hover:bg-kisan-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Processing...' : loginMode === 'password' ? 'Login' : 'Send OTP'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => setLoginMode(loginMode === 'password' ? 'otp' : 'password')}
            className="text-kisan-700 hover:underline text-sm"
          >
            {loginMode === 'password' ? 'Login with OTP' : 'Login with Password'}
          </button>
        </div>

        <p className="text-center mt-4 text-gray-600">
          Don't have an account?{' '}
          <Link to="/register" className="text-kisan-700 font-medium hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
