import React, { useState, useEffect } from 'react';
import { Card, Col, Row, Input, Button, Avatar, Tag, Spin, Pagination, Empty } from 'antd';
import { SearchOutlined, FilterOutlined, CheckCircleOutlined, CloseCircleOutlined, MailOutlined } from '@ant-design/icons';
import { getIbuHamilUsers, IbuHamilUser } from '../bidan.api';

type DataType = IbuHamilUser & { key: React.Key };
type Profile = NonNullable<IbuHamilUser['profile']>;

const PAGE_SIZE = 10;

export default function BidanUsersPage() {
  const [users, setUsers] = useState<DataType[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<DataType[]>([]);
  const [paginatedUsers, setPaginatedUsers] = useState<DataType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchIbuHamilUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchText]);

  useEffect(() => {
    paginateUsers();
  }, [filteredUsers, currentPage]);

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

  const filterUsers = () => {
    let filtered = [...users];

    // Filter by search text (name, email, or other fields)
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        (user.profile && typeof user.profile === 'object' && 
          JSON.stringify(user.profile).toLowerCase().includes(searchLower))
      );
    }

    setFilteredUsers(filtered);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const paginateUsers = () => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;
    const paginated = filteredUsers.slice(startIndex, endIndex);
    setPaginatedUsers(paginated);
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const getStatusTag = (isActive: number) => {
    if (isActive === 1) {
      return (
        <Tag icon={<CheckCircleOutlined />} color="success">
          Active
        </Tag>
      );
    } else {
      return (
        <Tag icon={<CloseCircleOutlined />} color="error">
          InActive
        </Tag>
      );
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getFromProfile = (user: DataType, key: string) => {
    const prof = user.profile as Profile | null | undefined;
    if (prof && (prof as Record<string, unknown>)[key] !== undefined && (prof as Record<string, unknown>)[key] !== null) {
      return (prof as Record<string, unknown>)[key];
    }
    return (user as unknown as Record<string, unknown>)[key] as unknown;
  };

  const getPhotoUrl = (user: DataType): string | null => {
    const photo = getFromProfile(user, 'photo');
    if (photo && typeof photo === 'string' && photo.trim() !== '') {
      // Jika sudah full URL, return langsung
      if (photo.startsWith('http://') || photo.startsWith('https://')) {
        return photo;
      }
      // Jika relative path, tambahkan base URL dan storage path
      if (photo.startsWith('storage/') || photo.startsWith('/storage/')) {
        return `${import.meta.env.VITE_API_BASE}/${photo.replace(/^\//, '')}`;
      }
      // Jika hanya nama file, tambahkan storage path
      return `${import.meta.env.VITE_API_BASE}/storage/${photo}`;
    }
    return null;
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('id-ID');
  };

  const toStr = (value: unknown): string => {
    if (value === undefined || value === null) return '-';
    return String(value);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Manajemen Ibu Hamil</h1>
          <p className="text-gray-600">Kelola data ibu hamil dalam sistem</p>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Input
              placeholder="Cari user berdasarkan nama, email, atau informasi lainnya..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => handleSearch(e.target.value)}
              size="large"
            />
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Spin size="large" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <Empty
            description={
              <span className="text-gray-600">
                {searchText
                  ? 'Tidak ada hasil pencarian'
                  : 'Belum ada data ibu hamil yang terdaftar'}
              </span>
            }
          />
        ) : (
          <>
            <Row gutter={[16, 16]}>
              {paginatedUsers.map((user) => (
                <Col xs={24} sm={12} md={8} lg={6} key={user.user_id}>
                  <Card
                    title=""
                    className="h-full border border-gray-200 shadow-md hover:shadow-lg transition-shadow"
                    bodyStyle={{ padding: '20px' }}
                  >
                    <div className="flex flex-col items-center text-center">
                      {/* Profile Picture */}
                      <Avatar
                        size={80}
                        src={getPhotoUrl(user) || undefined}
                        style={{ backgroundColor: '#FA6978', marginBottom: '16px' }}
                      >
                        {getInitials(user.name)}
                      </Avatar>

                      {/* Name */}
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {user.name}
                      </h3>

                      {/* Role */}
                      <p className="text-sm text-gray-600 mb-3">
                        Ibu Hamil
                      </p>

                      {/* Status */}
                      <div className="mb-4">
                        {getStatusTag(user.is_active)}
                      </div>

                      {/* Profile Fields from users_profile */}
                      <div className="w-full space-y-2 text-sm text-gray-700">
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-gray-500">Tanggal Lahir</span>
                          <span className="font-medium">{formatDate(getFromProfile(user, 'tanggal_lahir') as string | null)}</span>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-gray-500">Usia</span>
                          <span className="font-medium">{toStr(getFromProfile(user, 'usia'))}</span>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-gray-500">Alamat</span>
                          <span className="font-medium truncate" title={toStr(getFromProfile(user, 'alamat'))}>{toStr(getFromProfile(user, 'alamat'))}</span>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-gray-500">No. Telepon</span>
                          <span className="font-medium">{toStr(getFromProfile(user, 'no_telepon'))}</span>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-gray-500">Pendidikan</span>
                          <span className="font-medium">{toStr(getFromProfile(user, 'pendidikan_terakhir'))}</span>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-gray-500">Pekerjaan</span>
                          <span className="font-medium">{toStr(getFromProfile(user, 'pekerjaan'))}</span>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-gray-500">Gol. Darah</span>
                          <span className="font-medium">{toStr(getFromProfile(user, 'golongan_darah'))}</span>
                        </div>
                      </div>

                      {/* Email & Created Date */}
                      <div className="mt-4 pt-4 border-t border-gray-100 w-full space-y-1">
                        <div className="flex items-center justify-center text-sm text-gray-600">
                          <MailOutlined className="mr-2 text-pink-500" />
                          <span className="truncate">{user.email}</span>
                        </div>
                        <p className="text-xs text-gray-500 text-center">
                          Bergabung: {user.created_at ? new Date(user.created_at).toLocaleDateString('id-ID') : '-'}
                        </p>
                      </div>
                    </div>
                  </Card>
                </Col>
              ))}
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
                    `${range[0]}-${range[1]} dari ${total} user`
                  }
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
