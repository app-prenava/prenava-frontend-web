'use client';

import { Card, Statistic, Row, Col, Empty } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { StuntingAnalytics } from './bidan.api';

interface StuntingAnalyticsCardProps {
  data: StuntingAnalytics | undefined;
  error: Error | null;
}

const COLORS = ['#10B981', '#EF4444']; // Green for Rendah, Red for Tinggi

export default function StuntingAnalyticsCard({
  data,
  error,
}: StuntingAnalyticsCardProps) {
  if (error) {
    return (
      <Card title="Prediksi Stunting" className="shadow-sm">
        <Empty description="Gagal memuat data" />
      </Card>
    );
  }

  if (!data) {
    return (
      <Card title="Prediksi Stunting" className="shadow-sm">
        <Empty description="Tidak ada data" />
      </Card>
    );
  }

  const chartData = [
    { name: 'Rendah', count: data.riskCategories.rendah, fill: COLORS[0] },
    { name: 'Tinggi', count: data.riskCategories.tinggi, fill: COLORS[1] },
  ];

  const totalCases = data.totalPredictions;

  return (
    <Card title="Prediksi Stunting" className="shadow-sm">
      <div className="space-y-6">
        {/* Chart */}
        <div>
          {totalCases > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis label={{ value: 'Jumlah Kasus', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value: unknown) => `${value} kasus`} />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <Empty description="Tidak ada data prediksi stunting" />
          )}
        </div>

        {/* Summary Statistics */}
        <Row gutter={16}>
          <Col span={12}>
            <Statistic
              title="Rendah"
              value={data.riskCategories.rendah}
              valueStyle={{ color: '#10B981' }}
            />
          </Col>
          <Col span={12}>
            <Statistic
              title="Tinggi"
              value={data.riskCategories.tinggi}
              valueStyle={{ color: '#EF4444' }}
            />
          </Col>
        </Row>

        {/* Total Predictions */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">Total Prediksi Stunting</p>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-blue-600">{totalCases}</span>
            <span className="text-sm text-gray-500">ibu hamil</span>
          </div>
        </div>

        {/* Risk Distribution */}
        {totalCases > 0 && (
          <div className="border-t pt-4">
            <p className="text-sm font-semibold text-gray-700 mb-3">Distribusi Risiko Stunting</p>
            <div className="space-y-2">
              {chartData.map((item) => {
                const percentage = ((item.count / totalCases) * 100).toFixed(1);
                return (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.fill }} />
                      <span className="text-sm text-gray-600">{item.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      {item.count} ({percentage}%)
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
