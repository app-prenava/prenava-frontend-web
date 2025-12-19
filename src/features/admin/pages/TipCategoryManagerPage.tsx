import React, { useState, useEffect } from 'react';
import { Space, Table, Tag, Button, Input, Modal, Form, InputNumber, Switch, message } from 'antd';
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { getAllTipCategories, createTipCategory, updateTipCategory, deleteTipCategory } from '@/features/tips/tips.api';
import { TipCategory } from '@/features/tips/tips.types';
import ConfirmDialog from '../components/ConfirmDialog';

const { Column } = Table;
const { TextArea } = Input;

interface DataType extends TipCategory {
  key: React.Key;
}

interface CategoryFormData {
  name: string;
  slug: string;
  icon_name: string;
  icon_url: string;
  description: string;
  order: number;
  is_active: boolean;
}

export default function TipCategoryManagerPage() {
  const [categories, setCategories] = useState<DataType[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<DataType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<TipCategory | null>(null);
  const [form] = Form.useForm<CategoryFormData>();
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    categoryId: number;
    categoryName: string;
  }>({
    isOpen: false,
    categoryId: 0,
    categoryName: '',
  });
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    filterCategories();
  }, [categories, searchText]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const result = await getAllTipCategories();
      // Convert is_active from number (1/0) to boolean if needed
      const categoriesWithKey = result.data.map((category) => ({
        ...category,
        key: category.id,
        is_active: typeof category.is_active === 'number' 
          ? category.is_active === 1 
          : Boolean(category.is_active),
      }));
      setCategories(categoriesWithKey);
    } catch (error: any) {
      console.error('Failed to fetch categories:', error);
      message.error(error?.response?.data?.message || 'Gagal memuat kategori');
    } finally {
      setLoading(false);
    }
  };

  const filterCategories = () => {
    let filtered = categories;

    if (searchText) {
      filtered = filtered.filter(category =>
        category.name.toLowerCase().includes(searchText.toLowerCase()) ||
        category.slug.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    setFilteredCategories(filtered);
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const openCreateModal = () => {
    setEditingCategory(null);
    form.resetFields();
    // Set default values after reset
    setTimeout(() => {
      form.setFieldsValue({
        name: '',
        slug: '',
        icon_name: '',
        icon_url: '',
        description: '',
        order: 0,
        is_active: true,
      });
    }, 0);
    setModalOpen(true);
  };

  const openEditModal = (category: TipCategory) => {
    setEditingCategory(category);
    // Ensure is_active is boolean
    const isActive = typeof category.is_active === 'number' 
      ? category.is_active === 1 
      : Boolean(category.is_active);
    
    form.setFieldsValue({
      name: category.name,
      slug: category.slug,
      icon_name: category.icon_name || '',
      icon_url: category.icon_url || '',
      description: category.description || '',
      order: category.order,
      is_active: isActive,
    });
    setModalOpen(true);
  };

  const handleDelete = (categoryId: number, categoryName: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (category && category.tips_count > 0) {
      message.warning(`Kategori "${categoryName}" memiliki ${category.tips_count} tips. Hapus tips terlebih dahulu sebelum menghapus kategori.`);
      return;
    }
    setConfirmDialog({
      isOpen: true,
      categoryId,
      categoryName,
    });
  };

  const handleSubmit = async (values: CategoryFormData) => {
      // Convert empty strings to null for optional fields
      // Backend mengharapkan is_active sebagai number (1/0) bukan boolean
      const isActiveValue = values.is_active !== undefined ? values.is_active : true;
      const payload: any = {
        name: values.name.trim(),
        slug: values.slug.trim(),
        icon_name: values.icon_name && values.icon_name.trim() ? values.icon_name.trim() : null,
        icon_url: values.icon_url && values.icon_url.trim() ? values.icon_url.trim() : null,
        description: values.description && values.description.trim() ? values.description.trim() : null,
        order: values.order ? Number(values.order) : 0,
        is_active: isActiveValue ? 1 : 0, // Convert boolean to number
      };
    
    console.log('Submitting category payload:', JSON.stringify(payload, null, 2));

    try {
      setActionLoading(true);

      if (editingCategory) {
        const result = await updateTipCategory(editingCategory.id, payload);
        console.log('Update category success:', result);
        message.success('Kategori berhasil diperbarui');
        
        // Update local state with response data
        if (result.data) {
          const updatedCategory = {
            ...result.data,
            key: result.data.id,
            is_active: typeof result.data.is_active === 'number' 
              ? result.data.is_active === 1 
              : Boolean(result.data.is_active),
          };
          setCategories(prev => prev.map(cat =>
            cat.id === updatedCategory.id ? updatedCategory : cat
          ));
        }
      } else {
        const result = await createTipCategory(payload);
        console.log('Create category success:', result);
        message.success('Kategori berhasil dibuat');
      }
      setModalOpen(false);
      form.resetFields();
      // Refresh to ensure sync
      await fetchCategories();
    } catch (error: any) {
      console.error('Failed to save category:', error);
      console.error('Error response:', error?.response?.data);
      console.error('Payload sent:', JSON.stringify(payload, null, 2));
      
      // Get detailed error message
      let errorMessage = 'Gagal menyimpan kategori';
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
      await deleteTipCategory(confirmDialog.categoryId);
      message.success('Kategori berhasil dihapus');
      setConfirmDialog({
        isOpen: false,
        categoryId: 0,
        categoryName: '',
      });
      fetchCategories();
    } catch (error: any) {
      console.error('Failed to delete category:', error);
      message.error(error?.response?.data?.message || 'Gagal menghapus kategori');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusToggle = async (categoryId: number, categoryName: string, newStatus: boolean) => {
    try {
      setActionLoading(true);
      // Backend mengharapkan number (1/0) bukan boolean
      const payload = { is_active: newStatus ? 1 : 0 };
      
      console.log('Toggling category status:', {
        categoryId,
        categoryName,
        newStatus,
        payload
      });
      
      // Optimistically update UI first
      setCategories(prev => prev.map(category =>
        category.id === categoryId ? { ...category, is_active: newStatus } : category
      ));
      
      const result = await updateTipCategory(categoryId, payload);
      
      console.log('Status toggle success:', result);
      console.log('Result data:', result.data);
      
      // Update local state with response data from backend to ensure sync
      if (result && result.data) {
        const updatedIsActive = typeof result.data.is_active === 'number' 
          ? result.data.is_active === 1 
          : Boolean(result.data.is_active);
        
        const updatedCategory = {
          ...result.data,
          key: result.data.id,
          is_active: updatedIsActive,
        };
        
        console.log('Updating state with:', updatedCategory);
        console.log('is_active value:', updatedIsActive);
        
        setCategories(prev => prev.map(category =>
          category.id === categoryId ? updatedCategory : category
        ));
      }
      
      message.success(`Kategori "${categoryName}" berhasil ${newStatus ? 'diaktifkan' : 'dinonaktifkan'}`);
    } catch (error: any) {
      console.error('Failed to toggle category status:', error);
      console.error('Error response:', error?.response?.data);
      console.error('Error status:', error?.response?.status);
      
      // Revert optimistic update on error
      setCategories(prev => prev.map(category =>
        category.id === categoryId ? { ...category, is_active: !newStatus } : category
      ));
      
      let errorMessage = 'Gagal mengubah status kategori';
      if (error?.response?.data) {
        const errorData = error.response.data;
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.errors) {
          const errors = Object.values(errorData.errors).flat();
          errorMessage = Array.isArray(errors) ? errors.join(', ') : String(errors);
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }
      }
      message.error(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleNameChange = (name: string) => {
    form.setFieldsValue({ name, slug: generateSlug(name) });
  };

  const getStatusTag = (isActive: boolean) => {
    if (isActive) {
      return (
        <Tag icon={<CheckCircleOutlined />} color="success">
          Active
        </Tag>
      );
    } else {
      return (
        <Tag icon={<CloseCircleOutlined />} color="error">
          Inactive
        </Tag>
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Kategori Tips</h1>
          <p className="text-gray-600">Kelola kategori tips kehamilan</p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          style={{ backgroundColor: '#FA6978', borderColor: '#FA6978' }}
          onClick={openCreateModal}
        >
          Tambah Kategori
        </Button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <Input
          placeholder="Cari kategori..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => handleSearch(e.target.value)}
          size="large"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <Table<DataType>
          dataSource={filteredCategories}
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} dari ${total} kategori`,
          }}
        >
          <Column
            title="Nama"
            dataIndex="name"
            key="name"
            render={(name: string, record: DataType) => (
              <div>
                <div className="font-medium">{name}</div>
                <div className="text-sm text-gray-500">/{record.slug}</div>
              </div>
            )}
          />
          <Column
            title="Icon"
            key="icon"
            render={(_, record: DataType) => (
              <div className="flex items-center gap-2">
                {record.icon_url ? (
                  record.icon_url.trim().startsWith('<svg') ? (
                    <div 
                      className="w-6 h-6 flex items-center justify-center"
                      dangerouslySetInnerHTML={{ __html: record.icon_url }}
                    />
                  ) : (
                    <img src={record.icon_url} alt={record.icon_name || ''} className="w-6 h-6" />
                  )
                ) : (
                  <span className="text-gray-400">-</span>
                )}
                {record.icon_name && (
                  <span className="text-sm text-gray-500">{record.icon_name}</span>
                )}
              </div>
            )}
          />
          <Column
            title="Deskripsi"
            dataIndex="description"
            key="description"
            render={(description: string | null) => (
              <span className="text-gray-600">{description || '-'}</span>
            )}
            ellipsis
          />
          <Column
            title="Tips Count"
            dataIndex="tips_count"
            key="tips_count"
            render={(count: number) => (
              <Tag color="blue">{count}</Tag>
            )}
          />
          <Column
            title="Status"
            dataIndex="is_active"
            key="is_active"
            render={(isActive: boolean | number, record: DataType) => {
              // Ensure isActive is boolean
              const isActiveBool = typeof isActive === 'number' ? isActive === 1 : Boolean(isActive);
              const isLoading = actionLoading;
              return (
                <div className="flex items-center gap-2">
                  {getStatusTag(isActiveBool)}
                  <Switch
                    checked={isActiveBool}
                    onChange={(checked) => {
                      console.log('Switch clicked:', { 
                        categoryId: record.id, 
                        categoryName: record.name, 
                        currentStatus: isActiveBool,
                        newStatus: checked 
                      });
                      handleStatusToggle(record.id, record.name, checked);
                    }}
                    size="small"
                    loading={isLoading}
                    disabled={isLoading}
                  />
                </div>
              );
            }}
          />
          <Column
            title="Order"
            dataIndex="order"
            key="order"
            sorter={(a, b) => a.order - b.order}
          />
          <Column
            title="Action"
            key="action"
            render={(_, record: DataType) => (
              <Space size="middle">
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  title="Edit Kategori"
                  onClick={() => openEditModal(record)}
                />
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  title="Delete Kategori"
                  onClick={() => handleDelete(record.id, record.name)}
                  disabled={record.tips_count > 0}
                />
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
        }}
        onOk={() => form.submit()}
        title={editingCategory ? 'Edit Kategori' : 'Tambah Kategori'}
        confirmLoading={actionLoading}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            label="Nama"
            name="name"
            rules={[{ required: true, message: 'Nama wajib diisi' }]}
          >
            <Input
              placeholder="Nama kategori"
              onChange={(e) => handleNameChange(e.target.value)}
            />
          </Form.Item>

          <Form.Item
            label="Slug"
            name="slug"
            rules={[
              { required: true, message: 'Slug wajib diisi' },
              { pattern: /^[a-z0-9-]+$/, message: 'Slug hanya boleh huruf kecil, angka, dan tanda hubung' },
            ]}
          >
            <Input placeholder="slug-kategori" />
          </Form.Item>

          <Form.Item
            label="Icon Name"
            name="icon_name"
          >
            <Input placeholder="Nama icon (opsional)" />
          </Form.Item>

          <Form.Item
            label="Icon URL"
            name="icon_url"
            help="Bisa berupa URL, SVG string, atau data URL"
          >
            <TextArea
              rows={3}
              placeholder="URL icon, SVG string (contoh: &lt;svg&gt;...&lt;/svg&gt;), atau data URL (opsional)"
            />
          </Form.Item>

          <Form.Item
            label="Deskripsi"
            name="description"
          >
            <TextArea
              rows={3}
              placeholder="Deskripsi kategori (opsional)"
            />
          </Form.Item>

          <Form.Item
            label="Order"
            name="order"
            initialValue={0}
            rules={[{ type: 'number', min: 0, message: 'Order harus berupa angka positif' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            label="Status"
            name="is_active"
            valuePropName="checked"
            initialValue={true}
            getValueFromEvent={(checked) => checked}
          >
            <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Konfirmasi Hapus"
        message={`Apakah Anda yakin ingin menghapus kategori "${confirmDialog.categoryName}"?`}
        confirmText="Hapus"
        cancelText="Batal"
        confirmButtonColor="red"
        onConfirm={confirmDelete}
        onCancel={() => setConfirmDialog({ isOpen: false, categoryId: 0, categoryName: '' })}
        loading={actionLoading}
      />
    </div>
  );
}


