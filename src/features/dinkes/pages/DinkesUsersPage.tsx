import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Alert,
  Button,
  Card,
  Empty,
  Input,
  Select,
  Skeleton,
  Table,
  Tabs,
  Tag,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  CheckCircleOutlined,
  EnvironmentOutlined,
  MedicineBoxOutlined,
  ReloadOutlined,
  SearchOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import {
  getDinkesUsers,
  type DinkesBidanItem,
  type DinkesIbuHamilItem,
} from '../dinkes.api';

function renderRiskTag(status: 'berisiko' | 'aman' | 'belum_skrining') {
  if (status === 'berisiko') {
    return <Tag color="error">Berisiko</Tag>;
  }
  if (status === 'aman') {
    return <Tag color="success">Aman</Tag>;
  }
  return <Tag color="default">Belum Skrining</Tag>;
}

export default function DinkesUsersPage() {
  const [searchText, setSearchText] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState<string | undefined>(undefined);

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['dinkesUsers'],
    queryFn: getDinkesUsers,
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });

  const filteredIbuHamil = useMemo(() => {
    if (!data) return [];
    const q = searchText.trim().toLowerCase();
    return data.ibu_hamil.filter((item) => {
      const matchDistrict = !selectedDistrict || item.district_code === selectedDistrict;
      const matchQuery =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.email.toLowerCase().includes(q) ||
        item.district_name.toLowerCase().includes(q);
      return matchDistrict && matchQuery;
    });
  }, [data, searchText, selectedDistrict]);

  const filteredBidans = useMemo(() => {
    if (!data) return [];
    const q = searchText.trim().toLowerCase();
    return data.bidans.filter((item) => {
      const matchDistrict = !selectedDistrict || item.district_code === selectedDistrict;
      const matchQuery =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.email.toLowerCase().includes(q) ||
        (item.tempat_praktik || '').toLowerCase().includes(q) ||
        item.district_name.toLowerCase().includes(q);
      return matchDistrict && matchQuery;
    });
  }, [data, searchText, selectedDistrict]);

  const ibuColumns: ColumnsType<DinkesIbuHamilItem> = [
    {
      title: 'Nama Ibu Hamil',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, row) => (
        <div>
          <div className="font-medium text-gray-900">{name}</div>
          <div className="text-xs text-gray-500">{row.email}</div>
        </div>
      ),
    },
    {
      title: 'Kecamatan',
      dataIndex: 'district_name',
      key: 'district_name',
      sorter: (a, b) => a.district_name.localeCompare(b.district_name),
    },
    {
      title: 'Usia',
      dataIndex: 'age',
      key: 'age',
      width: 90,
      render: (age: number | null) => (age ? `${age} th` : '-'),
    },
    {
      title: 'Trimester',
      dataIndex: 'trimester',
      key: 'trimester',
      render: (val: string) => <Tag color="magenta">{val}</Tag>,
    },
    {
      title: 'Anemia',
      dataIndex: 'risk_anemia',
      key: 'risk_anemia',
      render: (val: DinkesIbuHamilItem['risk_anemia']) => renderRiskTag(val),
    },
    {
      title: 'Depresi',
      dataIndex: 'risk_depression',
      key: 'risk_depression',
      render: (val: DinkesIbuHamilItem['risk_depression']) => renderRiskTag(val),
    },
    {
      title: 'Stunting',
      dataIndex: 'risk_stunting',
      key: 'risk_stunting',
      render: (val: DinkesIbuHamilItem['risk_stunting']) => renderRiskTag(val),
    },
    {
      title: 'Status Akun',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 110,
      render: (active: boolean) => (
        <Tag color={active ? 'success' : 'default'}>{active ? 'Aktif' : 'Nonaktif'}</Tag>
      ),
    },
  ];

  const bidanColumns: ColumnsType<DinkesBidanItem> = [
    {
      title: 'Praktik / Bidan',
      dataIndex: 'tempat_praktik',
      key: 'tempat_praktik',
      render: (tempat: string | null, row) => (
        <div>
          <div className="font-medium text-gray-900">{tempat || row.name}</div>
          <div className="text-xs text-gray-500">
            {row.name} ({row.email})
          </div>
        </div>
      ),
    },
    {
      title: 'Kecamatan',
      dataIndex: 'district_name',
      key: 'district_name',
      sorter: (a, b) => a.district_name.localeCompare(b.district_name),
    },
    {
      title: 'Legalitas STR / SIPB',
      key: 'legalitas',
      render: (_, row) => (
        <div className="text-xs text-gray-700 space-y-0.5">
          <div>STR: {row.str_number || '-'}</div>
          <div>SIPB: {row.sip_number || '-'}</div>
        </div>
      ),
    },
    {
      title: 'Kontak',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone: string | null) => phone || '-',
    },
    {
      title: 'Status Kemitraan',
      key: 'status',
      render: (_, row) =>
        row.is_verified_partner && row.is_active ? (
          <Tag icon={<CheckCircleOutlined />} color="success">
            Mitra Terverifikasi
          </Tag>
        ) : (
          <Tag color="default">Belum Aktif</Tag>
        ),
    },
  ];

  const errorMessage =
    (error as any)?.response?.data?.message ||
    (error instanceof Error ? error.message : 'Gagal memuat data pengguna wilayah.');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Tag color="pink" icon={<EnvironmentOutlined />} style={{ marginInlineEnd: 0 }}>
              {data
                ? `${data.region.regency_name}, ${data.region.province_name}`
                : 'Wilayah Kabupaten/Kota'}
            </Tag>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Data Pengguna Wilayah
          </h1>
          <p className="text-sm text-gray-600">
            Daftar ibu hamil dan Praktik Mandiri Bidan (PMB) mitra yang terdaftar di wilayah kerja Anda.
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
        <Card className="shadow-sm">
          <Skeleton active paragraph={{ rows: 6 }} />
        </Card>
      ) : error ? (
        <Alert
          type="error"
          showIcon
          message="Tidak dapat memuat daftar pengguna"
          description={errorMessage}
          action={
            <Button size="small" danger onClick={() => refetch()}>
              Coba Lagi
            </Button>
          }
        />
      ) : data ? (
        <Card className="shadow-sm">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <Input
              placeholder="Cari nama, email, praktik, atau kecamatan..."
              prefix={<SearchOutlined className="text-gray-400" />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              className="sm:max-w-sm"
            />
            <Select
              allowClear
              showSearch
              placeholder="Filter Kecamatan"
              optionFilterProp="label"
              value={selectedDistrict}
              onChange={(val) => setSelectedDistrict(val)}
              className="w-full sm:w-64"
              options={data.districts.map((d) => ({ value: d.code, label: d.name }))}
            />
          </div>

          <Tabs
            defaultActiveKey="ibu_hamil"
            items={[
              {
                key: 'ibu_hamil',
                label: (
                  <span className="inline-flex items-center gap-1.5">
                    <TeamOutlined />
                    Ibu Hamil ({filteredIbuHamil.length})
                  </span>
                ),
                children: (
                  <Table<DinkesIbuHamilItem>
                    columns={ibuColumns}
                    dataSource={filteredIbuHamil}
                    rowKey="user_id"
                    scroll={{ x: 860 }}
                    locale={{
                      emptyText: (
                        <Empty
                          image={Empty.PRESENTED_IMAGE_SIMPLE}
                          description={
                            searchText || selectedDistrict
                              ? 'Tidak ada ibu hamil yang sesuai dengan filter.'
                              : 'Belum ada ibu hamil yang terdaftar di wilayah ini.'
                          }
                        />
                      ),
                    }}
                    pagination={{
                      pageSize: 10,
                      showSizeChanger: true,
                      showTotal: (total) => `Total ${total} ibu hamil`,
                    }}
                  />
                ),
              },
              {
                key: 'bidans',
                label: (
                  <span className="inline-flex items-center gap-1.5">
                    <MedicineBoxOutlined />
                    PMB Mitra ({filteredBidans.length})
                  </span>
                ),
                children: (
                  <Table<DinkesBidanItem>
                    columns={bidanColumns}
                    dataSource={filteredBidans}
                    rowKey="user_id"
                    scroll={{ x: 800 }}
                    locale={{
                      emptyText: (
                        <Empty
                          image={Empty.PRESENTED_IMAGE_SIMPLE}
                          description={
                            searchText || selectedDistrict
                              ? 'Tidak ada PMB mitra yang sesuai dengan filter.'
                              : 'Belum ada PMB mitra yang terdaftar di wilayah ini.'
                          }
                        />
                      ),
                    }}
                    pagination={{
                      pageSize: 10,
                      showSizeChanger: true,
                      showTotal: (total) => `Total ${total} PMB mitra`,
                    }}
                  />
                ),
              },
            ]}
          />
        </Card>
      ) : null}
    </div>
  );
}
