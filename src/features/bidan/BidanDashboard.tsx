'use client';

import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, Skeleton, Alert, Button, Empty, Tag, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import dayjs from 'dayjs';
import BidanLayout from './components/BidanLayout';
import {
  getHealthHistory,
  aggregateDepressionAnalytics,
  aggregateAnemiaAnalytics,
  getStuntingHistory,
  aggregateStuntingAnalytics,
  getUserDataAgeLmp,
} from './bidan.api';
import { useBidanAppointments } from './appointment.api';
import type { Appointment, AppointmentStatus } from '@/features/admin/bidan.types';
import DepressionAnalyticsCard from './DepressionAnalyticsCard.tsx';
import AnemiaAnalyticsCard from './AnemiaAnalyticsCard.tsx';
import StuntingAnalyticsCard from './StuntingAnalyticsCard.tsx';

const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatus, { color: string; label: string }> = {
  requested: { color: 'warning', label: 'Menunggu Konfirmasi' },
  accepted: { color: 'success', label: 'Diterima' },
  rejected: { color: 'error', label: 'Ditolak' },
  completed: { color: 'default', label: 'Selesai' },
  cancelled: { color: 'default', label: 'Dibatalkan' },
};

const CONSULTATION_TYPE_LABELS: Record<string, string> = {
  visit: 'Kunjungan',
  consultation: 'Konsultasi',
  checkup: 'Pemeriksaan',
};

