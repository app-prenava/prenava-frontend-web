import { useState } from 'react';
import { createDinkes } from '../admin.api';
import { PlusOutlined } from '@ant-design/icons';
import MessageAlert from '../components/MessageAlert';
import RegionSelector, { type RegionValue } from '@/components/RegionSelector';

export default function CreateDinkesPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [region, setRegion] = useState<RegionValue>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!region.province_code || !region.regency_code) {
      setError('Provinsi dan Kabupaten/Kota wajib dipilih untuk akun Dinkes.');
      return;
    }

    setLoading(true);

    try {
      const result = await createDinkes({
        name,
        email,
        password,
        province_code: region.province_code,
        regency_code: region.regency_code,
      });

      setSuccess(result.message);
      setName('');
      setEmail('');
      setPassword('');
      setRegion({});
    } catch (err: any) {
      let errorMsg = err.response?.data?.message || 'Terjadi kesalahan saat membuat akun dinkes';
      const errors = err.response?.data?.errors;
      if (errors) {
        errorMsg = Object.values(errors).flat().join(', ') || errorMsg;
      }

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
          Buat Akun Dinkes Kabupaten/Kota
        </h1>
        <p className="text-gray-600">
          Tambahkan akun Dinkes dan tetapkan wilayah kerja Kabupaten/Kota untuk isolasi data dashboard
        </p>
      </div>

      <div className="-mt-4 md:-mt-6 mb-4 pl-[58px] pr-[99px]">
        {error && <MessageAlert type="error" message={error} />}
        {success && <MessageAlert type="success" message={success} />}
      </div>

      <form
        id="create-dinkes-form"
        onSubmit={handleSubmit}
        className="space-y-6 max-w-4xl pl-[58px] pr-[99px] pb-12"
      >
        <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-6">
          <label className="md:w-[180px] text-gray-800 font-medium text-base">
            Nama Lengkap
          </label>
          <div className="md:flex-1">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Dinkes Kota Bandung"
              className="w-full rounded-lg border border-gray-300 px-4 py-3.5 text-base focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
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
              placeholder="dinkes.wilayah@go.id"
              className="w-full rounded-lg border border-gray-300 px-4 py-3.5 text-base focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
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
              placeholder="Minimal 6 karakter"
              className="w-full rounded-lg border border-gray-300 px-4 py-3.5 text-base focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              required
              minLength={6}
            />
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-start gap-3 md:gap-6">
          <label className="md:w-[180px] text-gray-800 font-medium text-base pt-2">
            Wilayah Kerja
          </label>
          <div className="md:flex-1">
            <RegionSelector
              value={region}
              onChange={setRegion}
              includeDistrict={false}
            />
            <p className="text-xs text-gray-500 mt-2">
              Akun ini hanya akan melihat data agregasi ibu hamil &amp; PMB pada Kabupaten/Kota yang dipilih.
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-lg !text-white font-medium transition hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: '#FA6978' }}
          >
            <PlusOutlined />
            {loading ? 'Membuat Akun...' : 'Tambah Dinkes'}
          </button>
        </div>
      </form>
    </div>
  );
}
