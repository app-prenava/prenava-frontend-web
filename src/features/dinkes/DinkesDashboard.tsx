import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Alert,
  Button,
  Card,
  Empty,
  Input,
  Skeleton,
  Statistic,
  Table,
  Tag,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  EnvironmentOutlined,
  HeartOutlined,
  MedicineBoxOutlined,
  ReloadOutlined,
  SearchOutlined,
  TeamOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import DinkesLayout from './components/DinkesLayout';
import { getDinkesDashboard, type DinkesDistrictStat } from './dinkes.api';

const TRIMESTER_COLORS = ['#FA6978', '#F59E0B', '#10B981', '#6366F1', '#9CA3AF'];

export default function DinkesDashboard() {
  const [districtSearch, setDistrictSearch] = useState('');

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['dinkesDashboard'],
    queryFn: getDinkesDashboard,
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });

  const trimesterChartData = useMemo(() => {
    if (!data) return [];
    const t = data.trimester_distribution;
    return [
      { name: 'Trimester 1', value: t.trimester_1 },
      { name: 'Trimester 2', value: t.trimester_2 },
      { name: 'Trimester 3', value: t.trimester_3 },
      { name: 'Pasca Melahirkan', value: t.pasca_melahirkan },
      { name: 'Belum Diisi', value: t.belum_diisi },
    ].filter((item) => item.value > 0);
  }, [data]);

  const riskChartData = useMemo(() => {
    if (!data) return [];
    const r = data.risk_distribution;
    return [
      {
        name: 'Anemia',
        Berisiko: r.anemia.anemia,
        Aman: r.anemia.non_anemia,
        'Belum Skrining': r.anemia.belum_skrining,
      },
      {
        name: 'Depresi',
        Berisiko: r.depression.detected,
        Aman: r.depression.safe,
        'Belum Skrining': r.depression.belum_skrining,
      },
      {
        name: 'Stunting',
        Berisiko: r.stunting.tinggi,
        Aman: r.stunting.rendah,
        'Belum Skrining': r.stunting.belum_skrining,
      },
    ];
  }, [data]);

  const topDistrictChartData = useMemo(() => {
    if (!data) return [];
    return [...data.by_district]
      .filter((d) => d.ibu_hamil_count > 0 || d.pmb_count > 0)
      .sort((a, b) => b.ibu_hamil_count - a.ibu_hamil_count)
      .slice(0, 12)
      .map((d) => ({
        name: d.district_name,
        'Ibu Hamil': d.ibu_hamil_count,
        'PMB Mitra': d.pmb_count,
      }));
  }, [data]);

  const filteredDistricts = useMemo(() => {
    if (!data) return [];
    const q = districtSearch.trim().toLowerCase();
    if (!q) return data.by_district;
    return data.by_district.filter((d) => d.district_name.toLowerCase().includes(q));
  }, [data, districtSearch]);

  const columns: ColumnsType<DinkesDistrictStat> = [
    {
      title: 'Kecamatan',
      dataIndex: 'district_name',
      key: 'district_name',
      sorter: (a, b) => a.district_name.localeCompare(b.district_name),
      render: (name: string) => <span className="font-medium text-gray-900">{name}</span>,
    },
    {
      title: 'Ibu Hamil',
      dataIndex: 'ibu_hamil_count',
      key: 'ibu_hamil_count',
      sorter: (a, b) => a.ibu_hamil_count - b.ibu_hamil_count,
      defaultSortOrder: 'descend',
    },
    {
      title: 'PMB Mitra Terverifikasi',
      dataIndex: 'pmb_count',
      key: 'pmb_count',
      sorter: (a, b) => a.pmb_count - b.pmb_count,
      render: (count: number, row) =>
        count === 0 && row.ibu_hamil_count > 0 ? (
          <Tag color="warning">0 PMB (Perlu Mitra)</Tag>
        ) : (
          <Tag color={count > 0 ? 'green' : 'default'}>{count} PMB</Tag>
        ),
    },
    {
      title: 'T1 / T2 / T3',
      key: 'trimesters',
      render: (_, row) => (
        <span className="text-xs text-gray-700">
          {row.trimester_1} / {row.trimester_2} / {row.trimester_3}
        </span>
      ),
    },
    {
      title: 'Anemia',
      dataIndex: 'risk_anemia',
      key: 'risk_anemia',
      sorter: (a, b) => a.risk_anemia - b.risk_anemia,
    },
    {
      title: 'Depresi',
      dataIndex: 'risk_depression',
      key: 'risk_depression',
      sorter: (a, b) => a.risk_depression - b.risk_depression,
    },
    {
      title: 'Risiko Stunting',
      dataIndex: 'risk_stunting',
      key: 'risk_stunting',
      sorter: (a, b) => a.risk_stunting - b.risk_stunting,
    },
    {
      title: 'Ibu Berisiko',
      dataIndex: 'high_risk_ibu_count',
      key: 'high_risk_ibu_count',
      sorter: (a, b) => a.high_risk_ibu_count - b.high_risk_ibu_count,
      render: (val: number) =>
        val > 0 ? <Tag color="error">{val} ibu</Tag> : <span className="text-gray-400">0</span>,
    },
  ];

  const errorMessage =
    (error as any)?.response?.data?.message ||
    (error instanceof Error ? error.message : 'Gagal memuat data dashboard Dinkes.');

  return (
    <DinkesLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Tag color="pink" icon={<EnvironmentOutlined />}>
                {data
                  ? `${data.region.regency_name}, ${data.region.province_name}`
                  : 'Wilayah Kabupaten/Kota'}
              </Tag>
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
              Dashboard Agregasi Kesehatan Ibu Hamil
            </h1>
            <p className="text-gray-600 text-sm">
              Data teragregasi khusus wilayah kerja Dinas Kesehatan Kabupaten/Kota Anda
            </p>
          </div>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => refetch()}
            loading={isFetching}
          >
            Muat Ulang
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((n) => (
                <Card key={n}>
                  <Skeleton active paragraph={{ rows: 1 }} />
                </Card>
              ))}
            </div>
            <Card>
              <Skeleton active paragraph={{ rows: 6 }} />
            </Card>
          </div>
        ) : error ? (
          <Alert
            type="error"
            showIcon
            message="Tidak dapat memuat Dashboard Dinkes"
            description={errorMessage}
            action={
              <Button size="small" danger onClick={() => refetch()}>
                Coba Lagi
              </Button>
            }
          />
        ) : data ? (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="shadow-sm">
                <Statistic
                  title="Total Ibu Hamil Terdaftar"
                  value={data.summary.total_ibu_hamil}
                  prefix={<TeamOutlined style={{ color: '#FA6978' }} />}
                  suffix="ibu"
                />
              </Card>
              <Card className="shadow-sm">
                <Statistic
                  title="PMB Mitra Terverifikasi"
                  value={data.summary.total_pmb_verified}
                  prefix={<MedicineBoxOutlined style={{ color: '#10B981' }} />}
                  suffix="klinik"
                />
              </Card>
              <Card className="shadow-sm">
                <Statistic
                  title="Kecamatan Tercakup"
                  value={data.summary.total_districts_covered}
                  prefix={<EnvironmentOutlined style={{ color: '#3B82F6' }} />}
                  suffix={`/ ${data.summary.total_districts}`}
                />
              </Card>
              <Card className="shadow-sm">
                <Statistic
                  title="Ibu Hamil Terdeteksi Berisiko"
                  value={data.summary.ibu_hamil_high_risk}
                  prefix={<WarningOutlined style={{ color: '#EF4444' }} />}
                  suffix="ibu"
                />
              </Card>
            </div>

            {/* Trimester & Risk Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card title="Distribusi Trimester Kehamilan" className="shadow-sm">
                {trimesterChartData.length === 0 ? (
                  <Empty description="Belum ada data ibu hamil di wilayah ini" />
                ) : (
                  <ResponsiveContainer width="100%" height={290}>
                    <PieChart>
                      <Pie
                        data={trimesterChartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={95}
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {trimesterChartData.map((_, idx) => (
                          <Cell
                            key={idx}
                            fill={TRIMESTER_COLORS[idx % TRIMESTER_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip formatter={(val: unknown) => `${val} ibu`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </Card>

              <Card
                title={
                  <span>
                    <HeartOutlined className="mr-1.5 text-pink-500" />
                    Distribusi Risiko Kesehatan (Skrining Terbaru per Ibu)
                  </span>
                }
                className="shadow-sm"
              >
                {data.summary.total_ibu_hamil === 0 ? (
                  <Empty description="Belum ada data skrining di wilayah ini" />
                ) : (
                  <ResponsiveContainer width="100%" height={290}>
                    <BarChart data={riskChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="Berisiko" fill="#EF4444" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="Aman" fill="#10B981" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="Belum Skrining" fill="#CBD5E1" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </Card>
            </div>

            {/* District comparison chart */}
            {topDistrictChartData.length > 0 && (
              <Card
                title="Sebaran Ibu Hamil vs PMB Mitra per Kecamatan (Teratas)"
                className="shadow-sm"
              >
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topDistrictChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" interval={0} angle={-15} textAnchor="end" height={60} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Ibu Hamil" fill="#FA6978" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="PMB Mitra" fill="#10B981" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            )}

            {/* Breakdown Table per Kecamatan */}
            <Card
              title={`Rekapitulasi per Kecamatan — ${data.region.regency_name}`}
              className="shadow-sm"
              extra={
                <Input
                  placeholder="Cari kecamatan..."
                  prefix={<SearchOutlined />}
                  value={districtSearch}
                  onChange={(e) => setDistrictSearch(e.target.value)}
                  allowClear
                  style={{ width: 240 }}
                />
              }
            >
              <Table<DinkesDistrictStat>
                columns={columns}
                dataSource={filteredDistricts}
                rowKey="district_code"
                scroll={{ x: 800 }}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showTotal: (total) => `Total ${total} kecamatan`,
                }}
              />
            </Card>
          </>
        ) : null}
      </div>
    </DinkesLayout>
  );
}