export default function BidanDashboard() {
  const {
    data: appointments = [],
    isLoading: appointmentsLoading,
    error: appointmentsError,
    refetch: refetchAppointments,
  } = useBidanAppointments();

  const {
    data: healthHistoryResponse,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['healthHistory'],
    queryFn: getHealthHistory,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  const {
    data: stuntingHistoryResponse,
    isLoading: stuntingLoading,
    error: stuntingError,
    refetch: refetchStunting,
  } = useQuery({
    queryKey: ['stuntingHistory'],
    queryFn: getStuntingHistory,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  const {
    data: userDataResponse,
    isLoading: userDataLoading,
    error: userDataError,
    refetch: refetchUserData,
  } = useQuery({
    queryKey: ['userDataAgeLmp'],
    queryFn: getUserDataAgeLmp,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  const appointmentStats = useMemo(() => {
    let requested = 0;
    let accepted = 0;
    let completed = 0;
    appointments.forEach((appt) => {
      if (appt.status === 'requested') requested++;
      else if (appt.status === 'accepted') accepted++;
      else if (appt.status === 'completed') completed++;
    });
    return { requested, accepted, completed, total: appointments.length };
  }, [appointments]);

  const activeAppointments = useMemo(
    () =>
      appointments
        .filter((a) => a.status === 'requested' || a.status === 'accepted')
        .slice(0, 5),
    [appointments]
  );

  const gestationalWeekData = (userDataResponse?.data.gestational_age_distribution ?? []).map((d) => ({
    name: `${d.gestational_age_weeks} mgg`,
    count: d.total,
  }));
  const trimesterFallbackData = (userDataResponse?.data.trimester_distribution ?? []).map((d) => ({
    name: d.trimester,
    count: d.total,
  }));

  const showingTrimesterFallback =
    gestationalWeekData.length === 0 && trimesterFallbackData.length > 0;
  const pregnancyChartData = showingTrimesterFallback
    ? trimesterFallbackData
    : gestationalWeekData;
  const pregnancyTotal = pregnancyChartData.reduce((s, d) => s + d.count, 0);

  const ageData = (userDataResponse?.data.age_distribution ?? []).map((d) => ({
    name: `${d.age} th`,
    count: d.total,
  }));
  const ageTotal = ageData.reduce((s, d) => s + d.count, 0);

  const healthRecords = healthHistoryResponse?.data ?? [];
  const stuntingRecords = stuntingHistoryResponse?.data ?? [];
  const hasAnyAnalytics = healthRecords.length > 0 || stuntingRecords.length > 0;

  const depressionAnalytics = healthRecords.length > 0
    ? aggregateDepressionAnalytics(healthRecords)
    : undefined;

  const anemiaAnalytics = healthRecords.length > 0
    ? aggregateAnemiaAnalytics(healthRecords)
    : undefined;

  const stuntingAnalytics = stuntingRecords.length > 0
    ? aggregateStuntingAnalytics(stuntingRecords)
    : undefined;

  const handleRefreshAll = () => {
    refetchAppointments();
    refetchUserData();
    refetch();
    refetchStunting();
  };

  const appointmentColumns: ColumnsType<Appointment> = [
    {
      title: 'Nama Ibu Hamil',
      key: 'patient',
      render: (_, record) => (
        <span className="font-medium text-gray-900">
          {(record.user_data as any)?.name || 'Pasien'}
        </span>
      ),
    },
    {
      title: 'Jadwal',
      key: 'schedule',
      render: (_, record) => {
        const dateVal = record.confirmed_date || record.preferred_date;
        const timeVal = record.confirmed_time || record.preferred_time;
        const dateStr = dateVal ? dayjs(dateVal).format('DD MMM YYYY') : '-';
        return (
          <span className="text-gray-700">
            {dateStr}
            {timeVal ? `, ${String(timeVal).slice(0, 5)}` : ''}
          </span>
        );
      },
    },
    {
      title: 'Tipe',
      dataIndex: 'consultation_type',
      key: 'consultation_type',
      render: (type: string) => (
        <span className="text-gray-600">{CONSULTATION_TYPE_LABELS[type] || type || '-'}</span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: AppointmentStatus) => {
        const cfg = APPOINTMENT_STATUS_LABELS[status] || { color: 'default', label: status };
        return <Tag color={cfg.color}>{cfg.label}</Tag>;
      },
    },
  ];

  // Section 1: Ringkasan Janji Temu Pasien
  const appointmentSection = (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Ringkasan Praktik &amp; Janji Temu</h1>
          <p className="text-sm text-gray-600">
            Pantau jadwal kunjungan pasien dan profil ibu hamil yang terhubung di Prenava.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            icon={<ReloadOutlined />}
            onClick={handleRefreshAll}
            loading={appointmentsLoading || userDataLoading || isLoading}
          >
            Muat Ulang
          </Button>
          <Link to="/bidan/appointments">
            <Button type="primary" style={{ backgroundColor: '#FA6978', borderColor: '#FA6978' }}>
              Kelola Janji Temu
            </Button>
          </Link>
        </div>
      </div>

      {appointmentsError ? (
        <Alert
          type="error"
          showIcon
          message="Gagal memuat data janji temu"
          action={
            <Button size="small" danger onClick={() => refetchAppointments()}>
              Coba Lagi
            </Button>
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium text-gray-500">Menunggu Konfirmasi</div>
                  <div className="text-2xl font-bold text-gray-900 mt-1">
                    {appointmentsLoading ? '-' : appointmentStats.requested}
                  </div>
                </div>
                <ClockCircleOutlined style={{ fontSize: 22, color: '#D97706' }} />
              </div>
            </Card>
            <Card className="shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium text-gray-500">Janji Temu Diterima</div>
                  <div className="text-2xl font-bold text-gray-900 mt-1">
                    {appointmentsLoading ? '-' : appointmentStats.accepted}
                  </div>
                </div>
                <CalendarOutlined style={{ fontSize: 22, color: '#FA6978' }} />
              </div>
            </Card>
            <Card className="shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium text-gray-500">Konsultasi Selesai</div>
                  <div className="text-2xl font-bold text-gray-900 mt-1">
                    {appointmentsLoading ? '-' : appointmentStats.completed}
                  </div>
                </div>
                <CheckCircleOutlined style={{ fontSize: 22, color: '#16A34A' }} />
              </div>
            </Card>
          </div>

          <Card
            title="Jadwal Janji Temu Aktif"
            className="shadow-sm"
            extra={
              <Link to="/bidan/appointments" className="text-sm text-[#FA6978] hover:text-[#E95D6B] hover:underline">
                Lihat semua ({appointmentStats.total})
              </Link>
            }
          >
            {appointmentsLoading ? (
              <Skeleton active paragraph={{ rows: 3 }} />
            ) : activeAppointments.length === 0 ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Belum ada jadwal janji temu aktif saat ini."
              />
            ) : (
              <Table<Appointment>
                columns={appointmentColumns}
                dataSource={activeAppointments}
                rowKey="appointment_id"
                pagination={false}
                size="middle"
              />
            )}
          </Card>
        </>
      )}
    </div>
  );

  // Section 2: Data Pengguna Prenava (2 diagram batang)
  const userDataSection = (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold text-gray-900">Data Pengguna Prenava</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card
          title={
            showingTrimesterFallback
              ? `Sebaran Trimester Kehamilan (Total: ${pregnancyTotal} ibu hamil)`
              : `Usia Kehamilan Dalam Minggu (Total: ${pregnancyTotal} ibu hamil)`
          }
          className="shadow-sm"
        >
          {userDataLoading ? (
            <Skeleton active paragraph={{ rows: 6 }} />
          ) : userDataError ? (
            <Alert
              type="error"
              showIcon
              message="Gagal memuat data usia kehamilan"
              action={<Button size="small" danger onClick={() => refetchUserData()}>Coba Lagi</Button>}
            />
          ) : pregnancyChartData.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="Belum ada ibu hamil yang mengisi data usia kehamilan atau trimester."
            />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={pregnancyChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} label={{ value: 'Jumlah Ibu', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value: unknown) => `${value} ibu hamil`} />
                <Bar dataKey="count" radius={[8, 8, 0, 0]} maxBarSize={56}>
                  {pregnancyChartData.map((_, i) => <Cell key={i} fill="#FA6978" />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card title={`Usia Ibu (Total: ${ageTotal} ibu)`} className="shadow-sm">
          {userDataLoading ? (
            <Skeleton active paragraph={{ rows: 6 }} />
          ) : userDataError ? (
            <Alert
              type="error"
              showIcon
              message="Gagal memuat data usia ibu"
              action={<Button size="small" danger onClick={() => refetchUserData()}>Coba Lagi</Button>}
            />
          ) : ageData.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="Belum ada data tanggal lahir atau usia ibu hamil."
            />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={ageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} label={{ value: 'Jumlah Ibu', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value: unknown) => `${value} ibu`} />
                <Bar dataKey="count" radius={[8, 8, 0, 0]} maxBarSize={56}>
                  {ageData.map((_, i) => <Cell key={i} fill="#FA6978" />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>
    </div>
  );

  // Section 3: Dashboard Analitik Skrining
  let dashboardContent;

  if (error && stuntingError) {
    dashboardContent = (
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold text-gray-900">Dashboard Analitik Skrining</h2>
        <Alert
          message="Gagal memuat data analitik skrining"
          description={
            error instanceof Error
              ? error.message
              : 'Terjadi kesalahan saat mengambil data. Silakan coba lagi.'
          }
          type="error"
          showIcon
          action={
            <Button size="small" danger onClick={() => { refetch(); refetchStunting(); }}>
              Coba Lagi
            </Button>
          }
        />
      </div>
    );
  } else if (!isLoading && !stuntingLoading && !hasAnyAnalytics) {
    dashboardContent = (
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Dashboard Analitik Skrining</h2>
          <p className="text-sm text-gray-600">
            Visualisasi hasil skrining Anemia, Depresi, dan Risiko Stunting dari ibu hamil.
          </p>
        </div>
        <Card className="shadow-sm">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <div className="space-y-1">
                <div className="font-medium text-gray-700">Belum ada hasil skrining kesehatan</div>
                <div className="text-xs text-gray-500 max-w-md mx-auto">
                  Grafik analitik akan tampil otomatis setelah ibu hamil menyelesaikan skrining Anemia, Depresi, atau Stunting melalui aplikasi Prenava.
                </div>
              </div>
            }
          />
        </Card>
      </div>
    );
  } else {
    dashboardContent = (
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Dashboard Analitik Skrining</h2>
          <p className="text-sm text-gray-600">
            Visualisasi hasil skrining Anemia, Depresi, dan Risiko Stunting dari ibu hamil.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {isLoading ? (
            <Card>
              <Skeleton active paragraph={{ rows: 6 }} />
            </Card>
          ) : (
            <DepressionAnalyticsCard
              data={depressionAnalytics}
              error={error}
            />
          )}

          {isLoading ? (
            <Card>
              <Skeleton active paragraph={{ rows: 6 }} />
            </Card>
          ) : (
            <AnemiaAnalyticsCard
              data={anemiaAnalytics}
              error={error}
            />
          )}

          {stuntingLoading ? (
            <Card>
              <Skeleton active paragraph={{ rows: 6 }} />
            </Card>
          ) : (
            <StuntingAnalyticsCard
              data={stuntingAnalytics}
              error={stuntingError}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <BidanLayout>
      <div className="flex flex-col gap-8">
        {appointmentSection}
        {userDataSection}
        {dashboardContent}
      </div>
    </BidanLayout>
  );
}
