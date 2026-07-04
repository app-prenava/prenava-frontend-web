'use client';

import { Card, Statistic, Row, Col, Empty } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { AnemiaAnalytics } from './bidan.api';

interface AnemiaAnalyticsCardProps {
  data: AnemiaAnalytics | undefined;
  error: Error | null;
}

const COLORS = ['#EF4444', '#10B981']; // Red for anemia, Green for non-anemia

export default function AnemiaAnalyticsCard({
  data,
  error,
}: AnemiaAnalyticsCardProps) {
  if (error) {
    return (
      <Card title="Deteksi Anemia" bordered={false} className="shadow-sm">
        <Empty description="Gagal memuat data" />
      </Card>
    );
  }

  if (!data) {
    return (
      <Card title="Deteksi Anemia" bordered={false} className="shadow-sm">
        <Empty description="Tidak ada data" />
      </Card>
    );
  }

  // Extract anemia and non-anemia counts
  // Note: anemia_sedang field stores non-anemia count (2-category system)
  const anemiaCount = data.categories.anemia;
  const nonAnemiaCount = data.categories.anemia_sedang;
  const totalCases = anemiaCount + nonAnemiaCount;

  const chartData = [
    { name: 'Anemia', count: anemiaCount, fill: COLORS[0] },
    { name: 'Tidak Anemia', count: nonAnemiaCount, fill: COLORS[1] },
  ];

  return (
    <Card title="Deteksi Anemia" bordered={false} className="shadow-sm">
      <div className="space-y-6">
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
            <Empty description="Tidak ada data deteksi anemia" />
          )}
        </div>

        <Row gutter={16}>
          <Col span={12}>
            <Statistic title="Anemia" value={anemiaCount} valueStyle={{ color: '#EF4444' }} />
          </Col>
          <Col span={12}>
            <Statistic title="Tidak Anemia" value={nonAnemiaCount} valueStyle={{ color: '#10B981' }} />
          </Col>
        </Row>

        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">Total Kasus Deteksi</p>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-blue-600">{totalCases}</span>
            <span className="text-sm text-gray-500">ibu hamil</span>
          </div>
        </div>

        {totalCases > 0 && (
          <div className="border-t pt-4">
            <p className="text-sm font-semibold text-gray-700 mb-3">Distribusi Hasil Deteksi</p>
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
