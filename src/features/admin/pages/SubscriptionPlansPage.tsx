import { useState } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Switch,
  Tag,
  Space,
  message,
  Popconfirm,
  Card,
  Typography,
  Tooltip,
  Skeleton,
  Empty,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  useSubscriptionPlans,
  useCreateSubscriptionPlan,
  useUpdateSubscriptionPlan,
  useDeleteSubscriptionPlan,
  useToggleSubscriptionPlanStatus,
} from '@/hooks/useBidanManagement';
import type { SubscriptionPlan } from '@/features/admin/bidan.types';

const { Title } = Typography;

// Form validation schema
const planSchema = z.object({
  name: z.string().min(1, 'Nama paket wajib diisi'),
  description: z.string().min(1, 'Deskripsi wajib diisi'),
  price: z.number().min(0, 'Harga tidak boleh negatif'),
  duration_days: z.number().min(1, 'Durasi minimal 1 hari'),
  features: z.string().min(1, 'Fitur wajib diisi'),
  is_active: z.boolean(),
});

type PlanFormValues = z.infer<typeof planSchema>;

const SubscriptionPlansPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);

  // React Query hooks
  const { data: plans, isLoading, error, refetch } = useSubscriptionPlans();
  const createMutation = useCreateSubscriptionPlan();
  const updateMutation = useUpdateSubscriptionPlan();
  const deleteMutation = useDeleteSubscriptionPlan();
  const toggleMutation = useToggleSubscriptionPlanStatus();

  // React Hook Form
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PlanFormValues>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      duration_days: 30,
      features: '',
      is_active: true,
    },
  });

  const openModal = (plan?: SubscriptionPlan) => {
    if (plan) {
      setEditingPlan(plan);
      reset({
        name: plan.name,
        description: plan.description,
        price: plan.price,
        duration_days: plan.duration_days,
        features: plan.features.join('\n'),
        is_active: plan.is_active,
      });
    } else {
      setEditingPlan(null);
      reset({
        name: '',
        description: '',
        price: 0,
        duration_days: 30,
        features: '',
        is_active: true,
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPlan(null);
    reset();
  };

  const onSubmit = async (values: PlanFormValues) => {
    try {
      const featuresArray = values.features
        .split('\n')
        .map((f) => f.trim())
        .filter((f) => f.length > 0);

      const payload = {
        name: values.name,
        description: values.description,
        price: values.price,
        duration_days: values.duration_days,
        features: featuresArray,
        is_active: values.is_active,
      };

      if (editingPlan) {
        await updateMutation.mutateAsync({ id: editingPlan.id, data: payload });
        message.success('Paket berhasil diperbarui');
      } else {
        await createMutation.mutateAsync(payload);
        message.success('Paket berhasil dibuat');
      }
      closeModal();
    } catch (err) {
      message.error('Terjadi kesalahan saat menyimpan paket');
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync(id);
      message.success('Paket berhasil dihapus');
    } catch (err) {
      message.error('Terjadi kesalahan saat menghapus paket');
      console.error(err);
    }
  };

  const handleToggleStatus = async (id: number) => {
    try {
      await toggleMutation.mutateAsync(id);
      message.success('Status paket berhasil diubah');
    } catch (err) {
      message.error('Terjadi kesalahan saat mengubah status');
      console.error(err);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const columns: ColumnsType<SubscriptionPlan> = [
    {
      title: 'Nama Paket',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Harga',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => formatPrice(price),
      sorter: (a, b) => a.price - b.price,
    },
    {
      title: 'Durasi',
      dataIndex: 'duration_days',
      key: 'duration_days',
      render: (days: number) => `${days} hari`,
      sorter: (a, b) => a.duration_days - b.duration_days,
    },
    {
      title: 'Fitur',
      dataIndex: 'features',
      key: 'features',
      render: (features: string[]) => (
        <Tooltip
          title={
            <ul style={{ margin: 0, paddingLeft: 16 }}>
              {features.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          }
        >
          <span>{features.length} fitur</span>
        </Tooltip>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (isActive: boolean) =>
        isActive ? (
          <Tag icon={<CheckCircleOutlined />} color="success">
            Aktif
          </Tag>
        ) : (
          <Tag icon={<CloseCircleOutlined />} color="default">
            Nonaktif
          </Tag>
        ),
      filters: [
        { text: 'Aktif', value: true },
        { text: 'Nonaktif', value: false },
      ],
      onFilter: (value, record) => record.is_active === value,
    },
    {
      title: 'Aksi',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => openModal(record)}
            />
          </Tooltip>
          <Tooltip title={record.is_active ? 'Nonaktifkan' : 'Aktifkan'}>
            <Switch
              checked={record.is_active}
              onChange={() => handleToggleStatus(record.id)}
              loading={toggleMutation.isPending}
              size="small"
            />
          </Tooltip>
          <Popconfirm
            title="Hapus Paket"
            description="Apakah Anda yakin ingin menghapus paket ini?"
            onConfirm={() => handleDelete(record.id)}
            okText="Ya"
            cancelText="Tidak"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Hapus">
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (error) {
    return (
      <Card>
        <Empty
          description={
            <span>
              Gagal memuat data paket langganan.{' '}
              <Button type="link" onClick={() => refetch()}>
                Coba lagi
              </Button>
            </span>
          }
        />
      </Card>
    );
  }

  return (
    <div className="p-6">
      <Card>
        <div className="flex justify-between items-center mb-6">
          <Title level={4} style={{ margin: 0 }}>
            Paket Langganan
          </Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => openModal()}
            style={{ backgroundColor: '#FA6978' }}
          >
            Tambah Paket
          </Button>
        </div>

        {isLoading ? (
          <Skeleton active paragraph={{ rows: 5 }} />
        ) : plans && plans.length > 0 ? (
          <Table
            columns={columns}
            dataSource={plans}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} paket`,
            }}
          />
        ) : (
          <Empty description="Belum ada paket langganan" />
        )}
      </Card>

      {/* Modal Form */}
      <Modal
        title={editingPlan ? 'Edit Paket' : 'Tambah Paket Baru'}
        open={isModalOpen}
        onCancel={closeModal}
        footer={null}
        destroyOnHidden
      >
        <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
          <Form.Item
            label="Nama Paket"
            validateStatus={errors.name ? 'error' : ''}
            help={errors.name?.message}
          >
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <Input {...field} placeholder="Contoh: Paket Basic" />
              )}
            />
          </Form.Item>

          <Form.Item
            label="Deskripsi"
            validateStatus={errors.description ? 'error' : ''}
            help={errors.description?.message}
          >
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <Input.TextArea
                  {...field}
                  rows={3}
                  placeholder="Deskripsi singkat tentang paket"
                />
              )}
            />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              label="Harga (IDR)"
              validateStatus={errors.price ? 'error' : ''}
              help={errors.price?.message}
            >
              <Controller
                name="price"
                control={control}
                render={({ field }) => (
                  <InputNumber
                    {...field}
                    style={{ width: '100%' }}
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                    }
                    parser={(value) =>
                      Number(value?.replace(/,/g, '') ?? 0)
                    }
                    min={0}
                  />
                )}
              />
            </Form.Item>

            <Form.Item
              label="Durasi (hari)"
              validateStatus={errors.duration_days ? 'error' : ''}
              help={errors.duration_days?.message}
            >
              <Controller
                name="duration_days"
                control={control}
                render={({ field }) => (
                  <InputNumber {...field} style={{ width: '100%' }} min={1} />
                )}
              />
            </Form.Item>
          </div>

          <Form.Item
            label="Fitur (satu per baris)"
            validateStatus={errors.features ? 'error' : ''}
            help={errors.features?.message}
          >
            <Controller
              name="features"
              control={control}
              render={({ field }) => (
                <Input.TextArea
                  {...field}
                  rows={4}
                  placeholder="Fitur 1&#10;Fitur 2&#10;Fitur 3"
                />
              )}
            />
          </Form.Item>

          <Form.Item label="Status Aktif">
            <Controller
              name="is_active"
              control={control}
              render={({ field }) => (
                <Switch checked={field.value} onChange={field.onChange} />
              )}
            />
          </Form.Item>

          <div className="flex justify-end gap-2">
            <Button onClick={closeModal}>Batal</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={createMutation.isPending || updateMutation.isPending}
              style={{ backgroundColor: '#FA6978' }}
            >
              {editingPlan ? 'Simpan Perubahan' : 'Tambah Paket'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default SubscriptionPlansPage;
