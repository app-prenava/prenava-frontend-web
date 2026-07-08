'use client';

import { Card, Empty } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { AgeAndGestationalAnalytics } from './bidan.api';

interface AgeAnalyticsCardProps {
  data: AgeAndGestationalAnalytics | undefined;
  error: Error | null;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6'];

export default function AgeAnalyticsCard({
  data,
  error,
}: AgeAnalyticsCardProps) {
  if (error) {
    return (
      <Card title="Distribusi Umur Ibu Hamil" className="shadow-sm">
        <Empty description="Gagal memuat data" />
      </Card>
    );
  }

  if (!data || !data.ageData || data.ageData.length === 0) {
    return (
      <Card title="Distribusi Umur Ibu Hamil" className="shadow-sm">
        <Empty description="Tidak ada data" />
      </Card>
    );
  }

  // Transform data for chart: show total for each age
  const chartData = data.ageData.map((item) => ({
    age: `${item.age} tahun`,
    total: item.total,
  }));

  const totalPeople = data.ageData.reduce((sum, item) => sum + item.total, 0);
  const avgAge = Math.round(
    data.ageData.reduce((sum, item) => sum + item.age * item.total, 0) / totalPeople
  );

  return (
    <Card title="Distribusi Umur Ibu Hamil" className="shadow-sm">
      <div className="space-y-6">
        {/* Chart */}
        <div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="age" angle={-45} textAnchor="end" height={80} />
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
            <Empty description="Tidak ada data distribusi umur" />
          )}
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Total Ibu Hamil</p>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-blue-600">{totalPeople}</span>
              <span className="text-sm text-gray-500">orang</span>
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Rata-rata Umur</p>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-green-600">{avgAge}</span>
              <span className="text-sm text-gray-500">tahun</span>
            </div>
          </div>
        </div>

        {/* Age Distribution Table */}
        {data.ageData.length > 0 && (
          <div className="border-t pt-4">
            <p className="text-sm font-semibold text-gray-700 mb-3">Detail Distribusi Umur</p>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {data.ageData.map((item, index) => {
                const percentage = ((item.total / totalPeople) * 100).toFixed(1);
                return (
                  <div key={`age-${item.age}-${index}`} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-sm text-gray-600 font-medium">{item.age} tahun</span>
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
