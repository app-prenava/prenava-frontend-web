import { useState } from 'react';
import { createDinkes } from '../admin.api';
import MessageAlert from '../components/MessageAlert';

export default function CreateDinkesPage() {
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
      const result = await createDinkes(body);

      setSuccess(result.message);
      setName('');
      setEmail('');
      setPassword('');
    } catch (err: any) {
      let errorMsg = err.response?.data?.message || 'Terjadi kesalahan saat membuat akun dinkes';

      if (errorMsg.includes('Account is deactivated') || errorMsg.includes('Contact admin')) {
        errorMsg = 'Akun dinonaktifkan. Hubungi Admin.';
      }

      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="pt-[60px] pl-[58px] pb-[54px]">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Buat Akun Dinkes
          </h1>
          <p className="text-gray-600">
            Tambahkan akun dinkes baru ke sistem
          </p>
      </div>

        <div className="-mt-4 md:-mt-6 mb-4">
          {error && <MessageAlert type="error" message={error} />}
          {success && <MessageAlert type="success" message={success} />}
        </div>

        {/* Submit button bottom-right */}
        

        <form id="create-dinkes-form" onSubmit={handleSubmit} className="space-y-6 max-w-none pl-[58px] pr-[99px]">
          <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-6">
            <label className="md:w-[180px] text-gray-800 font-medium text-base">
              Nama Lengkap
            </label>
            <div className="md:flex-1">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Masukkan nama lengkap dinkes"
                className="w-full md:w-[1100px] rounded-lg border border-gray-300 px-4 py-4 text-base focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-6">
            <label className="md:w-[180px] text-gray-800 font-medium text-base">
              Email
            </label>
            <div className="md:flex-1">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Masukkan email dinkes"
                className="w-full md:w-[1100px] rounded-lg border border-gray-300 px-4 py-4 text-base focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-6">
            <label className="md:w-[180px] text-gray-800 font-medium text-base">
              Password
            </label>
            <div className="md:flex-1">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                className="w-full md:w-[1100px] rounded-lg border border-gray-300 px-4 py-4 text-base focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-lg !text-white font-medium transition hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: '#FA6978' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              {loading ? 'Membuat Akun...' : 'Tambah Dinkes'}
            </button>
          </div>
        </form>
    </div>
  );
}
