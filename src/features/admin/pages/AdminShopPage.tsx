import { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Image,
  message,
  Popconfirm,
  Space,
  Modal,
  Tag,
  Form,
  Input,
  Select,
  Upload,
  Card,
  Tooltip,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { UploadFile } from 'antd/es/upload/interface';
import {
  DeleteOutlined,
  EyeOutlined,
  FileTextOutlined,
  PlusOutlined,
  EditOutlined,
  UploadOutlined,
  StarFilled,
  SearchOutlined,
} from '@ant-design/icons';
import AdminLayout from '../components/AdminLayout';
import { shopApi } from '../shop.api';
import { Shop, ShopLog } from '../shop.types';

const CATEGORY_OPTIONS = [
  'Pakaian Hamil',
  'Suplemen',
  'Bantal Hamil',
  'Bantal Menyusui',
  'Perawatan Kulit',
  'Alat Kesehatan',
  'Olahraga',
  'Perlengkapan Bayi',
  'Makanan & Minuman',
  'Lainnya',
];

export default function AdminShopPage() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    per_page: 30,
    last_page: 1,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Delete State
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);

  // Modal Create/Edit State
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Shop | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [form] = Form.useForm();

  // Logs Modal State
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
      const response = await shopApi.getAllShops(page, 50);
      const shopsData = response.data || [];
      const paginationData = {
        total: response.total || 0,
        per_page: response.per_page || 50,
        last_page: response.last_page || 1,
      };

      setShops(shopsData);
      setPagination(paginationData);
      setCurrentPage(response.current_page || 1);
    } catch (error: any) {
      console.error('Error fetching shops:', error);
      if (error?.response?.status === 403) {
        message.error('Akses ditolak. Pastikan Anda memiliki izin role admin.');
      } else {
        message.error(error?.response?.data?.message || 'Gagal memuat data produk');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShops(1);
  }, []);

  // Filtered Shops
  const filteredShops = shops.filter((item) => {
    const matchName = item.product_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = selectedCategory ? item.category === selectedCategory : true;
    return matchName && matchCategory;
  });

  // Open Form Modal for Create
  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    form.resetFields();
    setFileList([]);
    setFormModalOpen(true);
  };

  // Open Form Modal for Edit
  const handleOpenEditModal = (product: Shop) => {
    setEditingProduct(product);
    form.setFieldsValue({
      product_name: product.product_name,
      category: product.category || 'Lainnya',
      price: product.price,
      url: product.url,
      description: product.description,
      photo_url: product.photo && product.photo.startsWith('http') ? product.photo : undefined,
    });
    setFileList([]);
    setFormModalOpen(true);
  };

  // Submit Create / Edit Product
  const handleFormSubmit = async () => {
    try {
      const values = await form.validateFields();
      setFormSubmitting(true);

      const formData = new FormData();
      formData.append('product_name', values.product_name);
      formData.append('price', String(values.price));
      if (values.category) formData.append('category', values.category);
      if (values.description) formData.append('description', values.description);
      formData.append('url', values.url);

      if (fileList.length > 0 && fileList[0].originFileObj) {
        formData.append('photo', fileList[0].originFileObj);
      } else if (values.photo_url) {
        formData.append('photo_url', values.photo_url);
      }

      if (editingProduct) {
        // Update
        const res = await shopApi.updateShop(editingProduct.product_id, formData);
        message.success(res.message || 'Produk berhasil diperbarui');
      } else {
        // Create
        const res = await shopApi.createShop(formData);
        message.success(res.message || 'Produk berhasil ditambahkan');
      }

      setFormModalOpen(false);
      form.resetFields();
      setFileList([]);
      fetchShops(currentPage);
    } catch (err: any) {
      console.error('Error submitting form:', err);
      message.error(err?.response?.data?.message || 'Gagal menyimpan produk. Periksa kembali form.');
    } finally {
      setFormSubmitting(false);
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

  const formatPrice = (price: number | string) => {
    const num = typeof price === 'string' ? parseInt(price.replace(/\D/g, ''), 10) : price;
    if (isNaN(num)) return 'Rp 0';
    return `Rp ${num.toLocaleString('id-ID')}`;
  };

  const columns: ColumnsType<Shop> = [
    {
      title: 'ID',
      dataIndex: 'product_id',
      key: 'product_id',
      width: 70,
    },
    {
      title: 'Foto',
      dataIndex: 'photo',
      key: 'photo',
      width: 80,
      render: (photo: string) => (
        <Image
          src={photo}
          alt="Product"
          width={55}
          height={55}
          style={{ objectFit: 'cover', borderRadius: '8px' }}
          fallback="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Crect width='60' height='60' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23999'%3ENo Image%3C/text%3E%3C/svg%3E"
        />
      ),
    },
    {
      title: 'Nama Produk',
      dataIndex: 'product_name',
      key: 'product_name',
      render: (name: string, record: Shop) => (
        <div className="flex flex-col">
          <span className="font-semibold text-gray-900">{name}</span>
          {record.description && (
            <span className="text-xs text-gray-500 line-clamp-1">{record.description}</span>
          )}
        </div>
      ),
    },
    {
      title: 'Kategori',
      dataIndex: 'category',
      key: 'category',
      width: 140,
      render: (cat: string) => (
        <Tag color="magenta" className="rounded-md font-medium text-xs">
          {cat || 'Lainnya'}
        </Tag>
      ),
    },
    {
      title: 'Harga',
      dataIndex: 'price',
      key: 'price',
      width: 130,
      render: (price: number | string) => (
        <span className="font-semibold text-gray-800">{formatPrice(price)}</span>
      ),
    },
    {
      title: 'Rating',
      key: 'rating',
      width: 110,
      render: (_, record: Shop) => (
        <div className="flex items-center gap-1 text-xs">
          <StarFilled className="text-amber-400" />
          <span className="font-bold text-gray-800">{record.average_rating || 0}</span>
          <span className="text-gray-400">({record.rating_count || 0})</span>
        </div>
      ),
    },
    {
      title: 'Link Toko',
      dataIndex: 'url',
      key: 'url',
      width: 100,
      render: (url: string) => (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-rose-600 hover:text-rose-800 font-medium text-xs flex items-center gap-1"
        >
          <EyeOutlined /> Lihat
        </a>
      ),
    },
    {
      title: 'Aksi',
      key: 'action',
      width: 140,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Edit Produk">
            <Button
              type="text"
              icon={<EditOutlined className="text-blue-600" />}
              onClick={() => handleOpenEditModal(record)}
            />
          </Tooltip>

          <Popconfirm
            title="Hapus Produk"
            description={`Hapus produk "${record.product_name}"?`}
            onConfirm={() => handleDelete(record.product_id, record.product_name)}
            okText="Hapus"
            cancelText="Batal"
            okButtonProps={{
              danger: true,
              loading: deleteLoading === record.product_id,
            }}
          >
            <Tooltip title="Hapus Produk">
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                loading={deleteLoading === record.product_id}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6 pb-8">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-gray-100">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
              Manajemen Shop
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Kelola katalog produk rekomendasi dan perlengkapan ibu hamil. Total: <strong>{pagination.total}</strong> produk.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              icon={<FileTextOutlined />}
              onClick={handleOpenLogs}
              className="rounded-xl flex items-center gap-1.5"
            >
              Audit Log
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleOpenCreateModal}
              className="rounded-xl flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 border-0"
            >
              Tambah Produk
            </Button>
          </div>
        </div>

        {/* Filter & Search Controls */}
        <Card className="rounded-2xl border-gray-100 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="w-full sm:w-80">
              <Input
                placeholder="Cari nama produk..."
                prefix={<SearchOutlined className="text-gray-400" />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                allowClear
                className="rounded-xl"
              />
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <span className="text-xs text-gray-500 font-medium">Kategori:</span>
              <Select
                value={selectedCategory}
                onChange={(val) => setSelectedCategory(val)}
                className="w-48"
                allowClear
                placeholder="Semua Kategori"
              >
                {CATEGORY_OPTIONS.map((cat) => (
                  <Select.Option key={cat} value={cat}>
                    {cat}
                  </Select.Option>
                ))}
              </Select>
            </div>
          </div>
        </Card>

        {/* Products Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <Table
            columns={columns}
            dataSource={filteredShops}
            rowKey="product_id"
            loading={loading}
            pagination={{
              current: currentPage,
              total: pagination.total,
              pageSize: pagination.per_page,
              showSizeChanger: false,
              showTotal: (total, range) => `${range[0]}-${range[1]} dari ${total} produk`,
              onChange: (page) => fetchShops(page),
            }}
            scroll={{ x: 1000 }}
          />
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      <Modal
        title={
          <div className="text-lg font-bold text-gray-900 pb-2 border-b border-gray-100">
            {editingProduct ? 'Edit Data Produk' : 'Tambah Produk Baru'}
          </div>
        }
        open={formModalOpen}
        onCancel={() => setFormModalOpen(false)}
        onOk={handleFormSubmit}
        confirmLoading={formSubmitting}
        okText={editingProduct ? 'Simpan Perubahan' : 'Tambah Produk'}
        cancelText="Batal"
        width={650}
        okButtonProps={{ className: 'bg-rose-600 hover:bg-rose-700' }}
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item
            name="product_name"
            label="Nama Produk"
            rules={[{ required: true, message: 'Nama produk wajib diisi' }]}
          >
            <Input placeholder="Contoh: Pregnancy Pillow U-Shape" className="rounded-lg" />
          </Form.Item>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Form.Item
              name="category"
              label="Kategori Produk"
              rules={[{ required: true, message: 'Pilih kategori produk' }]}
            >
              <Select placeholder="Pilih Kategori" className="rounded-lg">
                {CATEGORY_OPTIONS.map((cat) => (
                  <Select.Option key={cat} value={cat}>
                    {cat}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="price"
              label="Harga Produk (Rp)"
              rules={[{ required: true, message: 'Harga wajib diisi' }]}
            >
              <Input placeholder="Contoh: 250000" className="rounded-lg" />
            </Form.Item>
          </div>

          <Form.Item
            name="url"
            label="Tautan Pembelian (URL Shopee / Tokopedia)"
            rules={[
              { required: true, message: 'URL pembelian wajib diisi' },
              { type: 'url', message: 'Format URL tidak valid (harus menyertakan https://)' },
            ]}
          >
            <Input placeholder="https://shopee.co.id/..." className="rounded-lg" />
          </Form.Item>

          <Form.Item name="description" label="Deskripsi Produk">
            <Input.TextArea
              rows={3}
              placeholder="Jelaskan manfaat, keunggulan, dan kegunaan produk bagi ibu hamil..."
              className="rounded-lg"
            />
          </Form.Item>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Form.Item label="Upload Foto Produk">
              <Upload
                beforeUpload={() => false}
                fileList={fileList}
                onChange={({ fileList }) => setFileList(fileList.slice(-1))}
                maxCount={1}
                accept="image/*"
              >
                <Button icon={<UploadOutlined />}>Pilih File Gambar</Button>
              </Upload>
            </Form.Item>

            <Form.Item name="photo_url" label="Atau Gunakan URL Gambar Langsung">
              <Input placeholder="https://.../gambar.png" className="rounded-lg" />
            </Form.Item>
          </div>
        </Form>
      </Modal>

      {/* Logs Modal */}
      <Modal
        title="Shop Logs - Audit Trail"
        open={logsModalOpen}
        onCancel={handleCloseLogs}
        footer={null}
        width={1000}
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
              title: 'Aksi',
              dataIndex: 'action',
              key: 'action',
              width: 120,
              render: (act: string) => {
                const color = act.includes('delete') ? 'red' : act === 'create' ? 'green' : 'blue';
                return <Tag color={color}>{act.toUpperCase()}</Tag>;
              },
            },
            {
              title: 'Oleh Admin',
              dataIndex: 'is_admin',
              key: 'is_admin',
              width: 100,
              render: (isAdmin: boolean) => (isAdmin ? <Tag color="gold">ADMIN</Tag> : <Tag>USER</Tag>),
            },
            {
              title: 'Waktu',
              dataIndex: 'created_at',
              key: 'created_at',
              width: 180,
              render: (date: string) => new Date(date).toLocaleString('id-ID'),
            },
          ]}
          dataSource={logs}
          rowKey="shop_logs_id"
          loading={logsLoading}
          pagination={{
            current: logsPagination.current_page,
            total: logsPagination.total,
            pageSize: logsPagination.per_page,
            onChange: (p) => fetchShopLogs(p),
          }}
        />
      </Modal>
    </AdminLayout>
  );
}
