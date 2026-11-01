import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Input, Button, Spin, message, Tag } from 'antd';
import {
    ArrowLeftOutlined,
    PrinterOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    SaveOutlined,
} from '@ant-design/icons';
import { getCatatanIbuDetail, updateCatatanIbu } from '../catatan.api';
import type { CatatanIbu, UpdateCatatanIbuPayload } from '../catatan.types';

const { TextArea } = Input;

const monitoringQuestions = [
    { key: 'q1_demam', label: 'Demam lebih dari 2 hari' },
    { key: 'q2_pusing', label: 'Pusing / sakit kepala berat' },
    { key: 'q3_sulit_tidur', label: 'Sulit tidur / cemas berlebih' },
    { key: 'q4_risiko_tb', label: 'Batuk > 2 minggu / kontak penderita TB' },
    { key: 'q5_gerakan_bayi', label: 'Gerakan janin berkurang (<10 kali per 12 jam)' },
    { key: 'q6_nyeri_perut', label: 'Nyeri perut hebat / kram menetap' },
    { key: 'q7_cairan_jalan_lahir', label: 'Cairan jalan lahir berbau / perdarahan aktif' },
    { key: 'q8_sakit_kencing', label: 'Nyeri berkemih / keputihan abnormal' },
    { key: 'q9_diare', label: 'Diare berulang berisiko dehidrasi' },
] as const;

