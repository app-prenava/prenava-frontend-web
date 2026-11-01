import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Input, Button, Table, Spin, message, Tag, Divider } from 'antd';
import {
    CalendarOutlined,
    ArrowLeftOutlined,
    PrinterOutlined,
    HeartOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    AlertOutlined,
    MedicineBoxOutlined,
    UserOutlined,
} from '@ant-design/icons';
import { getCatatanIbuDetail, updateCatatanIbu } from '../catatan.api';
import type { CatatanIbu, UpdateCatatanIbuPayload } from '../catatan.types';

const { TextArea } = Input;

const monitoringQuestions = [
    { key: 'q1_demam', label: 'Demam lebih dari 2 hari' },
    { key: 'q2_pusing', label: 'Pusing / sakit kepala berat' },
    { key: 'q3_sulit_tidur', label: 'Sulit tidur / cemas berlebih' },
    { key: 'q4_risiko_tb', label: 'Risiko TB atau batuk > 2 minggu' },
    { key: 'q5_gerakan_bayi', label: 'Gerakan janin berkurang (<10x/12 jam)' },
    { key: 'q6_nyeri_perut', label: 'Nyeri perut hebat' },
    { key: 'q7_cairan_jalan_lahir', label: 'Cairan jalan lahir berbau / perdarahan' },
    { key: 'q8_sakit_kencing', label: 'Sakit saat kencing / keputihan abnormal' },
    { key: 'q9_diare', label: 'Diare berulang' },
] as const;

type QuestionKey = (typeof monitoringQuestions)[number]['key'];

