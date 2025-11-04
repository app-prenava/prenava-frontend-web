import { useState, useEffect } from 'react';
import { Table, Button, Image, message, Popconfirm, Space, Modal, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { DeleteOutlined, EyeOutlined, FileTextOutlined } from '@ant-design/icons';
import AdminLayout from '../components/AdminLayout';
import { shopApi } from '../shop.api';
import { Shop, ShopLog } from '../shop.types';

export default function AdminShopPage() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    per_page: 30,
    last_page: 1,
  });
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
  const [logsModalOpen, setLogsModalOpen] = useState(false);
  const [logs, setLogs] = useState<ShopLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsPagination, setLogsPagination] = useState({
    total: 0,
    per_page: 50,
    last_page: 1,
    current_page: 1,
  });

  const fetchShops = async (page = 1) => {
    setLoading(true);
    try {
      const response = await shopApi.getAllShops(page, 30);
      console.log('Shop Response:', response);
      
      // Handle different response structures
      const shopsData = response.data || [];
      const paginationData = {
        total: response.total || 0,
        per_page: response.per_page || 30,
        last_page: response.last_page || 1,
      };
      
      setShops(shopsData);
      setPagination(paginationData);
      setCurrentPage(response.current_page || 1);
      
      console.log('Shops data:', shopsData);
      console.log('Pagination:', paginationData);
    } catch (error: any) {
      console.error('Error fetching shops:', error);
      console.error('Error response:', error?.response);
      
      // Handle 403 Forbidden specifically
      if (error?.response?.status === 403) {
        message.error('Akses ditolak. Pastikan Anda login sebagai Admin dan memiliki izin untuk mengakses data shop.');
      } else {
        message.error(error?.response?.data?.message || error?.message || 'Gagal memuat data produk');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId: number, productName: string) => {
    setDeleteLoading(productId);
    try {
      const response = await shopApi.deleteShop(productId);
      if (response.status === 'success') {
        message.success(response.message || 'Produk berhasil dihapus');
        fetchShops(currentPage);
      }
    } catch (error: any) {
      console.error('Error deleting shop:', error);
      message.error(error?.response?.data?.message || 'Gagal menghapus produk');
    } finally {
      setDeleteLoading(null);
    }
  };

  const fetchShopLogs = async (page = 1) => {
    setLogsLoading(true);
    try {
      const response = await shopApi.getShopLogs(page, 50);
      console.log('Shop Logs Response:', response);
      
      const logsData = response.data || [];
      setLogs(logsData);
      setLogsPagination({
        total: response.total || 0,
        per_page: response.per_page || 50,
        last_page: response.last_page || 1,
        current_page: response.current_page || 1,
      });
    } catch (error: any) {
      console.error('Error fetching shop logs:', error);
      message.error(error?.response?.data?.message || 'Gagal memuat data log');
    } finally {
      setLogsLoading(false);
    }
  };

  const handleOpenLogs = () => {
    setLogsModalOpen(true);
    fetchShopLogs(1);
  };

  const handleCloseLogs = () => {
    setLogsModalOpen(false);
    setLogs([]);
  };

  const getActionBadge = (action: string) => {
    const badges: Record<string, { color: string; label: string }> = {
      create: { color: 'success', label: 'Create' },
      update: { color: 'processing', label: 'Update' },
      delete: { color: 'warning', label: 'Delete' },
      admin_delete: { color: 'error', label: 'Admin Delete' },
    };
    return badges[action] || { color: 'default', label: action };
  };

  useEffect(() => {
    fetchShops(1);
  }, []);

  const columns: ColumnsType<Shop> = [
    {
      title: 'ID',
      dataIndex: 'product_id',
      key: 'product_id',
      width: 80,
    },
    {
      title: 'Foto',
      dataIndex: 'photo',
      key: 'photo',
      width: 100,
      render: (photo: string) => (
        <Image
          src={photo}
          alt="Product"
          width={60}
          height={60}
          style={{ objectFit: 'cover', borderRadius: '4px' }}
          fallback="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Crect width='60' height='60' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23999'%3ENo Image%3C/text%3E%3C/svg%3E"
        />
      ),
    },
    {
      title: 'Nama Produk',
      dataIndex: 'product_name',
      key: 'product_name',
      ellipsis: true,
    },
    {
      title: 'Harga',
      dataIndex: 'price',
      key: 'price',
      width: 150,
      render: (price: number) => (
        <span className="font-medium">Rp {price.toLocaleString('id-ID')}</span>
      ),
    },
    {
      title: 'User ID',
      dataIndex: 'user_id',
      key: 'user_id',
      width: 100,
    },
    {
      title: 'URL',
      dataIndex: 'url',
      key: 'url',
      width: 100,
      render: (url: string) => (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800"
        >
          <EyeOutlined className="mr-1" />
          Lihat
        </a>
      ),
    },
    {
      title: 'Tanggal',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 120,
      render: (date: string) => new Date(date).toLocaleDateString('id-ID'),
    },
    {
      title: 'Aksi',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<FileTextOutlined />}
            title="Lihat Log"
            onClick={handleOpenLogs}
          />
          <Popconfirm
            title="Hapus Produk"
            description={`Apakah Anda yakin ingin menghapus "${record.product_name}"?`}
            onConfirm={() => handleDelete(record.product_id, record.product_name)}
            okText="Ya, Hapus"
            cancelText="Batal"
            okButtonProps={{
              danger: true,
              loading: deleteLoading === record.product_id,
            }}
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              loading={deleteLoading === record.product_id}
              title="Hapus Produk"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">Manajemen Shop</h1>
            <p className="text-gray-600 mt-2">
              Total Produk: <span className="font-medium">{pagination.total}</span>
            </p>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <Table
            columns={columns}
            dataSource={shops}
            rowKey="product_id"
            loading={loading}
            pagination={{
              current: currentPage,
              total: pagination.total,
              pageSize: pagination.per_page,
              showSizeChanger: false,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} dari ${total} produk`,
              onChange: (page) => {
                fetchShops(page);
              },
            }}
            scroll={{ x: 1000 }}
          />
        </div>
      </div>

      {/* Logs Modal */}
      <Modal
        title="Shop Logs - Audit Trail"
        open={logsModalOpen}
        onCancel={handleCloseLogs}
        footer={null}
        width={1200}
      >
        <Table
          columns={[
            {
              title: 'ID',
              dataIndex: 'shop_logs_id',
              key: 'shop_logs_id',
              width: 80,
            },
            {
              title: 'User ID',
              dataIndex: 'user_id',
              key: 'user_id',
              width: 100,
            },
            {
              title: 'Action',
              dataIndex: 'action',
              key: 'action',
              width: 150,
              render: (action: string) => {
                const badge = getActionBadge(action);
                return <Tag color={badge.color}>{badge.label}</Tag>;
              },
            },
            {
              title: 'Admin Action',
              dataIndex: 'is_admin',
              key: 'is_admin',
              width: 120,
              render: (isAdmin: boolean) => (
                <Tag color={isAdmin ? 'error' : 'default'}>
                  {isAdmin ? 'Admin' : 'User'}
                </Tag>
              ),
            },
            {
              title: 'Data Snapshot',
              dataIndex: 'data_snapshot',
              key: 'data_snapshot',
              width: 300,
              render: (snapshot: any) => {
                if (!snapshot) return <span className="text-gray-400">-</span>;
                
                // Extract product name if available
                const productName = snapshot.product_name || snapshot.name || 'N/A';
                const price = snapshot.price ? `Rp ${snapshot.price.toLocaleString('id-ID')}` : 'N/A';
                
                return (
                  <div className="max-w-xs">
                    <div className="text-xs space-y-1">
                      <div><span className="font-medium">Produk:</span> {productName}</div>
                      <div><span className="font-medium">Harga:</span> {price}</div>
                      <details className="mt-2">
                        <summary className="cursor-pointer text-blue-600 hover:text-blue-800 text-xs">
                          Lihat Detail Lengkap
                        </summary>
                        <pre className="text-xs bg-gray-50 p-2 rounded mt-2 overflow-auto max-h-40">
                          {JSON.stringify(snapshot, null, 2)}
                        </pre>
                      </details>
                    </div>
                  </div>
                );
              },
            },
            {
              title: 'Tanggal',
              dataIndex: 'created_at',
              key: 'created_at',
              width: 180,
              render: (date: string) => (
                <span>{new Date(date).toLocaleString('id-ID')}</span>
              ),
            },
          ]}
          dataSource={logs}
          rowKey="shop_logs_id"
          loading={logsLoading}
          pagination={{
            current: logsPagination.current_page,
            total: logsPagination.total,
            pageSize: logsPagination.per_page,
            showSizeChanger: false,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} dari ${total} log`,
            onChange: (page) => {
              fetchShopLogs(page);
            },
          }}
          scroll={{ x: 1000 }}
        />
      </Modal>
    </AdminLayout>
  );
}