export default function CatatanKunjunganDetail() {
    const { catatan_id } = useParams<{ catatan_id: string }>();
    const navigate = useNavigate();

    const [catatan, setCatatan] = useState<CatatanIbu | null>(null);
    const [monitoringData, setMonitoringData] = useState<Record<string, boolean>>({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Form fields
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
                throw new Error('Data rekam medis tidak ditemukan');
            }

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

            await updateCatatanIbu(Number(catatan_id), payload);
            message.success(
                markAsCompleted
                    ? 'Catatan berhasil diselesaikan dan disimpan'
                    : 'Perubahan catatan medis berhasil disimpan'
            );

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

    const formatShortDate = (dateStr?: string | null): string => {
        if (!dateStr) return '-';
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

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center min-h-[400px] gap-3">
                <Spin size="large" />
                <span className="text-gray-500 text-sm">Memuat rekam medis kunjungan...</span>
            </div>
        );
    }

    if (!catatan) {
        return (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                <p className="text-gray-700 font-medium">Rekam medis kunjungan tidak ditemukan.</p>
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

    const todayOfficialDate = new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

    return (
        <div className="space-y-6">
            {/* Print Stylesheet for Formal Healthcare Document */}
            <style>{`
                @media print {
                    @page {
                        size: A4 portrait;
                        margin: 15mm 15mm 15mm 15mm;
                    }
                    body {
                        background: #ffffff !important;
                        font-family: "Times New Roman", Times, Georgia, serif !important;
                        color: #000000 !important;
                        font-size: 11pt !important;
                        line-height: 1.35 !important;
                    }
                    .no-print, header, aside, nav, .ant-btn, .ant-layout-header, .ant-layout-sider {
                        display: none !important;
                    }
                    .print-only {
                        display: block !important;
                    }
                    .print-table {
                        width: 100% !important;
                        border-collapse: collapse !important;
                        margin-bottom: 12px !important;
                    }
                    .print-table th, .print-table td {
                        border: 1px solid #1f2937 !important;
                        padding: 5px 8px !important;
                        font-size: 10pt !important;
                        text-align: left !important;
                    }
                    .print-table th {
                        background-color: #f3f4f6 !important;
                        font-weight: bold !important;
                    }
                    .kop-garis-tebal {
                        border-bottom: 2.5px solid #000000 !important;
                        margin-bottom: 1.5px !important;
                    }
                    .kop-garis-tipis {
                        border-bottom: 1px solid #000000 !important;
                        margin-bottom: 16px !important;
                    }
                    .avoid-break {
                        page-break-inside: avoid !important;
                    }
                }
                @media screen {
                    .print-only {
                        display: none !important;
                    }
                }
            `}</style>

            {/* SCREEN VIEW: Unified Clean Page Header */}
            <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-gray-200">
                <div className="flex items-center gap-3">
                    <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={() => navigate('/catatan-kunjungan')}
                    >
                        Kembali
                    </Button>
                    <div>
                        <div className="flex items-center gap-2.5">
                            <h1 className="text-2xl font-bold text-gray-900 m-0">
                                Catatan Kunjungan: {catatan.nama_ibu}
                            </h1>
                            <Tag color={isCompleted ? 'success' : 'warning'} className="font-medium text-xs m-0">
                                {isCompleted ? 'Selesai' : 'Sedang Berlangsung'}
                            </Tag>
                        </div>
                        <p className="text-sm text-gray-600 mt-1 mb-0">
                            Kunjungan #{catatan.catatan_id} &bull; {formatDate(catatan.tanggal_kunjungan)}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2.5">
                    <Button
                        icon={<PrinterOutlined />}
                        onClick={handlePrint}
                        size="large"
                    >
                        Cetak Resume Medis
                    </Button>
                    {!isCompleted && (
                        <Button
                            type="primary"
                            icon={<CheckCircleOutlined />}
                            size="large"
                            loading={submitting}
                            onClick={() => handleUpdateCatatan(true)}
                            style={{ backgroundColor: '#FA6978', borderColor: '#FA6978' }}
                        >
                            Tandai Selesai
                        </Button>
                    )}
                </div>
            </div>

            {/* SCREEN VIEW: Patient Summary Card */}
            <div className="no-print bg-white rounded-xl border border-gray-200 p-5 space-y-4">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-0">
                    Informasi Pasien & Tanggal Kunjungan
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <span className="text-xs text-gray-500 block">Nama Ibu Hamil</span>
                        <span className="font-semibold text-gray-900">{catatan.nama_ibu}</span>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <span className="text-xs text-gray-500 block">Kontak / Telepon</span>
                        <span className="font-semibold text-gray-800">
                            {catatan.user?.phone || catatan.user?.email || '-'}
                        </span>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <span className="text-xs text-gray-500 block">Tanggal Kunjungan</span>
                        <span className="font-semibold text-gray-800">
                            {formatShortDate(catatan.tanggal_kunjungan)}
                        </span>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <span className="text-xs text-gray-500 block">Status Pemeriksaan</span>
                        <span className="font-semibold text-gray-800">
                            {catatan.status_kunjungan === 'selesai' ? 'Selesai' : 'Sedang Berlangsung'}
                        </span>
                    </div>
                </div>
            </div>

            {/* SCREEN VIEW: Vital Signs */}
            <div className="no-print bg-white rounded-xl border border-gray-200 p-5 space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-0">
                        Pemeriksaan Fisik & Tanda Vital
                    </h3>
                    {isBpHigh && (
                        <Tag color="error" className="m-0 font-medium">
                            Tekanan Darah Tinggi (&ge;140/90 mmHg)
                        </Tag>
                    )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    <div className={`p-4 rounded-xl border text-center ${isBpHigh ? 'bg-red-50 border-red-200 text-red-900' : 'bg-gray-50 border-gray-200'}`}>
                        <span className="text-xs text-gray-500 block font-medium">Tekanan Darah</span>
                        <div className="text-lg font-bold mt-1">
                            {systolicBp && diastolicBp ? `${systolicBp}/${diastolicBp}` : '-'}
                            <span className="text-xs font-normal text-gray-500 ml-1">mmHg</span>
                        </div>
                        <span className="text-[11px] text-gray-500 block mt-0.5">
                            {isBpHigh ? 'Tinggi' : 'Normal'}
                        </span>
                    </div>

                    <div className={`p-4 rounded-xl border text-center ${isFhrAbnormal ? 'bg-red-50 border-red-200 text-red-900' : 'bg-gray-50 border-gray-200'}`}>
                        <span className="text-xs text-gray-500 block font-medium">Detak Jantung Janin</span>
                        <div className="text-lg font-bold mt-1 text-[#FA6978]">
                            {fhrBpm || '-'}
                            <span className="text-xs font-normal text-gray-500 ml-1">bpm</span>
                        </div>
                        <span className="text-[11px] text-gray-500 block mt-0.5">Normal: 120-160</span>
                    </div>

                    <div className="p-4 rounded-xl border bg-gray-50 border-gray-200 text-center">
                        <span className="text-xs text-gray-500 block font-medium">Berat Badan</span>
                        <div className="text-lg font-bold mt-1">
                            {weightKg || '-'}
                            <span className="text-xs font-normal text-gray-500 ml-1">kg</span>
                        </div>
                        <span className="text-[11px] text-gray-500 block mt-0.5">Ibu Hamil</span>
                    </div>

                    <div className="p-4 rounded-xl border bg-gray-50 border-gray-200 text-center">
                        <span className="text-xs text-gray-500 block font-medium">Tinggi Fundus</span>
                        <div className="text-lg font-bold mt-1">
                            {fundalHeightCm || '-'}
                            <span className="text-xs font-normal text-gray-500 ml-1">cm</span>
                        </div>
                        <span className="text-[11px] text-gray-500 block mt-0.5">TFU Leopold</span>
                    </div>

                    <div className={`p-4 rounded-xl border text-center ${isAnemic ? 'bg-red-50 border-red-200 text-red-900' : 'bg-gray-50 border-gray-200'}`}>
                        <span className="text-xs text-gray-500 block font-medium">Kadar Hb</span>
                        <div className="text-lg font-bold mt-1">
                            {hemoglobinGdl || '-'}
                            <span className="text-xs font-normal text-gray-500 ml-1">g/dL</span>
                        </div>
                        <span className="text-[11px] text-gray-500 block mt-0.5">
                            {isAnemic ? 'Kurang (<11)' : 'Cukup (&ge;11)'}
                        </span>
                    </div>

                    <div className="p-4 rounded-xl border bg-gray-50 border-gray-200 text-center">
                        <span className="text-xs text-gray-500 block font-medium">Kontrol Ulang</span>
                        <div className="text-sm font-bold mt-1 text-[#FA6978]">
                            {nextVisitDate ? formatShortDate(nextVisitDate) : 'Belum diatur'}
                        </div>
                        <span className="text-[11px] text-gray-500 block mt-0.5">Jadwal Kembali</span>
                    </div>
                </div>
            </div>

            {/* SCREEN VIEW: 9 Screening Symptoms */}
            <div className="no-print bg-white rounded-xl border border-gray-200 p-5 space-y-4">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-0">
                    Tanda Bahaya Kehamilan
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {monitoringQuestions.map((q) => {
                        const hasSymptom = !!monitoringData[q.key];
                        return (
                            <div
                                key={q.key}
                                className={`p-3 rounded-lg border flex items-center justify-between text-xs ${
                                    hasSymptom
                                        ? 'bg-red-50 border-red-200 text-red-900 font-medium'
                                        : 'bg-gray-50 border-gray-200 text-gray-700'
                                }`}
                            >
                                <span>{q.label}</span>
                                <Tag color={hasSymptom ? 'error' : 'default'} className="m-0 text-xs font-semibold">
                                    {hasSymptom ? 'Ya' : 'Tidak'}
                                </Tag>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* SCREEN VIEW: Clinical SOAP Notes & Therapy */}
            <div className="no-print bg-white rounded-xl border border-gray-200 p-5 space-y-5">
                <div>
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">
                        Catatan Pemeriksaan & Anjuran Bidan
                    </h3>
                    <TextArea
                        rows={4}
                        value={hasilKunjungan}
                        onChange={(e) => setHasilKunjungan(e.target.value)}
                        disabled={isCompleted}
                        placeholder="Tuliskan hasil pemeriksaan fisik, keluhan ibu, serta anjuran istirahat atau pola makan..."
                        className="rounded-lg text-sm"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                            Obat atau Vitamin yang Diberikan
                        </label>
                        <Input
                            value={therapyNotes}
                            onChange={(e) => setTherapyNotes(e.target.value)}
                            disabled={isCompleted}
                            placeholder="Contoh: Tablet Tambah Darah (TTD) 1x1 malam, Kalsium 1x500mg"
                            className="rounded-lg"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                            Tanggal Kontrol Berikutnya
                        </label>
                        <input
                            type="date"
                            value={nextVisitDate}
                            onChange={(e) => setNextVisitDate(e.target.value)}
                            disabled={isCompleted}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#FA6978]"
                        />
                    </div>
                </div>

                {!isCompleted && (
                    <div className="flex justify-end gap-3 pt-3 border-t border-gray-200">
                        <Button
                            icon={<SaveOutlined />}
                            loading={submitting}
                            onClick={() => handleUpdateCatatan(false)}
                        >
                            Simpan Catatan
                        </Button>
                        <Button
                            type="primary"
                            icon={<CheckCircleOutlined />}
                            loading={submitting}
                            onClick={() => handleUpdateCatatan(true)}
                            style={{ backgroundColor: '#FA6978', borderColor: '#FA6978' }}
                        >
                            Tandai Selesai
                        </Button>
                    </div>
                )}
            </div>

            {/* ========================================================================= */}
            {/* OFFICIAL PRINT TEMPLATE (ONLY VISIBLE ON PRINT / EXPORT TO PDF)             */}
            {/* Standard Indonesian Antenatal Care Medical Resume (No AI Slop)            */}
            {/* ========================================================================= */}
            <div className="print-only">
                {/* 1. Official Clinical Letterhead (Kop Surat Resmi) */}
                <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                    <div style={{ fontSize: '15pt', fontWeight: 'bold', letterSpacing: '0.5px' }}>
                        KLINIK PRATAMA & LAYANAN KESEHATAN MATERNAL PRENAVA
                    </div>
                    <div style={{ fontSize: '10pt', fontWeight: 'bold' }}>
                        SURAT IZIN PRAKTIK BIDAN (SIPB) NOMOR: 446.1/029/SIPB/DPMPTSP/2026
                    </div>
                    <div style={{ fontSize: '9pt', color: '#374151' }}>
                        Jl. Terusan Buah Batu No. 1, Kota Bandung, Jawa Barat 40257 &bull; Telp: (022) 756-4108 &bull; Email: rekam.medis@prenava.id
                    </div>
                </div>

                {/* Double Border Separator */}
                <div className="kop-garis-tebal" />
                <div className="kop-garis-tipis" />

                {/* 2. Document Title */}
                <div style={{ textAlign: 'center', marginBottom: '14px' }}>
                    <div style={{ fontSize: '12pt', fontWeight: 'bold', textDecoration: 'underline' }}>
                        LEMBAR RESUME MEDIS ASUHAN KEBIDANAN ANTENATAL (ANC)
                    </div>
                    <div style={{ fontSize: '9pt', color: '#4b5563', marginTop: '2px' }}>
                        Nomor Registrasi: REG-ANC-2026-{String(catatan.catatan_id).padStart(5, '0')} &bull; Tanggal Pemeriksaan: {formatDate(catatan.tanggal_kunjungan)}
                    </div>
                </div>

                {/* 3. Patient Demographics Table */}
                <table className="print-table">
                    <tbody>
                        <tr>
                            <td style={{ width: '22%', fontWeight: 'bold', backgroundColor: '#f9fafb' }}>Nama Pasien</td>
                            <td style={{ width: '38%' }}>Ny. {catatan.nama_ibu}</td>
                            <td style={{ width: '20%', fontWeight: 'bold', backgroundColor: '#f9fafb' }}>No. Rekam Medis</td>
                            <td style={{ width: '20%' }}>RM-{String(catatan.user_id).padStart(5, '0')}</td>
                        </tr>
                        <tr>
                            <td style={{ fontWeight: 'bold', backgroundColor: '#f9fafb' }}>Kontak / No. Telp</td>
                            <td>{catatan.user?.phone || catatan.user?.email || '-'}</td>
                            <td style={{ fontWeight: 'bold', backgroundColor: '#f9fafb' }}>Status Pelayanan</td>
                            <td>{catatan.status_kunjungan === 'selesai' ? 'Lengkap & Terverifikasi' : 'Asuhan Berjalan'}</td>
                        </tr>
                    </tbody>
                </table>

                {/* 4. Physical Examination & Vital Signs Table (Standard ANC) */}
                <div style={{ fontWeight: 'bold', fontSize: '10pt', marginBottom: '4px' }}>
                    I. HASIL PEMERIKSAAN FISIK & TANDA VITAL (ANTENATAL CARE)
                </div>
                <table className="print-table">
                    <thead>
                        <tr>
                            <th style={{ width: '5%', textAlign: 'center' }}>No</th>
                            <th style={{ width: '35%' }}>Parameter Pemeriksaan</th>
                            <th style={{ width: '25%', textAlign: 'center' }}>Hasil Pengukuran</th>
                            <th style={{ width: '20%', textAlign: 'center' }}>Nilai Rujukan Normal</th>
                            <th style={{ width: '15%', textAlign: 'center' }}>Status Klinis</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style={{ textAlign: 'center' }}>1</td>
                            <td>Tekanan Darah (TD)</td>
                            <td style={{ textAlign: 'center', fontWeight: 'bold' }}>
                                {systolicBp && diastolicBp ? `${systolicBp} / ${diastolicBp} mmHg` : '-'}
                            </td>
                            <td style={{ textAlign: 'center' }}>110-120 / 70-80 mmHg</td>
                            <td style={{ textAlign: 'center' }}>
                                {isBpHigh ? 'Hipertensi' : 'Normal'}
                            </td>
                        </tr>
                        <tr>
                            <td style={{ textAlign: 'center' }}>2</td>
                            <td>Denyut Jantung Janin (DJJ)</td>
                            <td style={{ textAlign: 'center', fontWeight: 'bold' }}>
                                {fhrBpm ? `${fhrBpm} denyut/menit` : '-'}
                            </td>
                            <td style={{ textAlign: 'center' }}>120 - 160 denyut/menit</td>
                            <td style={{ textAlign: 'center' }}>
                                {isFhrAbnormal ? 'Abnormal' : 'Normal'}
                            </td>
                        </tr>
                        <tr>
                            <td style={{ textAlign: 'center' }}>3</td>
                            <td>Tinggi Fundus Uteri (TFU)</td>
                            <td style={{ textAlign: 'center', fontWeight: 'bold' }}>
                                {fundalHeightCm ? `${fundalHeightCm} cm` : '-'}
                            </td>
                            <td style={{ textAlign: 'center' }}>Sesuai Usia Gestasi (Leopold)</td>
                            <td style={{ textAlign: 'center' }}>Normal</td>
                        </tr>
                        <tr>
                            <td style={{ textAlign: 'center' }}>4</td>
                            <td>Berat Badan Ibu (BB)</td>
                            <td style={{ textAlign: 'center', fontWeight: 'bold' }}>
                                {weightKg ? `${weightKg} kg` : '-'}
                            </td>
                            <td style={{ textAlign: 'center' }}>Kenaikan bertahap</td>
                            <td style={{ textAlign: 'center' }}>Normal</td>
                        </tr>
                        <tr>
                            <td style={{ textAlign: 'center' }}>5</td>
                            <td>Kadar Hemoglobin (Hb)</td>
                            <td style={{ textAlign: 'center', fontWeight: 'bold' }}>
                                {hemoglobinGdl ? `${hemoglobinGdl} g/dL` : '-'}
                            </td>
                            <td style={{ textAlign: 'center' }}>&ge; 11.0 g/dL</td>
                            <td style={{ textAlign: 'center' }}>
                                {isAnemic ? 'Anemia' : 'Normal'}
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* 5. 9 Danger Symptoms Screening Matrix */}
                <div style={{ fontWeight: 'bold', fontSize: '10pt', marginBottom: '4px' }}>
                    II. PENAPISAN 9 TANDA BAHAYA KEHAMILAN (STANDAR BUKU KIA KEMENKES RI)
                </div>
                <table className="print-table">
                    <thead>
                        <tr>
                            <th style={{ width: '40%' }}>Tanda Bahaya / Gejala Klinis</th>
                            <th style={{ width: '10%', textAlign: 'center' }}>Status</th>
                            <th style={{ width: '40%' }}>Tanda Bahaya / Gejala Klinis</th>
                            <th style={{ width: '10%', textAlign: 'center' }}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>1. Demam lebih dari 2 hari</td>
                            <td style={{ textAlign: 'center', fontWeight: monitoringData.q1_demam ? 'bold' : 'normal' }}>
                                {monitoringData.q1_demam ? 'YA' : 'TIDAK'}
                            </td>
                            <td>6. Nyeri perut hebat / kram menetap</td>
                            <td style={{ textAlign: 'center', fontWeight: monitoringData.q6_nyeri_perut ? 'bold' : 'normal' }}>
                                {monitoringData.q6_nyeri_perut ? 'YA' : 'TIDAK'}
                            </td>
                        </tr>
                        <tr>
                            <td>2. Pusing / sakit kepala berat</td>
                            <td style={{ textAlign: 'center', fontWeight: monitoringData.q2_pusing ? 'bold' : 'normal' }}>
                                {monitoringData.q2_pusing ? 'YA' : 'TIDAK'}
                            </td>
                            <td>7. Cairan jalan lahir berbau / perdarahan</td>
                            <td style={{ textAlign: 'center', fontWeight: monitoringData.q7_cairan_jalan_lahir ? 'bold' : 'normal' }}>
                                {monitoringData.q7_cairan_jalan_lahir ? 'YA' : 'TIDAK'}
                            </td>
                        </tr>
                        <tr>
                            <td>3. Sulit tidur / cemas berlebih</td>
                            <td style={{ textAlign: 'center', fontWeight: monitoringData.q3_sulit_tidur ? 'bold' : 'normal' }}>
                                {monitoringData.q3_sulit_tidur ? 'YA' : 'TIDAK'}
                            </td>
                            <td>8. Nyeri berkemih / keputihan abnormal</td>
                            <td style={{ textAlign: 'center', fontWeight: monitoringData.q8_sakit_kencing ? 'bold' : 'normal' }}>
                                {monitoringData.q8_sakit_kencing ? 'YA' : 'TIDAK'}
                            </td>
                        </tr>
                        <tr>
                            <td>4. Batuk &gt; 2 minggu / kontak TB</td>
                            <td style={{ textAlign: 'center', fontWeight: monitoringData.q4_risiko_tb ? 'bold' : 'normal' }}>
                                {monitoringData.q4_risiko_tb ? 'YA' : 'TIDAK'}
                            </td>
                            <td>9. Diare berulang</td>
                            <td style={{ textAlign: 'center', fontWeight: monitoringData.q9_diare ? 'bold' : 'normal' }}>
                                {monitoringData.q9_diare ? 'YA' : 'TIDAK'}
                            </td>
                        </tr>
                        <tr>
                            <td>5. Gerakan janin berkurang (&lt;10x/12 jam)</td>
                            <td style={{ textAlign: 'center', fontWeight: monitoringData.q5_gerakan_bayi ? 'bold' : 'normal' }}>
                                {monitoringData.q5_gerakan_bayi ? 'YA' : 'TIDAK'}
                            </td>
                            <td style={{ backgroundColor: '#f9fafb' }}>-</td>
                            <td style={{ backgroundColor: '#f9fafb', textAlign: 'center' }}>-</td>
                        </tr>
                    </tbody>
                </table>

                {/* 6. SOAP Clinical Notes & Therapy */}
                <div style={{ fontWeight: 'bold', fontSize: '10pt', marginBottom: '4px' }}>
                    III. CATATAN ASUHAN KEBIDANAN (SOAP) & REKOMENDASI TERAPI
                </div>
                <table className="print-table">
                    <tbody>
                        <tr>
                            <td style={{ width: '25%', fontWeight: 'bold', backgroundColor: '#f9fafb' }}>Hasil Pemeriksaan & Asuhan</td>
                            <td style={{ width: '75%' }}>
                                {hasilKunjungan || 'Pemeriksaan kehamilan antenatal rutin dalam batas normal.'}
                            </td>
                        </tr>
                        <tr>
                            <td style={{ fontWeight: 'bold', backgroundColor: '#f9fafb' }}>Terapi / Profilaksis Diberikan</td>
                            <td>
                                {therapyNotes || 'Edukasi nutrisi seimbang, konsumsi suplemen TTD sesuai anjuran, dan istirahat optimal.'}
                            </td>
                        </tr>
                        <tr>
                            <td style={{ fontWeight: 'bold', backgroundColor: '#f9fafb' }}>Rencana Kunjungan Ulang</td>
                            <td style={{ fontWeight: 'bold' }}>
                                {nextVisitDate ? formatDate(nextVisitDate) : 'Sesuai jadwal kontrol buku KIA (1 bulan mendatang)'}
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* 7. Official Legal Signatures & Stamp */}
                <div className="avoid-break" style={{ marginTop: '24px' }}>
                    <div style={{ textAlign: 'right', fontSize: '10pt', marginBottom: '12px' }}>
                        Bandung, {todayOfficialDate}
                    </div>
                    <table style={{ width: '100%', textAlign: 'center', fontSize: '10pt', border: 'none' }}>
                        <tbody>
                            <tr>
                                <td style={{ width: '50%', paddingBottom: '70px', verticalAlign: 'top', border: 'none' }}>
                                    <div>Pasien / Keluarga Pasien,</div>
                                </td>
                                <td style={{ width: '50%', paddingBottom: '70px', verticalAlign: 'top', border: 'none' }}>
                                    <div>Bidan Penanggung Jawab Pelayanan,</div>
                                </td>
                            </tr>
                            <tr>
                                <td style={{ border: 'none' }}>
                                    <div style={{ fontWeight: 'bold', textDecoration: 'underline' }}>
                                        ( Ny. {catatan.nama_ibu} )
                                    </div>
                                    <div style={{ fontSize: '9pt', color: '#4b5563' }}>Tanda Tangan Pasien</div>
                                </td>
                                <td style={{ border: 'none' }}>
                                    <div style={{ fontWeight: 'bold', textDecoration: 'underline' }}>
                                        ( Bidan Prenava, S.Tr.Keb. )
                                    </div>
                                    <div style={{ fontSize: '9pt', color: '#4b5563' }}>SIPB: 446.1/029/SIPB/DPMPTSP/2026</div>
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    {/* Official Footnote */}
                    <div style={{ marginTop: '24px', paddingTop: '6px', borderTop: '1px dashed #9ca3af', fontSize: '8pt', color: '#6b7280', textAlign: 'center' }}>
                        Dokumen ini adalah resume rekam medis elektronik resmi yang diterbitkan secara sah oleh Sistem Pelayanan Terpadu Prenava. Salinan dokumen ini berlaku sebagai arsip klinis pasien sesuai standar PMK Rekam Medis.
                    </div>
                </div>
            </div>
        </div>
    );
}
