'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, Skeleton, Alert, Button, Empty, Tag } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useTriageQueue } from './triage.api';
import BidanLayout from './components/BidanLayout';
import {
  getHealthHistory,
  aggregateDepressionAnalytics,
  aggregateAnemiaAnalytics,
  getStuntingHistory,
  aggregateStuntingAnalytics,
  getUserDataAgeLmp,
} from './bidan.api';
import DepressionAnalyticsCard from './DepressionAnalyticsCard.tsx';
import AnemiaAnalyticsCard from './AnemiaAnalyticsCard.tsx';
import StuntingAnalyticsCard from './StuntingAnalyticsCard.tsx';

export default function BidanDashboard() {
  const { data: triageResponse } = useTriageQueue();
  const criticalRedCount = triageResponse?.summary?.critical_red || 0;
  const warningYellowCount = triageResponse?.summary?.warning_yellow || 0;
  const stableGreenCount = triageResponse?.summary?.stable_green || 0;
  const totalTriagePatients = triageResponse?.total_patients || 0;
  const {
    data: healthHistoryResponse,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['healthHistory'],
    queryFn: getHealthHistory,
    staleTime: 5 * 60 * 1000,
    retry: 3,
  });

  const {
    data: stuntingHistoryResponse,
    isLoading: stuntingLoading,
    error: stuntingError,
  } = useQuery({
    queryKey: ['stuntingHistory'],
    queryFn: getStuntingHistory,
    staleTime: 5 * 60 * 1000,
    retry: 3,
  });

  // ===== Query baru: Data Pengguna Prenava (independen dari data existing) =====
  const {
    data: userDataResponse,
    isLoading: userDataLoading,
    error: userDataError,
    refetch: refetchUserData,
  } = useQuery({
    queryKey: ['userDataAgeLmp'],
    queryFn: getUserDataAgeLmp,
    staleTime: 5 * 60 * 1000,
    retry: 3,
  });

  const gestationalData = (userDataResponse?.data.gestational_age_distribution ?? []).map((d) => ({
    name: `${d.gestational_age_weeks} mgg`,
    count: d.total,
  }));
  const ageData = (userDataResponse?.data.age_distribution ?? []).map((d) => ({
    name: `${d.age} th`,
    count: d.total,
  }));
  const gestationalTotal = gestationalData.reduce((s, d) => s + d.count, 0);
  const ageTotal = ageData.reduce((s, d) => s + d.count, 0);

  // ===== Logika analitik existing (TIDAK diubah) =====
  const depressionAnalytics = healthHistoryResponse?.data
    ? (() => {
        console.log('[DASHBOARD] Computing depression analytics from', healthHistoryResponse.data.length, 'records');
        const result = aggregateDepressionAnalytics(healthHistoryResponse.data);
        console.log('[DASHBOARD] Depression analytics result:', result);
        return result;
      })()
    : undefined;

  const anemiaAnalytics = healthHistoryResponse?.data
    ? (() => {
        console.log('[DASHBOARD] Computing anemia analytics from', healthHistoryResponse.data.length, 'records');
        const result = aggregateAnemiaAnalytics(healthHistoryResponse.data);
        console.log('[DASHBOARD] Anemia analytics result:', result);
        return result;
      })()
    : undefined;

  const stuntingAnalytics = stuntingHistoryResponse?.data
    ? (() => {
        console.log('[DASHBOARD] Computing stunting analytics from', stuntingHistoryResponse.data?.length || 0, 'records');
        const result = aggregateStuntingAnalytics(stuntingHistoryResponse.data || []);
        console.log('[DASHBOARD] Stunting analytics result:', result);
        return result;
      })()
    : undefined;

  // ===== Section atas: Data Pengguna Prenava (2 diagram batang) =====
  const userDataSection = (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-semibold text-gray-900">Data Pengguna Prenava</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title={`Usia Kehamilan Dalam Minggu (Total: ${gestationalTotal} ibu hamil)`} className="shadow-sm">
          {userDataLoading ? (
            <Skeleton active paragraph={{ rows: 6 }} />
          ) : userDataError ? (
            <Alert
              type="error"
              showIcon
              message="Gagal memuat data pengguna"
              action={<Button size="small" danger onClick={() => refetchUserData()}>Coba Lagi</Button>}
            />
          ) : gestationalData.length === 0 ? (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Belum ada data usia kehamilan" />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={gestationalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} label={{ value: 'Jumlah Ibu', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value: unknown) => `${value} ibu hamil`} />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {gestationalData.map((_, i) => <Cell key={i} fill="#FA6978" />)}
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
              message="Gagal memuat data pengguna"
              action={<Button size="small" danger onClick={() => refetchUserData()}>Coba Lagi</Button>}
            />
          ) : ageData.length === 0 ? (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Belum ada data usia ibu" />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} label={{ value: 'Jumlah Ibu', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value: unknown) => `${value} ibu`} />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {ageData.map((_, i) => <Cell key={i} fill="#FA6978" />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>
    </div>
  );

  // ===== Konten bawah: dashboard analitik existing (kondisi & isi tidak diubah) =====
  let dashboardContent;

  if (error) {
    dashboardContent = (
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-semibold text-gray-900">Dashboard Analitik</h1>
        <Alert
          message="Gagal memuat data analytics"
          description={
            error instanceof Error
              ? error.message
              : 'Terjadi kesalahan saat mengambil data. Silakan coba lagi.'
          }
          type="error"
          showIcon
          action={
            <Button size="small" danger onClick={() => refetch()}>
              Coba Lagi
            </Button>
          }
        />
        <Alert
          message="Debug Info"
          description="Buka browser console (F12) untuk melihat error details"
          type="info"
          showIcon
        />
      </div>
    );
  } else if (!isLoading && (!healthHistoryResponse?.data || healthHistoryResponse.data.length === 0)) {
    dashboardContent = (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">Dashboard Analitik</h1>
            <p className="text-gray-600">Visualisasi data kesehatan ibu hamil</p>
          </div>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => refetch()}
            loading={isLoading}
          >
            Refresh
          </Button>
        </div>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Tidak ada data prediksi tersedia"
        />
        <Alert
          message="Info"
          description="Jika data sudah ada di database, cek console browser (F12) untuk error details"
          type="info"
          showIcon
        />
      </div>
    );
  } else {
    dashboardContent = (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">Dashboard Analitik</h1>
            <p className="text-gray-600">Visualisasi data kesehatan ibu hamil</p>
          </div>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => refetch()}
            loading={isLoading}
          >
            Refresh
          </Button>
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
                {/* CDSS Clinical Triage Overview Card */}
        <Card
          className="shadow-sm border border-gray-200 rounded-xl"
          bodyStyle={{ padding: '20px 24px' }}
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FA6978]" />
                <h2 className="text-lg font-semibold text-gray-900 m-0">
                  Prioritas Triase Klinis Maternal (CDSS)
                </h2>
                <Tag color={criticalRedCount > 0 ? 'error' : 'success'} className="font-medium ml-1">
                  {criticalRedCount > 0 ? `${criticalRedCount} Butuh Intervensi Segera` : 'Status Pasien Terkendali'}
                </Tag>
              </div>
              <p className="text-sm text-gray-600 m-0 max-w-3xl leading-relaxed">
                Pemantauan risiko terpadu berbasis fusi cerdas 4 dimensi: Prediksi Stunting (35%), Skrining Anemia Konjungtiva (30%), Tekanan Darah/MAP (20%), dan Kepatuhan Piring Gizi (15%).
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-50 border border-red-200 text-xs">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="text-gray-600">Gawat (Merah):</span>
                  <span className="font-bold text-red-700">{criticalRedCount}</span>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-xs">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="text-gray-600">Waspada (Kuning):</span>
                  <span className="font-bold text-amber-700">{warningYellowCount}</span>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-gray-600">Stabil (Hijau):</span>
                  <span className="font-bold text-emerald-700">{stableGreenCount}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/bidan/triage"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FA6978] hover:bg-[#e85867] text-white font-medium text-sm rounded-lg transition duration-150 shadow-sm"
              >
                <span>Buka Antrean Triase ({totalTriagePatients})</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </Card>
        {userDataSection}
        {dashboardContent}
      </div>
    </BidanLayout>
  );
}