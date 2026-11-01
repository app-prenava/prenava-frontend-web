import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, Input, Select, Spin, Empty, Pagination, Button, Modal, message, Badge } from 'antd';
import {
    SearchOutlined,
    CalendarOutlined,
    PlusOutlined,
    FileTextOutlined,
    UserOutlined,
    HeartOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    AlertOutlined,
} from '@ant-design/icons';
import { getCatatanIbuList, createCatatanIbu } from '../catatan.api';
import { getIbuHamilUsers, type IbuHamilUser } from '../bidan.api';
import type { CatatanIbu, CreateCatatanIbuPayload } from '../catatan.types';

const { TextArea } = Input;
const PAGE_SIZE = 9;

const defaultSymptoms = [
    { id: 'q1_demam', label: 'Demam > 2 hari', desc: 'Suhu tubuh meningkat atau rasa menggigil' },
    { id: 'q2_pusing', label: 'Pusing / Sakit Kepala Hebat', desc: 'Nyeri kepala menetap atau gangguan penglihatan' },
    { id: 'q3_sulit_tidur', label: 'Sulit Tidur / Cemas Berlebih', desc: 'Kecemasan tinggi atau insomnia' },
    { id: 'q4_risiko_tb', label: 'Batuk > 2 Minggu / Gejala TB', desc: 'Batuk lama atau kontak serumah TB' },
    { id: 'q5_gerakan_bayi', label: 'Gerakan Janin Berkurang', desc: 'Kurang dari 10 gerakan per 12 jam (usia >24 mgg)' },
    { id: 'q6_nyeri_perut', label: 'Nyeri Perut Hebat', desc: 'Nyeri tekan atau kram perut bawah hebat' },
    { id: 'q7_cairan_jalan_lahir', label: 'Cairan / Perdarahan Jalan Lahir', desc: 'Ketuban pecah dini atau perdarahan pervaginam' },
    { id: 'q8_sakit_kencing', label: 'Nyeri BAK / Keputihan Abnormal', desc: 'Disuria, keputihan berbau atau gatal' },
    { id: 'q9_diare', label: 'Diare Berulang', desc: 'BAB cair berulang berisiko dehidrasi' },
];

