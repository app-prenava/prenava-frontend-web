import React, { useState, useEffect } from 'react';
import { Space, Table, Tag, Button, Input, Avatar, Switch } from 'antd';
import { SearchOutlined, PlusOutlined, FilterOutlined, EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getAllUsers } from '../admin.api';
import { User } from '../admin.types';

const { Column } = Table;

interface DataType extends User {
  key: React.Key;
}

export default function DinkesUsersPage() {
  const [users, setUsers] = useState<DataType[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<DataType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    fetchDinkesUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchText]);

  const fetchDinkesUsers = async () => {
    try {
      setLoading(true);
      const result = await getAllUsers('dinkes');
      const usersWithKey = result.data.map((user) => ({
        ...user,
        key: user.user_id,
      }));
      setUsers(usersWithKey);
    } catch (error) {
      console.error('Failed to fetch dinkes users:', error);
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

  const handleStatusToggle = (userId: number, checked: boolean) => {
    // TODO: Implement status toggle API call
    console.log(`Toggle user ${userId} to ${checked ? 'active' : 'inactive'}`);
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'green' : 'red';
  };

  const getStatusText = (isActive: boolean) => {
    return isActive ? 'Active' : 'InActive';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Manajemen Dinkes</h1>
          <p className="text-gray-600">Kelola semua akun dinkes dalam sistem</p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          style={{ backgroundColor: '#FA6978', borderColor: '#FA6978' }}
          onClick={() => window.location.href = '/admin/create-dinkes'}
        >
          Tambah Dinkes
        </Button>
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

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <Table<DataType>
          dataSource={filteredUsers}
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} dari ${total} dinkes`,
          }}
        >
          <Column
            title="Akun Dinkes"
            key="user"
            render={(_, record: DataType) => (
              <div className="flex items-center gap-3">
                <Avatar
                  size={40}
                  style={{ backgroundColor: '#FA6978' }}
                >
                  {record.name.charAt(0).toUpperCase()}
                </Avatar>
                <div>
                  <div className="font-medium">{record.name}</div>
                  <div className="text-sm text-gray-500">{record.email}</div>
                </div>
              </div>
            )}
          />
          <Column
            title="Alamat"
            dataIndex="email"
            key="address"
            render={(email: string) => (
              <span className="text-gray-600">345321231</span>
            )}
          />
          <Column
            title="Kota"
            dataIndex="city"
            key="city"
            render={() => (
              <span className="text-gray-600">Design</span>
            )}
          />
          <Column
            title="Spesialisasi"
            dataIndex="specialization"
            key="specialization"
            render={() => (
              <span className="text-gray-600">UI/UX Designer</span>
            )}
          />
          <Column
            title="Status"
            dataIndex="is_active"
            key="is_active"
            render={(isActive: boolean, record: DataType) => (
              <div className="flex items-center gap-2">
                <Tag color={getStatusColor(isActive)}>
                  {getStatusText(isActive)}
                </Tag>
                <Switch
                  checked={isActive}
                  onChange={(checked) => handleStatusToggle(record.user_id, checked)}
                  size="small"
                />
              </div>
            )}
          />
          <Column
            title="Action"
            key="action"
            render={(_, record: DataType) => (
              <Space size="middle">
                <Button
                  type="text"
                  icon={<EyeOutlined />}
                  title="View Details"
                />
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  title="Edit User"
                />
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  title="Delete User"
                />
                </Space>
            )}
          />
        </Table>
      </div>
    </div>
  );
}
