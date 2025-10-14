import React, { useState, useEffect } from 'react';
import { Card, Col, Row, Input, Button, Avatar, Tag, Spin } from 'antd';
import { SearchOutlined, FilterOutlined, CheckCircleOutlined, CloseCircleOutlined, PhoneOutlined, MailOutlined } from '@ant-design/icons';
import BidanLayout from '../components/BidanLayout';
import { getIbuHamilUsers } from '../bidan.api';
import { User } from '@/features/admin/admin.types';

interface DataType extends User {
  key: React.Key;
}

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
      const usersWithKey = result.data.map((user) => ({
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

  return (
    <BidanLayout>
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

                      {/* Contact Info */}
                      <div className="w-full space-y-2">
                        <div className="flex items-center justify-center text-sm text-gray-600">
                          <MailOutlined className="mr-2 text-pink-500" />
                          <span className="truncate">{user.email}</span>
                        </div>
                        <div className="flex items-center justify-center text-sm text-gray-600">
                          <PhoneOutlined className="mr-2 text-pink-500" />
                          <span>+12 345 6789 0</span>
                        </div>
                      </div>

                      {/* Created Date */}
                      <div className="mt-4 pt-4 border-t border-gray-100 w-full">
                        <p className="text-xs text-gray-500">
                          Bergabung: {new Date(user.created_at).toLocaleDateString('id-ID')}
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
    </BidanLayout>
  );
}
