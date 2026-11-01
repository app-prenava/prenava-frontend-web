import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, Input, Select, Spin, Empty, Pagination, Button, Modal, message, Tag } from 'antd';
import {
    SearchOutlined,
    CalendarOutlined,
    PlusOutlined,
    FileTextOutlined,
    UserOutlined,
    HeartOutlined,
    AlertOutlined,
} from '@ant-design/icons';
import { getCatatanIbuList, createCatatanIbu } from '../catatan.api';
import { getIbuHamilUsers, type IbuHamilUser } from '../bidan.api';
import type { CatatanIbu, CreateCatatanIbuPayload } from '../catatan.types';

const { TextArea } = Input;
const PAGE_SIZE = 9;

const defaultSymptoms = [
    { id: 'q1_demam', label: 'Demam lebih dari 2 hari', desc: 'Suhu tubuh terasa panas atau menggigil' },
    { id: 'q2_pusing', label: 'Sakit kepala berat', desc: 'Pusing hebat yang tidak kunjung membaik' },
    { id: 'q3_sulit_tidur', label: 'Sulit tidur atau cemas', desc: 'Gelisah atau sulit beristirahat dengan tenang' },
    { id: 'q4_risiko_tb', label: 'Batuk lama (lebih 2 minggu)', desc: 'Batuk kering/berdahak lama atau kontak serumah penderita TB' },
    { id: 'q5_gerakan_bayi', label: 'Gerakan janin berkurang', desc: 'Janin bergerak kurang dari 10 kali dalam 12 jam (usia >24 minggu)' },
    { id: 'q6_nyeri_perut', label: 'Nyeri perut hebat', desc: 'Kram atau nyeri perut bagian bawah yang parah' },
    { id: 'q7_cairan_jalan_lahir', label: 'Keluar cairan atau darah', desc: 'Cairan ketuban merembes atau ada flek/darah dari jalan lahir' },
    { id: 'q8_sakit_kencing', label: 'Nyeri saat buang air kecil', desc: 'Terasa perih saat kencing atau keputihan yang gatal/berbau' },
    { id: 'q9_diare', label: 'Diare berulang', desc: 'Buang air besar cair lebih dari 3 kali sehari' },
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
            message.error('Gagal mengambil daftar catatan kunjungan');
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
            message.warning('Pilih nama ibu hamil terlebih dahulu');
            return;
        }
        if (!formDate) {
            message.warning('Tentukan tanggal kunjungan');
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
                hasil_kunjungan: formHasil.trim() || 'Pemeriksaan kehamilan rutin.',
                therapy_notes: formTherapy.trim() || null,
                next_visit_date: formNextVisit || null,
            };

            const res = await createCatatanIbu(payload);
            message.success('Catatan kunjungan berhasil disimpan');
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
            {/* Header Bersih & Natural */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-gray-200">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 m-0">
                        Catatan Kunjungan Ibu Hamil
                    </h1>
                    <p className="text-sm text-gray-600 mt-1 mb-0">
                        Riwayat pemeriksaan kehamilan, tanda vital, dan asuhan kebidanan.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        size="large"
                        onClick={() => setIsCreateModalOpen(true)}
                        style={{ backgroundColor: '#FA6978', borderColor: '#FA6978' }}
                    >
                        Catat Kunjungan
                    </Button>
                </div>
            </div>

            {/* Filter dan Pencarian */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="flex-1 w-full">
                        <Input
                            placeholder="Cari nama ibu hamil atau tanggal kunjungan..."
                            prefix={<SearchOutlined className="text-gray-400" />}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            size="large"
                            allowClear
                        />
                    </div>
                    <div className="w-full sm:w-64">
                        <Select
                            placeholder="Status Kunjungan"
                            value={statusFilter}
                            onChange={setStatusFilter}
                            size="large"
                            className="w-full"
                            options={[
                                { label: 'Semua Status', value: 'all' },
                                { label: 'Selesai', value: 'selesai' },
                                { label: 'Sedang Berlangsung', value: 'sedang_berlangsung' },
                            ]}
                        />
                    </div>
                </div>
            </div>

            {/* Daftar Kunjungan Pasien */}
            <div className="space-y-4">
                {loading ? (
                    <div className="flex flex-col justify-center items-center py-20 gap-3 bg-white rounded-xl border border-gray-200">
                        <Spin size="large" />
                        <span className="text-gray-500 text-sm">Memuat catatan kunjungan...</span>
                    </div>
                ) : filteredList.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-8">
                        <Empty
                            description={
                                <div className="text-gray-600 py-4">
                                    <p className="font-semibold text-base mb-1">Belum ada catatan kunjungan yang cocok</p>
                                    <p className="text-sm text-gray-500 mb-0">
                                        Tekan tombol "Catat Kunjungan" di kanan atas untuk membuat catatan baru.
                                    </p>
                                </div>
                            }
                        />
                    </div>
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
                                        className="rounded-xl border border-gray-200 shadow-xs hover:border-[#FA6978] transition-all cursor-pointer"
                                        onClick={() => navigate(`/catatan-kunjungan/${catatan.catatan_id}`)}
                                        bodyStyle={{ padding: '20px' }}
                                    >
                                        <div className="flex flex-col h-full justify-between space-y-4">
                                            {/* Header Card Pasien */}
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-pink-50 border border-pink-100 flex items-center justify-center text-[#FA6978] font-semibold text-sm shrink-0">
                                                        <UserOutlined />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-gray-900 line-clamp-1 mb-0">
                                                            {patientName}
                                                        </h3>
                                                        <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                                                            <CalendarOutlined />
                                                            <span>{formatDate(catatan.tanggal_kunjungan)}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <Tag
                                                    color={catatan.status_kunjungan === 'selesai' ? 'success' : 'warning'}
                                                    className="font-medium text-xs m-0"
                                                >
                                                    {catatan.status_kunjungan === 'selesai' ? 'Selesai' : 'Berlangsung'}
                                                </Tag>
                                            </div>

                                            {/* Ringkasan Tanda Vital */}
                                            {hasVitals ? (
                                                <div className="grid grid-cols-2 gap-2 p-2.5 bg-gray-50 rounded-lg border border-gray-200 text-xs">
                                                    {catatan.systolic_bp && catatan.diastolic_bp && (
                                                        <div className="text-gray-700">
                                                            <span className="text-gray-500 block">Tekanan Darah:</span>
                                                            <span className={catatan.systolic_bp >= 140 ? 'font-bold text-red-600' : 'font-semibold'}>
                                                                {catatan.systolic_bp}/{catatan.diastolic_bp} mmHg
                                                            </span>
                                                        </div>
                                                    )}
                                                    {catatan.fetal_heart_rate_bpm && (
                                                        <div className="text-gray-700">
                                                            <span className="text-gray-500 block">Detak Jantung Janin:</span>
                                                            <span className="font-semibold text-gray-900">
                                                                {catatan.fetal_heart_rate_bpm} bpm
                                                            </span>
                                                        </div>
                                                    )}
                                                    {catatan.weight_kg && (
                                                        <div className="text-gray-700">
                                                            <span className="text-gray-500 block">Berat Badan:</span>
                                                            <span className="font-semibold text-gray-900">{catatan.weight_kg} kg</span>
                                                        </div>
                                                    )}
                                                    {catatan.hemoglobin_gdl && (
                                                        <div className="text-gray-700">
                                                            <span className="text-gray-500 block">Kadar Hb:</span>
                                                            <span className={catatan.hemoglobin_gdl < 11 ? 'font-bold text-red-600' : 'font-semibold text-gray-900'}>
                                                                {catatan.hemoglobin_gdl} g/dL
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="p-2.5 bg-gray-50 rounded-lg text-xs text-gray-500 italic">
                                                    Tanda vital belum dicatat lengkap
                                                </div>
                                            )}

                                            {/* Cuplikan Catatan Bidan */}
                                            {catatan.hasil_kunjungan && (
                                                <div className="text-xs text-gray-700 line-clamp-2 bg-gray-50 p-2.5 rounded-lg border border-gray-200">
                                                    <span className="font-semibold text-gray-900">Catatan: </span>
                                                    {catatan.hasil_kunjungan}
                                                </div>
                                            )}

                                            {/* Aksi Bawah */}
                                            <div className="pt-2 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
                                                <span>No. #{catatan.catatan_id}</span>
                                                <span className="text-[#FA6978] font-medium flex items-center gap-1">
                                                    <FileTextOutlined /> Buka Catatan
                                                </span>
                                            </div>
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>

                        {/* Paginasi */}
                        {filteredList.length > PAGE_SIZE && (
                            <div className="flex justify-center mt-8">
                                <Pagination
                                    current={currentPage}
                                    total={filteredList.length}
                                    pageSize={PAGE_SIZE}
                                    onChange={(page) => setCurrentPage(page)}
                                    showSizeChanger={false}
                                    showTotal={(total, range) =>
                                        `${range[0]}-${range[1]} dari ${total} catatan`
                                    }
                                />
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Modal Tambah Catatan Kunjungan */}
            <Modal
                title={
                    <div className="border-b border-gray-200 pb-3">
                        <h3 className="text-base font-bold text-gray-900 mb-0">
                            Tambah Catatan Kunjungan Ibu Hamil
                        </h3>
                        <p className="text-xs text-gray-500 mt-1 mb-0">
                            Isi data pemeriksaan fisik dan keluhan saat kunjungan.
                        </p>
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
                        Simpan Catatan
                    </Button>,
                ]}
                width={800}
                centered
                destroyOnClose
            >
                <div className="space-y-5 py-2 max-h-[72vh] overflow-y-auto px-1">
                    {/* Bagian 1: Data Pasien & Tanggal */}
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-4">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 m-0">
                            Data Pasien & Tanggal Kunjungan
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Pilih Ibu Hamil <span className="text-red-500">*</span>
                                </label>
                                <Select
                                    placeholder="Pilih nama ibu hamil..."
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
                                        label: `${p.name} (${p.email || p.profile?.no_telepon || p.no_telepon || 'Kontak belum ada'})`,
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
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#FA6978]"
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
                                className="w-full md:w-64"
                                options={[
                                    { label: 'Selesai', value: 'selesai' },
                                    { label: 'Sedang Berlangsung', value: 'sedang_berlangsung' },
                                ]}
                            />
                        </div>
                    </div>

                    {/* Bagian 2: Tanda Vital & Pemeriksaan Fisik */}
                    <div className="p-4 rounded-xl border border-gray-200 bg-white space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-800 m-0 flex items-center gap-1.5">
                                <HeartOutlined className="text-[#FA6978]" /> Pemeriksaan Fisik & Tanda Vital
                            </h4>
                            {isBpHigh && (
                                <Tag color="error" className="m-0 font-medium text-xs">
                                    Tekanan Darah Tinggi (&ge;140/90 mmHg)
                                </Tag>
                            )}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Tekanan Darah Sistolik (mmHg)
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
                                    Tekanan Darah Diastolik (mmHg)
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
                                    Berat Badan (kg)
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
                                    Detak Jantung Janin (bpm)
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

                        <p className="text-[11px] text-gray-500 mb-0">
                            * Data tekanan darah dan keluhan akan otomatis dicatat untuk memantau risiko kehamilan.
                        </p>
                    </div>

                    {/* Bagian 3: Tanda Bahaya Kehamilan */}
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 m-0 flex items-center gap-1.5">
                            <AlertOutlined /> Tanda Bahaya Kehamilan
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
                                        className={`p-2.5 rounded-lg border cursor-pointer transition-all flex items-start gap-2.5 select-none ${
                                            isChecked
                                                ? 'bg-red-50 border-red-300 text-red-900'
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

                    {/* Bagian 4: Catatan Bidan & Terapi */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Catatan Pemeriksaan & Anjuran Bidan
                            </label>
                            <TextArea
                                rows={4}
                                placeholder="Tuliskan temuan fisik, keluhan ibu, serta anjuran istirahat atau pola makan..."
                                value={formHasil}
                                onChange={(e) => setFormHasil(e.target.value)}
                                className="rounded-lg"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Obat atau Vitamin yang Diberikan
                                </label>
                                <Input
                                    placeholder="Contoh: Tablet Tambah Darah (TTD) 1x1 malam, Kalsium 1x500mg"
                                    value={formTherapy}
                                    onChange={(e) => setFormTherapy(e.target.value)}
                                    className="rounded-lg"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                    Tanggal Kontrol Berikutnya
                                </label>
                                <input
                                    type="date"
                                    value={formNextVisit}
                                    onChange={(e) => setFormNextVisit(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#FA6978]"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
