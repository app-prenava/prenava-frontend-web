import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Input, Button, Table, Spin, message } from 'antd';
import { CalendarOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { getCatatanIbuDetail, updateCatatanIbu } from '../catatan.api';
import type { CatatanIbu } from '../catatan.types';

const { TextArea } = Input;

const monitoringQuestions = [
    { key: 'q1_demam', label: 'Demam lebih dari 2 hari' },
    { key: 'q2_pusing', label: 'Pusing / sakit kepala berat' },
    { key: 'q3_sulit_tidur', label: 'Sulit tidur / cemas berlebih' },
    { key: 'q4_risiko_tb', label: 'Risiko TB atau kontak penderita TB' },
    { key: 'q5_gerakan_bayi', label: 'Gerakan bayi berkurang' },
    { key: 'q6_nyeri_perut', label: 'Nyeri perut hebat' },
    {
        key: 'q7_cairan_jalan_lahir',
        label: 'Cairan jalan lahir sangat banyak / berbau',
    },
    { key: 'q8_sakit_kencing', label: 'Sakit kencing / keputihan / gatal' },
    { key: 'q9_diare', label: 'Diare berulang' },
] as const;

type QuestionKey = (typeof monitoringQuestions)[number]['key'];

export default function CatatanKunjunganDetail() {
    const { catatan_id } = useParams<{ catatan_id: string }>();
    const navigate = useNavigate();
    const [catatan, setCatatan] = useState<CatatanIbu | null>(null);
    const [monitoringData, setMonitoringData] = useState<Partial<CatatanIbu> | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [hasilKunjungan, setHasilKunjungan] = useState('');

    useEffect(() => {
        if (catatan_id) {
            fetchCatatanDetail(Number(catatan_id));
        }
    }, [catatan_id]);

    useEffect(() => {
        if (catatan) {
            setHasilKunjungan(catatan.hasil_kunjungan || '');
        }
    }, [catatan]);

    const fetchCatatanDetail = async (id: number) => {
        try {
            setLoading(true);
            const result = await getCatatanIbuDetail(id);

            // Debug: Log full API response
            console.log('=== DEBUG: Full API Response ===', result.data);

            // Extract the data item (could be array or object)
            const responseData = result.data;
            let dataItem: any = null;

            if (Array.isArray(responseData)) {
                dataItem = responseData[0] || null;
                console.log('Response is array, extracted first item:', dataItem);
            } else if (responseData && typeof responseData === 'object') {
                dataItem = responseData;
                console.log('Response is object, using directly:', dataItem);
            }

            if (!dataItem) {
                throw new Error('No data found in response');
            }

            // Extract monitoring data from pertanyaan array
            // Structure: pertanyaan: [{id: 'q1_demam', pertanyaan: '...', jawaban: 0/1/null}, ...]
            let extractedMonitoringData: Record<string, 0 | 1> = {};

            if (dataItem.pertanyaan && Array.isArray(dataItem.pertanyaan)) {
                console.log('Found pertanyaan array:', dataItem.pertanyaan);

                // Map pertanyaan array to q* fields
                dataItem.pertanyaan.forEach((item: any) => {
                    console.log(`Processing item: id=${item.id}, jawaban=${item.jawaban}, type=${typeof item.jawaban}`);

                    if (item.id) {
                        // Handle null, 0, 1, or string "0"/"1"
                        let jawabanValue: 0 | 1 = 0;

                        if (item.jawaban === 1 || item.jawaban === '1' || item.jawaban === true) {
                            jawabanValue = 1;
                        } else if (item.jawaban === 0 || item.jawaban === '0' || item.jawaban === false) {
                            jawabanValue = 0;
                        } else {
                            // Default to 0 if null/undefined/other
                            jawabanValue = 0;
                        }

                        extractedMonitoringData[item.id] = jawabanValue;
                        console.log(`Set ${item.id} = ${jawabanValue}`);
                    }
                });

                console.log('=== DEBUG: Extracted Monitoring Data ===', extractedMonitoringData);
                monitoringQuestions.forEach((q) => {
                    console.log(`${q.key}:`, extractedMonitoringData[q.key]);
                });
            } else {
                // Fallback: check if q* fields exist directly in dataItem (from JSON file structure)
                console.log('No pertanyaan array found, checking for direct q* fields');
                monitoringQuestions.forEach((q) => {
                    const value = dataItem[q.key];
                    if (value === 0 || value === 1 || value === '0' || value === '1') {
                        extractedMonitoringData[q.key] = value === 1 || value === '1' ? 1 : 0;
                    } else {
                        extractedMonitoringData[q.key] = 0;
                    }
                });
            }

            // Ensure all q* fields are present in extractedMonitoringData
            monitoringQuestions.forEach((q) => {
                if (!(q.key in extractedMonitoringData)) {
                    extractedMonitoringData[q.key] = 0;
                }
            });

            // Prepare main catatan data
            const mainData: CatatanIbu = {
                catatan_id: dataItem.catatan_id,
                user_id: dataItem.user_id,
                nama_ibu: dataItem.user?.name || dataItem.nama_ibu || '',
                tanggal_kunjungan: dataItem.tanggal_kunjungan,
                status_kunjungan: dataItem.status_kunjungan,
                hasil_kunjungan: dataItem.hasil_kunjungan,
                // Add q* fields from extractedMonitoringData
                ...extractedMonitoringData,
            } as CatatanIbu;

            setCatatan(mainData);
            // Use extractedMonitoringData which now has all q* fields
            setMonitoringData(extractedMonitoringData as Partial<CatatanIbu>);

            console.log('=== DEBUG: Final State ===');
            console.log('catatan:', mainData);
            console.log('monitoringData:', extractedMonitoringData);
        } catch (error) {
            console.error('Failed to fetch catatan detail:', error);
            message.error('Gagal memuat detail catatan kunjungan');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!catatan_id || !catatan) return;

        if (!hasilKunjungan.trim()) {
            message.warning('Harap isi catatan untuk ibu hamil');
            return;
        }

        try {
            setSubmitting(true);
            await updateCatatanIbu(Number(catatan_id), {
                hasil_kunjungan: hasilKunjungan.trim(),
                status_kunjungan: 'selesai',
            });

            message.success('Catatan berhasil dikirimkan');

            // Update local state
            setCatatan({
                ...catatan,
                hasil_kunjungan: hasilKunjungan.trim(),
                status_kunjungan: 'selesai',
            });
        } catch (error: any) {
            console.error('Failed to update catatan:', error);
            const errorMessage =
                error?.response?.data?.message ||
                error?.message ||
                'Gagal mengirimkan catatan';
            message.error(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    const formatDate = (dateStr: string): string => {
        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return dateStr;
            return date.toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
        } catch {
            return dateStr;
        }
    };

    const getStatusBadge = (status: CatatanIbu['status_kunjungan']) => {
        if (status === 'selesai') {
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    Selesai
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-700">
                <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                Sedang Berlangsung
            </span>
        );
    };

    const tableColumns = [
        {
            title: 'Pertanyaan',
            dataIndex: 'label',
            key: 'label',
            className: 'font-medium',
        },
        {
            title: 'Iya',
            dataIndex: 'iya',
            key: 'iya',
            align: 'center' as const,
            width: 100,
            render: (_: unknown, record: { key: QuestionKey }) => {
                if (!monitoringData) return null;
                const value = monitoringData[record.key];
                return (
                    <input
                        type="checkbox"
                        checked={value === 1}
                        disabled
                        className="cursor-not-allowed"
                        readOnly
                    />
                );
            },
        },
        {
            title: 'Tidak',
            dataIndex: 'tidak',
            key: 'tidak',
            align: 'center' as const,
            width: 100,
            render: (_: unknown, record: { key: QuestionKey }) => {
                if (!monitoringData) return null;
                const value = monitoringData[record.key];
                return (
                    <input
                        type="checkbox"
                        checked={value === 0}
                        disabled
                        className="cursor-not-allowed"
                        readOnly
                    />
                );
            },
        },
    ];

    const tableData = monitoringQuestions.map((q) => ({
        key: q.key,
        label: q.label,
    }));

    const isEditable = catatan?.status_kunjungan === 'sedang_berlangsung';

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <Spin size="large" />
            </div>
        );
    }

    if (!catatan) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-600">Catatan tidak ditemukan</p>
                <Button
                    type="link"
                    onClick={() => navigate('/catatan-kunjungan')}
                    className="mt-4"
                >
                    Kembali ke Daftar
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={() => navigate('/catatan-kunjungan')}
                    >
                        Kembali
                    </Button>
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">
                            Riwayat Konsultasi Ibu Hamil
                        </h1>
                    </div>
                </div>
            </div>

            {/* Main Content Card */}
            <Card className="shadow-sm border border-gray-200">
                <div className="space-y-6">
                    {/* Patient Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-gray-200">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nama Ibu Hamil
                            </label>
                            <Input
                                value={catatan.nama_ibu}
                                disabled
                                className="bg-gray-50"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tanggal Konsultasi
                            </label>
                            <Input
                                value={formatDate(catatan.tanggal_kunjungan)}
                                disabled
                                className="bg-gray-50"
                                prefix={<CalendarOutlined className="text-gray-400" />}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Status
                            </label>
                            <div>{getStatusBadge(catatan.status_kunjungan)}</div>
                        </div>
                    </div>

                    {/* Weekly Monitoring Results */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            Hasil Pemantauan Mingguan
                        </h2>
                        <Table
                            columns={tableColumns}
                            dataSource={tableData}
                            pagination={false}
                            className="border border-gray-200 rounded-lg"
                            rowClassName="hover:bg-gray-50"
                        />
                    </div>

                    {/* Midwife Notes */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Catatan Untuk Ibu Hamil
                        </label>
                        <TextArea
                            value={hasilKunjungan}
                            onChange={(e) => setHasilKunjungan(e.target.value)}
                            disabled={!isEditable}
                            placeholder="Isi kan catatan untuk ibu hamil berdasarkan hasil kondisi pemantauan mingguan"
                            rows={6}
                            className={!isEditable ? 'bg-gray-50' : ''}
                        />
                        {!isEditable && (
                            <p className="text-sm text-gray-500 mt-2">
                                Catatan tidak dapat diubah karena status kunjungan sudah selesai.
                            </p>
                        )}
                    </div>

                    {/* Submit Button */}
                    {isEditable && (
                        <div className="flex justify-end pt-4 border-t border-gray-200">
                            <Button
                                type="primary"
                                size="large"
                                onClick={handleSubmit}
                                loading={submitting}
                                disabled={!hasilKunjungan.trim()}
                                className="bg-red-600 hover:bg-red-700 border-red-600 hover:border-red-700"
                                style={{ backgroundColor: '#FA6978', borderColor: '#FA6978' }}
                            >
                                Kirimkan Catatan
                            </Button>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
}

