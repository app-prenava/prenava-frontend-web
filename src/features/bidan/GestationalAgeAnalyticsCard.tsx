'use client';

import { Card, Empty } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { AgeAndGestationalAnalytics } from './bidan.api';

interface GestationalAgeAnalyticsCardProps {
  data: AgeAndGestationalAnalytics | undefined;
  error: Error | null;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6'];

export default function GestationalAgeAnalyticsCard({
  data,
  error,
}: GestationalAgeAnalyticsCardProps) {
  if (error) {
    return (
      <Card title="Distribusi Usia Kehamilan" className="shadow-sm">
        <Empty description="Gagal memuat data" />
      </Card>
    );
  }

  if (!data || !data.gestationalAgeData || data.gestationalAgeData.length === 0) {
    return (
      <Card title="Distribusi Usia Kehamilan" className="shadow-sm">
        <Empty description="Tidak ada data" />
      </Card>
    );
  }

  // Transform data for chart
  const chartData = data.gestationalAgeData.map((item) => ({
    weeks: `${item.gestational_age_weeks} minggu`,
    total: item.total,
  }));

  const totalPeople = data.gestationalAgeData.reduce((sum, item) => sum + item.total, 0);
  const avgWeeks = Math.round(
    data.gestationalAgeData.reduce((sum, item) => sum + item.gestational_age_weeks * item.total, 0) / totalPeople
  );

  // Categorize by trimester
  const triMester1 = data.gestationalAgeData
    .filter((item) => item.gestational_age_weeks <= 12)
    .reduce((sum, item) => sum + item.total, 0);
  const trimester2 = data.gestationalAgeData
    .filter((item) => item.gestational_age_weeks > 12 && item.gestational_age_weeks <= 27)
    .reduce((sum, item) => sum + item.total, 0);
  const trimester3 = data.gestationalAgeData
    .filter((item) => item.gestational_age_weeks > 27)
    .reduce((sum, item) => sum + item.total, 0);

  return (
    <Card title="Distribusi Usia Kehamilan" className="shadow-sm">
      <div className="space-y-6">
        {/* Chart */}
        <div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="weeks" angle={-45} textAnchor="end" height={80} />
                <YAxis label={{ value: 'Jumlah Orang', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value: unknown) => `${value} orang`} />
                <Bar dataKey="total" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <Empty description="Tidak ada data distribusi usia kehamilan" />
          )}
        </div>

        {/* Summary Statistics by Trimester */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-purple-50 p-3 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">Trimester 1</p>
            <p className="text-lg font-bold text-purple-600">
              {triMester1}
              <span className="text-xs text-gray-500 ml-1">orang</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">(≤12 minggu)</p>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">Trimester 2</p>
            <p className="text-lg font-bold text-blue-600">
              {trimester2}
              <span className="text-xs text-gray-500 ml-1">orang</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">(13-27 minggu)</p>
          </div>
          <div className="bg-orange-50 p-3 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">Trimester 3</p>
            <p className="text-lg font-bold text-orange-600">
              {trimester3}
              <span className="text-xs text-gray-500 ml-1">orang</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">(minggu ke-27+)</p>
          </div>
        </div>

        {/* Average Gestational Age */}
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">Rata-rata Usia Kehamilan</p>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-green-600">{avgWeeks}</span>
            <span className="text-sm text-gray-500">minggu</span>
          </div>
        </div>

        {/* Age Distribution Table */}
        {data.gestationalAgeData.length > 0 && (
          <div className="border-t pt-4">
            <p className="text-sm font-semibold text-gray-700 mb-3">Detail Distribusi Usia Kehamilan</p>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {data.gestationalAgeData.map((item, index) => {
                const percentage = ((item.total / totalPeople) * 100).toFixed(1);
                let trimesterLabel = '';
                if (item.gestational_age_weeks <= 12) {
                  trimesterLabel = 'T1';
                } else if (item.gestational_age_weeks <= 27) {
                  trimesterLabel = 'T2';
                } else {
                  trimesterLabel = 'T3';
                }
                return (
                  <div key={`gestational-${item.gestational_age_weeks}-${index}`} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <div>
                        <span className="text-sm text-gray-600 font-medium">{item.gestational_age_weeks} minggu</span>
                        <span className="text-xs text-gray-400 ml-2">({trimesterLabel})</span>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      {item.total} ({percentage}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
