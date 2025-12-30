import React, { useState, useEffect } from 'react';
import { Space, Table, Tag, Button, Input, Select, Modal, Form, InputNumber, Switch, message } from 'antd';
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { getAllTips, createTip, updateTip, deleteTip } from '@/features/tips/tips.api';
import { getAllTipCategories } from '@/features/tips/tips.api';
import { PregnancyTip, TipCategory } from '@/features/tips/tips.types';
import { storage } from '@/lib/storage';
import { me } from '@/features/auth/auth.api';
import ConfirmDialog from '../components/ConfirmDialog';

const { Column } = Table;
const { Option } = Select;

interface DataType extends PregnancyTip {
  key: React.Key;
}

interface TipFormData {
  category_id: number;
  judul: string;
  konten: string;
  is_published: boolean;
  order: number;
}

export default function TipManagerPage() {
  const [tips, setTips] = useState<DataType[]>([]);
  const [filteredTips, setFilteredTips] = useState<DataType[]>([]);
  const [categories, setCategories] = useState<TipCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>(undefined);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTip, setEditingTip] = useState<PregnancyTip | null>(null);
  const [form] = Form.useForm<TipFormData>();
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    tipId: number;
    tipTitle: string;
  }>({
    isOpen: false,
    tipId: 0,
    tipTitle: '',
  });
  const [actionLoading, setActionLoading] = useState(false);
  const [konten, setKonten] = useState('');
  const [userId, setUserId] = useState<number>(0);

  const userRole = storage.getRole();

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const userInfo = await me();
        setUserId(userInfo.user.user_id);
      } catch (error) {
        // Fallback to storage if API fails
        const storedUserId = storage.get('userId');
        if (storedUserId) {
          setUserId(parseInt(storedUserId, 10));
        }
      }
    };
    fetchUserInfo();
  }, []);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (userId || userRole === 'admin') {
      fetchTips();
    }
  }, [userId, selectedCategoryId, searchText]);

  useEffect(() => {
    filterTips();
  }, [tips, searchText, selectedCategoryId]);

  const fetchCategories = async () => {
    try {
      const result = await getAllTipCategories();
      // Konversi is_active ke boolean, tapi JANGAN filter;
      // saat edit kita tetap perlu bisa melihat kategori yang sudah nonaktif.
      const normalizedCategories = result.data.map(cat => ({
        ...cat,
        is_active:
          typeof cat.is_active === 'number'
            ? cat.is_active === 1
            : Boolean(cat.is_active),
      }));
      setCategories(normalizedCategories);
    } catch (error: any) {
      console.error('Failed to fetch categories:', error);
      message.error('Gagal memuat kategori');
    }
  };

  const fetchTips = async () => {
    try {
      setLoading(true);
      const filters: { category_id?: number; search?: string } = {};
      if (selectedCategoryId) filters.category_id = selectedCategoryId;
      if (searchText) filters.search = searchText;

      const result = await getAllTips(filters);
      let tipsData = result.data.map((tip) => ({
        ...tip,
        // Normalisasi is_published agar selalu boolean walaupun backend kirim 0/1
        is_published:
          typeof tip.is_published === 'number'
            ? tip.is_published === 1
            : Boolean(tip.is_published),
      }));
      
      // Bidan hanya bisa melihat tips miliknya
      if (userRole === 'bidan' && userId) {
        tipsData = tipsData.filter(tip => tip.created_by?.id === userId);
      }
      
      const tipsWithKey = tipsData.map((tip) => ({
        ...tip,
        key: tip.id,
      }));
      setTips(tipsWithKey);
    } catch (error: any) {
      console.error('Failed to fetch tips:', error);
      message.error(error?.response?.data?.message || 'Gagal memuat tips');
    } finally {
      setLoading(false);
    }
  };

  const filterTips = () => {
    let filtered = tips;

    if (searchText) {
      filtered = filtered.filter(tip =>
        tip.judul.toLowerCase().includes(searchText.toLowerCase()) ||
        tip.konten.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    if (selectedCategoryId) {
      filtered = filtered.filter(tip => tip.category?.id === selectedCategoryId);
    }

    setFilteredTips(filtered);
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const handleCategoryFilter = (categoryId: number | undefined) => {
    setSelectedCategoryId(categoryId);
  };

  const openCreateModal = () => {
    try {
      setEditingTip(null);
      setKonten('');
      form.resetFields();
      form.setFieldsValue({
        category_id: undefined,
        judul: '',
        is_published: false,
        order: 0,
      });
      setModalOpen(true);
    } catch (error) {
      console.error('Error opening create modal:', error);
      message.error('Gagal membuka form');
    }
  };

  const openEditModal = (tip: PregnancyTip) => {
    // Check authorization: Bidan hanya bisa edit tips miliknya
    if (userRole === 'bidan' && tip.created_by?.id !== userId) {
      message.error('Anda tidak memiliki izin untuk mengedit tips ini');
      return;
    }

    setEditingTip(tip);
    setKonten(tip.konten || '');
    setModalOpen(true);

    // Pastikan form sudah ter-mount sebelum mengisi nilai
    setTimeout(() => {
      form.setFieldsValue({
        category_id: tip.category?.id,
        judul: tip.judul,
        is_published:
          typeof tip.is_published === 'number'
            ? tip.is_published === 1
            : Boolean(tip.is_published),
        order: tip.order,
      });
    }, 0);
  };

  const handleDelete = (tipId: number, tipTitle: string) => {
    const tip = tips.find(t => t.id === tipId);
    // Check authorization: Bidan hanya bisa delete tips miliknya
    if (userRole === 'bidan' && tip?.created_by?.id !== userId) {
      message.error('Anda tidak memiliki izin untuk menghapus tips ini');
      return;
    }
    setConfirmDialog({
      isOpen: true,
      tipId,
      tipTitle,
    });
  };

  const handleSubmit = async (values: TipFormData) => {
    // Validate konten
    if (!konten || konten.trim() === '' || konten === '<p><br></p>') {
      message.error('Konten wajib diisi');
      return;
    }

    // Validate required fields
    if (!values.category_id) {
      message.error('Kategori wajib dipilih');
      return;
    }

    if (!values.judul || !values.judul.trim()) {
      message.error('Judul wajib diisi');
      return;
    }

    const submitData = {
      category_id: Number(values.category_id),
      judul: values.judul.trim(),
      konten: konten.trim(),
      is_published: values.is_published !== undefined ? Boolean(values.is_published) : false,
      order: values.order ? Number(values.order) : 0,
    };

    console.log('Submitting tip payload:', JSON.stringify(submitData, null, 2));

    try {
      setActionLoading(true);

      if (editingTip) {
        const result = await updateTip(editingTip.id, submitData);
        console.log('Update tip success:', result);
        message.success('Tips berhasil diperbarui');
      } else {
        const result = await createTip(submitData);
        console.log('Create tip success:', result);
        message.success('Tips berhasil dibuat');
      }
      setModalOpen(false);
      form.resetFields();
      setKonten('');
      fetchTips();
    } catch (error: any) {
      console.error('Failed to save tip:', error);
      console.error('Error response:', error?.response?.data);
      console.error('Payload sent:', JSON.stringify(submitData, null, 2));
      
      // Get detailed error message
      let errorMessage = 'Gagal menyimpan tips';
      if (error?.response?.data) {
        const errorData = error.response.data;
        console.error('Error data structure:', errorData);
        
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.errors) {
          // Laravel validation errors format
          const errors = Object.values(errorData.errors).flat();
          errorMessage = Array.isArray(errors) ? errors.join(', ') : String(errors);
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        }
      }
      message.error(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const confirmDelete = async () => {
    try {
      setActionLoading(true);
      await deleteTip(confirmDialog.tipId);
      message.success('Tips berhasil dihapus');
      setConfirmDialog({
        isOpen: false,
        tipId: 0,
        tipTitle: '',
      });
      fetchTips();
    } catch (error: any) {
      console.error('Failed to delete tip:', error);
      message.error(error?.response?.data?.message || 'Gagal menghapus tips');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusTag = (isPublished: boolean) => {
    if (isPublished) {
      return (
        <Tag icon={<CheckCircleOutlined />} color="success">
          Published
        </Tag>
      );
    } else {
      return (
        <Tag icon={<CloseCircleOutlined />} color="default">
          Draft
        </Tag>
      );
    }
  };

  const canEdit = (tip: PregnancyTip) => {
    if (userRole === 'admin') return true;
    if (userRole === 'bidan') return tip.created_by?.id === userId;
    return false;
  };

  const canDelete = (tip: PregnancyTip) => {
    if (userRole === 'admin') return true;
    if (userRole === 'bidan') return tip.created_by?.id === userId;
    return false;
  };

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link'],
      ['clean']
    ],
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Tips Kehamilan</h1>
          <p className="text-gray-600">Kelola tips kehamilan</p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          style={{ backgroundColor: '#FA6978', borderColor: '#FA6978' }}
          onClick={openCreateModal}
        >
          Tambah Tips
        </Button>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Input
              placeholder="Cari tips..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => handleSearch(e.target.value)}
              size="large"
            />
          </div>
          <Select
            placeholder="Filter Kategori"
            allowClear
            style={{ width: 200 }}
            size="large"
            value={selectedCategoryId}
            onChange={handleCategoryFilter}
          >
            {categories.map(category => (
              <Option key={category.id} value={category.id}>
                {category.name}
              </Option>
            ))}
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <Table<DataType>
          dataSource={filteredTips}
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} dari ${total} tips`,
          }}
        >
          <Column
            title="Judul"
            dataIndex="judul"
            key="judul"
            render={(judul: string) => (
              <div className="font-medium">{judul}</div>
            )}
            ellipsis
          />
          <Column
            title="Kategori"
            key="category"
            render={(_, record: DataType) => (
              <Tag color="blue">{record.category?.name || '-'}</Tag>
            )}
          />
          <Column
            title="Created By"
            key="created_by"
            render={(_, record: DataType) => (
              <span className="text-gray-600">{record.created_by?.name || '-'}</span>
            )}
          />
          <Column
            title="Status"
            dataIndex="is_published"
            key="is_published"
            render={(isPublished: boolean) => getStatusTag(isPublished)}
          />
          <Column
            title="Created At"
            dataIndex="created_at"
            key="created_at"
            render={(date: string) => (
              <span className="text-gray-600">
                {new Date(date).toLocaleDateString('id-ID')}
              </span>
            )}
          />
          <Column
            title="Action"
            key="action"
            render={(_, record: DataType) => (
              <Space size="middle">
                {canEdit(record) && (
                  <Button
                    type="text"
                    icon={<EditOutlined />}
                    title="Edit Tips"
                    onClick={() => openEditModal(record)}
                  />
                )}
                {canDelete(record) && (
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    title="Delete Tips"
                    onClick={() => handleDelete(record.id, record.judul)}
                  />
                )}
              </Space>
            )}
          />
        </Table>
      </div>

      {/* Create/Edit Modal */}
      <Modal
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          form.resetFields();
          setKonten('');
          setEditingTip(null);
        }}
        onOk={() => {
          form.validateFields().then(() => {
            form.submit();
          }).catch(() => {
            // Form validation failed
          });
        }}
        title={editingTip ? 'Edit Tips' : 'Tambah Tips'}
        confirmLoading={actionLoading}
        width={900}
        style={{ top: 20 }}
        destroyOnHidden
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          preserve={false}
        >
          <Form.Item
            label="Kategori"
            name="category_id"
            rules={[{ required: true, message: 'Kategori wajib dipilih' }]}
          >
            <Select placeholder="Pilih kategori" size="large">
              {categories.map(category => (
                <Option key={category.id} value={category.id}>
                  {category.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Judul"
            name="judul"
            rules={[{ required: true, message: 'Judul wajib diisi' }]}
          >
            <Input placeholder="Judul tips" size="large" />
          </Form.Item>

          <Form.Item
            label="Konten"
            required
            rules={[
              {
                validator: () => {
                  if (!konten || konten.trim() === '' || konten === '<p><br></p>') {
                    return Promise.reject(new Error('Konten wajib diisi'));
                  }
                  return Promise.resolve();
                },
              },
            ]}
            help="Gunakan editor untuk menulis konten tips"
          >
            <div style={{ minHeight: '300px', marginBottom: '24px' }}>
              <ReactQuill
                theme="snow"
                value={konten}
                onChange={(value) => {
                  setKonten(value);
                  // Trigger form validation
                  setTimeout(() => {
                    form.validateFields(['konten']).catch(() => {});
                  }, 100);
                }}
                modules={quillModules}
                style={{ height: '250px' }}
                placeholder="Tulis konten tips di sini..."
              />
            </div>
          </Form.Item>

          <Form.Item
            label="Status"
            name="is_published"
            valuePropName="checked"
            initialValue={false}
            getValueFromEvent={(checked) => checked}
          >
            <Switch checkedChildren="Published" unCheckedChildren="Draft" />
          </Form.Item>

          <Form.Item
            label="Order"
            name="order"
            initialValue={0}
            rules={[{ type: 'number', min: 0, message: 'Order harus berupa angka positif' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} size="large" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Konfirmasi Hapus"
        message={`Apakah Anda yakin ingin menghapus tips "${confirmDialog.tipTitle}"?`}
        confirmText="Hapus"
        cancelText="Batal"
        confirmButtonColor="red"
        onConfirm={confirmDelete}
        onCancel={() => setConfirmDialog({ isOpen: false, tipId: 0, tipTitle: '' })}
        loading={actionLoading}
      />
    </div>
  );
}


