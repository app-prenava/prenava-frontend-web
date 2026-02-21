import { useState } from 'react';
import {
  Table,
  Button,
  Modal,
  Tag,
  Space,
  message,
  Card,
  Typography,
  Tabs,
  Input,
  Descriptions,
  Skeleton,
  Empty,
  Avatar,
  Divider,
} from 'antd';
import {
  SearchOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useNavigate } from 'react-router-dom';
import {
  useBidanApplications,
  useApproveApplication,
  useRejectApplication,
} from '@/hooks/useBidanManagement';
import type { BidanApplication, ApplicationStatus } from '@/features/admin/bidan.types';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const statusConfig: Record<
  ApplicationStatus,
  { color: string; icon: React.ReactNode; label: string }
> = {
  pending: {
    color: 'warning',
    icon: <ClockCircleOutlined />,
    label: 'Menunggu',
  },
  approved: {
    color: 'success',
    icon: <CheckCircleOutlined />,
    label: 'Disetujui',
  },
  rejected: {
    color: 'error',
    icon: <CloseCircleOutlined />,
    label: 'Ditolak',
  },
};

const BidanApplicationsPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ApplicationStatus | 'all'>('all');
  const [searchText, setSearchText] = useState('');
  const [selectedApplication, setSelectedApplication] = useState<BidanApplication | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  // React Query hooks
  const statusFilter = activeTab === 'all' ? undefined : activeTab;
  const { data: applicationsData, isLoading, error, refetch } = useBidanApplications(statusFilter);
  const approveMutation = useApproveApplication();
  const rejectMutation = useRejectApplication();

  // Safely extract applications array - handle paginated response
  // API returns: { status: 'success', data: { data: [...], current_page, total, ... } }
  const applications = Array.isArray(applicationsData?.data?.data)
    ? applicationsData.data.data
    : Array.isArray(applicationsData?.data)
    ? applicationsData.data
    : Array.isArray(applicationsData)
    ? applicationsData
    : [];

  // Filter by search
  const filteredApplications = applications.filter((app) => {
    if (!searchText) return true;
    const searchLower = searchText.toLowerCase();
    return (
      app.nama.toLowerCase().includes(searchLower) ||
      app.email.toLowerCase().includes(searchLower) ||
      app.bidan_name.toLowerCase().includes(searchLower) ||
      app.phone.includes(searchText)
    );
  });

  const openDetailModal = (application: BidanApplication) => {
    setSelectedApplication(application);
    setIsDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedApplication(null);
  };

  const openRejectModal = (application: BidanApplication) => {
    setSelectedApplication(application);
    setRejectionReason('');
    setIsRejectModalOpen(true);
  };

  const closeRejectModal = () => {
    setIsRejectModalOpen(false);
    setSelectedApplication(null);
    setRejectionReason('');
  };

  const handleApprove = async (application: BidanApplication) => {
    try {
      await approveMutation.mutateAsync({ id: application.id });
      message.success('Pengajuan berhasil disetujui');
      closeDetailModal();
      // Navigate to create bidan account page
      navigate(`/admin/create-bidan-from-application/${application.id}`);
    } catch (err: any) {
      console.error('Approval error:', err);

      // Check for specific error types
      if (err.response?.status === 405) {
        message.error('Method tidak didukung. Silakan hubungi developer backend.');
      } else if (err.response?.status === 404) {
        message.error('Endpoint tidak ditemukan. Silakan cek konfigurasi backend.');
      } else if (err.response?.data?.message) {
        message.error(`Gagal menyetujui: ${err.response.data.message}`);
      } else {
        message.error('Terjadi kesalahan saat menyetujui pengajuan');
      }
    }
  };

  const handleReject = async () => {
    if (!selectedApplication) return;
    if (!rejectionReason.trim()) {
      message.error('Alasan penolakan wajib diisi');
      return;
    }

    try {
      await rejectMutation.mutateAsync({
        id: selectedApplication.id,
        rejection_reason: rejectionReason,
      });
      message.success('Pengajuan berhasil ditolak');
      closeRejectModal();
    } catch (err) {
      message.error('Terjadi kesalahan saat menolak pengajuan');
      console.error(err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const columns: ColumnsType<BidanApplication> = [
    {
      title: 'Pemohon',
      key: 'pemohon',
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#FA6978' }} />
          <div>
            <div className="font-medium">{record.nama}</div>
            <Text type="secondary" className="text-xs">
              {record.email}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Nama Praktik',
      dataIndex: 'bidan_name',
      key: 'bidan_name',
      sorter: (a, b) => a.bidan_name.localeCompare(b.bidan_name),
    },
    {
      title: 'No. Telepon',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Tanggal Pengajuan',
      dataIndex: 'submitted_at',
      key: 'submitted_at',
      render: (date: string) => formatDate(date),
      sorter: (a, b) =>
        new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime(),
      defaultSortOrder: 'descend',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: ApplicationStatus) => {
        const config = statusConfig[status];
        return (
          <Tag icon={config.icon} color={config.color}>
            {config.label}
          </Tag>
        );
      },
    },
    {
      title: 'Aksi',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => openDetailModal(record)}
          >
            Detail
          </Button>
          {record.status === 'pending' && (
            <>
              <Button
                type="primary"
                size="small"
                icon={<CheckCircleOutlined />}
                onClick={() => handleApprove(record)}
                loading={approveMutation.isPending}
                style={{ backgroundColor: '#52c41a' }}
              >
                Setujui
              </Button>
              <Button
                danger
                size="small"
                icon={<CloseCircleOutlined />}
                onClick={() => openRejectModal(record)}
              >
                Tolak
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  const tabItems = [
    {
      key: 'all',
      label: 'Semua',
    },
    {
      key: 'pending',
      label: (
        <span>
          <ClockCircleOutlined /> Menunggu
        </span>
      ),
    },
    {
      key: 'approved',
      label: (
        <span>
          <CheckCircleOutlined /> Disetujui
        </span>
      ),
    },
    {
      key: 'rejected',
      label: (
        <span>
          <CloseCircleOutlined /> Ditolak
        </span>
      ),
    },
  ];

  if (error) {
    return (
      <Card>
        <Empty
          description={
            <span>
              Gagal memuat data pengajuan.{' '}
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
            Pengajuan Akun Bidan
          </Title>
        </div>

        <Tabs
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key as ApplicationStatus | 'all')}
          items={tabItems}
        />

        <div className="mb-4">
          <Input
            placeholder="Cari nama, email, atau nomor telepon..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ maxWidth: 400 }}
            allowClear
          />
        </div>

        {isLoading ? (
          <Skeleton active paragraph={{ rows: 5 }} />
        ) : filteredApplications.length > 0 ? (
          <Table
            columns={columns}
            dataSource={filteredApplications}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} pengajuan`,
            }}
          />
        ) : (
          <Empty description="Tidak ada pengajuan ditemukan" />
        )}
      </Card>

      {/* Detail Modal */}
      <Modal
        title="Detail Pengajuan"
        open={isDetailModalOpen}
        onCancel={closeDetailModal}
        width={700}
        footer={
          selectedApplication?.status === 'pending'
            ? [
                <Button key="close" onClick={closeDetailModal}>
                  Tutup
                </Button>,
                <Button
                  key="reject"
                  danger
                  onClick={() => {
                    closeDetailModal();
                    openRejectModal(selectedApplication);
                  }}
                >
                  Tolak
                </Button>,
                <Button
                  key="approve"
                  type="primary"
                  onClick={() => handleApprove(selectedApplication)}
                  loading={approveMutation.isPending}
                  style={{ backgroundColor: '#52c41a' }}
                >
                  Setujui
                </Button>,
              ]
            : [
                <Button key="close" onClick={closeDetailModal}>
                  Tutup
                </Button>,
              ]
        }
      >
        {selectedApplication && (
          <>
            <div className="flex items-center gap-4 mb-4">
              <Avatar size={64} icon={<UserOutlined />} style={{ backgroundColor: '#FA6978' }} />
              <div>
                <Title level={5} style={{ margin: 0 }}>
                  {selectedApplication.nama}
                </Title>
                <Text type="secondary">{selectedApplication.email}</Text>
                <div>
                  <Tag
                    icon={statusConfig[selectedApplication.status].icon}
                    color={statusConfig[selectedApplication.status].color}
                  >
                    {statusConfig[selectedApplication.status].label}
                  </Tag>
                </div>
              </div>
            </div>

            <Divider />

            <Descriptions column={2} size="small">
              <Descriptions.Item label="Nama Praktik">
                {selectedApplication.bidan_name}
              </Descriptions.Item>
              <Descriptions.Item label="No. Telepon">
                {selectedApplication.phone}
              </Descriptions.Item>
              <Descriptions.Item label="No. STR">
                {selectedApplication.str_number}
              </Descriptions.Item>
              <Descriptions.Item label="No. SIP">
                {selectedApplication.sip_number}
              </Descriptions.Item>
              <Descriptions.Item label="Alamat Praktik" span={2}>
                {selectedApplication.practice_address}
              </Descriptions.Item>
              <Descriptions.Item label="Tanggal Pengajuan">
                {formatDate(selectedApplication.submitted_at)}
              </Descriptions.Item>
              {selectedApplication.reviewed_at && (
                <Descriptions.Item label="Tanggal Review">
                  {formatDate(selectedApplication.reviewed_at)}
                </Descriptions.Item>
              )}
            </Descriptions>

            {selectedApplication.status === 'rejected' && selectedApplication.rejection_reason && (
              <>
                <Divider />
                <div>
                  <Text strong>Alasan Penolakan:</Text>
                  <Paragraph type="danger" className="mt-2">
                    {selectedApplication.rejection_reason}
                  </Paragraph>
                </div>
              </>
            )}
          </>
        )}
      </Modal>

      {/* Reject Modal */}
      <Modal
        title="Tolak Pengajuan"
        open={isRejectModalOpen}
        onCancel={closeRejectModal}
        onOk={handleReject}
        okText="Tolak Pengajuan"
        cancelText="Batal"
        okButtonProps={{
          danger: true,
          loading: rejectMutation.isPending,
        }}
      >
        {selectedApplication && (
          <>
            <p className="mb-4">
              Anda akan menolak pengajuan dari <strong>{selectedApplication.nama}</strong> (
              {selectedApplication.email}).
            </p>
            <div>
              <Text strong>Alasan Penolakan *</Text>
              <TextArea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                placeholder="Masukkan alasan penolakan..."
                className="mt-2"
              />
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default BidanApplicationsPage;
