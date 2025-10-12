import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from './auth.api';
import { storage } from '@/lib/storage';
import logoUrl from '@/assets/logo.png';

export default function LoginPage() {
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const res = await login({ email, password });
      const { authorization, user } = res;
      storage.setToken(authorization.token, remember);
      storage.setRole(user.role, remember);
      storage.setUserName(user.name, remember);
      
      // Redirect based on role
      switch (user.role) {
        case 'admin':
          nav('/admin');
          break;
        case 'bidan':
          nav('/bidan');
          break;
        case 'dinkes':
          nav('/dinkes');
          break;
        default:
          nav('/dashboard');
      }
    } catch (e: any) {
      console.error('Login error:', e);
      console.error('Response data:', e?.response?.data);
      
      // Try to get error message from various possible locations
      const errorMsg = 
        e?.response?.data?.message || 
        e?.response?.data?.error || 
        e?.message || 
        'Login gagal. Periksa email dan password Anda.';
      
      setErr(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-white p-0 md:p-6">
      {/* Left side - Branding */}
      <div className="hidden md:flex items-center justify-center rounded-3xl" style={{ backgroundColor: '#FA6978' }}>
        <div className="max-w-md text-white px-12">
          <img src={logoUrl} alt="Prenava Logo" className="w-32 h-32 mb-6" />
          <h1 className="text-5xl font-semibold mb-3">Prenava</h1>
          <p className="text-white/90 text-lg">Pemantauan dan layanan kesehatan ibu hamil</p>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex items-center justify-center px-6 py-12">
        <form onSubmit={onSubmit} className="w-full max-w-md space-y-6">
          <div>
            <h2 className="text-3xl font-semibold text-gray-900">Selamat Datang</h2>
            <p className="text-sm text-gray-500 mt-1">Masuk untuk melanjutkan</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:border-transparent"
                style={{ '--tw-ring-color': '#FA6978' } as React.CSSProperties}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="robertallen@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:border-transparent"
                  style={{ '--tw-ring-color': '#FA6978' } as React.CSSProperties}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="inline-flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 focus:ring-2"
                  style={{ 
                    accentColor: '#FA6978',
                    '--tw-ring-color': '#FA6978'
                  } as React.CSSProperties}
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                Remember Me
              </label>
              <button
                type="button"
                className="text-sm hover:underline"
                style={{ color: '#FA6978' }}
              >
                Forgot Password?
              </button>
            </div>
          </div>

          {err && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {err}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md py-2.5 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#FA6978', color: '#FFFFFF' }}
            onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = '#E83F51')}
            onMouseLeave={(e) => !loading && (e.currentTarget.style.backgroundColor = '#FA6978')}
          >
            {loading ? 'Loading...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
