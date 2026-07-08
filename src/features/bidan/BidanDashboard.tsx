'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, Skeleton, Alert, Button, Empty } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
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
        {userDataSection}
        {dashboardContent}
      </div>
    </BidanLayout>
  );
}