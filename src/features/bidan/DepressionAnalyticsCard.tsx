'use client';

import { Card, Statistic, Row, Col, Tag, Empty } from 'antd';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import type { DepressionAnalytics } from './bidan.api';

interface DepressionAnalyticsCardProps {
  data: DepressionAnalytics | undefined;
  error: Error | null;
}

const COLORS = ['#10B981', '#EF4444'];

export default function DepressionAnalyticsCard({
  data,
  error,
}: DepressionAnalyticsCardProps) {
  if (error) {
    return (
      <Card
        title="Prediksi Depresi"
        bordered={false}
        className="shadow-sm"
      >
        <Empty description="Gagal memuat data" />
      </Card>
    );
  }

  if (!data) {
    return (
      <Card
        title="Prediksi Depresi"
        bordered={false}
        className="shadow-sm"
      >
        <Empty description="Tidak ada data" />
      </Card>
    );
  }

  const pieData = [
    { name: 'Aman/Normal', value: data.summary.safe },
    { name: 'Terdeteksi Depresi', value: data.summary.detected },
  ];

  const totalCases = data.summary.safe + data.summary.detected;
  const detectionRate = totalCases > 0 
    ? ((data.summary.detected / totalCases) * 100).toFixed(1)
    : '0';

  return (
    <Card
      title="Prediksi Depresi"
      bordered={false}
      className="shadow-sm"
    >
      <div className="space-y-6">
        {/* Chart */}
        <div className="flex justify-center">
          {totalCases > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => `${value} kasus`}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <Empty description="Tidak ada data prediksi depresi" />
          )}
        </div>

        {/* Summary Statistics */}
        <Row gutter={16}>
          <Col span={12}>
            <Statistic
              title="Aman/Normal"
              value={data.summary.safe}
              valueStyle={{ color: '#10B981' }}
              suffix="kasus"
            />
          </Col>
          <Col span={12}>
            <Statistic
              title="Terdeteksi Depresi"
              value={data.summary.detected}
              valueStyle={{ color: '#EF4444' }}
              suffix="kasus"
            />
          </Col>
        </Row>

        {/* Detection Rate */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">Tingkat Deteksi Depresi</p>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-blue-600">{detectionRate}%</span>
            <span className="text-sm text-gray-500">dari {totalCases} ibu hamil</span>
          </div>
        </div>

        {/* Expression Scores */}
        {data.expressionScores && (
          <div className="border-t pt-4">
            <p className="text-sm font-semibold text-gray-700 mb-3">Rata-rata Skor Ekspresi</p>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(data.expressionScores).map(([emotion, score]) => (
                <div key={emotion} className="text-center p-2 bg-gray-50 rounded">
                  <p className="text-xs text-gray-600">{emotion}</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {(score * 100).toFixed(1)}%
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Overall Score */}
        {data.overallScore !== undefined && (
          <div className="border-t pt-4">
            <p className="text-sm font-semibold text-gray-700 mb-2">Skor Keseluruhan</p>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{data.overallScore.toFixed(2)}</span>
              <Tag color={data.overallScore > 50 ? 'red' : 'green'}>
                {data.overallScore > 50 ? 'Indikasi Depresi' : 'Aman'}
              </Tag>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
