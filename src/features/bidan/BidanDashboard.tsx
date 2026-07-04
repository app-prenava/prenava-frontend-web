'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, Skeleton, Alert, Button, Empty } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import BidanLayout from './components/BidanLayout';
import { getHealthHistory, aggregateDepressionAnalytics, aggregateAnemiaAnalytics } from './bidan.api';
import DepressionAnalyticsCard from './DepressionAnalyticsCard.tsx';
import AnemiaAnalyticsCard from './AnemiaAnalyticsCard.tsx';

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

  if (error) {
    return (
      <BidanLayout>
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
      </BidanLayout>
    );
  }

  if (!isLoading && (!healthHistoryResponse?.data || healthHistoryResponse.data.length === 0)) {
    return (
      <BidanLayout>
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
      </BidanLayout>
    );
  }

  return (
    <BidanLayout>
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
        </div>
      </div>
    </BidanLayout>
  );
}
