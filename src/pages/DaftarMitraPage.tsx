import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Alert,
  Button,
  ConfigProvider,
  Empty,
  Form,
  Input,
  Skeleton,
  Upload,
  message,
} from 'antd';
import type { UploadFile } from 'antd';
import {
  AimOutlined,
  CheckOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import logoUrl from '@/assets/logo.png';
import MapPicker, { type MapPosition } from '@/components/Map/MapPicker';
import RegionSelector, { type RegionValue } from '@/components/RegionSelector';
import { usePublicSubscriptionPlans } from '@/hooks/useBidanManagement';
import {
  checkPublicApplicationStatus,
  createSubscriptionApplication,
  type ApplicationStatusCheckResult,
} from '@/features/admin/bidanService.api';
import type { SubscriptionPlan } from '@/features/admin/bidan.types';

const DEFAULT_MAP_CENTER: MapPosition = { lat: -6.914744, lng: 107.60981 };

const formatPrice = (price: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(price);

export default function DaftarMitraPage() {
  const {
    data: plansData,
    isLoading: loadingPlans,
    isError: plansError,
    refetch: refetchPlans,
  } = usePublicSubscriptionPlans();

  const plans: SubscriptionPlan[] = Array.isArray(plansData)
    ? plansData.filter((p) => p.is_active)
    : [];

  const [activeTab, setActiveTab] = useState<'register' | 'status'>('register');
  const [form] = Form.useForm();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [region, setRegion] = useState<RegionValue>({});
  const [mapPosition, setMapPosition] = useState<MapPosition | null>(null);
  const [mapCenter, setMapCenter] = useState<MapPosition>(DEFAULT_MAP_CENTER);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [locatingGps, setLocatingGps] = useState(false);
  const [submittedResult, setSubmittedResult] = useState<{
    application_id: number;
    bidan_name: string;
    email: string;
  } | null>(null);

  // Watch fields for live completeness checklist
  const watchedFullName = Form.useWatch('full_name', form);
  const watchedBidanName = Form.useWatch('bidan_name', form);
  const watchedEmail = Form.useWatch('email', form);
  const watchedPhone = Form.useWatch('phone', form);
  const watchedStr = Form.useWatch('str_number', form);
  const watchedSip = Form.useWatch('sip_number', form);
  const watchedAddress = Form.useWatch('full_address', form);

  // Status checker state
  const [statusEmail, setStatusEmail] = useState('');
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [statusResult, setStatusResult] = useState<ApplicationStatusCheckResult | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);

  const checklist = [
    {
      label: 'Paket kemitraan dipilih',
      done: Boolean(selectedPlan),
    },
    {
      label: 'Identitas bidan dan kontak aktif',
      done: Boolean(
        watchedFullName?.trim() &&
          watchedBidanName?.trim() &&
          watchedEmail?.trim() &&
          watchedPhone?.trim()
      ),
    },
    {
      label: 'Nomor STR dan SIPB terisi',
      done: Boolean(watchedStr?.trim() && watchedSip?.trim()),
    },
    {
      label: 'Dokumen izin diunggah',
      done: fileList.length > 0,
    },
    {
      label: 'Wilayah, alamat, dan titik peta klinik',
      done: Boolean(
        region.province_code &&
          region.regency_code &&
          region.district_code &&
          watchedAddress?.trim() &&
          mapPosition
      ),
    },
  ];

  const completedCount = checklist.filter((item) => item.done).length;

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      message.warning('Browser ini belum mendukung pengambilan lokasi GPS.');
      return;
    }
    setLocatingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const next = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setMapPosition(next);
        setMapCenter(next);
        setLocatingGps(false);
        message.success('Titik lokasi GPS berhasil ditandai di peta.');
      },
      () => {
        setLocatingGps(false);
        message.error('Lokasi GPS tidak dapat diakses. Anda tetap bisa klik langsung pada peta.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = async (values: any) => {
    if (!selectedPlan) {
      message.error('Pilih salah satu paket kemitraan terlebih dahulu.');
      return;
    }
    if (!region.province_code || !region.regency_code || !region.district_code) {
      message.error('Provinsi, Kabupaten/Kota, dan Kecamatan wajib dipilih.');
      return;
    }
    if (!mapPosition) {
      message.error('Tandai titik lokasi praktik pada peta terlebih dahulu.');
      return;
    }
    const rawFile = fileList[0]?.originFileObj;
    if (!rawFile) {
      message.error('Unggah dokumen sertifikat izin (STR atau SIPB) terlebih dahulu.');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('subscription_plan_id', String(selectedPlan.subscription_plan_id));
      formData.append('full_name', values.full_name.trim());
      formData.append('email', values.email.trim());
      formData.append('phone', values.phone.trim());
      formData.append('bidan_name', values.bidan_name.trim());
      if (values.spesialisasi) {
        formData.append('spesialisasi', values.spesialisasi.trim());
      }
      formData.append('full_address', values.full_address.trim());
      formData.append('province_code', region.province_code);
      formData.append('regency_code', region.regency_code);
      formData.append('district_code', region.district_code);
      formData.append('lat', String(mapPosition.lat));
      formData.append('lng', String(mapPosition.lng));
      formData.append('str_number', values.str_number.trim());
      formData.append('sip_number', values.sip_number.trim());
      formData.append('document_file', rawFile);

      if (values.operating_hours_note?.trim()) {
        formData.append(
          'operating_hours',
          JSON.stringify({ jadwal: values.operating_hours_note.trim() })
        );
      }

      const res = await createSubscriptionApplication(formData);
      setSubmittedResult({
        application_id: res.application_id ?? res.id,
        bidan_name: values.bidan_name,
        email: values.email,
      });
      message.success('Pengajuan kemitraan berhasil dikirim.');
    } catch (err: any) {
      const errors = err?.response?.data?.errors;
      if (errors) {
        const msgs = Object.values(errors).flat().join(', ');
        message.error(msgs || 'Periksa kembali isian formulir Anda.');
      } else {
        message.error(err?.response?.data?.message || 'Gagal mengirim pengajuan kemitraan.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const runStatusCheck = async (targetEmail: string) => {
    const trimmed = targetEmail.trim();
    if (!trimmed) {
      message.warning('Masukkan email yang digunakan saat pendaftaran.');
      return;
    }
    setCheckingStatus(true);
    setStatusError(null);
    setStatusResult(null);
    try {
      const data = await checkPublicApplicationStatus(trimmed);
      setStatusResult(data);
    } catch (err: any) {
      setStatusError(
        err?.response?.data?.message || 'Data pengajuan dengan email tersebut belum ditemukan.'
      );
    } finally {
      setCheckingStatus(false);
    }
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#FA6978',
          colorLink: '#FA6978',
          colorLinkHover: '#E95D6B',
          borderRadius: 10,
          fontFamily: '"Plus Jakarta Sans", sans-serif',
        },
      }}
    >
      <div className="min-h-screen bg-[#FAF8F7] text-[#1C1917]">
        {/* Top Navigation */}
        <header className="bg-white border-b border-stone-200 sticky top-0 z-40">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <img src={logoUrl} alt="Prenava" width={34} height={34} className="w-8.5 h-8.5" />
              <span className="text-lg font-bold tracking-tight text-[#FA6978]">Prenava</span>
            </Link>

            <nav aria-label="Navigasi utama" className="flex items-center gap-3 sm:gap-5">
              <Link
                to="/"
                className="text-sm font-medium text-[#57534E] hover:text-[#1C1917] transition-colors py-2 px-1"
              >
                Beranda
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center min-h-[40px] px-4 py-2 rounded-lg text-sm font-semibold !text-white bg-[#FA6978] hover:bg-[#E95D6B] transition-colors"
              >
                Masuk Portal
              </Link>
            </nav>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          {/* Page Intro & Mode Switcher */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-stone-200">
            <div className="max-w-2xl">
              <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#1C1917] leading-snug">
                Daftar Mitra Praktik Mandiri Bidan
              </h1>
              <p className="mt-3 text-base text-[#57534E] leading-relaxed">
                Lengkapi profil praktik, nomor STR dan SIPB, serta titik lokasi klinik agar ibu
                hamil di sekitar wilayah Anda dapat menemukan praktik dan menjadwalkan kunjungan
                melalui aplikasi Prenava.
              </p>
            </div>

            <div
              role="tablist"
              aria-label="Menu kemitraan bidan"
              className="inline-flex self-start lg:self-end rounded-xl bg-stone-200/75 p-1"
            >
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'register'}
                onClick={() => setActiveTab('register')}
                className={`min-h-[44px] px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  activeTab === 'register'
                    ? 'bg-white text-[#1C1917] shadow-xs'
                    : 'text-[#57534E] hover:text-[#1C1917]'
                }`}
              >
                Formulir Pendaftaran
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'status'}
                onClick={() => setActiveTab('status')}
                className={`min-h-[44px] px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  activeTab === 'status'
                    ? 'bg-white text-[#1C1917] shadow-xs'
                    : 'text-[#57534E] hover:text-[#1C1917]'
                }`}
              >
                Cek Status Pengajuan
              </button>
            </div>
          </div>

          {activeTab === 'register' ? (
            submittedResult ? (
              <section
                aria-live="polite"
                className="mt-8 max-w-2xl bg-white border border-stone-200 rounded-2xl p-6 sm:p-8"
              >
                <div className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 mb-4">
                  <CheckOutlined aria-hidden="true" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#1C1917]">
                  Pengajuan kemitraan telah diterima
                </h2>
                <p className="mt-2 text-sm sm:text-base text-[#57534E] leading-relaxed">
                  Berkas pendaftaran untuk{' '}
                  <strong className="text-[#1C1917]">{submittedResult.bidan_name}</strong> (nomor
                  pengajuan <strong className="text-[#1C1917]">#{submittedResult.application_id}</strong>)
                  sudah masuk ke antrean pemeriksaan Admin Prenava. Anda dapat memantau status
                  verifikasi kapan saja menggunakan email{' '}
                  <strong className="text-[#1C1917]">{submittedResult.email}</strong>.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      const email = submittedResult.email;
                      setStatusEmail(email);
                      setActiveTab('status');
                      setSubmittedResult(null);
                      runStatusCheck(email);
                    }}
                    className="min-h-[44px] px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#FA6978] hover:bg-[#E95D6B] transition-colors"
                  >
                    Lihat Status Pengajuan
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmittedResult(null);
                      form.resetFields();
                      setSelectedPlan(null);
                      setRegion({});
                      setMapPosition(null);
                      setFileList([]);
                    }}
                    className="min-h-[44px] px-5 py-2.5 rounded-xl text-sm font-semibold text-[#1C1917] bg-white border border-stone-300 hover:bg-stone-50 transition-colors"
                  >
                    Daftarkan Praktik Lain
                  </button>
                </div>
              </section>
            ) : (
              <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Main Form Document */}
                <div className="lg:col-span-8 bg-white border border-stone-200 rounded-2xl divide-y divide-stone-200">
                  {/* Section 1: Paket Kemitraan */}
                  <section className="p-6 sm:p-8" aria-labelledby="section-paket">
                    <div className="mb-5">
                      <h2 id="section-paket" className="text-lg font-bold text-[#1C1917]">
                        Paket Kemitraan
                      </h2>
                      <p className="text-sm text-[#57534E] mt-1">
                        Pilih paket layanan yang sesuai dengan kebutuhan praktik Anda.
                      </p>
                    </div>

                    {loadingPlans ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[1, 2, 3, 4].map((n) => (
                          <div key={n} className="rounded-xl border border-stone-200 p-4">
                            <Skeleton active paragraph={{ rows: 3 }} />
                          </div>
                        ))}
                      </div>
                    ) : plansError ? (
                      <Alert
                        type="error"
                        showIcon
                        message="Daftar paket kemitraan gagal dimuat"
                        description="Periksa koneksi internet Anda lalu coba muat ulang daftar paket."
                        action={
                          <Button size="small" onClick={() => refetchPlans()}>
                            Coba Lagi
                          </Button>
                        }
                      />
                    ) : plans.length === 0 ? (
                      <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description="Belum ada paket kemitraan aktif yang tersedia saat ini."
                      />
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {plans.map((plan) => {
                          const isSelected =
                            selectedPlan?.subscription_plan_id === plan.subscription_plan_id;
                          return (
                            <button
                              type="button"
                              key={plan.subscription_plan_id}
                              aria-pressed={isSelected}
                              onClick={() => setSelectedPlan(plan)}
                              className={`text-left rounded-xl p-5 border transition-colors flex flex-col justify-between ${
                                isSelected
                                  ? 'border-[#FA6978] bg-[#FFF5F6] ring-1 ring-[#FA6978]'
                                  : 'border-stone-200 bg-white hover:border-[#FA6978]/50'
                              }`}
                            >
                              <div>
                                <div className="flex items-start justify-between gap-2">
                                  <span className="font-bold text-base text-[#1C1917]">
                                    {plan.name}
                                  </span>
                                  {isSelected && (
                                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#FA6978] bg-white border border-[#FA6978]/35 rounded-md px-2 py-0.5 shrink-0">
                                      <CheckOutlined aria-hidden="true" /> Dipilih
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-[#57534E] mt-1.5 leading-relaxed">
                                  {plan.description}
                                </p>

                                <div className="mt-4 pb-3 border-b border-stone-200/80 flex items-baseline gap-1.5">
                                  <span className="text-xl font-bold text-[#1C1917]">
                                    {plan.price === 0 ? 'Gratis' : formatPrice(plan.price)}
                                  </span>
                                  <span className="text-xs text-[#57534E]">
                                    / {plan.duration_days} hari
                                  </span>
                                </div>

                                <ul className="mt-3 space-y-1.5 text-xs text-[#44403C]">
                                  {(plan.features ?? []).map((feat, i) => (
                                    <li key={i} className="flex items-start gap-2">
                                      <CheckOutlined
                                        aria-hidden="true"
                                        className="mt-0.5 text-[#FA6978] shrink-0"
                                      />
                                      <span>{feat}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </section>

                  <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    requiredMark={false}
                    className="divide-y divide-stone-200"
                  >
                    {/* Section 2: Identitas & Legalitas */}
                    <section className="p-6 sm:p-8" aria-labelledby="section-identitas">
                      <div className="mb-5">
                        <h2 id="section-identitas" className="text-lg font-bold text-[#1C1917]">
                          Identitas Bidan dan Legalitas Praktik
                        </h2>
                        <p className="text-sm text-[#57534E] mt-1">
                          Data ini digunakan untuk verifikasi berkas STR/SIPB dan ditampilkan pada
                          halaman profil praktik Anda.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5">
                        <Form.Item
                          label={<span className="font-medium text-[#1C1917]">Nama Lengkap Bidan *</span>}
                          name="full_name"
                          rules={[
                            { required: true, message: 'Nama lengkap wajib diisi' },
                            { min: 3, message: 'Minimal 3 karakter' },
                          ]}
                        >
                          <Input size="large" placeholder="Nama lengkap sesuai STR" />
                        </Form.Item>

                        <Form.Item
                          label={<span className="font-medium text-[#1C1917]">Nama Praktik / PMB *</span>}
                          name="bidan_name"
                          rules={[
                            { required: true, message: 'Nama praktik wajib diisi' },
                            { min: 3, message: 'Minimal 3 karakter' },
                          ]}
                        >
                          <Input size="large" placeholder="Contoh: PMB Melati Bandung" />
                        </Form.Item>

                        <Form.Item
                          label={<span className="font-medium text-[#1C1917]">Email Aktif *</span>}
                          name="email"
                          rules={[
                            { required: true, message: 'Email wajib diisi' },
                            { type: 'email', message: 'Format email tidak valid' },
                          ]}
                        >
                          <Input size="large" type="email" placeholder="email@domain.com" />
                        </Form.Item>

                        <Form.Item
                          label={<span className="font-medium text-[#1C1917]">Nomor Telepon / WhatsApp *</span>}
                          name="phone"
                          rules={[
                            { required: true, message: 'Nomor telepon wajib diisi' },
                            {
                              pattern: /^(\+62|62|0)8[1-9][0-9]{6,11}$/,
                              message: 'Gunakan nomor Indonesia aktif (contoh: 0812xxxxxxxx)',
                            },
                          ]}
                        >
                          <Input size="large" placeholder="0812xxxxxxxx" />
                        </Form.Item>

                        <Form.Item
                          label={<span className="font-medium text-[#1C1917]">Layanan Utama (Opsional)</span>}
                          name="spesialisasi"
                        >
                          <Input size="large" placeholder="Pemeriksaan ANC, USG, persalinan, imunisasi" />
                        </Form.Item>

                        <Form.Item
                          label={<span className="font-medium text-[#1C1917]">Jam Praktik (Opsional)</span>}
                          name="operating_hours_note"
                        >
                          <Input size="large" placeholder="Senin - Sabtu, 08:00 - 17:00 WIB" />
                        </Form.Item>
                      </div>

                      <div className="mt-4 pt-5 border-t border-stone-100">
                        <h3 className="text-sm font-semibold text-[#1C1917] mb-3">
                          Berkas Legalitas Resmi
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5">
                          <Form.Item
                            label={<span className="font-medium text-[#1C1917]">Nomor STR *</span>}
                            name="str_number"
                            rules={[{ required: true, message: 'Nomor STR wajib diisi' }]}
                          >
                            <Input size="large" placeholder="Nomor Surat Tanda Registrasi aktif" />
                          </Form.Item>

                          <Form.Item
                            label={<span className="font-medium text-[#1C1917]">Nomor SIP / SIPB *</span>}
                            name="sip_number"
                            rules={[{ required: true, message: 'Nomor SIP/SIPB wajib diisi' }]}
                          >
                            <Input size="large" placeholder="Nomor Surat Izin Praktik Bidan aktif" />
                          </Form.Item>
                        </div>

                        <Form.Item
                          label={<span className="font-medium text-[#1C1917]">Dokumen Sertifikat / Izin (STR dan SIPB) *</span>}
                          extra={
                            <span className="text-xs text-[#57534E]">
                              Format PDF, JPG, PNG, atau WEBP dengan ukuran maksimal 5 MB.
                            </span>
                          }
                          className="mb-0"
                        >
                          <Upload
                            beforeUpload={() => false}
                            maxCount={1}
                            accept=".pdf,.jpg,.jpeg,.png,.webp"
                            fileList={fileList}
                            onChange={({ fileList: next }) => setFileList(next)}
                          >
                            <Button icon={<UploadOutlined />} size="large">
                              Pilih Berkas Dokumen
                            </Button>
                          </Upload>
                        </Form.Item>
                      </div>
                    </section>

                    {/* Section 3: Wilayah & Lokasi */}
                    <section className="p-6 sm:p-8" aria-labelledby="section-lokasi">
                      <div className="mb-5">
                        <h2 id="section-lokasi" className="text-lg font-bold text-[#1C1917]">
                          Wilayah dan Titik Lokasi Praktik
                        </h2>
                        <p className="text-sm text-[#57534E] mt-1">
                          Titik koordinat membantu ibu hamil melihat jarak klinik dari posisi mereka.
                        </p>
                      </div>

                      <div className="mb-5">
                        <RegionSelector value={region} onChange={setRegion} includeDistrict />
                      </div>

                      <Form.Item
                        label={<span className="font-medium text-[#1C1917]">Alamat Lengkap Praktik *</span>}
                        name="full_address"
                        rules={[
                          { required: true, message: 'Alamat lengkap wajib diisi' },
                          { min: 10, message: 'Tuliskan alamat lengkap minimal 10 karakter' },
                        ]}
                      >
                        <Input.TextArea
                          rows={2}
                          size="large"
                          placeholder="Nama jalan, nomor bangunan, RT/RW, kelurahan atau desa"
                        />
                      </Form.Item>

                      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <div className="text-sm font-medium text-[#1C1917]">
                            Titik Lokasi pada Peta <span className="text-[#FA6978]">*</span>
                          </div>
                          <div className="text-xs text-[#57534E] mt-0.5">
                            Klik langsung pada peta atau gunakan tombol GPS jika Anda sedang berada
                            di lokasi praktik.
                          </div>
                        </div>
                        <Button
                          icon={<AimOutlined />}
                          loading={locatingGps}
                          onClick={handleUseCurrentLocation}
                        >
                          Ambil Titik GPS
                        </Button>
                      </div>

                      <MapPicker
                        initialPosition={mapCenter}
                        selectedPosition={mapPosition}
                        onLocationSelect={(pos) => setMapPosition(pos)}
                        height={320}
                      />

                      <div className="mt-2 text-xs text-[#57534E]">
                        {mapPosition ? (
                          <span>
                            Koordinat terpilih:{' '}
                            <strong className="text-[#1C1917]">
                              {mapPosition.lat.toFixed(6)}, {mapPosition.lng.toFixed(6)}
                            </strong>
                          </span>
                        ) : (
                          <span>Belum ada titik lokasi yang ditandai pada peta.</span>
                        )}
                      </div>
                    </section>

                    {/* Submit Footer */}
                    <div className="p-6 sm:p-8 bg-stone-50/70 rounded-b-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <p className="text-xs text-[#57534E] max-w-md leading-relaxed">
                        Dengan mengirim formulir ini, data praktik dan dokumen STR/SIPB Anda akan
                        diperiksa oleh tim Admin Prenava sebelum akun mitra diaktifkan.
                      </p>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="min-h-[46px] px-6 py-3 rounded-xl text-sm font-semibold text-white bg-[#FA6978] hover:bg-[#E95D6B] disabled:opacity-60 transition-colors shrink-0"
                      >
                        {submitting ? 'Mengirim Pengajuan...' : 'Kirim Pengajuan Kemitraan'}
                      </button>
                    </div>
                  </Form>
                </div>

                {/* Companion Sidebar */}
                <aside className="lg:col-span-4 space-y-5 lg:sticky lg:top-24">
                  {/* Live Completeness Checklist */}
                  <div className="bg-white border border-stone-200 rounded-2xl p-5">
                    <div className="flex items-center justify-between gap-2 pb-3 border-b border-stone-100">
                      <h2 className="text-sm font-bold text-[#1C1917]">Kelengkapan Berkas</h2>
                      <span className="text-xs font-semibold text-[#57534E]">
                        {completedCount}/{checklist.length}
                      </span>
                    </div>

                    <ul className="mt-3.5 space-y-2.5 text-sm">
                      {checklist.map((item) => (
                        <li key={item.label} className="flex items-start gap-2.5">
                          <span
                            aria-hidden="true"
                            className={`mt-0.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] shrink-0 ${
                              item.done
                                ? 'bg-emerald-600 text-white'
                                : 'border border-stone-300 bg-white text-transparent'
                            }`}
                          >
                            <CheckOutlined />
                          </span>
                          <span className={item.done ? 'text-[#1C1917] font-medium' : 'text-[#57534E]'}>
                            {item.label}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {selectedPlan && (
                      <div className="mt-4 pt-3.5 border-t border-stone-100 text-xs text-[#57534E]">
                        Paket terpilih:{' '}
                        <strong className="text-[#1C1917]">
                          {selectedPlan.name} (
                          {selectedPlan.price === 0 ? 'Gratis' : formatPrice(selectedPlan.price)} /{' '}
                          {selectedPlan.duration_days} hari)
                        </strong>
                      </div>
                    )}
                  </div>

                  {/* Verification Steps */}
                  <div className="bg-white border border-stone-200 rounded-2xl p-5">
                    <h2 className="text-sm font-bold text-[#1C1917] mb-3">
                      Proses Setelah Mendaftar
                    </h2>
                    <ol className="space-y-3 text-xs text-[#57534E] leading-relaxed list-decimal list-inside">
                      <li>
                        Admin Prenava memeriksa kesesuaian nomor STR, SIPB, dokumen izin, dan lokasi
                        praktik.
                      </li>
                      <li>
                        Pantau perkembangan verifikasi melalui menu{' '}
                        <button
                          type="button"
                          onClick={() => setActiveTab('status')}
                          className="font-semibold text-[#FA6978] hover:text-[#E95D6B] underline underline-offset-2"
                        >
                          Cek Status Pengajuan
                        </button>{' '}
                        menggunakan email pendaftaran.
                      </li>
                      <li>
                        Setelah disetujui, akun portal bidan dan profil lokasi klinik akan aktif
                        untuk menerima janji temu ibu hamil.
                      </li>
                    </ol>
                  </div>

                  {/* Contact Help */}
                  <div className="bg-stone-100/80 border border-stone-200 rounded-2xl p-5 text-xs text-[#57534E] space-y-1.5">
                    <div className="font-semibold text-[#1C1917]">Butuh bantuan pendaftaran?</div>
                    <div>
                      Email:{' '}
                      <a
                        href="mailto:prenava.official@gmail.com"
                        className="text-[#FA6978] hover:text-[#E95D6B] font-medium hover:underline"
                      >
                        prenava.official@gmail.com
                      </a>
                    </div>
                    <div>
                      Telepon / WhatsApp:{' '}
                      <a
                        href="tel:+6285156240040"
                        className="text-[#FA6978] hover:text-[#E95D6B] font-medium hover:underline"
                      >
                        +62 851-5624-0040
                      </a>
                    </div>
                  </div>
                </aside>
              </div>
            )
          ) : (
            /* Status Checker Panel */
            <section
              aria-labelledby="status-heading"
              className="mt-8 max-w-2xl bg-white border border-stone-200 rounded-2xl p-6 sm:p-8"
            >
              <h2 id="status-heading" className="text-lg font-bold text-[#1C1917]">
                Periksa Status Verifikasi Kemitraan
              </h2>
              <p className="text-sm text-[#57534E] mt-1 mb-5">
                Masukkan alamat email yang Anda gunakan saat mengajukan pendaftaran mitra bidan.
              </p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  runStatusCheck(statusEmail);
                }}
                className="flex flex-col sm:flex-row gap-3"
              >
                <div className="flex-1">
                  <label htmlFor="status-email-input" className="sr-only">
                    Email pendaftaran mitra
                  </label>
                  <Input
                    id="status-email-input"
                    size="large"
                    type="email"
                    placeholder="email@domain.com"
                    value={statusEmail}
                    onChange={(e) => setStatusEmail(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  disabled={checkingStatus}
                  className="min-h-[44px] px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#FA6978] hover:bg-[#E95D6B] disabled:opacity-60 transition-colors shrink-0"
                >
                  {checkingStatus ? 'Memeriksa...' : 'Periksa Status'}
                </button>
              </form>

              {statusError && (
                <Alert className="mt-5" type="error" showIcon message={statusError} />
              )}

              {statusResult && (
                <div className="mt-6 p-5 rounded-xl border border-stone-200 bg-[#FAF8F7] space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-bold text-base text-[#1C1917]">
                      {statusResult.bidan_name}
                    </span>
                    {statusResult.status === 'pending' && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                        <ClockCircleOutlined aria-hidden="true" /> Menunggu Verifikasi
                      </span>
                    )}
                    {statusResult.status === 'approved' && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <CheckOutlined aria-hidden="true" /> Disetujui
                      </span>
                    )}
                    {statusResult.status === 'rejected' && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md bg-red-50 text-red-800 border border-red-200">
                        <CloseCircleOutlined aria-hidden="true" /> Ditolak
                      </span>
                    )}
                  </div>

                  {statusResult.plan_name && (
                    <div className="text-sm text-[#44403C]">
                      Paket: <strong className="text-[#1C1917]">{statusResult.plan_name}</strong>
                    </div>
                  )}

                  {(statusResult.district || statusResult.city || statusResult.province) && (
                    <div className="text-sm text-[#44403C]">
                      Wilayah:{' '}
                      {[statusResult.district, statusResult.city, statusResult.province]
                        .filter(Boolean)
                        .join(', ')}
                    </div>
                  )}

                  {statusResult.rejection_reason && (
                    <Alert
                      type="error"
                      showIcon
                      message="Alasan Penolakan"
                      description={statusResult.rejection_reason}
                    />
                  )}
                </div>
              )}
            </section>
          )}
        </main>
      </div>
    </ConfigProvider>
  );
}
