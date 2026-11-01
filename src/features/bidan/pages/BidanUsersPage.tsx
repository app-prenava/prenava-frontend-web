import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Col,
  Row,
  Input,
  Button,
  Avatar,
  Tag,
  Spin,
  Pagination,
  Empty,
  Select,
  Modal,
  Tabs,
  Table,
  Descriptions,
  Tooltip,
} from 'antd';
import {
  SearchOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  MailOutlined,
  WhatsAppOutlined,
  EyeOutlined,
  FormOutlined,
  AlertOutlined,
  CalendarOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { getIbuHamilUsers, type IbuHamilUser } from '../bidan.api';

type DataType = IbuHamilUser & { key: React.Key };
type Profile = NonNullable<IbuHamilUser['profile']>;

const PAGE_SIZE = 12;

export default function BidanUsersPage() {
  const navigate = useNavigate();

  const [users, setUsers] = useState<DataType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [trimesterFilter, setTrimesterFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Detail Modal State
  const [selectedUser, setSelectedUser] = useState<DataType | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    fetchIbuHamilUsers();
  }, []);

  const fetchIbuHamilUsers = async () => {
    try {
      setLoading(true);
      const result = await getIbuHamilUsers();
      const list = Array.isArray(result?.data) ? result.data : [];
      const usersWithKey: DataType[] = list.map((user) => ({
        ...user,
        key: user.user_id,
      }));
      setUsers(usersWithKey);
    } catch (error) {
      console.error('Failed to fetch ibu hamil users:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFromProfile = (user: DataType, key: string) => {
    const prof = user.profile as Profile | null | undefined;
    if (prof && (prof as Record<string, unknown>)[key] !== undefined && (prof as Record<string, unknown>)[key] !== null) {
      return (prof as Record<string, unknown>)[key];
    }
    return (user as unknown as Record<string, unknown>)[key] as unknown;
  };

  const getPhotoUrl = (user: DataType): string | null => {
    if (user.photo_url) return user.photo_url;
    const photo = getFromProfile(user, 'photo');
    if (photo && typeof photo === 'string' && photo.trim() !== '') {
      if (photo.startsWith('http://') || photo.startsWith('https://')) {
        return photo;
      }
      if (photo.startsWith('storage/') || photo.startsWith('/storage/')) {
        return `${import.meta.env.VITE_API_BASE}/${photo.replace(/^\//, '')}`;
      }
      return `${import.meta.env.VITE_API_BASE}/storage/${photo}`;
    }
    return null;
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatWhatsAppUrl = (phone: string, name: string) => {
    let clean = phone.replace(/\D/g, '');
    if (clean.startsWith('0')) {
      clean = '62' + clean.slice(1);
    }
    const text = encodeURIComponent(
      `Halo Ibu ${name}, salam sehat dari Bidan Prenava. Bagaimana kabar kesehatan kandungan Ibu hari ini?`
    );
    return `https://wa.me/${clean}?text=${text}`;
  };

  // Status Risk Analyzers
  const checkAnemiaRisk = (user: DataType): boolean => {
    if (!user.anemia_history || user.anemia_history.length === 0) return false;
    const latest = user.anemia_history[0];
    const left = String(latest.hasil_mata_kiri || '').toLowerCase();
    const right = String(latest.hasil_mata_kanan || '').toLowerCase();
    return left.includes('anemia') || right.includes('anemia');
  };

  const checkDepressionRisk = (user: DataType): boolean => {
    if (!user.depression_history || user.depression_history.length === 0) return false;
    const latest = user.depression_history[0];
    const lvl = String(latest.depression_level || '').toLowerCase();
    return lvl.includes('tinggi') || lvl.includes('sedang') || lvl.includes('berat');
  };

  const checkStuntingRisk = (user: DataType): boolean => {
    if (!user.stunting_history || user.stunting_history.length === 0) return false;
    const latest = user.stunting_history[0];
    const cat = String(latest.risk_category || '').toLowerCase();
    return cat.includes('tinggi') || cat.includes('sedang') || cat.includes('stunting');
  };

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      // 1. Text Search
      if (searchText) {
        const q = searchText.toLowerCase();
        const nameMatch = user.name.toLowerCase().includes(q);
        const emailMatch = user.email.toLowerCase().includes(q);
        const phoneMatch = String(getFromProfile(user, 'no_telepon') || '').includes(q);
        const addressMatch = String(getFromProfile(user, 'alamat') || '').toLowerCase().includes(q);
        if (!nameMatch && !emailMatch && !phoneMatch && !addressMatch) {
          return false;
        }
      }

      // 2. Risk Filter
      if (riskFilter === 'anemia' && !checkAnemiaRisk(user)) return false;
      if (riskFilter === 'depression' && !checkDepressionRisk(user)) return false;
      if (riskFilter === 'stunting' && !checkStuntingRisk(user)) return false;
      if (riskFilter === 'any_risk') {
        const hasAny = checkAnemiaRisk(user) || checkDepressionRisk(user) || checkStuntingRisk(user);
        if (!hasAny) return false;
      }
      if (riskFilter === 'safe') {
        const hasAny = checkAnemiaRisk(user) || checkDepressionRisk(user) || checkStuntingRisk(user);
        if (hasAny) return false;
      }

      // 3. Trimester Filter
      const weeks = user.gestational_age_weeks;
      if (trimesterFilter === 't1' && (weeks == null || weeks > 12)) return false;
      if (trimesterFilter === 't2' && (weeks == null || weeks <= 12 || weeks > 27)) return false;
      if (trimesterFilter === 't3' && (weeks == null || weeks <= 27)) return false;

      return true;
    });
  }, [users, searchText, riskFilter, trimesterFilter]);

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredUsers.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredUsers, currentPage]);

  const handleOpenDetailModal = (user: DataType) => {
    setSelectedUser(user);
    setIsDetailModalOpen(true);
  };

  const handleNavigateToVisit = (user: DataType) => {
    navigate('/catatan-kunjungan', {
      state: {
        openCreateModal: true,
        selectedUserId: user.user_id,
        selectedPatientName: user.name,
      },
    });
  };

  const handleNavigateToTriage = (user: DataType) => {
    navigate('/bidan/triage', {
      state: {
        selectedUserId: user.user_id,
      },
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 m-0">
            Daftar Pasien Ibu Hamil
          </h1>
          <p className="text-gray-600 text-sm mt-1 m-0">
            Pantau status kehamilan, riwayat skrining AI, dan kelola rekam medis pasien
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            type="primary"
            style={{ backgroundColor: '#FA6978', borderColor: '#FA6978' }}
            icon={<FormOutlined />}
            onClick={() => navigate('/catatan-kunjungan', { state: { openCreateModal: true } })}
          >
            + Catat Kunjungan Baru
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="flex-1 w-full">
            <Input
              placeholder="Cari ibu hamil berdasarkan nama, email, no. telepon, atau alamat..."
              prefix={<SearchOutlined className="text-gray-400" />}
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
                setCurrentPage(1);
              }}
              allowClear
              size="large"
            />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Select
              value={riskFilter}
              onChange={(val) => {
                setRiskFilter(val);
                setCurrentPage(1);
              }}
              size="large"
              className="w-full md:w-56"
              options={[
                { label: 'Semua Status Risiko', value: 'all' },
                { label: '🚨 Pasien dengan Risiko AI', value: 'any_risk' },
                { label: '🩸 Risiko Anemia', value: 'anemia' },
                { label: '🧠 Waspada Depresi', value: 'depression' },
                { label: '👶 Risiko Stunting Janin', value: 'stunting' },
                { label: '✅ Kondisi Sehat / Aman', value: 'safe' },
              ]}
            />
            <Select
              value={trimesterFilter}
              onChange={(val) => {
                setTrimesterFilter(val);
                setCurrentPage(1);
              }}
              size="large"
              className="w-full md:w-48"
              options={[
                { label: 'Semua Trimester', value: 'all' },
                { label: 'Trimester 1 (≤ 12 Mgg)', value: 't1' },
                { label: 'Trimester 2 (13-27 Mgg)', value: 't2' },
                { label: 'Trimester 3 (≥ 28 Mgg)', value: 't3' },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {loading ? (
          <div className="flex flex-col justify-center items-center py-20 space-y-3">
            <Spin size="large" />
            <span className="text-gray-500 text-sm">Memuat data pasien ibu hamil...</span>
          </div>
        ) : filteredUsers.length === 0 ? (
          <Empty
            description={
              <span className="text-gray-600">
                {searchText || riskFilter !== 'all' || trimesterFilter !== 'all'
                  ? 'Tidak ada data pasien yang sesuai dengan filter pencarian.'
                  : 'Belum ada ibu hamil yang terdaftar.'}
              </span>
            }
          />
        ) : (
          <>
            <Row gutter={[20, 20]}>
              {paginatedUsers.map((user) => {
                const phone = String(getFromProfile(user, 'no_telepon') || '');
                const hasAnemia = checkAnemiaRisk(user);
                const hasDepression = checkDepressionRisk(user);
                const hasStunting = checkStuntingRisk(user);
                const weeks = user.gestational_age_weeks;

                return (
                  <Col xs={24} sm={12} lg={8} xl={6} key={user.user_id}>
                    <Card
                      hoverable
                      className="h-full border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition flex flex-col justify-between"
                      bodyStyle={{ padding: '18px', display: 'flex', flexDirection: 'column', height: '100%' }}
                    >
                      <div>
                        {/* Top Profile Header */}
                        <div className="flex items-center gap-3 mb-3">
                          <Avatar
                            size={56}
                            src={getPhotoUrl(user) || undefined}
                            style={{ backgroundColor: '#FA6978', flexShrink: 0 }}
                          >
                            {getInitials(user.name)}
                          </Avatar>
                          <div className="overflow-hidden">
                            <h3
                              className="text-base font-semibold text-gray-900 truncate m-0"
                              title={user.name}
                            >
                              {user.name}
                            </h3>
                            <p className="text-xs text-gray-500 truncate m-0 mt-0.5">
                              {user.email}
                            </p>
                            {weeks ? (
                              <Tag color="magenta" className="text-[11px] font-semibold mt-1">
                                {weeks} Minggu ({weeks <= 12 ? 'TM 1' : weeks <= 27 ? 'TM 2' : 'TM 3'})
                              </Tag>
                            ) : (
                              <Tag color="default" className="text-[11px] mt-1">
                                Usia Belum Diset
                              </Tag>
                            )}
                          </div>
                        </div>

                        {/* AI Screening Risk Badges */}
                        <div className="flex flex-wrap gap-1.5 mb-3 pt-2 border-t border-gray-100">
                          {hasAnemia ? (
                            <Tag color="error" className="text-[11px]">
                              🩸 Risiko Anemia
                            </Tag>
                          ) : user.anemia_history && user.anemia_history.length > 0 ? (
                            <Tag color="success" className="text-[11px]">
                              🩸 Anemia Normal
                            </Tag>
                          ) : null}

                          {hasDepression ? (
                            <Tag color="warning" className="text-[11px]">
                              🧠 Waspada Depresi
                            </Tag>
                          ) : user.depression_history && user.depression_history.length > 0 ? (
                            <Tag color="blue" className="text-[11px]">
                              🧠 Depresi Rendah
                            </Tag>
                          ) : null}

                          {hasStunting ? (
                            <Tag color="purple" className="text-[11px]">
                              👶 Risiko Stunting
                            </Tag>
                          ) : user.stunting_history && user.stunting_history.length > 0 ? (
                            <Tag color="green" className="text-[11px]">
                              👶 Stunting Aman
                            </Tag>
                          ) : null}

                          {!user.anemia_history?.length &&
                            !user.depression_history?.length &&
                            !user.stunting_history?.length && (
                              <span className="text-[11px] text-gray-400 italic">
                                Belum ada riwayat AI
                              </span>
                            )}
                        </div>

                        {/* Profile Info Summary */}
                        <div className="space-y-1.5 text-xs text-gray-600 mb-4 bg-gray-50 p-2.5 rounded-lg">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Usia Ibu:</span>
                            <span className="font-medium">
                              {getFromProfile(user, 'usia')
                                ? `${getFromProfile(user, 'usia')} Thn`
                                : '-'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Gol. Darah:</span>
                            <span className="font-medium">
                              {String(getFromProfile(user, 'golongan_darah') || '-')}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Telepon:</span>
                            <span className="font-medium truncate max-w-[140px]">
                              {phone || '-'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Card Action Buttons */}
                      <div className="pt-2 border-t border-gray-100 space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            size="small"
                            icon={<EyeOutlined />}
                            onClick={() => handleOpenDetailModal(user)}
                            className="text-xs"
                          >
                            Riwayat Medis
                          </Button>
                          <Button
                            size="small"
                            type="primary"
                            style={{ backgroundColor: '#FA6978', borderColor: '#FA6978' }}
                            icon={<FormOutlined />}
                            onClick={() => handleNavigateToVisit(user)}
                            className="text-xs"
                          >
                            Catat Rekis
                          </Button>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="small"
                            icon={<AlertOutlined />}
                            onClick={() => handleNavigateToTriage(user)}
                            className="text-xs flex-1 text-purple-700 border-purple-300 hover:border-purple-500"
                          >
                            Triase CDSS
                          </Button>
                          {phone && (
                            <Tooltip title="Chat WhatsApp dengan Pasien">
                              <Button
                                size="small"
                                icon={<WhatsAppOutlined />}
                                style={{ color: '#25D366', borderColor: '#25D366' }}
                                href={formatWhatsAppUrl(phone, user.name)}
                                target="_blank"
                              />
                            </Tooltip>
                          )}
                        </div>
                      </div>
                    </Card>
                  </Col>
                );
              })}
            </Row>

            {/* Pagination */}
            {filteredUsers.length > PAGE_SIZE && (
              <div className="flex justify-center mt-8">
                <Pagination
                  current={currentPage}
                  total={filteredUsers.length}
                  pageSize={PAGE_SIZE}
                  onChange={(page) => setCurrentPage(page)}
                  showSizeChanger={false}
                  showTotal={(total, range) =>
                    `${range[0]}-${range[1]} dari ${total} ibu hamil`
                  }
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Patient Medical History & Profile Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <UserOutlined className="text-[#FA6978]" />
            <span>Profil Klinis & Riwayat Medis: {selectedUser?.name}</span>
          </div>
        }
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsDetailModalOpen(false)}>
            Tutup
          </Button>,
          selectedUser && (
            <Button
              key="catat"
              type="primary"
              style={{ backgroundColor: '#FA6978', borderColor: '#FA6978' }}
              icon={<FormOutlined />}
              onClick={() => {
                setIsDetailModalOpen(false);
                handleNavigateToVisit(selectedUser);
              }}
            >
              Catat Pemeriksaan ANC
            </Button>
          ),
        ]}
        width={780}
      >
        {selectedUser && (
          <Tabs
            defaultActiveKey="ai_history"
            className="mt-2"
            items={[
              {
                key: 'ai_history',
                label: 'Riwayat Skrining AI',
                children: (
                  <div className="space-y-6 py-2">
                    {/* Anemia Scan History */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                        <span>🩸 Deteksi Skrining Anemia (Mata)</span>
                      </h4>
                      {selectedUser.anemia_history && selectedUser.anemia_history.length > 0 ? (
                        <Table
                          size="small"
                          pagination={false}
                          dataSource={selectedUser.anemia_history}
                          rowKey="id"
                          columns={[
                            {
                              title: 'Tanggal',
                              dataIndex: 'created_at',
                              key: 'created_at',
                              render: (d) => (d ? new Date(d).toLocaleDateString('id-ID') : '-'),
                            },
                            {
                              title: 'Mata Kiri',
                              dataIndex: 'hasil_mata_kiri',
                              key: 'hasil_mata_kiri',
                              render: (t) => (
                                <Tag color={String(t).toLowerCase().includes('anemia') ? 'error' : 'success'}>
                                  {t || '-'}
                                </Tag>
                              ),
                            },
                            {
                              title: 'Mata Kanan',
                              dataIndex: 'hasil_mata_kanan',
                              key: 'hasil_mata_kanan',
                              render: (t) => (
                                <Tag color={String(t).toLowerCase().includes('anemia') ? 'error' : 'success'}>
                                  {t || '-'}
                                </Tag>
                              ),
                            },
                          ]}
                        />
                      ) : (
                        <p className="text-xs text-gray-400 italic">Belum ada riwayat deteksi anemia.</p>
                      )}
                    </div>

                    {/* Depression History */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                        <span>🧠 Skrining Kesehatan Mental (EPDS)</span>
                      </h4>
                      {selectedUser.depression_history && selectedUser.depression_history.length > 0 ? (
                        <Table
                          size="small"
                          pagination={false}
                          dataSource={selectedUser.depression_history}
                          rowKey="id"
                          columns={[
                            {
                              title: 'Tanggal',
                              dataIndex: 'created_at',
                              key: 'created_at',
                              render: (d) => (d ? new Date(d).toLocaleDateString('id-ID') : '-'),
                            },
                            {
                              title: 'Tingkat Depresi',
                              dataIndex: 'depression_level',
                              key: 'depression_level',
                              render: (t) => (
                                <Tag color={String(t).toLowerCase().includes('tinggi') ? 'error' : 'blue'}>
                                  {t || '-'}
                                </Tag>
                              ),
                            },
                            {
                              title: 'Skor Keyakinan AI',
                              dataIndex: 'confidence_score',
                              key: 'confidence_score',
                              render: (s) => (s ? `${(Number(s) * 100).toFixed(1)}%` : '-'),
                            },
                          ]}
                        />
                      ) : (
                        <p className="text-xs text-gray-400 italic">Belum ada riwayat tes kesehatan mental.</p>
                      )}
                    </div>

                    {/* Stunting History */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                        <span>👶 Prediksi Risiko Stunting Janin</span>
                      </h4>
                      {selectedUser.stunting_history && selectedUser.stunting_history.length > 0 ? (
                        <Table
                          size="small"
                          pagination={false}
                          dataSource={selectedUser.stunting_history}
                          rowKey="prediction_id"
                          columns={[
                            {
                              title: 'Tanggal',
                              dataIndex: 'created_at',
                              key: 'created_at',
                              render: (d) => (d ? new Date(d).toLocaleDateString('id-ID') : '-'),
                            },
                            {
                              title: 'Kategori Risiko',
                              dataIndex: 'risk_category',
                              key: 'risk_category',
                              render: (r) => (
                                <Tag color={String(r).toLowerCase().includes('tinggi') ? 'error' : 'green'}>
                                  {r || '-'}
                                </Tag>
                              ),
                            },
                            {
                              title: 'Skor Risiko',
                              dataIndex: 'risk_score',
                              key: 'risk_score',
                              render: (s) => (s != null ? `${Number(s).toFixed(2)}` : '-'),
                            },
                          ]}
                        />
                      ) : (
                        <p className="text-xs text-gray-400 italic">Belum ada riwayat prediksi stunting.</p>
                      )}
                    </div>
                  </div>
                ),
              },
              {
                key: 'profile_info',
                label: 'Data Demografis & Kontak',
                children: (
                  <div className="py-2">
                    <Descriptions bordered size="small" column={2}>
                      <Descriptions.Item label="Nama Lengkap">
                        <span className="font-semibold text-gray-900">{selectedUser.name}</span>
                      </Descriptions.Item>
                      <Descriptions.Item label="Email">
                        <span>{selectedUser.email}</span>
                      </Descriptions.Item>
                      <Descriptions.Item label="Usia">
                        <span>{getFromProfile(selectedUser, 'usia') ? `${getFromProfile(selectedUser, 'usia')} Tahun` : '-'}</span>
                      </Descriptions.Item>
                      <Descriptions.Item label="Gol. Darah">
                        <span>{String(getFromProfile(selectedUser, 'golongan_darah') || '-')}</span>
                      </Descriptions.Item>
                      <Descriptions.Item label="Tanggal Lahir">
                        <span>{getFromProfile(selectedUser, 'tanggal_lahir') ? new Date(String(getFromProfile(selectedUser, 'tanggal_lahir'))).toLocaleDateString('id-ID') : '-'}</span>
                      </Descriptions.Item>
                      <Descriptions.Item label="Usia Kehamilan">
                        <span className="font-semibold text-[#FA6978]">{selectedUser.gestational_age_weeks ? `${selectedUser.gestational_age_weeks} Minggu` : '-'}</span>
                      </Descriptions.Item>
                      <Descriptions.Item label="Nomor Telepon">
                        <span>{String(getFromProfile(selectedUser, 'no_telepon') || '-')}</span>
                      </Descriptions.Item>
                      <Descriptions.Item label="Pendidikan Terakhir">
                        <span>{String(getFromProfile(selectedUser, 'pendidikan_terakhir') || '-')}</span>
                      </Descriptions.Item>
                      <Descriptions.Item label="Pekerjaan">
                        <span>{String(getFromProfile(selectedUser, 'pekerjaan') || '-')}</span>
                      </Descriptions.Item>
                      <Descriptions.Item label="Tanggal Bergabung">
                        <span>{selectedUser.created_at ? new Date(selectedUser.created_at).toLocaleDateString('id-ID') : '-'}</span>
                      </Descriptions.Item>
                      <Descriptions.Item label="Alamat Domisili" span={2}>
                        <span>{String(getFromProfile(selectedUser, 'alamat') || '-')}</span>
                      </Descriptions.Item>
                    </Descriptions>
                  </div>
                ),
              },
            ]}
          />
        )}
      </Modal>
    </div>
  );
}
