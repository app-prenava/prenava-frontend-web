import { useState } from 'react';
import {
  Card,
  Table,
  Button,
  Tag,
  Space,
  Modal,
  Form,
  Input,
  DatePicker,
  TimePicker,
  message,
  Typography,
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  CheckOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import {
  useBidanAppointments,
  useAcceptAppointment,
  useRejectAppointment,
  useCompleteAppointment,
} from '@/features/bidan/appointment.api';
import type { Appointment, AppointmentStatus } from '@/features/admin/bidan.types';

const { Title, Text } = Typography;
const { TextArea } = Input;

const statusConfig: Record<AppointmentStatus, { color: string; label: string }> = {
  requested: { color: 'warning', label: 'Menunggu' },
  accepted: { color: 'success', label: 'Diterima' },
  rejected: { color: 'error', label: 'Ditolak' },
  completed: { color: 'default', label: 'Selesai' },
  cancelled: { color: 'default', label: 'Dibatalkan' },
};

export default function BidanAppointmentsPage() {
  const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);

  const [acceptForm] = Form.useForm();
  const [rejectForm] = Form.useForm();

  const { data: appointments, isLoading } = useBidanAppointments();
  const acceptMutation = useAcceptAppointment();
  const rejectMutation = useRejectAppointment();
  const completeMutation = useCompleteAppointment();

  const handleOpenAccept = (appt: Appointment) => {
    setSelectedAppt(appt);
    setIsAcceptModalOpen(true);
    acceptForm.resetFields();
    if (appt.preferred_date && appt.preferred_time) {
      acceptForm.setFieldsValue({
        date: dayjs(appt.preferred_date),
        time: dayjs(appt.preferred_time, 'HH:mm'),
      });
    }
  };

  const handleOpenReject = (appt: Appointment) => {
    setSelectedAppt(appt);
    setIsRejectModalOpen(true);
    rejectForm.resetFields();
  };

  const submitAccept = async (values: any) => {
    if (!selectedAppt) return;
    try {
      await acceptMutation.mutateAsync({
        id: selectedAppt.appointment_id,
        data: {
          confirmed_date: values.date.format('YYYY-MM-DD'),
          confirmed_time: values.time.format('HH:mm'),
          notes: values.notes,
        },
      });
      message.success('Appointment berhasil diterima!');
      setIsAcceptModalOpen(false);
      setSelectedAppt(null);
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Gagal menerima appointment.');
    }
  };

  const submitReject = async (values: any) => {
    if (!selectedAppt) return;
    try {
      await rejectMutation.mutateAsync({
        id: selectedAppt.appointment_id,
        data: {
          rejection_reason: values.reason,
        },
      });
      message.success('Appointment ditolak.');
      setIsRejectModalOpen(false);
      setSelectedAppt(null);
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Gagal menolak appointment.');
    }
  };

  const handleComplete = async (appt: Appointment) => {
    Modal.confirm({
      title: 'Selesaikan Konsultasi?',
      content: 'Apakah Anda yakin konsultasi dengan pasien ini telah selesai?',
      okText: 'Ya, Selesai',
      cancelText: 'Batal',
      onOk: async () => {
        try {
          await completeMutation.mutateAsync(appt.appointment_id);
          message.success('Konsultasi ditandai selesai.');
        } catch (error: any) {
          message.error(error?.response?.data?.message || 'Gagal menyelesaikan konsultasi.');
        }
      },
    });
  };

  const getPatientName = (record: Appointment): string => {
    if (record.user_data && typeof record.user_data === 'object') {
      return (record.user_data as any).name || 'Pasien';
    }
    return 'Pasien';
  };

  const columns: ColumnsType<Appointment> = [
    {
      title: 'Nama Ibu Hamil',
      key: 'patient_name',
      render: (_, record) => <div className="font-medium">{getPatientName(record)}</div>,
    },
    {
      title: 'Waktu Diminta',
      key: 'time',
      render: (_, record) => {
        const dateStr = record.preferred_date ? dayjs(record.preferred_date).format('DD MMM YYYY') : '-';
        const timeStr = record.preferred_time || '-';
        return <div>{dateStr} {timeStr !== '-' && `• ${timeStr}`}</div>;
      },
    },
    {
      title: 'Tipe Konsultasi',
      dataIndex: 'consultation_type',
      key: 'consultation_type',
      render: (text) => {
        const labels: Record<string, string> = {
          visit: 'Kunjungan',
          consultation: 'Konsultasi',
          checkup: 'Pemeriksaan',
        };
        return <Text type="secondary">{labels[text] || text || '-'}</Text>;
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: AppointmentStatus) => {
        const config = statusConfig[status] || { color: 'default', label: status };
        let icon = <ClockCircleOutlined />;
        if (status === 'accepted') icon = <CheckCircleOutlined />;
        if (status === 'rejected') icon = <CloseCircleOutlined />;
        if (status === 'completed') icon = <CheckOutlined />;
        return (
          <Tag color={config.color} icon={icon}>
            {config.label}
          </Tag>
        );
      },
    },
    {
      title: 'Aksi',
      key: 'actions',
      render: (_, record) => {
        if (record.status === 'requested') {
          return (
            <Space>
              <Button
                type="primary"
                size="small"
                style={{ backgroundColor: '#52c41a' }}
                onClick={() => handleOpenAccept(record)}
              >
                Terima
              </Button>
              <Button
                danger
                size="small"
                onClick={() => handleOpenReject(record)}
              >
                Tolak
              </Button>
            </Space>
          );
        }
        if (record.status === 'accepted') {
          return (
            <Button
              type="default"
              size="small"
              onClick={() => handleComplete(record)}
            >
              Tandai Selesai
            </Button>
          );
        }
        return <span className="text-gray-400 text-xs">-</span>;
      },
    },
  ];

  return (
    <div className="p-6">
      <Card>
        <div className="flex justify-between items-center mb-6">
          <Title level={4} style={{ margin: 0 }}>
            Jadwal Appointment
          </Title>
        </div>
        <Table
          columns={columns}
          dataSource={appointments}
          rowKey="appointment_id"
          loading={isLoading}
          pagination={{ pageSize: 15 }}
          locale={{ emptyText: 'Belum ada data appointment' }}
        />
      </Card>

      {/* Accept Modal */}
      <Modal
        title="Terima Appointment"
        open={isAcceptModalOpen}
        onCancel={() => setIsAcceptModalOpen(false)}
        okText="Konfirmasi"
        onOk={() => acceptForm.submit()}
        confirmLoading={acceptMutation.isPending}
      >
        <div className="mb-4 text-sm text-gray-500">
          Atur tanggal dan jam konsultasi pasti untuk pasien <strong>{selectedAppt ? getPatientName(selectedAppt) : ''}</strong>.
        </div>
        <Form form={acceptForm} layout="vertical" onFinish={submitAccept}>
          <div className="flex gap-4">
            <Form.Item
              name="date"
              label="Tanggal Konfirmasi"
              rules={[{ required: true, message: 'Harap pilih tanggal' }]}
              className="flex-1"
            >
              <DatePicker className="w-full" format="DD MMMM YYYY" />
            </Form.Item>
            <Form.Item
              name="time"
              label="Jam Konfirmasi"
              rules={[{ required: true, message: 'Harap pilih jam' }]}
              className="flex-1"
            >
              <TimePicker className="w-full" format="HH:mm" />
            </Form.Item>
          </div>
          <Form.Item name="notes" label="Catatan Tambahan (Opsional)">
            <TextArea rows={3} placeholder="Instruksi tambahan untuk pasien..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* Reject Modal */}
      <Modal
        title="Tolak Appointment"
        open={isRejectModalOpen}
        onCancel={() => setIsRejectModalOpen(false)}
        okText="Tolak"
        okButtonProps={{ danger: true }}
        onOk={() => rejectForm.submit()}
        confirmLoading={rejectMutation.isPending}
      >
        <div className="mb-4 text-sm text-gray-500">
          Anda akan menolak permintaan konsultasi dari <strong>{selectedAppt ? getPatientName(selectedAppt) : ''}</strong>.
        </div>
        <Form form={rejectForm} layout="vertical" onFinish={submitReject}>
          <Form.Item
            name="reason"
            label="Alasan Penolakan"
            rules={[{ required: true, message: 'Harap isi alasan penolakan' }]}
          >
            <TextArea rows={4} placeholder="Jelaskan alasan penolakan jadwal ini (cth: Sudah penuh, Bidang tidak sesuai...)" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
