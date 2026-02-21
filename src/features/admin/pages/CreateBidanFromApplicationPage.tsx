import { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  message,
  Typography,
  Descriptions,
  Skeleton,
  Empty,
  Result,
  Alert,
  Divider,
} from 'antd';
import {
  UserOutlined,
  MailOutlined,
  LockOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useBidanApplication, useCreateBidanAccount } from '@/hooks/useBidanManagement';

const { Title, Text } = Typography;

// Form validation schema
const formSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
});

type FormValues = z.infer<typeof formSchema>;

interface CreatedAccount {
  user_id: number;
  bidan_id: number;
  email: string;
  temporary_password?: string;
}

const CreateBidanFromApplicationPage = () => {
  const { applicationId } = useParams<{ applicationId: string }>();
  const navigate = useNavigate();
  const [createdAccount, setCreatedAccount] = useState<CreatedAccount | null>(null);

  const appId = Number(applicationId);

  // React Query hooks
  const { data: application, isLoading, error } = useBidanApplication(appId);
  const createMutation = useCreateBidanAccount();

  // React Hook Form
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Pre-fill email from application
  useEffect(() => {
    if (application) {
      setValue('email', application.email);
    }
  }, [application, setValue]);

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setValue('password', password);
  };

  const onSubmit = async (values: FormValues) => {
    try {
      const response = await createMutation.mutateAsync({
        application_id: appId,
        email: values.email,
        password: values.password,
      });
      setCreatedAccount(response.data);
      message.success('Akun bidan berhasil dibuat');
    } catch (err) {
      message.error('Terjadi kesalahan saat membuat akun');
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <Card>
          <Skeleton active paragraph={{ rows: 8 }} />
        </Card>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="p-6">
        <Card>
          <Empty
            description={
              <span>
                Pengajuan tidak ditemukan.{' '}
                <Link to="/admin/bidan-applications">Kembali ke daftar pengajuan</Link>
              </span>
            }
          />
        </Card>
      </div>
    );
  }

  if (application.status !== 'approved') {
    return (
      <div className="p-6">
        <Card>
          <Result
            status="warning"
            title="Pengajuan Belum Disetujui"
            subTitle="Anda hanya dapat membuat akun untuk pengajuan yang sudah disetujui."
            extra={
              <Button type="primary" onClick={() => navigate('/admin/bidan-applications')}>
                Kembali ke Daftar Pengajuan
              </Button>
            }
          />
        </Card>
      </div>
    );
  }

  // Show success state after account creation
  if (createdAccount) {
    return (
      <div className="p-6">
        <Card>
          <Result
            status="success"
            icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
            title="Akun Bidan Berhasil Dibuat!"
            subTitle={`Akun untuk ${application.bidan_name} telah berhasil dibuat.`}
            extra={[
              <Button
                type="primary"
                key="location"
                onClick={() => navigate(`/admin/bidan-locations?bidan=${createdAccount.bidan_id}`)}
                style={{ backgroundColor: '#FA6978' }}
              >
                Set Lokasi Praktik
              </Button>,
              <Button key="applications" onClick={() => navigate('/admin/bidan-applications')}>
                Kembali ke Pengajuan
              </Button>,
            ]}
          />

          <Divider />

          <Alert
            type="info"
            message="Informasi Akun"
            description={
              <Descriptions column={1} size="small" className="mt-2">
                <Descriptions.Item label="User ID">{createdAccount.user_id}</Descriptions.Item>
                <Descriptions.Item label="Bidan ID">{createdAccount.bidan_id}</Descriptions.Item>
                <Descriptions.Item label="Email">{createdAccount.email}</Descriptions.Item>
              </Descriptions>
            }
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Card>
        <Title level={4}>Buat Akun Bidan</Title>
        <Text type="secondary">
          Membuat akun berdasarkan pengajuan yang telah disetujui.
        </Text>

        <Divider />

        {/* Application Info */}
        <Card type="inner" title="Informasi Pengajuan" className="mb-6">
          <Descriptions column={2} size="small">
            <Descriptions.Item label="ID Pengajuan">{application.id}</Descriptions.Item>
            <Descriptions.Item label="Nama Pemohon">{application.nama}</Descriptions.Item>
            <Descriptions.Item label="Nama Praktik">{application.bidan_name}</Descriptions.Item>
            <Descriptions.Item label="Email">{application.email}</Descriptions.Item>
            <Descriptions.Item label="No. Telepon">{application.phone}</Descriptions.Item>
            <Descriptions.Item label="No. STR">{application.str_number}</Descriptions.Item>
            <Descriptions.Item label="No. SIP">{application.sip_number}</Descriptions.Item>
            <Descriptions.Item label="Alamat Praktik" span={2}>
              {application.practice_address}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Account Creation Form */}
        <Card type="inner" title="Buat Akun Login">
          <Form layout="vertical" onFinish={handleSubmit(onSubmit)} className="max-w-md">
            <Form.Item
              label="Email"
              validateStatus={errors.email ? 'error' : ''}
              help={errors.email?.message}
            >
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    prefix={<MailOutlined />}
                    placeholder="Email untuk login"
                  />
                )}
              />
            </Form.Item>

            <Form.Item
              label="Password"
              validateStatus={errors.password ? 'error' : ''}
              help={errors.password?.message}
            >
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <Input.Password
                    {...field}
                    prefix={<LockOutlined />}
                    placeholder="Password"
                    iconRender={(visible) =>
                      visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                    }
                  />
                )}
              />
              <Button
                type="link"
                onClick={generatePassword}
                style={{ padding: 0, height: 'auto', marginTop: 4 }}
              >
                Generate Password Otomatis
              </Button>
            </Form.Item>

            <Form.Item className="mb-0">
              <div className="flex gap-2">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={createMutation.isPending}
                  icon={<UserOutlined />}
                  style={{ backgroundColor: '#FA6978' }}
                >
                  Buat Akun
                </Button>
                <Button onClick={() => navigate('/admin/bidan-applications')}>
                  Batal
                </Button>
              </div>
            </Form.Item>
          </Form>
        </Card>
      </Card>
    </div>
  );
};

export default CreateBidanFromApplicationPage;
