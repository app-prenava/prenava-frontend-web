import { useState, useMemo, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Tag,
  Space,
  Input,
  Radio,
  Progress,
  Alert,
  Drawer,
  Spin,
  Row,
  Col,
  Statistic,
  Tooltip,
  message,
  Divider,
  Timeline,
} from 'antd';
import {
  AlertTriangle,
  Activity,
  CheckCircle2,
  Clock,
  RefreshCw,
  Search,
  User,
  Stethoscope,
  ShieldAlert,
  Phone,
  Copy,
  ExternalLink,
  MessageCircle,
  FileText,
} from 'lucide-react';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import {
  useTriageQueue,
  usePatientTriageDetail,
  useRecalculateTriage,
  type TriagePatientItem,
  type TriageCategory,
} from '@/features/bidan/triage.api';

const { TextArea } = Input;

export default function BidanTriagePage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Outreach message state
  const [outreachMessage, setOutreachMessage] = useState<string>('');
  const [activeTemplateKey, setActiveTemplateKey] = useState<'clinical' | 'visit' | 'nutrition'>('clinical');

  // Queries & Mutations
  const { data: queueResponse, isLoading, isFetching, refetch } = useTriageQueue();
  const { data: detailResponse, isLoading: isDetailLoading } = usePatientTriageDetail(selectedUserId);
  const recalculateMutation = useRecalculateTriage();

  const patients = queueResponse?.data || [];
  const summary = queueResponse?.summary || { critical_red: 0, warning_yellow: 0, stable_green: 0 };
  const totalPatients = queueResponse?.total_patients || 0;

  // Filtered patients
  const filteredPatients = useMemo(() => {
    return patients.filter((p) => {
      const matchCategory =
        selectedCategory === 'ALL' || p.triage_category === selectedCategory;
      const matchSearch =
        p.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.patient_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.phone && p.phone.includes(searchQuery));
      return matchCategory && matchSearch;
    });
  }, [patients, selectedCategory, searchQuery]);

  const detailPatient = detailResponse?.patient;
  const latestTriage = detailResponse?.latest_triage;
  const historyList = detailResponse?.history || [];

  const getTrimester = (weeks: number): string => {
    if (weeks <= 12) return 'Trimester 1';
    if (weeks <= 27) return 'Trimester 2';
    return 'Trimester 3';
  };

  // Helper to generate clinical WhatsApp outreach template
  const generateOutreachTemplate = (
    patientName: string,
    weeks: number | string,
    category: TriageCategory | string,
    primaryAlert: string,
    templateType: 'clinical' | 'visit' | 'nutrition' = 'clinical',
    missingModalities: string[] = []
  ): string => {
    const greeting = `Halo Ibu ${patientName}, salam sehat dari Bidan Prenava.`;
    const pregnancyInfo = weeks ? ` (Usia kandungan saat ini: ${weeks} minggu)` : '';

    const missingNote =
      missingModalities.length > 0
        ? `\n\nCatatan Bidan: Untuk akurasi pemantauan kehamilan yang maksimal, mohon luangkan waktu untuk melengkapi pemeriksaan: ${missingModalities.join(', ')} di aplikasi Prenava ya Bu.`
        : '';

    if (templateType === 'visit') {
      return `${greeting}

Berdasarkan tinjauan berkala pemantauan kehamilan Ibu${pregnancyInfo}, kami mengundang Ibu untuk berkunjung dan melakukan pemeriksaan langsung dengan Bidan di fasilitas kesehatan.

Pemeriksaan tatap muka ini penting untuk evaluasi komprehensif perkembangan janin, pengukuran tekanan darah berkala, serta konsultasi kesehatan lanjutan.${missingNote}

Kapan Ibu memiliki waktu luang minggu ini untuk kami jadwalkan janji temu?

Salam hangat,
Bidan Prenava`;
    }

    if (templateType === 'nutrition') {
      return `${greeting}

Berdasarkan pemantauan pola gizi dan catatan kesehatan kehamilan Ibu${pregnancyInfo}, kami menyarankan beberapa langkah penguatan nutrisi:
1. Pastikan menu harian memenuhi porsi Isi Piringku dengan asupan protein hewani yang cukup (telur, ikan, daging).
2. Disiplin mengonsumsi Tablet Tambah Darah (TTD) sesuai anjuran untuk mencegah risiko anemia.
3. Cukupi hidrasi air putih minimal 2-2.5 liter per hari dan istirahat teratur.${missingNote}

Jika ada kendala nafsu makan atau keluhan fisik lainnya, silakan berkonsultasi langsung dengan kami.

Salam hangat,
Bidan Prenava`;
    }

    // Default 'clinical' template according to CDSS category
    if (category === 'MERAH') {
      return `${greeting}

Berdasarkan hasil analisis triase klinis terbaru${pregnancyInfo}, sistem mencatat indikator risiko penting yang memerlukan perhatian khusus:
Catatan: "${primaryAlert}"

Demi keselamatan dan kesehatan optimal Ibu dan calon bayi, kami sangat menyarankan Ibu untuk segera melakukan pemeriksaan langsung ke fasilitas kesehatan terdekat atau berkonsultasi dengan tim bidan.${missingNote}

Bila timbul keluhan seperti pusing berat, pandangan kabur, nyeri ulu hati, lemas berlebih, atau tanda bahaya lainnya, segera hubungi kami atau fasilitas gawat darurat terdekat.

Salam hangat,
Bidan Prenava`;
    }

    if (category === 'KUNING') {
      return `${greeting}

Dari evaluasi berkala kondisi kehamilan Ibu${pregnancyInfo}, terdapat catatan klinis yang memerlukan pengawasan bersama:
Catatan: "${primaryAlert}"

Kami menganjurkan Ibu untuk menjadwalkan kontrol kehamilan (ANC) dalam waktu dekat agar kita dapat mengevaluasi kondisi nutrisi dan parameter kesehatan Ibu secara optimal.${missingNote}

Apakah saat ini ada gejala atau keluhan tertentu yang sedang Ibu rasakan?

Salam hangat,
Bidan Prenava`;
    }

    // HIJAU (Stabil)
    return `${greeting}

Kabar baik, kondisi kehamilan Ibu saat ini terpantau stabil dan berada dalam batas normal${pregnancyInfo}.
Catatan: "${primaryAlert}"${missingNote}

Mohon pertahankan asupan nutrisi bergizi seimbang, istirahat cukup, dan jangan lupa untuk tetap hadir pada jadwal kontrol kehamilan (ANC) rutin berikutnya sesuai anjuran Buku KIA.

Salam hangat,
Bidan Prenava`;
  };

  // Helper to generate SBAR Referral Sheet for SpOG / Secondary Health Facility
  const generateSbarReferral = (
    patientName: string,
    age: number | string,
    weeks: number | string,
    phone: string,
    category: string,
    score: number,
    primaryAlert: string,
    subScores: { stunting_weighted: number; anemia_weighted: number; bp_weighted: number; plate_weighted: number },
    completenessPct: number,
    missingModalities: string[]
  ): string => {
    return `LEMBAR RUJUKAN MEDIS MATERNAL (SBAR)
Fasilitas Pengirim: Bidan Pelayanan Prenava
Tanggal & Waktu: ${dayjs().format('DD/MM/YYYY HH:mm')} WIB

══════════════════════════════════════════════════════
S - SITUATION (Identitas & Kondisi Akut)
══════════════════════════════════════════════════════
• Nama Pasien     : Ny. ${patientName}
• Usia            : ${age ? `${age} Tahun` : '-'}
• Usia Kehamilan  : ${weeks ? `${weeks} Minggu (${getTrimester(Number(weeks))})` : '-'}
• Kontak Pasien   : ${phone || '-'}
• Status Triase   : [${category}] (Skor Komposit Risiko: ${(score * 100).toFixed(0)}%)
• Indikasi Utama  : ${primaryAlert}

══════════════════════════════════════════════════════
B - BACKGROUND (Riwayat & Rekam Skrining)
══════════════════════════════════════════════════════
• Indeks Kelengkapan Data : ${completenessPct}% (${4 - missingModalities.length}/4 Modalitas)
• Modalitas Belum Terisi   : ${missingModalities.length > 0 ? missingModalities.join(', ') : 'Lengkap (Semua terisi)'}

══════════════════════════════════════════════════════
A - ASSESSMENT (Objektif 4 Dimensi AI/Klinis)
══════════════════════════════════════════════════════
1. Probabilitas Stunting Maternal (35%)   : ${(subScores.stunting_weighted * 100).toFixed(0)}%
2. Skrining Anemia Konjungtiva Mata (30%) : ${(subScores.anemia_weighted * 100).toFixed(0)}%
3. Tekanan Darah & MAP (20%)             : ${(subScores.bp_weighted * 100).toFixed(0)}%
4. Kepatuhan Piring Nutrisi (15%)         : ${(subScores.plate_weighted * 100).toFixed(0)}%

══════════════════════════════════════════════════════
R - RECOMMENDATION (Rekomendasi Tindakan Klinis)
══════════════════════════════════════════════════════
${
  category === 'MERAH'
    ? '• FAST-TRACK RUJUKAN SEGERA ke Dokter Spesialis Obstetri & Ginekologi (SpOG) / RS PONEK.\n• Evaluasi kegawatdaruratan tensi/preeklamsia dan pemeriksaan USG Doppler janin cito.\n• Stabilisasi hemodinamik dan pemantauan tanda bahaya obstetri lanjutan.'
    : '• Konsultasi ANC komprehensif di fasilitas kesehatan.\n• Evaluasi laboratorium kadar Hb dan penanganan defisiensi mikronutrien.\n• Pemantauan kenaikan berat badan dan kepatuhan konsumsi Tablet Tambah Darah (TTD).'
}

Pengirim: Bidan Pemeriksa Prenava`;
  };

  // Sync outreach message when patient details or template type changes
  useEffect(() => {
    if (detailPatient && latestTriage) {
      const weeks =
        detailPatient.pregnancies?.[0]?.gestational_age_weeks ||
        latestTriage.gestational_age_weeks ||
        '';
      const missing = latestTriage.completeness?.missing_modalities || [];
      const text = generateOutreachTemplate(
        detailPatient.name,
        weeks,
        latestTriage.triage_category,
        latestTriage.primary_alert,
        activeTemplateKey,
        missing
      );
      setOutreachMessage(text);
    }
  }, [detailPatient, latestTriage, activeTemplateKey]);

  const handleOpenDetail = (userId: number) => {
    setSelectedUserId(userId);
    setActiveTemplateKey('clinical');
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
  };

  const handleRecalculate = async (userId: number) => {
    try {
      await recalculateMutation.mutateAsync(userId);
      message.success('Skor triase berhasil dihitung ulang secara real-time!');
    } catch {
      message.error('Gagal menghitung ulang triase.');
    }
  };

  const handleCopySbar = async () => {
    if (!detailPatient || !latestTriage) return;
    const weeks =
      detailPatient.pregnancies?.[0]?.gestational_age_weeks ||
      latestTriage.gestational_age_weeks ||
      0;
    const comp = latestTriage.completeness;
    const sbarText = generateSbarReferral(
      detailPatient.name,
      detailPatient.profile?.usia || '',
      weeks,
      detailPatient.profile?.no_telepon || detailPatient.email || '',
      latestTriage.triage_category,
      latestTriage.triage_score,
      latestTriage.primary_alert,
      latestTriage.sub_scores,
      comp?.percentage ?? 100,
      comp?.missing_modalities ?? []
    );

    try {
      await navigator.clipboard.writeText(sbarText);
      message.success('Format rujukan medis SBAR berhasil disalin ke clipboard! Siap dikirim ke Dokter SpOG / RS.');
    } catch {
      message.error('Gagal menyalin format rujukan SBAR.');
    }
  };

  // WhatsApp Sanitization & Trigger
  const rawPhone = detailPatient?.profile?.no_telepon || '';
  const sanitizedWhatsAppPhone = (() => {
    let digits = rawPhone.replace(/\D/g, '');
    if (digits.startsWith('0')) {
      digits = '62' + digits.substring(1);
    } else if (digits.startsWith('8')) {
      digits = '62' + digits;
    }
    return digits;
  })();
  const hasValidPhone = sanitizedWhatsAppPhone.length >= 9;

  const handleSendWhatsApp = () => {
    if (!hasValidPhone) {
      message.warning('Nomor telepon pasien tidak valid atau belum terdaftar.');
      return;
    }
    const encoded = encodeURIComponent(outreachMessage);
    const url = `https://wa.me/${sanitizedWhatsAppPhone}?text=${encoded}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    message.success('Membuka tautan WhatsApp...');
  };

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(outreachMessage);
      message.success('Pesan triase klinis berhasil disalin ke clipboard!');
    } catch {
      message.error('Gagal menyalin pesan ke clipboard.');
    }
  };

  // Table Columns
  const columns: ColumnsType<TriagePatientItem> = [
    {
      title: 'Prioritas & Status',
      key: 'priority',
      width: 200,
      render: (_, record) => {
        let tagColor = 'default';
        if (record.triage_category === 'MERAH') tagColor = 'error';
        else if (record.triage_category === 'KUNING') tagColor = 'warning';
        else if (record.triage_category === 'HIJAU') tagColor = 'success';

        return (
          <div className="flex flex-col gap-1">
            <Tag color={tagColor} className="font-semibold text-xs px-2.5 py-0.5 rounded w-fit">
              {record.badge.label}
            </Tag>
            <div className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
              <Clock className="w-3 h-3 text-gray-400" />
              <span>{dayjs(record.calculated_at).format('DD/MM/YYYY HH:mm')}</span>
            </div>
          </div>
        );
      },
    },
    {
      title: 'Data Pasien & Kehamilan',
      key: 'patient',
      render: (_, record) => (
        <div>
          <div className="font-semibold text-gray-900 text-sm">{record.patient_name}</div>
          <div className="text-xs text-gray-500">{record.patient_email} • {record.phone || 'No Telp (-) '}</div>
          <div className="mt-1">
            <Tag color="blue" className="text-xs font-normal">
              Usia Kehamilan: {record.gestational_age_weeks} Minggu ({getTrimester(record.gestational_age_weeks)})
            </Tag>
          </div>
        </div>
      ),
    },
    {
      title: 'Skor Komposit CDSS',
      key: 'score',
      width: 170,
      render: (_, record) => {
        const percent = Math.round(record.triage_score * 100);
        let barColor = '#52c41a';
        if (record.triage_category === 'MERAH') barColor = '#ff4d4f';
        else if (record.triage_category === 'KUNING') barColor = '#faad14';

        return (
          <div>
            <div className="flex justify-between items-center mb-1 text-xs">
              <span className="font-medium text-gray-600">Risiko Maternal:</span>
              <span className="font-bold text-gray-900">
                {percent}%
              </span>
            </div>
            <Progress
              percent={percent}
              showInfo={false}
              strokeColor={barColor}
              trailColor="#F0F0F0"
              size="small"
            />
          </div>
        );
      },
    },
    {
      title: 'Kelengkapan Profil',
      key: 'completeness',
      width: 175,
      render: (_, record) => {
        const comp = record.completeness;
        const pct = comp?.percentage ?? 100;
        const count = comp?.modalities_count ?? 4;
        const missing = comp?.missing_modalities || [];

        let badgeColor = '#52C41A';
        let badgeBg = '#F6FFED';
        let label = 'Lengkap (4/4)';

        if (pct >= 100) {
          badgeColor = '#52C41A';
          badgeBg = '#F6FFED';
          label = 'Lengkap (4/4)';
        } else if (pct >= 75) {
          badgeColor = '#1890FF';
          badgeBg = '#E6F7FF';
          label = 'Cukup (3/4)';
        } else if (pct >= 50) {
          badgeColor = '#FAAD14';
          badgeBg = '#FFFBE6';
          label = 'Parsial (2/4)';
        } else if (pct >= 25) {
          badgeColor = '#FA8C16';
          badgeBg = '#FFF7E6';
          label = 'Skor Awal (1/4)';
        } else {
          badgeColor = '#8C8C8C';
          badgeBg = '#F5F5F5';
          label = 'Belum Ada (0/4)';
        }

        return (
          <div>
            <div className="flex justify-between items-center mb-1 text-xs">
              <span className="font-medium text-gray-600">Modalitas:</span>
              <span className="font-bold text-gray-800">
                {count}/4 ({pct}%)
              </span>
            </div>
            <Tooltip
              title={
                missing.length > 0
                  ? `Belum diisi: ${missing.join(', ')}`
                  : 'Seluruh 4 modalitas skrining telah lengkap terisi.'
              }
            >
              <Tag
                style={{
                  color: badgeColor,
                  backgroundColor: badgeBg,
                  borderColor: badgeColor,
                }}
                className="font-medium text-xs px-2 py-0.5 rounded cursor-help w-full text-center truncate m-0"
              >
                {comp?.badge?.label || label}
              </Tag>
            </Tooltip>
          </div>
        );
      },
    },
    {
      title: 'Kontribusi 4 Dimensi',
      key: 'breakdown',
      width: 240,
      render: (_, record) => (
        <div className="grid grid-cols-2 gap-1 text-[11px]">
          <Tooltip title="Faktor Stunting (Bobot 35%)">
            <span className="bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded border border-purple-200">
              Stunting: <b>{(record.sub_scores.stunting_weighted * 100).toFixed(0)}%</b>
            </span>
          </Tooltip>
          <Tooltip title="Faktor Anemia Konjungtiva (Bobot 30%)">
            <span className="bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded border border-rose-200">
              Anemia: <b>{(record.sub_scores.anemia_weighted * 100).toFixed(0)}%</b>
            </span>
          </Tooltip>
          <Tooltip title="Faktor Tekanan Darah MAP (Bobot 20%)">
            <span className="bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded border border-amber-200">
              Tensi: <b>{(record.sub_scores.bp_weighted * 100).toFixed(0)}%</b>
            </span>
          </Tooltip>
          <Tooltip title="Faktor Kepatuhan Piring Gizi (Bobot 15%)">
            <span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-200">
              Piring: <b>{(record.sub_scores.plate_weighted * 100).toFixed(0)}%</b>
            </span>
          </Tooltip>
        </div>
      ),
    },
    {
      title: 'Indikasi Klinis AI',
      key: 'alert',
      render: (_, record) => (
        <div className="text-xs text-gray-700 max-w-xs leading-snug">
          {record.triage_category === 'MERAH' && (
            <div className="text-red-600 font-semibold flex items-center gap-1 mb-0.5">
              <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Indikasi Intervensi Segera</span>
            </div>
          )}
          <span>{record.primary_alert}</span>
        </div>
      ),
    },
    {
      title: 'Aksi',
      key: 'actions',
      width: 160,
      render: (_, record) => (
        <Space direction="vertical" size="small" className="w-full">
          <Button
            type="primary"
            size="small"
            className="w-full text-xs font-medium"
            style={{
              backgroundColor: record.triage_category === 'MERAH' ? '#DC2626' : '#FA6978',
              borderColor: record.triage_category === 'MERAH' ? '#DC2626' : '#FA6978',
            }}
            icon={<Stethoscope className="w-3.5 h-3.5 inline mr-1" />}
            onClick={() => handleOpenDetail(record.user_id)}
          >
            Tindakan Klinis
          </Button>
          <Button
            size="small"
            className="w-full text-xs"
            icon={<RefreshCw className="w-3 h-3 inline mr-1" />}
            loading={recalculateMutation.isPending && recalculateMutation.variables === record.user_id}
            onClick={() => handleRecalculate(record.user_id)}
          >
            Hitung Ulang
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Unified Clinical Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 m-0">
            Triase Pasien & Dukungan Keputusan Klinis (CDSS)
          </h1>
          <p className="text-sm text-gray-600 mt-1 mb-0">
            Klasifikasi risiko maternal otomatis berbasis fusi 4 dimensi (Stunting 35%, Anemia 30%, MAP 20%, Piring Gizi 15%) dan protokol edukasi pasien
          </p>
        </div>
          <div className="flex items-center gap-3">
            <Button
              icon={<RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />}
              onClick={() => refetch()}
              className="text-gray-700 border-gray-300 hover:border-[#FA6978] hover:text-[#FA6978]"
            >
              Perbarui Antrean
            </Button>
          </div>
        </div>

        {/* Clinical Overview Stat Cards */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} className="shadow-sm border border-gray-200 rounded-xl">
              <Statistic
                title={<span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Pasien Terpantau</span>}
                value={totalPatients}
                prefix={<User className="w-4 h-4 text-gray-500 mr-1.5 inline" />}
                valueStyle={{ fontWeight: 700, color: '#111827' }}
              />
              <div className="text-xs text-gray-500 mt-2">Ibu hamil aktif dalam pengawasan</div>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} className="shadow-sm border border-red-200 bg-red-50/20 rounded-xl">
              <Statistic
                title={<span className="text-xs font-semibold text-red-700 uppercase tracking-wider">Prioritas 1: Kritis (Merah)</span>}
                value={summary.critical_red}
                prefix={<AlertTriangle className="w-4 h-4 text-red-600 mr-1.5 inline" />}
                valueStyle={{ fontWeight: 700, color: '#DC2626' }}
              />
              <div className="text-xs text-red-600 mt-2 font-medium">Intervensi & rujukan prioritas segera</div>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} className="shadow-sm border border-amber-200 bg-amber-50/20 rounded-xl">
              <Statistic
                title={<span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Prioritas 2: Waspada (Kuning)</span>}
                value={summary.warning_yellow}
                prefix={<Activity className="w-4 h-4 text-amber-600 mr-1.5 inline" />}
                valueStyle={{ fontWeight: 700, color: '#D97706' }}
              />
              <div className="text-xs text-amber-700 mt-2 font-medium">Edukasi gizi & suplemen 90 TTD</div>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} className="shadow-sm border border-emerald-200 bg-emerald-50/20 rounded-xl">
              <Statistic
                title={<span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Prioritas 3: Terkendali (Hijau)</span>}
                value={summary.stable_green}
                prefix={<CheckCircle2 className="w-4 h-4 text-emerald-600 mr-1.5 inline" />}
                valueStyle={{ fontWeight: 700, color: '#059669' }}
              />
              <div className="text-xs text-emerald-700 mt-2 font-medium">Pemantauan ANC rutin Buku KIA</div>
            </Card>
          </Col>
        </Row>

        {/* Filter and Table Card */}
        <Card bordered={false} className="shadow-sm border border-gray-200 rounded-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex flex-wrap items-center gap-3">
              <Radio.Group
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                buttonStyle="solid"
              >
                <Radio.Button value="ALL">Semua ({totalPatients})</Radio.Button>
                <Radio.Button value="MERAH" className="text-red-600 font-medium">
                  Kritis / Merah ({summary.critical_red})
                </Radio.Button>
                <Radio.Button value="KUNING" className="text-amber-600 font-medium">
                  Waspada / Kuning ({summary.warning_yellow})
                </Radio.Button>
                <Radio.Button value="HIJAU" className="text-emerald-600 font-medium">
                  Stabil / Hijau ({summary.stable_green})
                </Radio.Button>
              </Radio.Group>
            </div>

            <div className="w-full md:w-80">
              <Input
                placeholder="Cari nama, email, atau telepon..."
                prefix={<Search className="w-4 h-4 text-gray-400 mr-1.5" />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                allowClear
              />
            </div>
          </div>

          {/* Priority Queue Table */}
          <Table
            columns={columns}
            dataSource={filteredPatients}
            rowKey="triage_id"
            loading={isLoading}
            pagination={{ pageSize: 8, showSizeChanger: false }}
            locale={{ emptyText: 'Tidak ada data pasien yang sesuai dengan filter triase.' }}
          />
        </Card>

        {/* Drawer: Detail Analisis Klinis & Komunikasi Pasien */}
        <Drawer
          title={
            <div className="flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-[#FA6978]" />
              <span className="font-bold text-gray-900 text-base">Rekam Triase & Tindakan Klinis Bidan</span>
            </div>
          }
          placement="right"
          width={720}
          onClose={handleCloseDrawer}
          open={isDrawerOpen}
          footer={
            <div className="flex justify-between items-center py-2">
              <Button onClick={handleCloseDrawer}>Tutup</Button>
              {selectedUserId && (
                <Button
                  type="primary"
                  style={{ backgroundColor: '#FA6978', borderColor: '#FA6978' }}
                  icon={<RefreshCw className="w-3.5 h-3.5 mr-1" />}
                  loading={recalculateMutation.isPending}
                  onClick={() => handleRecalculate(selectedUserId)}
                >
                  Hitung Ulang Skor Triase
                </Button>
              )}
            </div>
          }
        >
          {isDetailLoading ? (
            <div className="flex justify-center items-center py-20">
              <Spin size="large" />
            </div>
          ) : detailPatient ? (
            <div className="space-y-6">
              {/* Profil Pasien Card */}
              <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-200">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 m-0">{detailPatient.name}</h3>
                    <p className="text-xs text-gray-500 m-0 mt-0.5">{detailPatient.email}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-600 mt-2">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-gray-400" />
                        <span className="font-medium text-gray-800">
                          {detailPatient.profile?.no_telepon || '-'}
                        </span>
                      </span>
                      <span>•</span>
                      <span>
                        Alamat: <span className="font-medium text-gray-800">{detailPatient.profile?.alamat || '-'}</span>
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <Tag color="purple" className="text-xs font-semibold">
                      Gol. Darah: {detailPatient.profile?.golongan_darah || '-'}
                    </Tag>
                    <div className="text-xs text-gray-500 mt-1">
                      Usia: {detailPatient.profile?.usia ? `${detailPatient.profile.usia} Tahun` : '-'}
                    </div>
                  </div>
                </div>

                {detailPatient.pregnancies && detailPatient.pregnancies.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between text-xs text-gray-600">
                    <span>
                      Usia Kandungan:{' '}
                      <strong className="text-[#FA6978]">
                        {detailPatient.pregnancies[0].gestational_age_weeks} Minggu (
                        {getTrimester(detailPatient.pregnancies[0].gestational_age_weeks || 0)})
                      </strong>
                    </span>
                    <span>
                      Status Kehamilan: <strong className="uppercase">{detailPatient.pregnancies[0].status || 'ongoing'}</strong>
                    </span>
                  </div>
                )}
              </div>

              {/* Skor & Status Triase Terkini */}
              {latestTriage && (
                <div className="p-4 rounded-xl border border-gray-200 bg-white shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-600">
                      Evaluasi Risiko Klinis CDSS:
                    </span>
                    <Tag
                      color={
                        latestTriage.triage_category === 'MERAH'
                          ? 'error'
                          : latestTriage.triage_category === 'KUNING'
                          ? 'warning'
                          : 'success'
                      }
                      className="text-xs font-bold px-3 py-1 rounded"
                    >
                      {latestTriage.badge.label}
                    </Tag>
                  </div>

                  <div>
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-sm font-semibold text-gray-800">Skor Komposit Risiko Maternal:</span>
                      <span className="text-xl font-bold text-gray-900">
                        {(latestTriage.triage_score * 100).toFixed(0)}%
                        <span className="text-xs font-normal text-gray-500 ml-1">
                          ({latestTriage.triage_score.toFixed(2)})
                        </span>
                      </span>
                    </div>
                    <Progress
                      percent={Math.round(latestTriage.triage_score * 100)}
                      showInfo={false}
                      strokeColor={
                        latestTriage.triage_category === 'MERAH'
                          ? '#ff4d4f'
                          : latestTriage.triage_category === 'KUNING'
                          ? '#faad14'
                          : '#52c41a'
                      }
                      size="default"
                    />
                  </div>

                  {/* Breakdown Sub-Scores */}
                  <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-gray-100">
                    <div className="bg-purple-50/60 p-2.5 rounded-lg border border-purple-200">
                      <div className="text-purple-900 font-medium">1. Risiko Stunting (35%)</div>
                      <div className="text-sm font-bold text-purple-700 mt-0.5">
                        {(latestTriage.sub_scores.stunting_weighted * 100).toFixed(0)}%
                      </div>
                    </div>

                    <div className="bg-rose-50/60 p-2.5 rounded-lg border border-rose-200">
                      <div className="text-rose-900 font-medium">2. Skrining Anemia (30%)</div>
                      <div className="text-sm font-bold text-rose-700 mt-0.5">
                        {(latestTriage.sub_scores.anemia_weighted * 100).toFixed(0)}%
                      </div>
                    </div>

                    <div className="bg-amber-50/60 p-2.5 rounded-lg border border-amber-200">
                      <div className="text-amber-900 font-medium">3. Tekanan Darah MAP (20%)</div>
                      <div className="text-sm font-bold text-amber-700 mt-0.5">
                        {(latestTriage.sub_scores.bp_weighted * 100).toFixed(0)}%
                      </div>
                    </div>

                    <div className="bg-emerald-50/60 p-2.5 rounded-lg border border-emerald-200">
                      <div className="text-emerald-900 font-medium">4. Piring Gizi (15%)</div>
                      <div className="text-sm font-bold text-emerald-700 mt-0.5">
                        {(latestTriage.sub_scores.plate_weighted * 100).toFixed(0)}%
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Indeks Kelengkapan Data Skrining Profil */}
              {latestTriage && (
                <div className="p-4 rounded-xl border border-gray-200 bg-white shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-600 flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-[#FA6978]" />
                      Indeks Kelengkapan Data Skrining:
                    </span>
                    <Tag
                      style={{
                        color: (latestTriage.completeness?.percentage ?? 100) >= 75 ? '#1890FF' : '#FAAD14',
                        backgroundColor: (latestTriage.completeness?.percentage ?? 100) >= 75 ? '#E6F7FF' : '#FFFBE6',
                        borderColor: (latestTriage.completeness?.percentage ?? 100) >= 75 ? '#91D5FF' : '#FFE58F',
                      }}
                      className="text-xs font-semibold px-2.5 py-0.5 rounded m-0"
                    >
                      {latestTriage.completeness?.badge?.label ||
                        `${latestTriage.completeness?.modalities_count ?? 4}/4 Parameter Terisi`}
                    </Tag>
                  </div>

                  <div>
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-xs font-medium text-gray-600">
                        Cakupan Modalitas Terisi:
                      </span>
                      <span className="text-sm font-bold text-gray-900">
                        {latestTriage.completeness?.percentage ?? 100}%
                        <span className="text-xs font-normal text-gray-500 ml-1">
                          ({latestTriage.completeness?.modalities_count ?? 4} dari 4 Modalitas)
                        </span>
                      </span>
                    </div>
                    <Progress
                      percent={latestTriage.completeness?.percentage ?? 100}
                      showInfo={false}
                      strokeColor={
                        (latestTriage.completeness?.percentage ?? 100) >= 75 ? '#1890FF' : '#FAAD14'
                      }
                      size="small"
                    />
                  </div>

                  {/* Checklist Parameter yang Belum Dilakukan */}
                  {(latestTriage.completeness?.missing_modalities?.length ?? 0) > 0 ? (
                    <div className="bg-amber-50/80 border border-amber-200 rounded-lg p-3 text-xs space-y-1.5">
                      <div className="font-semibold flex items-center gap-1.5 text-amber-900">
                        <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                        <span>Pemeriksaan yang Belum Dilakukan Pasien:</span>
                      </div>
                      <ul className="list-disc list-inside space-y-0.5 text-amber-900/90 pl-1 m-0">
                        {latestTriage.completeness?.missing_modalities?.map((item, idx) => (
                          <li key={idx}>
                            <span className="font-medium text-amber-950">{item}</span>
                          </li>
                        ))}
                      </ul>
                      <p className="text-[11px] text-amber-700 m-0 pt-1 italic">
                        * Skor dihitung secara proporsional menggunakan Dynamic Normalization. Bidan disarankan mengingatkan pasien untuk melengkapi data di atas saat sesi konsultasi.
                      </p>
                    </div>
                  ) : (
                    <div className="bg-emerald-50/80 border border-emerald-200 rounded-lg p-2.5 text-xs flex items-center gap-2 text-emerald-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span className="font-medium">
                        Data skrining maternal 100% lengkap (Stunting, Anemia, Tensi, dan Piring Nutrisi).
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Diagnosis AI Alert */}
              {latestTriage && (
                <Alert
                  message="Diagnosis Triase AI (Primary Alert)"
                  description={latestTriage.primary_alert}
                  type={
                    latestTriage.triage_category === 'MERAH'
                      ? 'error'
                      : latestTriage.triage_category === 'KUNING'
                      ? 'warning'
                      : 'success'
                  }
                  showIcon
                  className="rounded-xl border"
                />
              )}

              {/* Suggested Clinical Action */}
              {latestTriage && (
                <Card
                  title={
                    <span className="flex items-center gap-2 text-sm font-bold text-gray-900">
                      <Stethoscope className="w-4 h-4 text-[#FA6978]" />
                      Panduan Tindakan Klinis untuk Bidan
                    </span>
                  }
                  bordered={false}
                  className="shadow-sm rounded-xl border border-gray-200 bg-gray-50/40"
                >
                  <p className="text-sm text-gray-800 leading-relaxed m-0">
                    {latestTriage.suggested_action}
                  </p>
                </Card>
              )}

              {/* Fast-Track Rujukan SpOG / RS (Format SBAR) */}
              {latestTriage && (
                <div
                  className={`p-4 rounded-xl border shadow-sm space-y-3 ${
                    latestTriage.triage_category === 'MERAH'
                      ? 'border-red-200 bg-red-50/40'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <FileText
                        className={`w-4 h-4 ${
                          latestTriage.triage_category === 'MERAH' ? 'text-red-600' : 'text-[#FA6978]'
                        }`}
                      />
                      <h4 className="font-bold text-sm text-gray-900 m-0">
                        Format Rujukan Medis SpOG / RS (SBAR)
                      </h4>
                    </div>
                    {latestTriage.triage_category === 'MERAH' ? (
                      <Tag color="error" className="font-bold text-xs px-2.5 py-0.5 animate-pulse w-fit m-0">
                        FAST-TRACK RUJUKAN SEGERA
                      </Tag>
                    ) : (
                      <Tag color="default" className="font-medium text-xs px-2 py-0.5 w-fit m-0">
                        Format Standar Akreditasi
                      </Tag>
                    )}
                  </div>

                  <p className="text-xs text-gray-600 m-0">
                    Salin ringkasan data klinis terstruktur standar SBAR (Situation, Background, Assessment, Recommendation) untuk pengantar rujukan ke Dokter Spesialis Obstetri & Ginekologi (SpOG) atau Rumah Sakit rujukan.
                  </p>

                  <div className="pt-1">
                    <Button
                      type={latestTriage.triage_category === 'MERAH' ? 'primary' : 'default'}
                      danger={latestTriage.triage_category === 'MERAH'}
                      icon={<Copy className="w-3.5 h-3.5 mr-1" />}
                      onClick={handleCopySbar}
                      className="text-xs font-semibold shadow-sm"
                    >
                      Salin Format Rujukan SBAR ke Clipboard
                    </Button>
                  </div>
                </div>
              )}

              <Divider className="my-4" />

              {/* OUTREACH SECTION: Hubungi Ibu Hamil via WhatsApp */}
              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-emerald-600" />
                    <h4 className="font-bold text-sm text-gray-900 m-0">
                      Komunikasi & Arahan Kunjungan Pasien (WhatsApp Outreach)
                    </h4>
                  </div>
                  {hasValidPhone ? (
                    <Tag color="success" className="font-medium text-xs px-2 py-0.5 w-fit">
                      WA: +{sanitizedWhatsAppPhone}
                    </Tag>
                  ) : (
                    <Tag color="default" className="font-medium text-xs px-2 py-0.5 w-fit">
                      Nomor Belum Terdaftar
                    </Tag>
                  )}
                </div>

                <p className="text-xs text-gray-600 m-0">
                  Gunakan fitur ini untuk mengirimkan arahan kunjungan ke bidan, rekomendasi klinis, atau edukasi nutrisi langsung ke nomor WhatsApp ibu hamil.
                </p>

                {/* Template Selector Tabs */}
                <div>
                  <div className="text-xs font-semibold text-gray-700 mb-1.5">Pilih Template Pesan Otomatis:</div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="small"
                      type={activeTemplateKey === 'clinical' ? 'primary' : 'default'}
                      style={
                        activeTemplateKey === 'clinical'
                          ? { backgroundColor: '#FA6978', borderColor: '#FA6978' }
                          : undefined
                      }
                      onClick={() => setActiveTemplateKey('clinical')}
                    >
                      Rekomendasi Triase Medis
                    </Button>
                    <Button
                      size="small"
                      type={activeTemplateKey === 'visit' ? 'primary' : 'default'}
                      style={
                        activeTemplateKey === 'visit'
                          ? { backgroundColor: '#FA6978', borderColor: '#FA6978' }
                          : undefined
                      }
                      onClick={() => setActiveTemplateKey('visit')}
                    >
                      Ajakan Kunjungan Tatap Muka
                    </Button>
                    <Button
                      size="small"
                      type={activeTemplateKey === 'nutrition' ? 'primary' : 'default'}
                      style={
                        activeTemplateKey === 'nutrition'
                          ? { backgroundColor: '#FA6978', borderColor: '#FA6978' }
                          : undefined
                      }
                      onClick={() => setActiveTemplateKey('nutrition')}
                    >
                      Edukasi Gizi & Suplemen TTD
                    </Button>
                  </div>
                </div>

                {/* Editable Text Area */}
                <div>
                  <div className="flex justify-between items-center mb-1 text-xs">
                    <span className="font-semibold text-gray-700">Teks Pesan (Dapat Diedit Sesuai Kebutuhan Bidan):</span>
                    <span className="text-gray-400">{outreachMessage.length} karakter</span>
                  </div>
                  <TextArea
                    rows={7}
                    value={outreachMessage}
                    onChange={(e) => setOutreachMessage(e.target.value)}
                    className="font-sans text-xs leading-relaxed"
                    placeholder="Tulis pesan arahan klinis untuk ibu hamil di sini..."
                  />
                </div>

                {/* Outreach Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <Button
                    type="primary"
                    icon={<ExternalLink className="w-3.5 h-3.5 mr-1" />}
                    onClick={handleSendWhatsApp}
                    disabled={!hasValidPhone}
                    style={{
                      backgroundColor: hasValidPhone ? '#25D366' : undefined,
                      borderColor: hasValidPhone ? '#25D366' : undefined,
                      color: '#ffffff',
                    }}
                    className="font-medium text-xs shadow-sm hover:opacity-90"
                  >
                    Buka WhatsApp & Kirim Pesan
                  </Button>
                  <Button
                    icon={<Copy className="w-3.5 h-3.5 mr-1" />}
                    onClick={handleCopyMessage}
                    className="text-xs"
                  >
                    Salin Teks Pesan
                  </Button>
                  {!hasValidPhone && (
                    <span className="text-[11px] text-amber-600">
                      * Pasien belum mendaftarkan nomor telepon. Silakan salin teks untuk dikirimkan melalui saluran alternatif.
                    </span>
                  )}
                </div>
              </div>

              <Divider className="my-4" />

              {/* Histori Triase Pasien */}
              <div>
                <h4 className="font-bold text-sm text-gray-800 mb-3 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-gray-500" />
                  Riwayat Evaluasi Triase Sebelumnya
                </h4>

                {historyList.length === 0 ? (
                  <div className="text-xs text-gray-400 italic">Belum ada riwayat triase sebelumnya.</div>
                ) : (
                  <Timeline
                    className="mt-4"
                    items={historyList.map((h) => ({
                      color: h.triage_category === 'MERAH' ? 'red' : h.triage_category === 'KUNING' ? 'gold' : 'green',
                      children: (
                        <div className="text-xs pb-2">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-gray-800">
                              Kategori: {h.triage_category} (Skor: {(h.triage_score * 100).toFixed(0)}%)
                            </span>
                            <span className="text-gray-400">
                              {dayjs(h.calculated_at || h.created_at).format('DD MMM YYYY, HH:mm')}
                            </span>
                          </div>
                          <p className="text-gray-600 mt-1 mb-0">{h.primary_alert}</p>
                        </div>
                      ),
                    }))}
                  />
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-20 text-gray-400">Pilih pasien untuk melihat detail triase.</div>
          )}
        </Drawer>
      </div>
  );
}
