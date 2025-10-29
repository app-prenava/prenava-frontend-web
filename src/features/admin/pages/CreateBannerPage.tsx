import { useState } from 'react';
import { message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { createBanner } from '../admin.api';
import { CreateBannerBody } from '../admin.types';

export default function CreateBannerPage() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        name: '',
        url: '',
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;

        // Validate file type
        if (file && !file.type.startsWith('image/')) {
            setError('You can only upload image files!');
            return;
        }

        // Validate file size (2MB limit)
        if (file && file.size > 2 * 1024 * 1024) {
            setError('Image must be smaller than 2MB!');
            return;
        }

        setImageFile(file);
        if (imagePreview) URL.revokeObjectURL(imagePreview);
        setImagePreview(file ? URL.createObjectURL(file) : null);
        setError(null); // Clear any previous errors
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0] || null;

        // Validate file type
        if (file && !file.type.startsWith('image/')) {
            setError('You can only upload image files!');
            return;
        }

        // Validate file size (2MB limit)
        if (file && file.size > 2 * 1024 * 1024) {
            setError('Image must be smaller than 2MB!');
            return;
        }

        setImageFile(file);
        if (imagePreview) URL.revokeObjectURL(imagePreview);
        setImagePreview(file ? URL.createObjectURL(file) : null);
        setError(null); // Clear any previous errors
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setSaving(true);

        if (!imageFile) {
            setError('The photo field is required.');
            setSaving(false);
            return;
        }

        if (!form.name.trim()) {
            setError('Banner name is required.');
            setSaving(false);
            return;
        }

        if (!form.url.trim()) {
            setError('URL is required.');
            setSaving(false);
            return;
        }

        try {
            console.log('Submitting banner data:', {
                name: form.name,
                url: form.url,
                imageFile: imageFile,
                imageFileName: imageFile?.name,
                imageFileSize: imageFile?.size,
                imageFileType: imageFile?.type
            });

            const bannerData: CreateBannerBody = {
                name: form.name,
                image: imageFile,
                url: form.url,
            };

            await createBanner(bannerData);
            setSuccess('Banner created successfully');
            setForm({ name: '', url: '' });
            setImageFile(null);
            if (imagePreview) URL.revokeObjectURL(imagePreview);
            setImagePreview(null);

            // Navigate after a short delay to show success message
            setTimeout(() => {
                navigate('/admin/add-banner');
            }, 1500);
        } catch (error: any) {
            console.error('Failed to create banner:', error);
            setError(error?.response?.data?.message || 'Failed to create banner');
        } finally {
            setSaving(false);
        }
    };


    return (
        <div className="p-8">
            <nav className="text-sm text-gray-500 mb-1">Pages / Add Banner</nav>
            <h1 className="text-2xl font-semibold text-gray-900 mb-6">Buat Banner</h1>

            <div className="bg-white rounded-xl border border-gray-200 p-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Banner</h2>

                {error && <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
                {success && <div className="mb-4 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{success}</div>}

                <form onSubmit={handleSubmit} className="space-y-5 max-w-5xl">
                    <FormRow label="Banner Name">
                        <input
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            disabled={loading}
                            placeholder="Masukan Nama Banner"
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-pink-500 focus:outline-none"
                        />
                    </FormRow>

                    <FormRow label="URL">
                        <input
                            name="url"
                            value={form.url}
                            onChange={handleChange}
                            disabled={loading}
                            placeholder="Masukan URL Banner"
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-pink-500 focus:outline-none"
                        />
                    </FormRow>

                    <FormRow label="Banner Image">
                        <div
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            className="w-full rounded-lg border border-dashed border-gray-300 px-4 py-8 text-center text-gray-600"
                        >
                            <div className="mb-2">Drop here to attach or <label className="text-pink-600 underline cursor-pointer"><input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />upload</label></div>
                            <div className="text-xs text-gray-400">Max size: 2MB</div>
                            {imagePreview && (
                                <div className="mt-4 flex flex-col items-center gap-2">
                                    <img src={imagePreview} alt="Preview" className="h-28 w-28 rounded-lg object-cover border border-gray-200" />
                                    {imageFile && <div className="text-sm text-gray-700">{imageFile.name}</div>}
                                </div>
                            )}
                        </div>
                    </FormRow>

                    <div className="pt-4">
                        <div className="flex items-center gap-3">
                            <button type="button" disabled={saving} onClick={() => navigate('/admin/add-banner')} className="rounded-lg border border-gray-300 px-5 py-2.5 text-gray-700 hover:border-[#FA6978] hover:text-[#FA6978] hover:shadow-[0_0_10px_#FA6978] transition-all duration-200 cursor-pointer disabled:opacity-60">
                                Batalkan
                            </button>
                            <button type="submit" disabled={saving} className="rounded-lg bg-[#FA6978] px-5 py-2.5 !text-white hover:bg-[#e95d6b] cursor-pointer transition">
                                {saving ? 'Menyimpan...' : 'Simpan Banner'}
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