export default function CatatanKunjunganDetail() {
    const { catatan_id } = useParams<{ catatan_id: string }>();
    const navigate = useNavigate();

    const [catatan, setCatatan] = useState<CatatanIbu | null>(null);
    const [monitoringData, setMonitoringData] = useState<Record<string, boolean>>({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Editable fields
    const [hasilKunjungan, setHasilKunjungan] = useState('');
    const [therapyNotes, setTherapyNotes] = useState('');
    const [nextVisitDate, setNextVisitDate] = useState('');
    const [systolicBp, setSystolicBp] = useState<string>('');
    const [diastolicBp, setDiastolicBp] = useState<string>('');
    const [weightKg, setWeightKg] = useState<string>('');
    const [fundalHeightCm, setFundalHeightCm] = useState<string>('');
    const [fhrBpm, setFhrBpm] = useState<string>('');
    const [hemoglobinGdl, setHemoglobinGdl] = useState<string>('');

    useEffect(() => {
        if (catatan_id) {
            fetchCatatanDetail(Number(catatan_id));
        }
    }, [catatan_id]);

    const fetchCatatanDetail = async (id: number) => {
        try {
            setLoading(true);
            const result = await getCatatanIbuDetail(id);

            const responseData = result.data;
            let dataItem: any = null;

            if (Array.isArray(responseData)) {
                dataItem = responseData[0] || null;
            } else if (responseData && typeof responseData === 'object') {
                dataItem = responseData;
            }

            if (!dataItem) {
                throw new Error('Data catatan tidak ditemukan');
            }

            // Extract monitoring questions
            const extractedQuestions: Record<string, boolean> = {};
            if (Array.isArray(dataItem.pertanyaan)) {
                dataItem.pertanyaan.forEach((p: any) => {
                    if (p.id) {
                        extractedQuestions[p.id] = p.jawaban === 1 || p.jawaban === true || p.jawaban === '1';
                    }
                });
            } else {
                monitoringQuestions.forEach((q) => {
                    extractedQuestions[q.key] = dataItem[q.key] === 1 || dataItem[q.key] === true || dataItem[q.key] === '1';
                });
            }

            setMonitoringData(extractedQuestions);

            const normalizedCatatan: CatatanIbu = {
                catatan_id: dataItem.catatan_id,
                user_id: dataItem.user_id,
                nama_ibu: dataItem.nama_ibu || dataItem.user?.name || 'Pasien',
                user: dataItem.user,
                tanggal_kunjungan: dataItem.tanggal_kunjungan,
                status_kunjungan: dataItem.status_kunjungan,
                hasil_kunjungan: dataItem.hasil_kunjungan,
                systolic_bp: dataItem.systolic_bp,
                diastolic_bp: dataItem.diastolic_bp,
                weight_kg: dataItem.weight_kg,
                fundal_height_cm: dataItem.fundal_height_cm,
                fetal_heart_rate_bpm: dataItem.fetal_heart_rate_bpm,
                hemoglobin_gdl: dataItem.hemoglobin_gdl,
                therapy_notes: dataItem.therapy_notes,
                next_visit_date: dataItem.next_visit_date,
                q1_demam: extractedQuestions.q1_demam ? 1 : 0,
                q2_pusing: extractedQuestions.q2_pusing ? 1 : 0,
                q3_sulit_tidur: extractedQuestions.q3_sulit_tidur ? 1 : 0,
                q4_risiko_tb: extractedQuestions.q4_risiko_tb ? 1 : 0,
                q5_gerakan_bayi: extractedQuestions.q5_gerakan_bayi ? 1 : 0,
                q6_nyeri_perut: extractedQuestions.q6_nyeri_perut ? 1 : 0,
                q7_cairan_jalan_lahir: extractedQuestions.q7_cairan_jalan_lahir ? 1 : 0,
                q8_sakit_kencing: extractedQuestions.q8_sakit_kencing ? 1 : 0,
                q9_diare: extractedQuestions.q9_diare ? 1 : 0,
            };

            setCatatan(normalizedCatatan);
            setHasilKunjungan(normalizedCatatan.hasil_kunjungan || '');
            setTherapyNotes(normalizedCatatan.therapy_notes || '');
            setNextVisitDate(normalizedCatatan.next_visit_date || '');
            setSystolicBp(normalizedCatatan.systolic_bp ? String(normalizedCatatan.systolic_bp) : '');
            setDiastolicBp(normalizedCatatan.diastolic_bp ? String(normalizedCatatan.diastolic_bp) : '');
            setWeightKg(normalizedCatatan.weight_kg ? String(normalizedCatatan.weight_kg) : '');
            setFundalHeightCm(normalizedCatatan.fundal_height_cm ? String(normalizedCatatan.fundal_height_cm) : '');
            setFhrBpm(normalizedCatatan.fetal_heart_rate_bpm ? String(normalizedCatatan.fetal_heart_rate_bpm) : '');
            setHemoglobinGdl(normalizedCatatan.hemoglobin_gdl ? String(normalizedCatatan.hemoglobin_gdl) : '');
        } catch (error) {
            console.error('Failed to fetch catatan detail:', error);
            message.error('Gagal memuat detail rekam medis kunjungan');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateCatatan = async (markAsCompleted: boolean = false) => {
        if (!catatan_id || !catatan) return;

        try {
            setSubmitting(true);

            const payload: UpdateCatatanIbuPayload = {
                hasil_kunjungan: hasilKunjungan.trim(),
                status_kunjungan: markAsCompleted ? 'selesai' : catatan.status_kunjungan,
                therapy_notes: therapyNotes.trim() || null,
                next_visit_date: nextVisitDate || null,
                systolic_bp: systolicBp ? Number(systolicBp) : null,
                diastolic_bp: diastolicBp ? Number(diastolicBp) : null,
                weight_kg: weightKg ? Number(weightKg) : null,
                fundal_height_cm: fundalHeightCm ? Number(fundalHeightCm) : null,
                fetal_heart_rate_bpm: fhrBpm ? Number(fhrBpm) : null,
                hemoglobin_gdl: hemoglobinGdl ? Number(hemoglobinGdl) : null,
            };

            const updated = await updateCatatanIbu(Number(catatan_id), payload);
            message.success(
                markAsCompleted
                    ? 'Catatan berhasil diselesaikan & diperbarui!'
                    : 'Perubahan catatan medis berhasil disimpan'
            );

            // Re-sync local state
            setCatatan((prev) =>
                prev
                    ? {
                          ...prev,
                          ...payload,
                          status_kunjungan: payload.status_kunjungan || prev.status_kunjungan,
                      }
                    : null
            );
        } catch (error: any) {
            console.error('Failed updating catatan:', error);
            const errMsg = error?.response?.data?.message || 'Gagal menyimpan perubahan catatan';
            message.error(errMsg);
        } finally {
            setSubmitting(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const formatDate = (dateStr?: string | null): string => {
        if (!dateStr) return '-';
        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return dateStr;
            return date.toLocaleDateString('id-ID', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
            });
        } catch {
            return dateStr;
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center min-h-[400px] gap-3">
                <Spin size="large" />
                <span className="text-gray-400 text-sm">Memuat rekam medis kunjungan...</span>
            </div>
        );
    }

    if (!catatan) {
        return (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <p className="text-gray-600 font-medium">Rekam medis kunjungan tidak ditemukan.</p>
                <Button
                    type="primary"
                    onClick={() => navigate('/catatan-kunjungan')}
                    className="mt-4"
                    style={{ backgroundColor: '#FA6978', borderColor: '#FA6978' }}
                >
                    Kembali ke Daftar Kunjungan
                </Button>
            </div>
        );
    }

    const isCompleted = catatan.status_kunjungan === 'selesai';
    const isBpHigh = Number(systolicBp) >= 140 || Number(diastolicBp) >= 90;
    const isAnemic = Number(hemoglobinGdl) > 0 && Number(hemoglobinGdl) < 11;
    const isFhrAbnormal =
        Number(fhrBpm) > 0 && (Number(fhrBpm) < 120 || Number(fhrBpm) > 160);

    return (
        <div className="space-y-6">
            {/* Print Stylesheet */}
            <style>{`
                @media print {
                    body {
                        background: #ffffff !important;
                        font-family: Arial, sans-serif !important;
                        color: #000000 !important;
                    }
                    .no-print, header, aside, nav, .ant-btn {
                        display: none !important;
                    }
                    .print-only {
                        display: block !important;
                    }
                    .printable-card {
                        border: 1px solid #ddd !important;
                        box-shadow: none !important;
                        padding: 0 !important;
                    }
                }
                @media screen {
                    .print-only {
                        display: none !important;
                    }
                }
            `}</style>

            {/* Header Screen */}
            <div className="no-print flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3">
                    <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={() => navigate('/catatan-kunjungan')}
                        className="rounded-xl"
                    >
                        Kembali
                    </Button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-bold text-gray-900">
                                Rekam Medis ANC: {catatan.nama_ibu}
                            </h1>
                            <span
                                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                    isCompleted
                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                                }`}
                            >
                                {isCompleted ? (
                                    <>
                                        <CheckCircleOutlined /> Selesai
                                    </>
                                ) : (
                                    <>
                                        <ClockCircleOutlined /> Sedang Berlangsung
                                    </>
                                )}
                            </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                            ID Kunjungan #{catatan.catatan_id} &bull; {formatDate(catatan.tanggal_kunjungan)}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2.5">
                    <Button
                        icon={<PrinterOutlined />}
                        onClick={handlePrint}
                        size="large"
                        className="rounded-xl border-gray-300 font-medium hover:text-[#FA6978] hover:border-[#FA6978]"
                    >
                        Cetak Resume Medis
                    </Button>
                    {!isCompleted && (
                        <Button
                            type="primary"
                            size="large"
                            loading={submitting}
                            onClick={() => handleUpdateCatatan(true)}
                            className="rounded-xl font-medium"
                            style={{ backgroundColor: '#FA6978', borderColor: '#FA6978' }}
                        >
                            Selesaikan Kunjungan
                        </Button>
                    )}
                </div>
            </div>

            {/* Print Official Header */}
            <div className="print-only border-b-2 border-gray-800 pb-4 mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">PRENAVA MATERNAL HEALTH</h2>
                        <p className="text-xs text-gray-600">Pusat Layanan Kesehatan Ibu & Janin Terpadu</p>
                        <p className="text-xs text-gray-500">Standar Pelayanan Antenatal Care (ANC) Terintegrasi CDSS Kemenkes RI</p>
                    </div>
                    <div className="text-right">
                        <span className="text-xs font-bold uppercase tracking-wider px-2 py-1 bg-gray-100 border border-gray-300 rounded">
                            Resume Asuhan Antenatal
                        </span>
                        <p className="text-xs text-gray-500 mt-1">ID Kunjungan: #{catatan.catatan_id}</p>
                    </div>
                </div>
            </div>

            {/* Patient Demographic Summary Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 printable-card">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <UserOutlined className="text-[#FA6978]" /> Identitas Pasien & Waktu Kunjungan
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <span className="text-xs text-gray-500 block">Nama Pasien:</span>
                        <span className="font-bold text-gray-900 text-base">{catatan.nama_ibu}</span>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <span className="text-xs text-gray-500 block">Kontak / No Telepon:</span>
                        <span className="font-semibold text-gray-800">
                            {catatan.user?.phone || catatan.user?.email || '-'}
                        </span>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <span className="text-xs text-gray-500 block">Tanggal Kunjungan:</span>
                        <span className="font-semibold text-gray-800">
                            {formatDate(catatan.tanggal_kunjungan)}
                        </span>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <span className="text-xs text-gray-500 block">Status Rekam Medis:</span>
                        <span className="font-semibold text-gray-800 capitalize">
                            {catatan.status_kunjungan === 'selesai' ? '✅ Lengkap & Selesai' : '⏳ Sedang Berlangsung'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Vital Signs Grid */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 printable-card space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                        <HeartOutlined className="text-[#FA6978]" /> Tanda Vital & Pemeriksaan Fisik ANC
                    </h3>
                    {isBpHigh && (
                        <span className="text-xs bg-red-100 text-red-700 font-bold px-2.5 py-1 rounded-full flex items-center gap-1 border border-red-200">
                            <AlertOutlined /> Peringatan: Tensi Darah Tinggi (&ge;140/90 mmHg)
                        </span>
                    )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {/* Tekanan Darah */}
                    <div
                        className={`p-4 rounded-2xl border text-center ${
                            isBpHigh
                                ? 'bg-red-50 border-red-300 text-red-900'
                                : 'bg-gray-50 border-gray-100 text-gray-900'
                        }`}
                    >
                        <span className="text-xs text-gray-500 block font-medium">Tekanan Darah</span>
                        <div className="text-lg font-bold mt-1">
                            {systolicBp && diastolicBp ? `${systolicBp}/${diastolicBp}` : '-'}
                            <span className="text-xs font-normal text-gray-500 ml-1">mmHg</span>
                        </div>
                        <span className="text-[10px] text-gray-500 block mt-0.5">
                            {isBpHigh ? 'Hipertensi' : 'Normal'}
                        </span>
                    </div>

                    {/* Denyut Jantung Janin */}
                    <div
                        className={`p-4 rounded-2xl border text-center ${
                            isFhrAbnormal
                                ? 'bg-red-50 border-red-300 text-red-900'
                                : 'bg-gray-50 border-gray-100 text-gray-900'
                        }`}
                    >
                        <span className="text-xs text-gray-500 block font-medium">DJJ Janin</span>
                        <div className="text-lg font-bold mt-1 text-pink-600">
                            {fhrBpm || '-'}
                            <span className="text-xs font-normal text-gray-500 ml-1">bpm</span>
                        </div>
                        <span className="text-[10px] text-gray-500 block mt-0.5">Norm: 120-160</span>
                    </div>

                    {/* Berat Badan */}
                    <div className="p-4 rounded-2xl border bg-gray-50 border-gray-100 text-gray-900 text-center">
                        <span className="text-xs text-gray-500 block font-medium">Berat Badan</span>
                        <div className="text-lg font-bold mt-1">
                            {weightKg || '-'}
                            <span className="text-xs font-normal text-gray-500 ml-1">kg</span>
                        </div>
                        <span className="text-[10px] text-gray-500 block mt-0.5">Antropometri</span>
                    </div>

                    {/* Tinggi Fundus Uteri */}
                    <div className="p-4 rounded-2xl border bg-gray-50 border-gray-100 text-gray-900 text-center">
                        <span className="text-xs text-gray-500 block font-medium">Tinggi Fundus</span>
                        <div className="text-lg font-bold mt-1">
                            {fundalHeightCm || '-'}
                            <span className="text-xs font-normal text-gray-500 ml-1">cm</span>
                        </div>
                        <span className="text-[10px] text-gray-500 block mt-0.5">TFU Leopold</span>
                    </div>

                    {/* Hemoglobin */}
                    <div
                        className={`p-4 rounded-2xl border text-center ${
                            isAnemic
                                ? 'bg-red-50 border-red-300 text-red-900'
                                : 'bg-gray-50 border-gray-100 text-gray-900'
                        }`}
                    >
                        <span className="text-xs text-gray-500 block font-medium">Kadar Hb</span>
                        <div className="text-lg font-bold mt-1">
                            {hemoglobinGdl || '-'}
                            <span className="text-xs font-normal text-gray-500 ml-1">g/dL</span>
                        </div>
                        <span className="text-[10px] text-gray-500 block mt-0.5">
                            {isAnemic ? 'Risiko Anemia (<11)' : 'Normal (&ge;11)'}
                        </span>
                    </div>

                    {/* Jadwal Kontrol */}
                    <div className="p-4 rounded-2xl border bg-pink-50/50 border-pink-100 text-gray-900 text-center">
                        <span className="text-xs text-gray-500 block font-medium">Kunjungan Ulang</span>
                        <div className="text-sm font-bold mt-1 text-[#FA6978]">
                            {nextVisitDate ? nextVisitDate : 'Belum diatur'}
                        </div>
                        <span className="text-[10px] text-gray-500 block mt-0.5">Rencana Kontrol</span>
                    </div>
                </div>
            </div>

            {/* 9 Skrining Tanda Bahaya & Gejala Kemenkes */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 printable-card space-y-4">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                    <AlertOutlined className="text-amber-500" /> Skrining 9 Gejala & Tanda Bahaya Kehamilan (KIA)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {monitoringQuestions.map((q) => {
                        const hasSymptom = !!monitoringData[q.key];
                        return (
                            <div
                                key={q.key}
                                className={`p-3 rounded-xl border flex items-center justify-between ${
                                    hasSymptom
                                        ? 'bg-red-50/70 border-red-200 text-red-900 font-semibold'
                                        : 'bg-gray-50/70 border-gray-200/80 text-gray-700'
                                }`}
                            >
                                <span className="text-xs">{q.label}</span>
                                <span
                                    className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                        hasSymptom
                                            ? 'bg-red-200 text-red-800'
                                            : 'bg-emerald-100 text-emerald-800'
                                    }`}
                                >
                                    {hasSymptom ? 'YA' : 'TIDAK'}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Catatan Asuhan, Terapi, dan Rencana Medis */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 printable-card space-y-6">
                <div>
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2 flex items-center gap-2">
                        <MedicineBoxOutlined className="text-[#FA6978]" /> Catatan Klinis Asuhan Kebidanan (SOAP)
                    </h3>
                    <TextArea
                        rows={5}
                        value={hasilKunjungan}
                        onChange={(e) => setHasilKunjungan(e.target.value)}
                        disabled={isCompleted}
                        placeholder="Catatan pemeriksaan antenatal, diagnosis, serta edukasi gizi dan gaya hidup..."
                        className={`rounded-xl text-sm ${isCompleted ? 'bg-gray-50 text-gray-800' : ''}`}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                            Terapi Obat / Suplemen Diberikan:
                        </label>
                        <Input
                            value={therapyNotes}
                            onChange={(e) => setTherapyNotes(e.target.value)}
                            disabled={isCompleted}
                            placeholder="Contoh: Tablet Fe 1x1 malam, Kalsium 1x500mg"
                            className={`rounded-xl ${isCompleted ? 'bg-gray-50 text-gray-800' : ''}`}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                            Tanggal Kunjungan Ulang Direkomendasikan:
                        </label>
                        <input
                            type="date"
                            value={nextVisitDate}
                            onChange={(e) => setNextVisitDate(e.target.value)}
                            disabled={isCompleted}
                            className={`w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FA6978] ${
                                isCompleted ? 'bg-gray-50 text-gray-800' : ''
                            }`}
                        />
                    </div>
                </div>

                {/* Save Draft Action */}
                {!isCompleted && (
                    <div className="no-print flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <Button
                            loading={submitting}
                            onClick={() => handleUpdateCatatan(false)}
                            className="rounded-xl"
                        >
                            Simpan Perubahan
                        </Button>
                        <Button
                            type="primary"
                            loading={submitting}
                            onClick={() => handleUpdateCatatan(true)}
                            className="rounded-xl font-medium"
                            style={{ backgroundColor: '#FA6978', borderColor: '#FA6978' }}
                        >
                            Selesaikan Kunjungan
                        </Button>
                    </div>
                )}
            </div>

            {/* Official Signature Area for Print */}
            <div className="print-only mt-12 pt-6 border-t border-gray-300">
                <div className="grid grid-cols-2 text-center text-xs">
                    <div>
                        <p className="text-gray-500 mb-16">Pasien / Keluarga Pasien</p>
                        <p className="font-bold border-t border-gray-400 mx-12 pt-1">
                            ( {catatan.nama_ibu} )
                        </p>
                    </div>
                    <div>
                        <p className="text-gray-500 mb-16">Bidan Penanggung Jawab Asuhan</p>
                        <p className="font-bold border-t border-gray-400 mx-12 pt-1">
                            ( Bidan PRENAVA SIPB )
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
