import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Tabs,
  Badge,
  Descriptions,
  Tooltip,
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  CheckOutlined,
  EyeOutlined,
  WhatsAppOutlined,
  FormOutlined,
  CalendarOutlined,
  PlusOutlined,
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

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const statusConfig: Record<AppointmentStatus, { color: string; label: string }> = {
  requested: { color: 'warning', label: 'Menunggu Konfirmasi' },
  accepted: { color: 'success', label: 'Terjadwal' },
  rejected: { color: 'error', label: 'Ditolak' },
  completed: { color: 'blue', label: 'Selesai' },
  cancelled: { color: 'default', label: 'Dibatalkan' },
};

export default function BidanAppointmentsPage() {
  const navigate = useNavigate();

  // Tabs state
  const [activeTab, setActiveTab] = useState<string>('all');

  // Modals state
  const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [selectedCompleteAppt, setSelectedCompleteAppt] = useState<Appointment | null>(null);
  const [selectedDetailAppt, setSelectedDetailAppt] = useState<Appointment | null>(null);

  const [acceptForm] = Form.useForm();
  const [rejectForm] = Form.useForm();

  const { data: appointments = [], isLoading, refetch } = useBidanAppointments();
  const acceptMutation = useAcceptAppointment();
  const rejectMutation = useRejectAppointment();
  const completeMutation = useCompleteAppointment();

  // Helper: safely resolve patient name (avoids generic "Pasien")
  const getPatientName = (record: Appointment): string => {
    if (record.user_data && typeof record.user_data === 'object') {
      const u = record.user_data as any;
      if (u.name && u.name.trim() !== '' && u.name !== 'Pasien') {
        return u.name;
      }
    }
    return (record as any).patient_name || (record as any).user?.name || 'Ibu Hamil Prenava';
  };

  const getPatientPhone = (record: Appointment): string | null => {
    if (record.user_data && typeof record.user_data === 'object') {
      const u = record.user_data as any;
      if (u.phone) return u.phone;
    }
    return (record as any).user?.user_profile?.no_telepon || null;
  };

  const getPatientWeek = (record: Appointment): number | null => {
    if (record.user_data && typeof record.user_data === 'object') {
      const u = record.user_data as any;
      if (u.pregnancy_week) return u.pregnancy_week;
    }
    return null;
  };

  const formatWhatsAppUrl = (phone: string, name: string) => {
    let clean = phone.replace(/\D/g, '');
    if (clean.startsWith('0')) {
      clean = '62' + clean.slice(1);
    }
    const text = encodeURIComponent(
      `Halo Ibu ${name}, salam sehat dari Bidan Prenava. Terkait jadwal konsultasi Anda di klinik kami...`
    );
    return `https://wa.me/${clean}?text=${text}`;
  };

  // Counts for tabs badge
  const counts = useMemo(() => {
    const res = { requested: 0, accepted: 0, completed: 0, rejected: 0 };
    appointments.forEach((a) => {
      if (a.status === 'requested') res.requested++;
      else if (a.status === 'accepted') res.accepted++;
      else if (a.status === 'completed') res.completed++;
      else if (a.status === 'rejected' || a.status === 'cancelled') res.rejected++;
    });
    return res;
  }, [appointments]);

  // Filtered by active tab
  const filteredAppointments = useMemo(() => {
    if (!appointments) return [];
    if (activeTab === 'all') return appointments;
    if (activeTab === 'rejected') {
      return appointments.filter((a) => a.status === 'rejected' || a.status === 'cancelled');
    }
    return appointments.filter((a) => a.status === activeTab);
  }, [appointments, activeTab]);

  // Handlers
  const handleOpenDetail = (appt: Appointment) => {
    setSelectedDetailAppt(appt);
    setIsDetailModalOpen(true);
  };

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

  const handleComplete = (appt: Appointment) => {
    setSelectedCompleteAppt(appt);
    setIsCompleteModalOpen(true);
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
      message.success('Jadwal konsultasi berhasil dikonfirmasi dan diterima!');
      setIsAcceptModalOpen(false);
      setSelectedAppt(null);
      refetch();
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
      message.success('Permintaan konsultasi telah ditolak.');
      setIsRejectModalOpen(false);
      setSelectedAppt(null);
      refetch();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Gagal menolak appointment.');
    }
  };

  const submitComplete = async () => {
    if (!selectedCompleteAppt) return;
    try {
      await completeMutation.mutateAsync(selectedCompleteAppt.appointment_id);
      message.success('Konsultasi ditandai selesai.');
      setIsCompleteModalOpen(false);
      setSelectedCompleteAppt(null);
      refetch();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Gagal menyelesaikan konsultasi.');
    }
  };

  const navigateToCreateVisit = (appt: Appointment) => {
    const patientName = getPatientName(appt);
    const userId = appt.user_id;
    navigate('/catatan-kunjungan', {
      state: {
        openCreateModal: true,
        selectedUserId: userId,
        selectedPatientName: patientName,
      },
    });
  };

  const columns: ColumnsType<Appointment> = [
    {
      title: 'Nama Ibu Hamil',
      key: 'patient_name',
      render: (_, record) => {
        const name = getPatientName(record);
        const week = getPatientWeek(record);
        const phone = getPatientPhone(record);

        return (
          <div className="space-y-0.5">
            <div className="font-semibold text-gray-900 text-sm">{name}</div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              {week && (
                <span className="text-[#FA6978] font-medium">Usia: {week} Mgg</span>
              )}
              {phone && <span>• {phone}</span>}
            </div>
          </div>
        );
      },
    },
    {
      title: 'Waktu Diminta & Konfirmasi',
      key: 'time',
      render: (_, record) => {
        const prefDate = record.preferred_date
          ? dayjs(record.preferred_date).format('DD MMM YYYY')
          : '-';
        const prefTime = record.preferred_time || '-';
        const confDate = record.confirmed_date
          ? dayjs(record.confirmed_date).format('DD MMM YYYY')
          : null;
        const confTime = record.confirmed_time || null;

        return (
          <div className="text-xs">
            <div className="text-gray-700">
              <span className="font-medium text-gray-500">Diminta:</span> {prefDate}{' '}
              {prefTime !== '-' && `• ${prefTime}`}
            </div>
            {confDate && (
              <div className="text-emerald-700 font-medium mt-0.5">
                <span>Pasti:</span> {confDate} {confTime && `• ${confTime}`}
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: 'Tipe & Keluhan',
      key: 'type_notes',
      render: (_, record) => {
        const labels: Record<string, string> = {
          visit: 'Kunjungan Langsung',
          consultation: 'Konsultasi Online',
          checkup: 'Pemeriksaan Rutin ANC',
        };
        const typeLabel = labels[record.consultation_type] || record.consultation_type || 'Pemeriksaan';
        const notes = record.notes || (record as any).user_notes;

        return (
          <div className="max-w-xs">
            <Tag color="cyan" className="text-xs mb-1">
              {typeLabel}
            </Tag>
            {notes ? (
              <p className="text-xs text-gray-600 truncate m-0" title={notes}>
                "{notes}"
              </p>
            ) : (
              <span className="text-xs text-gray-400 italic">Tidak ada catatan</span>
            )}
          </div>
        );
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
          <Tag color={config.color} icon={icon} className="px-2 py-0.5 text-xs font-medium">
            {config.label}
          </Tag>
        );
      },
    },
    {
      title: 'Aksi',
      key: 'actions',
      render: (_, record) => {
        const phone = getPatientPhone(record);
        const name = getPatientName(record);

        return (
          <Space size="small" wrap>
            <Tooltip title="Lihat detail janji temu">
              <Button
                size="small"
                icon={<EyeOutlined />}
                onClick={() => handleOpenDetail(record)}
              >
                Detail
              </Button>
            </Tooltip>

            {phone && (
              <Tooltip title="Chat WhatsApp dengan Ibu">
                <Button
                  size="small"
                  icon={<WhatsAppOutlined />}
                  style={{ color: '#25D366', borderColor: '#25D366' }}
                  href={formatWhatsAppUrl(phone, name)}
                  target="_blank"
                />
              </Tooltip>
            )}

            {record.status === 'requested' && (
              <>
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
              </>
            )}

            {record.status === 'accepted' && (
              <>
                <Button
                  size="small"
                  type="default"
                  onClick={() => handleComplete(record)}
                >
                  Selesai
                </Button>
                <Tooltip title="Catat rekam medis kunjungan pasien ini">
                  <Button
                    size="small"
                    type="primary"
                    style={{ backgroundColor: '#FA6978', borderColor: '#FA6978' }}
                    icon={<FormOutlined />}
                    onClick={() => navigateToCreateVisit(record)}
                  >
                    Catat Rekis
                  </Button>
                </Tooltip>
              </>
            )}

            {record.status === 'completed' && (
              <Tooltip title="Buat rekam medis kunjungan lanjutan">
                <Button
                  size="small"
                  icon={<FormOutlined />}
                  onClick={() => navigateToCreateVisit(record)}
                >
                  Catat Kunjungan
                </Button>
              </Tooltip>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 m-0">
            Jadwal Janji Temu
          </h1>
          <p className="text-sm text-gray-600 mt-1 mb-0">
            Daftar permohonan kunjungan dan konsultasi dari ibu hamil.
          </p>
        </div>
      </div>

      {/* Main Table Card with Status Tabs */}
      <Card className="border border-gray-200 shadow-sm rounded-xl">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          className="mb-4"
          items={[
            {
              key: 'all',
              label: (
                <span>
                  Semua Janji{' '}
                  <Badge
                    count={appointments.length}
                    style={{ backgroundColor: '#8c8c8c' }}
                  />
                </span>
              ),
            },
            {
              key: 'requested',
              label: (
                <span>
                  Menunggu Konfirmasi{' '}
                  <Badge
                    count={counts.requested}
                    style={{ backgroundColor: '#faad14' }}
                  />
                </span>
              ),
            },
            {
              key: 'accepted',
              label: (
                <span>
                  Terjadwal{' '}
                  <Badge
                    count={counts.accepted}
                    style={{ backgroundColor: '#52c41a' }}
                  />
                </span>
              ),
            },
            {
              key: 'completed',
              label: (
                <span>
                  Selesai{' '}
                  <Badge
                    count={counts.completed}
                    style={{ backgroundColor: '#1890ff' }}
                  />
                </span>
              ),
            },
            {
              key: 'rejected',
              label: (
                <span>
                  Ditolak{' '}
                  <Badge
                    count={counts.rejected}
                    style={{ backgroundColor: '#ff4d4f' }}
                  />
                </span>
              ),
            },
          ]}
        />

        <Table
          columns={columns}
          dataSource={filteredAppointments}
          rowKey="appointment_id"
          loading={isLoading}
          pagination={{ pageSize: 10, showTotal: (t) => `Total ${t} janji temu` }}
          locale={{ emptyText: 'Tidak ada data janji temu pada kategori ini' }}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <CalendarOutlined className="text-[#FA6978]" />
            <span>Detail Jadwal Janji Temu</span>
          </div>
        }
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsDetailModalOpen(false)}>
            Tutup
          </Button>,
          selectedDetailAppt && selectedDetailAppt.status === 'requested' && (
            <Button
              key="accept"
              type="primary"
              style={{ backgroundColor: '#52c41a' }}
              onClick={() => {
                setIsDetailModalOpen(false);
                handleOpenAccept(selectedDetailAppt);
              }}
            >
              Terima Jadwal
            </Button>
          ),
          selectedDetailAppt && (selectedDetailAppt.status === 'accepted' || selectedDetailAppt.status === 'completed') && (
            <Button
              key="catat"
              type="primary"
              style={{ backgroundColor: '#FA6978' }}
              icon={<FormOutlined />}
              onClick={() => {
                setIsDetailModalOpen(false);
                navigateToCreateVisit(selectedDetailAppt);
              }}
            >
              Catat Rekam Medis
            </Button>
          ),
        ]}
        width={650}
      >
        {selectedDetailAppt && (
          <div className="space-y-4 py-2">
            <Descriptions bordered size="small" column={1}>
              <Descriptions.Item label="Nama Ibu Hamil">
                <span className="font-semibold text-gray-900">
                  {getPatientName(selectedDetailAppt)}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Nomor Telepon">
                {getPatientPhone(selectedDetailAppt) ? (
                  <div className="flex items-center gap-3">
                    <span>{getPatientPhone(selectedDetailAppt)}</span>
                    <Button
                      size="small"
                      icon={<WhatsAppOutlined />}
                      style={{ color: '#25D366', borderColor: '#25D366' }}
                      href={formatWhatsAppUrl(
                        getPatientPhone(selectedDetailAppt)!,
                        getPatientName(selectedDetailAppt)
                      )}
                      target="_blank"
                    >
                      Chat WhatsApp
                    </Button>
                  </div>
                ) : (
                  <span className="text-gray-400">Tidak tersedia</span>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Usia Kehamilan">
                {getPatientWeek(selectedDetailAppt) ? (
                  <span className="font-medium text-[#FA6978]">
                    {getPatientWeek(selectedDetailAppt)} Minggu
                  </span>
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Waktu yang Diminta Pasien">
                {selectedDetailAppt.preferred_date
                  ? dayjs(selectedDetailAppt.preferred_date).format('dddd, DD MMMM YYYY')
                  : '-'}{' '}
                {selectedDetailAppt.preferred_time && `(Jam ${selectedDetailAppt.preferred_time})`}
              </Descriptions.Item>
              <Descriptions.Item label="Waktu Konfirmasi Bidan">
                {selectedDetailAppt.confirmed_date ? (
                  <span className="font-semibold text-emerald-700">
                    {dayjs(selectedDetailAppt.confirmed_date).format('dddd, DD MMMM YYYY')}{' '}
                    (Jam {selectedDetailAppt.confirmed_time || '-'})
                  </span>
                ) : (
                  <span className="text-gray-400">Belum ditentukan</span>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={statusConfig[selectedDetailAppt.status]?.color}>
                  {statusConfig[selectedDetailAppt.status]?.label}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Keluhan / Catatan Pasien">
                <Paragraph className="m-0 text-sm text-gray-700">
                  {selectedDetailAppt.notes ||
                    (selectedDetailAppt as any).user_notes ||
                    'Tidak ada catatan khusus yang disampaikan pasien.'}
                </Paragraph>
              </Descriptions.Item>
              {selectedDetailAppt.rejection_reason && (
                <Descriptions.Item label="Alasan Penolakan">
                  <span className="text-red-600 font-medium">
                    {selectedDetailAppt.rejection_reason}
                  </span>
                </Descriptions.Item>
              )}
            </Descriptions>
          </div>
        )}
      </Modal>

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
          Atur tanggal dan jam konsultasi pasti untuk pasien{' '}
          <strong>{selectedAppt ? getPatientName(selectedAppt) : ''}</strong>.
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
            <TextArea
              rows={3}
              placeholder="Instruksi tambahan untuk pasien (misal: Bawa buku KIA, puasa 2 jam sebelum periksa...)"
            />
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
          Anda akan menolak permintaan konsultasi dari{' '}
          <strong>{selectedAppt ? getPatientName(selectedAppt) : ''}</strong>.
        </div>
        <Form form={rejectForm} layout="vertical" onFinish={submitReject}>
          <Form.Item
            name="reason"
            label="Alasan Penolakan"
            rules={[{ required: true, message: 'Harap isi alasan penolakan' }]}
          >
            <TextArea
              rows={4}
              placeholder="Jelaskan alasan penolakan jadwal ini (cth: Jadwal praktik sudah penuh, sedang ada tindakan persalinan...)"
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Complete Modal */}
      <Modal
        title="Selesaikan Konsultasi?"
        open={isCompleteModalOpen}
        onCancel={() => setIsCompleteModalOpen(false)}
        okText="Ya, Selesai"
        cancelText="Batal"
        onOk={submitComplete}
        confirmLoading={completeMutation.isPending}
      >
        <p>
          Apakah Anda yakin sesi konsultasi dengan{' '}
          <strong>
            {selectedCompleteAppt ? getPatientName(selectedCompleteAppt) : ''}
          </strong>{' '}
          telah selesai?
        </p>
      </Modal>
    </div>
  );
}
