import { useEffect, useState } from 'react';
import { getDinkesProfile, updateDinkesProfile, createDinkesProfile, DinkesProfile } from '@/features/dinkes/dinkes.api';

export default function EditDinkesProfilePage() {
    const [form, setForm] = useState<DinkesProfile>({
        nip: '',
        jabatan: '',
    });
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [hasProfile, setHasProfile] = useState<boolean>(true);

    useEffect(() => {
        let mounted = true;
        setLoading(true);
        getDinkesProfile()
            .then((res) => {
                if (!mounted) return;

                // Normalize response shape: { status, profile } or { message, data }
                const raw = (res as any)?.data ?? res;
                // eslint-disable-next-line no-console
                console.log('getDinkesProfile (edit) response:', res);

                const p = (raw && (raw as any).profile) ? (raw as any).profile : raw;

                if (p && typeof p === 'object') {
                    // Set form from existing profile and mark that profile exists
                    setForm({
                        nip: p.nip || '',
                        jabatan: p.jabatan || '',
                    });
                    setHasProfile(true);
                    setError(null);
                } else {
                    setHasProfile(false);
                    setError('Data profile tidak ditemukan, segera tambahkan data profile');
                }
            })
            .catch((e: any) => {
                if (!mounted) return;
                const msg = e?.response?.data?.message || e?.message || 'Gagal memuat profil dinkes';
                const status = e?.response?.status;
                if (String(msg).toLowerCase().includes('not found') ||
                    String(msg).toLowerCase().includes('tidak ditemukan') ||
                    status === 404) {
                    setHasProfile(false);
                    setError('Data profile tidak ditemukan, segera tambahkan data profile');
                } else {
                    setError(msg);
                }
            })
            .finally(() => mounted && setLoading(false));
        return () => { mounted = false; };
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setPhotoFile(file);
        if (photoPreview) URL.revokeObjectURL(photoPreview);
        setPhotoPreview(file ? URL.createObjectURL(file) : null);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0] || null;
        setPhotoFile(file);
        if (photoPreview) URL.revokeObjectURL(photoPreview);
        setPhotoPreview(file ? URL.createObjectURL(file) : null);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setSaving(true);

        console.log('Submitting dinkes profile:', { hasProfile, form });

        try {
            // Build payload: JSON when no photo, FormData when photo provided
            const hasPhoto = Boolean(photoFile);
            let payload: any;
            if (hasPhoto) {
                const fd = new FormData();
                fd.append('nip', form.nip);
                fd.append('jabatan', form.jabatan);
                if (photoFile) fd.append('photo', photoFile);
                payload = fd;
            } else {
                payload = {
                    nip: form.nip,
                    jabatan: form.jabatan,
                };
            }

            const res = hasProfile
                ? await updateDinkesProfile(payload)
                : await createDinkesProfile(payload);

            console.log('Success response:', res);
            setSuccess(res?.message || 'Perubahan berhasil disimpan');
            setHasProfile(true);
        } catch (e: any) {
            console.error('Submit error:', e);
            setError(e?.response?.data?.message || e?.message || 'Gagal menyimpan profil');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-8">
            <nav className="text-sm text-gray-500 mb-1">Pages / Users</nav>
            <h1 className="text-2xl font-semibold text-gray-900 mb-6">Edit Profile Data</h1>

            <div className="bg-white rounded-xl border border-gray-200 p-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Profile</h2>

                {error && <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
                {success && <div className="mb-4 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{success}</div>}

                <form onSubmit={handleSubmit} className="space-y-5 max-w-5xl">
                    <FormRow label="NIP">
                        <input
                            name="nip"
                            value={form.nip}
                            onChange={handleChange}
                            disabled={loading}
                            placeholder="Masukan NIP Anda"
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-pink-500 focus:outline-none"
                        />
                    </FormRow>

                    <FormRow label="Jabatan">
                        <input
                            name="jabatan"
                            value={form.jabatan}
                            onChange={handleChange}
                            disabled={loading}
                            placeholder="Masukan Jabatan Anda"
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-pink-500 focus:outline-none"
                        />
                    </FormRow>

                    {/* Foto Profile (optional) */}
                    <FormRow label="Foto Profile">
                        <div
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            className="w-full rounded-lg border border-dashed border-gray-300 px-4 py-8 text-center text-gray-600"
                        >
                            <div className="mb-2">Drop here to attach or <label className="text-pink-600 underline cursor-pointer"><input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />upload</label></div>
                            <div className="text-xs text-gray-400">Max size: 500KB</div>
                            {photoPreview && (
                                <div className="mt-4 flex flex-col items-center gap-2">
                                    <img src={photoPreview} alt="Preview" className="h-28 w-28 rounded-full object-cover border border-gray-200" />
                                    {photoFile && <div className="text-sm text-gray-700">{photoFile.name}</div>}
                                </div>
                            )}
                        </div>
                    </FormRow>

                    <div className="pt-4">
                        <div className="flex items-center gap-3">
                            <button type="button" disabled={saving} onClick={() => window.history.back()} className="rounded-lg border border-gray-300 px-5 py-2.5 text-gray-700 hover:border-[#FA6978] hover:text-[#FA6978] hover:shadow-[0_0_10px_#FA6978] transition-all duration-200 cursor-pointer disabled:opacity-60">
                                Batalkan
                            </button>
                            <button type="submit" disabled={saving} className="rounded-lg bg-[#FA6978] px-5 py-2.5 !text-white hover:bg-[#e95d6b] cursor-pointer transition">
                                {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

function FormRow({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="grid grid-cols-12 items-center gap-6">
            <div className="col-span-12 sm:col-span-3 text-gray-700">{label}</div>
            <div className="col-span-12 sm:col-span-9">{children}</div>
        </div>
    );
}
