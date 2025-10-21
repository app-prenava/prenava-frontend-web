import React, { useState, useEffect } from 'react';
import { Card, Col, Row, Input, Button, Avatar, Tag, Spin } from 'antd';
import { SearchOutlined, FilterOutlined, CheckCircleOutlined, CloseCircleOutlined, MailOutlined } from '@ant-design/icons';
import { getIbuHamilUsers, IbuHamilUser } from '../bidan.api';

type DataType = IbuHamilUser & { key: React.Key };
type Profile = NonNullable<IbuHamilUser['profile']>;

export default function BidanUsersPage() {
  const [users, setUsers] = useState<DataType[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<DataType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    fetchIbuHamilUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchText]);

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
    let filtered = users;

    // Filter by search text (name)
    if (searchText) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
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

  const getFromProfile = (user: DataType, key: keyof Profile) => {
    const prof = user.profile as Profile | null | undefined;
    if (prof && prof[key] !== undefined && prof[key] !== null) return prof[key];
    return (user as unknown as Record<string, unknown>)[key as string] as unknown;
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
              placeholder="Search by name..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => handleSearch(e.target.value)}
              size="large"
            />
          </div>
          <Button icon={<FilterOutlined />}>
            Filter
          </Button>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Spin size="large" />
          </div>
        ) : (
          <Row gutter={[16, 16]}>
            {filteredUsers.map((user) => (
              <Col xs={24} sm={12} md={8} lg={6} key={user.user_id}>
                <Card
                  title=""
                  variant="borderless"
                  className="h-full"
                  bodyStyle={{ padding: '20px' }}
                >
                  <div className="flex flex-col items-center text-center">
                    {/* Profile Picture */}
                    <Avatar
                      size={80}
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
        )}

        {!loading && filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Tidak ada data ibu hamil
            </h3>
            <p className="text-gray-600">
              {searchText ? 'Tidak ada hasil pencarian' : 'Belum ada data ibu hamil yang terdaftar'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
