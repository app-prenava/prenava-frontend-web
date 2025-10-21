import React, { useState, useEffect } from 'react';
import { Space, Table, Tag, Button, Input, Avatar, Switch, Modal, Spin, Card } from 'antd';
import { SearchOutlined, PlusOutlined, FilterOutlined, EyeOutlined, EditOutlined, DeleteOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { getDinkes, deactivateUser, activateUser, getDinkesProfileByUserId } from '../admin.api';
import { User } from '../admin.types';
import ConfirmDialog from '../components/ConfirmDialog';

const { Column } = Table;

interface DataType extends User {
  key: React.Key;
}

interface ConfirmDialogState {
  isOpen: boolean;
  userId: number;
  userName: string;
  action: 'activate' | 'deactivate';
}

export default function DinkesUsersPage() {
  const [users, setUsers] = useState<DataType[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<DataType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({
    isOpen: false,
    userId: 0,
    userName: '',
    action: 'deactivate',
  });
  const [actionLoading, setActionLoading] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detail, setDetail] = useState<any>(null);

  useEffect(() => {
    fetchDinkesUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchText]);

  const fetchDinkesUsers = async () => {
    try {
      setLoading(true);
      const result = await getDinkes();
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

  const handleStatusToggle = (userId: number, userName: string, currentStatus: number) => {
    setConfirmDialog({
      isOpen: true,
      userId,
      userName,
      action: currentStatus === 1 ? 'deactivate' : 'activate',
    });
  };

  const openDetail = async (record: DataType) => {
    setDetailOpen(true);
    setDetailLoading(true);
    try {
      const p = await getDinkesProfileByUserId(record.user_id);
      setDetail(p);
    } catch (e) {
      console.error('Failed to load dinkes detail:', e);
      setDetail(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const confirmAction = async () => {
    try {
      setActionLoading(true);

      if (confirmDialog.action === 'deactivate') {
        await deactivateUser(confirmDialog.userId);
        // Update local state immediately
        setUsers(prev => prev.map(user =>
          user.user_id === confirmDialog.userId ? { ...user, is_active: 0 } : user
        ));
      } else {
        await activateUser(confirmDialog.userId);
        // Update local state immediately
        setUsers(prev => prev.map(user =>
          user.user_id === confirmDialog.userId ? { ...user, is_active: 1 } : user
        ));
      }

      // Close dialog
      setConfirmDialog({
        isOpen: false,
        userId: 0,
        userName: '',
        action: 'deactivate',
      });
    } catch (error: any) {
      console.error('Failed to change user status:', error);
      let errorMsg = error?.response?.data?.message || `Gagal mengubah status user: ${error}`;

      // Translate specific error messages
      if (errorMsg.includes('Account is deactivated') || errorMsg.includes('Contact admin')) {
        errorMsg = 'Akun dinonaktifkan. Hubungi Admin.';
      }

      alert(errorMsg);
    } finally {
      setActionLoading(false);
    }
  };

  const cancelAction = () => {
    setConfirmDialog({
      isOpen: false,
      userId: 0,
      userName: '',
      action: 'deactivate',
    });
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
            dataIndex="address"
            key="address"
            render={() => (
              <span className="text-gray-400">-</span>
            )}
          />
          <Column
            title="Kota"
            dataIndex="city"
            key="city"
            render={() => (
              <span className="text-gray-400">-</span>
            )}
          />
          <Column
            title="Spesialisasi"
            dataIndex="specialization"
            key="specialization"
            render={() => (
              <span className="text-gray-400">-</span>
            )}
          />
          <Column
            title="Status"
            dataIndex="is_active"
            key="is_active"
            render={(isActive: number, record: DataType) => (
              <div className="flex items-center gap-2">
                {getStatusTag(isActive)}
                <Switch
                  checked={isActive === 1}
                  onChange={() => handleStatusToggle(record.user_id, record.name, isActive)}
                  size="small"
                  loading={actionLoading && confirmDialog.userId === record.user_id}
                  disabled={actionLoading}
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
                  onClick={() => openDetail(record)}
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

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Konfirmasi"
        message={`Apakah Anda yakin ingin ${confirmDialog.action === 'deactivate' ? 'menonaktifkan' : 'mengaktifkan'} user ${confirmDialog.userName}?`}
        confirmText={confirmDialog.action === 'deactivate' ? 'Nonaktifkan' : 'Aktifkan'}
        cancelText="Batal"
        confirmButtonColor={confirmDialog.action === 'deactivate' ? 'red' : 'green'}
        onConfirm={confirmAction}
        onCancel={cancelAction}
        loading={actionLoading}
      />

      <Modal
        open={detailOpen}
        onCancel={() => setDetailOpen(false)}
        footer={null}
        width={640}
        title={<div className="font-semibold">Detail Info</div>}
      >
        {detailLoading ? (
          <div className="flex justify-center items-center py-10">
            <Spin />
          </div>
        ) : (
          <div>
            <div className="flex justify-center mb-6">
              {detail?.photo ? (
                <img
                  src={`${import.meta.env.VITE_API_BASE}/storage/${detail.photo}`}
                  className="w-40 h-40 rounded-full object-cover"
                  alt="Foto Dinkes"
                />
              ) : (
                <div className="w-40 h-40 rounded-full bg-gray-200" />)
              }
            </div>

            <Card bordered>
              <div className="grid grid-cols-3 gap-y-3">
                <div className="col-span-1 text-gray-600">NIP</div>
                <div className="col-span-2">: {detail?.nip || '-'}</div>

                <div className="col-span-1 text-gray-600">Jabatan</div>
                <div className="col-span-2">: {detail?.jabatan || '-'}</div>
              </div>
            </Card>
          </div>
        )}
      </Modal>
    </div>
  );
}
