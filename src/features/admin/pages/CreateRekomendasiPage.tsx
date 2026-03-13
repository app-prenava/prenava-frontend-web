import { useState } from 'react';
import { message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { createRekomendasiGerakan } from '../admin.api';
import { CreateRekomendasiBody } from '../admin.types';

type ImageSlot = {
    file: File | null;
    preview: string | null;
};

export default function CreateRekomendasiPage() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        activity: '',
        video_link: '',
        long_text: '',
    });
    const [images, setImages] = useState<[ImageSlot, ImageSlot, ImageSlot]>([
        { file: null, preview: null },
        { file: null, preview: null },
        { file: null, preview: null },
    ]);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const validateImage = (file: File): string | null => {
        if (!file.type.startsWith('image/')) return 'Hanya file gambar yang diperbolehkan!';
        if (file.size > 2 * 1024 * 1024) return 'Ukuran gambar maksimal 2MB!';
        return null;
    };

    const handleImageChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        if (file) {
            const err = validateImage(file);
            if (err) { setError(err); return; }
        }
        updateImageSlot(index, file);
        setError(null);
    };

    const handleDrop = (index: number, e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0] || null;
        if (file) {
            const err = validateImage(file);
            if (err) { setError(err); return; }
        }
        updateImageSlot(index, file);
        setError(null);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const updateImageSlot = (index: number, file: File | null) => {
        setImages(prev => {
            const next = [...prev] as [ImageSlot, ImageSlot, ImageSlot];
            if (next[index].preview) URL.revokeObjectURL(next[index].preview!);
            next[index] = {
                file,
                preview: file ? URL.createObjectURL(file) : null,
            };
            return next;
        });
    };

    const removeImage = (index: number) => {
        updateImageSlot(index, null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setSaving(true);

        if (!form.activity.trim()) { setError('Nama aktivitas harus diisi.'); setSaving(false); return; }
        if (!form.video_link.trim()) { setError('Link video harus diisi.'); setSaving(false); return; }
        if (!form.long_text.trim()) { setError('Deskripsi harus diisi.'); setSaving(false); return; }

        try {
            const body: CreateRekomendasiBody = {
                activity: form.activity,
                video_link: form.video_link,
                long_text: form.long_text,
            };
            if (images[0].file) body.picture_1 = images[0].file;
            if (images[1].file) body.picture_2 = images[1].file;
            if (images[2].file) body.picture_3 = images[2].file;

            await createRekomendasiGerakan(body);
            setSuccess('Rekomendasi gerakan berhasil dibuat!');
            message.success('Rekomendasi gerakan berhasil dibuat!');

            setTimeout(() => {
                navigate('/admin/rekomendasi-olahraga');
            }, 1500);
        } catch (err: any) {
            console.error('Failed to create rekomendasi:', err);
            setError(err?.response?.data?.message || 'Gagal membuat rekomendasi gerakan');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-8">
            <nav className="text-sm text-gray-500 mb-1">Pages / Rekomendasi Olahraga</nav>
            <h1 className="text-2xl font-semibold text-gray-900 mb-6">Tambah Rekomendasi Gerakan</h1>

            <div className="bg-white rounded-xl border border-gray-200 p-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Detail Gerakan</h2>

                {error && <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
                {success && <div className="mb-4 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{success}</div>}

                <form onSubmit={handleSubmit} className="space-y-5 max-w-5xl">
                    <FormRow label="Nama Aktivitas">
                        <input
                            name="activity"
                            value={form.activity}
                            onChange={handleChange}
                            disabled={saving}
                            placeholder="Masukan nama aktivitas"
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-pink-500 focus:outline-none"
                        />
                    </FormRow>

                    <FormRow label="Link Video">
                        <input
                            name="video_link"
                            value={form.video_link}
                            onChange={handleChange}
                            disabled={saving}
                            placeholder="Masukan link video (YouTube, dll)"
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-pink-500 focus:outline-none"
                        />
                    </FormRow>

                    <FormRow label="Deskripsi">
                        <textarea
                            name="long_text"
                            value={form.long_text}
                            onChange={handleChange}
                            disabled={saving}
                            placeholder="Masukan deskripsi gerakan"
                            rows={5}
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-pink-500 focus:outline-none resize-none"
                        />
                    </FormRow>

                    {/* Image Uploads */}
                    {[0, 1, 2].map((idx) => (
                        <FormRow key={idx} label={`Gambar ${idx + 1}`}>
                            <div
                                onDrop={(e) => handleDrop(idx, e)}
                                onDragOver={handleDragOver}
                                className="w-full rounded-lg border border-dashed border-gray-300 px-4 py-8 text-center text-gray-600"
                            >
                                <div className="mb-2">
                                    Drop here to attach or{' '}
                                    <label className="text-pink-600 underline cursor-pointer">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => handleImageChange(idx, e)}
                                        />
                                        upload
                                    </label>
                                </div>
                                <div className="text-xs text-gray-400">Max size: 2MB</div>
                                {images[idx].preview && (
                                    <div className="mt-4 flex flex-col items-center gap-2">
                                        <img
                                            src={images[idx].preview!}
                                            alt={`Preview ${idx + 1}`}
                                            className="h-28 w-28 rounded-lg object-cover border border-gray-200"
                                        />
                                        <div className="flex items-center gap-2">
                                            {images[idx].file && <span className="text-sm text-gray-700">{images[idx].file!.name}</span>}
                                            <button
                                                type="button"
                                                onClick={() => removeImage(idx)}
                                                className="text-xs text-red-500 hover:text-red-700 underline"
                                            >
                                                Hapus
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </FormRow>
                    ))}

                    <div className="pt-4">
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                disabled={saving}
                                onClick={() => navigate('/admin/rekomendasi-olahraga')}
                                className="rounded-lg border border-gray-300 px-5 py-2.5 text-gray-700 hover:border-[#FA6978] hover:text-[#FA6978] hover:shadow-[0_0_10px_#FA6978] transition-all duration-200 cursor-pointer disabled:opacity-60"
                            >
                                Batalkan
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="rounded-lg bg-[#FA6978] px-5 py-2.5 !text-white hover:bg-[#e95d6b] cursor-pointer transition"
                            >
                                {saving ? 'Menyimpan...' : 'Simpan Gerakan'}
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
        <div className="grid grid-cols-12 items-start gap-6">
            <div className="col-span-12 sm:col-span-3 text-gray-700 pt-2.5">{label}</div>
            <div className="col-span-12 sm:col-span-9">{children}</div>
        </div>
    );
}
