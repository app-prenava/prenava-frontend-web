import React, { useState, useEffect } from 'react';
import { Space, Table, Tag, Button, Input, Avatar } from 'antd';
import { SearchOutlined, PlusOutlined, FilterOutlined, EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getUserList } from '../admin.api';
import { UserListItem } from '../admin.types';

const { Column } = Table;

interface DataType extends UserListItem {
  key: React.Key;
}

export default function UserListPage() {
  const [users, setUsers] = useState<DataType[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<DataType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchText, selectedRole]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const result = await getUserList();
      const usersWithKey = result.users.map((user) => ({
        ...user,
        key: user.user_id,
      }));
      setUsers(usersWithKey);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Filter by role
    if (selectedRole !== 'all') {
      filtered = filtered.filter(user => user.role === selectedRole);
    }

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

  const handleRoleFilter = (role: string) => {
    setSelectedRole(role);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'bidan':
        return 'blue';
      case 'dinkes':
        return 'green';
      case 'admin':
        return 'red';
      case 'ibu_hamil':
        return 'purple';
      default:
        return 'default';
    }
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
          <h1 className="text-2xl font-semibold text-gray-900">Manajemen User</h1>
          <p className="text-gray-600">Kelola semua user dalam sistem</p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          style={{ backgroundColor: '#FA6978', borderColor: '#FA6978' }}
        >
          Tambah User
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
          <div className="flex gap-2">
            <Button
              type={selectedRole === 'all' ? 'primary' : 'default'}
              onClick={() => handleRoleFilter('all')}
              style={selectedRole === 'all' ? { backgroundColor: '#FA6978', borderColor: '#FA6978' } : {}}
            >
              Semua
            </Button>
            <Button
              type={selectedRole === 'bidan' ? 'primary' : 'default'}
              onClick={() => handleRoleFilter('bidan')}
              style={selectedRole === 'bidan' ? { backgroundColor: '#FA6978', borderColor: '#FA6978' } : {}}
            >
              Bidan
            </Button>
            <Button
              type={selectedRole === 'dinkes' ? 'primary' : 'default'}
              onClick={() => handleRoleFilter('dinkes')}
              style={selectedRole === 'dinkes' ? { backgroundColor: '#FA6978', borderColor: '#FA6978' } : {}}
            >
              Dinkes
            </Button>
            <Button
              type={selectedRole === 'ibu_hamil' ? 'primary' : 'default'}
              onClick={() => handleRoleFilter('ibu_hamil')}
              style={selectedRole === 'ibu_hamil' ? { backgroundColor: '#FA6978', borderColor: '#FA6978' } : {}}
            >
              Ibu Hamil
            </Button>
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
            showTotal: (total, range) => `${range[0]}-${range[1]} dari ${total} user`,
          }}
        >
          <Column
            title="User"
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
            title="Role"
            dataIndex="role"
            key="role"
            render={(role: string) => (
              <Tag color={getRoleColor(role)}>
                {role.toUpperCase()}
              </Tag>
            )}
          />
          <Column
            title="Status"
            dataIndex="is_active"
            key="is_active"
            render={(isActive: boolean) => (
              <Tag color={getStatusColor(isActive)}>
                {getStatusText(isActive)}
              </Tag>
            )}
          />
          <Column
            title="Created At"
            dataIndex="created_at"
            key="created_at"
            render={(date: string) => new Date(date).toLocaleDateString('id-ID')}
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
