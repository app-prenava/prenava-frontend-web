import { useState } from 'react';
import { createBidan } from '../admin.api';
import FormInput from '../components/FormInput';
import MessageAlert from '../components/MessageAlert';

export default function CreateBidanPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const body = { name, email, password };
      const result = await createBidan(body);

      setSuccess(result.message);
      setName('');
      setEmail('');
      setPassword('');
    } catch (err: any) {
      let errorMsg = err.response?.data?.message || 'Terjadi kesalahan saat membuat akun bidan';
      
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
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Buat Akun Bidan
          </h1>
          <p className="text-gray-600">
            Tambahkan akun bidan baru ke sistem
          </p>
        </div>

        {error && <MessageAlert type="error" message={error} />}
        {success && <MessageAlert type="success" message={success} />}

        <form onSubmit={handleSubmit} className="space-y-6">
          <FormInput
            label="Nama Lengkap"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Masukkan nama lengkap bidan"
            required
          />

          <FormInput
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Masukkan email bidan"
            required
          />

          <FormInput
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Masukkan password"
            required
          />

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 rounded-lg text-white font-medium transition hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: '#FA6978' }}
            >
              {loading ? 'Membuat Akun...' : 'Buat Akun Bidan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