export default function CatatanKunjunganList() {
    const navigate = useNavigate();
    const location = useLocation();

    // Data state
    const [catatanList, setCatatanList] = useState<CatatanIbu[]>([]);
    const [filteredList, setFilteredList] = useState<CatatanIbu[]>([]);
    const [paginatedList, setPaginatedList] = useState<CatatanIbu[]>([]);
    const [loading, setLoading] = useState(true);

    // Filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [currentPage, setCurrentPage] = useState(1);

    // Modal Create Visit state
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [patients, setPatients] = useState<IbuHamilUser[]>([]);
    const [loadingPatients, setLoadingPatients] = useState(false);
    const [savingVisit, setSavingVisit] = useState(false);

    // Form fields
    const todayStr = new Date().toISOString().split('T')[0];
    const [formUserId, setFormUserId] = useState<number | undefined>(undefined);
    const [formDate, setFormDate] = useState<string>(todayStr);
    const [formStatus, setFormStatus] = useState<'sedang_berlangsung' | 'selesai'>('selesai');
    const [formSystolic, setFormSystolic] = useState<string>('');
    const [formDiastolic, setFormDiastolic] = useState<string>('');
    const [formWeight, setFormWeight] = useState<string>('');
    const [formFundal, setFormFundal] = useState<string>('');
    const [formFhr, setFormFhr] = useState<string>('');
    const [formHb, setFormHb] = useState<string>('');
    const [formSymptoms, setFormSymptoms] = useState<Record<string, boolean>>({
        q1_demam: false,
        q2_pusing: false,
        q3_sulit_tidur: false,
        q4_risiko_tb: false,
        q5_gerakan_bayi: false,
        q6_nyeri_perut: false,
        q7_cairan_jalan_lahir: false,
        q8_sakit_kencing: false,
        q9_diare: false,
    });
    const [formHasil, setFormHasil] = useState<string>('');
    const [formTherapy, setFormTherapy] = useState<string>('');
    const [formNextVisit, setFormNextVisit] = useState<string>('');

    // Pre-fill state from appointment or patient directory
    useEffect(() => {
        const state = location.state as { prefillUser?: { userId: number; userName: string } } | null;
        if (state?.prefillUser?.userId) {
            setFormUserId(state.prefillUser.userId);
            setIsCreateModalOpen(true);
        }
    }, [location.state]);

    useEffect(() => {
        fetchCatatanList();
        fetchPatients();
    }, []);

    useEffect(() => {
        filterCatatan();
    }, [catatanList, searchQuery, statusFilter]);

    useEffect(() => {
        paginateData();
    }, [filteredList, currentPage]);

    const fetchCatatanList = async () => {
        try {
            setLoading(true);
            const result = await getCatatanIbuList();
            const list = Array.isArray(result?.data) ? result.data : [];
            setCatatanList(list);
        } catch (error) {
            console.error('Failed to fetch catatan list:', error);
            message.error('Gagal mengambil daftar rekam medis kunjungan');
        } finally {
            setLoading(false);
        }
    };

    const fetchPatients = async () => {
        try {
            setLoadingPatients(true);
            const res = await getIbuHamilUsers();
            if (Array.isArray(res.data)) {
                setPatients(res.data);
            }
        } catch (err) {
            console.error('Failed loading patient list:', err);
        } finally {
            setLoadingPatients(false);
        }
    };

    const filterCatatan = () => {
        let filtered = [...catatanList];

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim();
            filtered = filtered.filter((catatan) => {
                const name = (catatan.nama_ibu || catatan.user?.name || '').toLowerCase();
                const date = (catatan.tanggal_kunjungan || '').toLowerCase();
                return name.includes(q) || date.includes(q);
            });
        }

        if (statusFilter !== 'all') {
            filtered = filtered.filter(
                (catatan) => catatan.status_kunjungan === statusFilter
            );
        }

        setFilteredList(filtered);
        setCurrentPage(1);
    };

    const paginateData = () => {
        const startIndex = (currentPage - 1) * PAGE_SIZE;
        const endIndex = startIndex + PAGE_SIZE;
        setPaginatedList(filteredList.slice(startIndex, endIndex));
    };

    const formatDate = (dateStr: string): string => {
        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return dateStr;
            return date.toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
            });
        } catch {
            return dateStr;
        }
    };

    const resetForm = () => {
        setFormUserId(undefined);
        setFormDate(todayStr);
        setFormStatus('selesai');
        setFormSystolic('');
        setFormDiastolic('');
        setFormWeight('');
        setFormFundal('');
        setFormFhr('');
        setFormHb('');
        setFormSymptoms({
            q1_demam: false,
            q2_pusing: false,
            q3_sulit_tidur: false,
            q4_risiko_tb: false,
            q5_gerakan_bayi: false,
            q6_nyeri_perut: false,
            q7_cairan_jalan_lahir: false,
            q8_sakit_kencing: false,
            q9_diare: false,
        });
        setFormHasil('');
        setFormTherapy('');
        setFormNextVisit('');
    };

    const handleCreateVisit = async () => {
        if (!formUserId) {
            message.warning('Silakan pilih ibu hamil terlebih dahulu');
            return;
        }
        if (!formDate) {
            message.warning('Silakan tentukan tanggal kunjungan');
            return;
        }

        try {
            setSavingVisit(true);

            const payload: CreateCatatanIbuPayload = {
                user_id: formUserId,
                tanggal_kunjungan: formDate,
                status_kunjungan: formStatus,
                systolic_bp: formSystolic ? Number(formSystolic) : null,
                diastolic_bp: formDiastolic ? Number(formDiastolic) : null,
                weight_kg: formWeight ? Number(formWeight) : null,
                fundal_height_cm: formFundal ? Number(formFundal) : null,
                fetal_heart_rate_bpm: formFhr ? Number(formFhr) : null,
                hemoglobin_gdl: formHb ? Number(formHb) : null,
                q1_demam: formSymptoms.q1_demam,
                q2_pusing: formSymptoms.q2_pusing,
                q3_sulit_tidur: formSymptoms.q3_sulit_tidur,
                q4_risiko_tb: formSymptoms.q4_risiko_tb,
                q5_gerakan_bayi: formSymptoms.q5_gerakan_bayi,
                q6_nyeri_perut: formSymptoms.q6_nyeri_perut,
                q7_cairan_jalan_lahir: formSymptoms.q7_cairan_jalan_lahir,
                q8_sakit_kencing: formSymptoms.q8_sakit_kencing,
                q9_diare: formSymptoms.q9_diare,
                hasil_kunjungan: formHasil.trim() || 'Pemeriksaan antenatal care (ANC) rutin.',
                therapy_notes: formTherapy.trim() || null,
                next_visit_date: formNextVisit || null,
            };

            const res = await createCatatanIbu(payload);
            message.success('Rekam kunjungan ANC berhasil dicatat & disinkronkan ke CDSS Triase!');
            setIsCreateModalOpen(false);
            resetForm();
            await fetchCatatanList();

            if (res.data?.catatan_id) {
                navigate(`/catatan-kunjungan/${res.data.catatan_id}`);
            }
        } catch (err: any) {
            console.error('Failed creating visit record:', err);
            const errDetail = err?.response?.data?.message || 'Gagal menyimpan catatan kunjungan';
            message.error(errDetail);
        } finally {
            setSavingVisit(false);
        }
    };

    const isBpHigh = Number(formSystolic) >= 140 || Number(formDiastolic) >= 90;

    return (
        <div className="space-y-6">
            {/* Header section with CTA */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-7 bg-[#FA6978] rounded-full"></span>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Pencatatan Rekam Medis Kunjungan ANC
                        </h1>
                    </div>
                    <p className="text-gray-500 mt-1 ml-4.5 text-sm">
                        Dokumentasi asuhan kehamilan rutin, tanda vital klinis, dan integrasi otomatis dengan sistem triase CDSS.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        size="large"
                        onClick={() => setIsCreateModalOpen(true)}
                        className="rounded-xl font-medium shadow-sm hover:scale-[1.02] transition-transform"
                        style={{ backgroundColor: '#FA6978', borderColor: '#FA6978' }}
                    >
                        + Catat Kunjungan Baru
                    </Button>
                </div>
            </div>

            {/* Search and Filter Bar */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <div className="flex flex-col md:flex-row items-center gap-4">
                    <div className="flex-1 w-full">
                        <Input
                            placeholder="Cari berdasarkan nama ibu atau tanggal kunjungan..."
                            prefix={<SearchOutlined className="text-gray-400" />}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            size="large"
                            allowClear
                            className="rounded-xl"
                        />
                    </div>
                    <div className="w-full md:w-64">
                        <Select
                            placeholder="Status Kunjungan"
                            value={statusFilter}
                            onChange={setStatusFilter}
                            size="large"
                            className="w-full rounded-xl"
                            options={[
                                { label: 'Semua Status Kunjungan', value: 'all' },
                                { label: '✅ Selesai', value: 'selesai' },
                                { label: '⏳ Sedang Berlangsung', value: 'sedang_berlangsung' },
                            ]}
                        />
                    </div>
                </div>
            </div>

            {/* Cards Grid */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                {loading ? (
                    <div className="flex flex-col justify-center items-center py-20 gap-3">
                        <Spin size="large" />
                        <span className="text-gray-400 text-sm">Memuat riwayat kunjungan medis...</span>
                    </div>
                ) : filteredList.length === 0 ? (
                    <Empty
                        description={
                            <div className="text-gray-500 py-6">
                                <p className="font-medium text-base">Tidak ada catatan kunjungan yang cocok</p>
                                <p className="text-sm text-gray-400 mt-1">
                                    Tekan tombol "+ Catat Kunjungan Baru" untuk merekam pemeriksaan ANC pasien.
                                </p>
                            </div>
                        }
                    />
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {paginatedList.map((catatan) => {
                                const patientName = catatan.nama_ibu || catatan.user?.name || 'Ibu Hamil';
                                const hasVitals =
                                    catatan.systolic_bp ||
                                    catatan.diastolic_bp ||
                                    catatan.fetal_heart_rate_bpm ||
                                    catatan.hemoglobin_gdl;

                                return (
                                    <Card
                                        key={catatan.catatan_id}
                                        hoverable
                                        className="rounded-2xl border border-gray-200/80 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden group"
                                        onClick={() => navigate(`/catatan-kunjungan/${catatan.catatan_id}`)}
                                        bodyStyle={{ padding: '20px' }}
                                    >
                                        <div className="flex flex-col h-full justify-between space-y-4">
                                            {/* Header Card */}
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-11 h-11 rounded-xl bg-pink-50 border border-pink-100 flex items-center justify-center text-[#FA6978] font-bold text-base shrink-0 group-hover:scale-105 transition-transform">
                                                        <UserOutlined />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-gray-900 group-hover:text-[#FA6978] transition-colors line-clamp-1">
                                                            {patientName}
                                                        </h3>
                                                        <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                                                            <CalendarOutlined />
                                                            <span>{formatDate(catatan.tanggal_kunjungan)}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <span
                                                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium shrink-0 ${
                                                        catatan.status_kunjungan === 'selesai'
                                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                                                    }`}
                                                >
                                                    {catatan.status_kunjungan === 'selesai' ? (
                                                        <>
                                                            <CheckCircleOutlined /> Selesai
                                                        </>
                                                    ) : (
                                                        <>
                                                            <ClockCircleOutlined /> Berlangsung
                                                        </>
                                                    )}
                                                </span>
                                            </div>

                                            {/* Vital Signs Preview */}
                                            {hasVitals ? (
                                                <div className="grid grid-cols-2 gap-2 p-2.5 bg-gray-50 rounded-xl border border-gray-100 text-xs">
                                                    {catatan.systolic_bp && catatan.diastolic_bp && (
                                                        <div className="flex items-center gap-1.5 text-gray-700">
                                                            <span className="font-medium text-gray-500">TD:</span>
                                                            <span className={catatan.systolic_bp >= 140 ? 'font-bold text-red-600' : 'font-semibold'}>
                                                                {catatan.systolic_bp}/{catatan.diastolic_bp} mmHg
                                                            </span>
                                                        </div>
                                                    )}
                                                    {catatan.fetal_heart_rate_bpm && (
                                                        <div className="flex items-center gap-1.5 text-gray-700">
                                                            <span className="font-medium text-gray-500">DJJ:</span>
                                                            <span className="font-semibold text-pink-600">
                                                                {catatan.fetal_heart_rate_bpm} bpm
                                                            </span>
                                                        </div>
                                                    )}
                                                    {catatan.weight_kg && (
                                                        <div className="flex items-center gap-1.5 text-gray-700">
                                                            <span className="font-medium text-gray-500">BB:</span>
                                                            <span className="font-semibold">{catatan.weight_kg} kg</span>
                                                        </div>
                                                    )}
                                                    {catatan.hemoglobin_gdl && (
                                                        <div className="flex items-center gap-1.5 text-gray-700">
                                                            <span className="font-medium text-gray-500">Hb:</span>
                                                            <span className={catatan.hemoglobin_gdl < 11 ? 'font-bold text-red-600' : 'font-semibold'}>
                                                                {catatan.hemoglobin_gdl} g/dL
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="p-2.5 bg-gray-50 rounded-xl text-xs text-gray-400 italic">
                                                    Pemeriksaan fisik tanda vital belum tercatat lengkap
                                                </div>
                                            )}

                                            {/* Clinical Notes Snippet */}
                                            {catatan.hasil_kunjungan && (
                                                <div className="text-xs text-gray-600 line-clamp-2 bg-pink-50/30 p-2 rounded-lg border border-pink-100/50">
                                                    <span className="font-medium text-gray-800">Catatan: </span>
                                                    {catatan.hasil_kunjungan}
                                                </div>
                                            )}

                                            {/* Footer Action */}
                                            <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                                                <span>ID Rekam: #{catatan.catatan_id}</span>
                                                <span className="text-[#FA6978] font-medium group-hover:underline flex items-center gap-1">
                                                    <FileTextOutlined /> Lihat / Resume &rarr;
                                                </span>
                                            </div>
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>

                        {/* Pagination */}
                        {filteredList.length > PAGE_SIZE && (
                            <div className="flex justify-center mt-8">
                                <Pagination
                                    current={currentPage}
                                    total={filteredList.length}
                                    pageSize={PAGE_SIZE}
                                    onChange={(page) => setCurrentPage(page)}
                                    showSizeChanger={false}
                                    showTotal={(total, range) =>
                                        `${range[0]}-${range[1]} dari total ${total} catatan rekam medis`
                                    }
                                />
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Modal Catat Kunjungan Baru */}
            <Modal
                title={
                    <div className="flex items-center gap-2 text-gray-900 border-b border-gray-100 pb-3">
                        <div className="w-8 h-8 rounded-lg bg-pink-100 text-[#FA6978] flex items-center justify-center font-bold">
                            <PlusOutlined />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-gray-900">
                                Catat Rekam Medis Kunjungan ANC Baru
                            </h3>
                            <p className="text-xs font-normal text-gray-500">
                                Dokumentasikan hasil pemeriksaan fisik, tanda vital, dan keluhan ibu hamil
                            </p>
                        </div>
                    </div>
                }
                open={isCreateModalOpen}
                onCancel={() => {
                    setIsCreateModalOpen(false);
                    resetForm();
                }}
                footer={[
                    <Button
                        key="cancel"
                        onClick={() => {
                            setIsCreateModalOpen(false);
                            resetForm();
                        }}
                        disabled={savingVisit}
                    >
                        Batal
                    </Button>,
                    <Button
                        key="submit"
                        type="primary"
                        loading={savingVisit}
                        onClick={handleCreateVisit}
                        style={{ backgroundColor: '#FA6978', borderColor: '#FA6978' }}
                    >
                        Simpan Rekam Medis
                    </Button>,
                ]}
                width={820}
                centered
                destroyOnClose
            >
                <div className="space-y-6 py-2 max-h-[75vh] overflow-y-auto px-1">
                    {/* Bagian 1: Identitas & Tanggal */}
                    <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-200/80 space-y-4">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-600 flex items-center gap-1.5">
                            <UserOutlined /> Identitas Pasien & Waktu Kunjungan
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Pilih Ibu Hamil <span className="text-red-500">*</span>
                                </label>
                                <Select
                                    placeholder="Cari & pilih ibu hamil..."
                                    showSearch
                                    loading={loadingPatients}
                                    value={formUserId}
                                    onChange={(val) => setFormUserId(val)}
                                    className="w-full"
                                    size="large"
                                    filterOption={(input, option) =>
                                        (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())
                                    }
                                    options={patients.map((p) => ({
                                        value: p.user_id,
                                        label: `${p.name} (${p.email || p.profile?.no_telepon || p.no_telepon || 'No Telp -'})`,
                                    }))}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Tanggal Kunjungan <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={formDate}
                                    onChange={(e) => setFormDate(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FA6978]"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Status Pemeriksaan
                            </label>
                            <Select
                                value={formStatus}
                                onChange={(val) => setFormStatus(val)}
                                className="w-full md:w-60"
                                options={[
                                    { label: '✅ Selesai (Pemeriksaan Lengkap)', value: 'selesai' },
                                    { label: '⏳ Sedang Berlangsung (Perlu Tindak Lanjut)', value: 'sedang_berlangsung' },
                                ]}
                            />
                        </div>
                    </div>

                    {/* Bagian 2: Tanda Vital & Pemeriksaan Fisik ANC */}
                    <div className="p-4 rounded-xl border border-pink-100 bg-pink-50/20 space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-[#FA6978] flex items-center gap-1.5">
                                <HeartOutlined /> Tanda Vital & Pengukuran Fisik ANC (Buku KIA)
                            </h4>
                            {isBpHigh && (
                                <span className="text-xs bg-red-100 text-red-700 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                                    <AlertOutlined /> Waspada Hipertensi Gestasional (&ge;140/90)
                                </span>
                            )}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                    TD Sistolik (mmHg)
                                </label>
                                <Input
                                    type="number"
                                    placeholder="Contoh: 120"
                                    value={formSystolic}
                                    onChange={(e) => setFormSystolic(e.target.value)}
                                    className={Number(formSystolic) >= 140 ? 'border-red-500 bg-red-50' : ''}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                    TD Diastolik (mmHg)
                                </label>
                                <Input
                                    type="number"
                                    placeholder="Contoh: 80"
                                    value={formDiastolic}
                                    onChange={(e) => setFormDiastolic(e.target.value)}
                                    className={Number(formDiastolic) >= 90 ? 'border-red-500 bg-red-50' : ''}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Berat Badan Pasien (kg)
                                </label>
                                <Input
                                    type="number"
                                    step="0.1"
                                    placeholder="Contoh: 62.5"
                                    value={formWeight}
                                    onChange={(e) => setFormWeight(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Tinggi Fundus Uteri / TFU (cm)
                                </label>
                                <Input
                                    type="number"
                                    placeholder="Contoh: 28"
                                    value={formFundal}
                                    onChange={(e) => setFormFundal(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Denyut Jantung Janin / DJJ (bpm)
                                </label>
                                <Input
                                    type="number"
                                    placeholder="Normal: 120 - 160"
                                    value={formFhr}
                                    onChange={(e) => setFormFhr(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Kadar Hemoglobin / Hb (g/dL)
                                </label>
                                <Input
                                    type="number"
                                    step="0.1"
                                    placeholder="Contoh: 11.5"
                                    value={formHb}
                                    onChange={(e) => setFormHb(e.target.value)}
                                    className={Number(formHb) > 0 && Number(formHb) < 11 ? 'border-red-500 bg-red-50' : ''}
                                />
                            </div>
                        </div>

                        <p className="text-[11px] text-gray-500 italic">
                            * Data tanda vital akan otomatis memperbarui kalkulasi bobot risiko preeklamsia pada Algoritma CDSS Maternal Triage secara real-time.
                        </p>
                    </div>

                    {/* Bagian 3: 9 Skrining Tanda Bahaya (Kemenkes RI) */}
                    <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-200/80 space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                            <AlertOutlined /> 9 Skrining Tanda Bahaya & Gejala Klinis (Kemenkes)
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                            {defaultSymptoms.map((sym) => {
                                const isChecked = !!formSymptoms[sym.id];
                                return (
                                    <div
                                        key={sym.id}
                                        onClick={() =>
                                            setFormSymptoms((prev) => ({
                                                ...prev,
                                                [sym.id]: !prev[sym.id],
                                            }))
                                        }
                                        className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 select-none ${
                                            isChecked
                                                ? 'bg-red-50 border-red-300 text-red-900 shadow-xs'
                                                : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                                        }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={isChecked}
                                            onChange={() => {}}
                                            className="mt-0.5 rounded text-[#FA6978] focus:ring-[#FA6978] cursor-pointer"
                                        />
                                        <div className="flex-1">
                                            <div className="font-semibold">{sym.label}</div>
                                            <div className="text-[11px] text-gray-500 mt-0.5">{sym.desc}</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Bagian 4: Catatan & Terapi */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Hasil Pemeriksaan & Rekomendasi Asuhan Bidan (SOAP)
                            </label>
                            <TextArea
                                rows={4}
                                placeholder="Tuliskan temuan klinis, hasil konseling, edukasi nutrisi, serta anjuran istirahat..."
                                value={formHasil}
                                onChange={(e) => setFormHasil(e.target.value)}
                                className="rounded-xl"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Resep Obat / Terapi (Tablet Tambah Darah / Kalsium)
                                </label>
                                <Input
                                    placeholder="Contoh: TTD 1x1 tab malam, Kalsium 1x500mg"
                                    value={formTherapy}
                                    onChange={(e) => setFormTherapy(e.target.value)}
                                    className="rounded-xl"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Jadwal Kunjungan Berikutnya
                                </label>
                                <input
                                    type="date"
                                    value={formNextVisit}
                                    onChange={(e) => setFormNextVisit(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FA6978]"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
