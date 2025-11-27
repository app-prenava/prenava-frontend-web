import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDinkesProfile, DinkesProfile } from '@/features/dinkes/dinkes.api';

export default function ViewDinkesProfilePage() {
    const navigate = useNavigate();
    const [profile, setProfile] = useState<(DinkesProfile & { photo?: string | null }) | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;
        setLoading(true);
        getDinkesProfile()
            .then((res) => {
                if (!mounted) return;
                // Normalize response shape: { status, profile } or { message, data }
                const raw = (res as any)?.data ?? res;
                // eslint-disable-next-line no-console
                console.log('getDinkesProfile response:', res);
                const p = (raw && (raw as any).profile) ? (raw as any).profile : raw;

                if (p && typeof p === 'object') {
                    setProfile(p as DinkesProfile & { photo?: string | null });
                    setError(null);
                } else {
                    setProfile(null);
                    setError('Data profile belum diisi. Silakan lengkapi terlebih dahulu.');
                }
            })
            .catch((e: any) => {
                if (!mounted) return;
                const msg = e?.response?.data?.message || e?.message || 'Gagal memuat profil dinkes';
                setError(msg);
            })
            .finally(() => mounted && setLoading(false));
        return () => { mounted = false; };
    }, []);

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">Profil Saya</h1>
                <button onClick={() => navigate('/dinkes/edit-profile-data')} className="rounded-lg bg-[#FA6978] px-5 py-2.5 !text-white hover:bg-[#e95d6b] cursor-pointer transition">Edit Data</button>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Profile</h2>

                {error && (
                    <div className="mb-4 rounded-md border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">{error}</div>
                )}

                {loading ? (
                    <div className="text-gray-600">Memuat...</div>
                ) : profile ? (
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                        <div className="md:col-span-3 flex flex-col items-center gap-3">
                            <div className="h-28 w-28 rounded-full overflow-hidden border border-gray-200 bg-gray-50">
                                {profile.photo ? (
                                    <img src={profile.photo}
                                        alt="Foto Profile" className="h-full w-full object-cover" />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center text-gray-400 text-sm">Tidak ada foto</div>
                                )}
                            </div>
                            <button onClick={() => navigate('/dinkes/edit-profile-data')} className="text-sm text-pink-600 hover:underline">Ganti foto</button>
                        </div>

                        <div className="md:col-span-9 grid grid-cols-1 gap-5">
                            <Field label="NIP" value={profile.nip} />
                            <Field label="Jabatan" value={profile.jabatan} />
                        </div>
                    </div>
                ) : (
                    <div className="text-gray-600">Data tidak tersedia.</div>
                )}
            </div>
        </div>
    );
}

function Field({ label, value }: { label: string; value?: string }) {
    return (
        <div>
            <div className="text-gray-700 mb-1">{label}</div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-gray-900 min-h-11">
                {value && String(value).trim() !== '' ? value : <span className="text-gray-400">-</span>}
            </div>
        </div>
    );
}

