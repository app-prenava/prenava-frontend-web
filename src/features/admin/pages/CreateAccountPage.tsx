import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { createBidan, createDinkes } from '../admin.api';
import RoleToggle from '../components/RoleToggle';
import FormInput from '../components/FormInput';
import MessageAlert from '../components/MessageAlert';

export default function CreateAccountPage() {
  const [searchParams] = useSearchParams();
  const [role, setRole] = useState<'bidan' | 'dinkes'>('bidan');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Set initial role from URL parameter
  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam === 'bidan' || roleParam === 'dinkes') {
      setRole(roleParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const body = { name, email, password };
      const createFn = role === 'bidan' ? createBidan : createDinkes;
      const result = await createFn(body);

      setSuccess(result.message);
      setName('');
      setEmail('');
      setPassword('');
    } catch (e: any) {
      let errorMsg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        e?.message ||
        'Gagal membuat akun';

      // Translate specific error messages
      if (errorMsg.includes('Account is deactivated') || errorMsg.includes('Contact admin')) {
        errorMsg = 'Akun dinonaktifkan. Hubungi Admin.';
      }

      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900">Buat Akun Baru</h1>
        <p className="text-gray-600 mt-2">
          Buat akun baru untuk bidan atau petugas dinkes
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <RoleToggle role={role} onRoleChange={setRole} />

          <FormInput
            label="Nama Lengkap"
            value={name}
            onChange={setName}
            placeholder="Masukkan nama lengkap"
            required
          />

          <FormInput
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="email@example.com"
            required
          />

          <FormInput
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="Masukkan password"
            required
            minLength={6}
            helpText="Minimal 6 karakter"
          />

          {error && <MessageAlert type="error" message={error} />}
          {success && <MessageAlert type="success" message={success} />}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg text-white font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#FA6978', color: '#FFFFFF' }}
          >
            {loading ? 'Membuat Akun...' : `Buat Akun ${role === 'bidan' ? 'Bidan' : 'Dinkes'}`}
          </button>
        </form>
      </div>
    </div>
  );
}