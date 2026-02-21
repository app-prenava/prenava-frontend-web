import { useState, useEffect } from 'react';
import {
  Card,
  List,
  Button,
  Form,
  Input,
  message,
  Typography,
  Skeleton,
  Empty,
  Avatar,
  Tag,
  Divider,
  TimePicker,
  Switch,
  Space,
} from 'antd';
import {
  EnvironmentOutlined,
  UserOutlined,
  PhoneOutlined,
  ClockCircleOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import { useSearchParams } from 'react-router-dom';
import dayjs from 'dayjs';
import MapPicker, { type MapPosition, type MapMarker } from '@/components/Map/MapPicker';
import {
  useBidansWithoutLocation,
  useBidanLocations,
  useSetBidanLocation,
  useBidanAccounts,
} from '@/hooks/useBidanManagement';
import type { BidanAccount, BidanLocation, OperatingHours } from '@/features/admin/bidan.types';

const { Title, Text } = Typography;
const { TextArea } = Input;

const defaultOperatingHours: OperatingHours[] = [
  { day: 'Senin', open: '08:00', close: '17:00', is_closed: false },
  { day: 'Selasa', open: '08:00', close: '17:00', is_closed: false },
  { day: 'Rabu', open: '08:00', close: '17:00', is_closed: false },
  { day: 'Kamis', open: '08:00', close: '17:00', is_closed: false },
  { day: 'Jumat', open: '08:00', close: '17:00', is_closed: false },
  { day: 'Sabtu', open: '08:00', close: '12:00', is_closed: false },
  { day: 'Minggu', open: '08:00', close: '12:00', is_closed: true },
];

const BidanLocationsPage = () => {
  const [searchParams] = useSearchParams();
  const preSelectedBidanId = searchParams.get('bidan');

  const [selectedBidan, setSelectedBidan] = useState<BidanAccount | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<MapPosition | null>(null);
  const [addressLabel, setAddressLabel] = useState('');
  const [phoneOverride, setPhoneOverride] = useState('');
  const [notes, setNotes] = useState('');
  const [operatingHours, setOperatingHours] = useState<OperatingHours[]>(defaultOperatingHours);

  // React Query hooks
  const { data: bidansWithoutLocationData, isLoading: loadingBidans } = useBidansWithoutLocation();
  const { data: locationsData, isLoading: loadingLocations } = useBidanLocations();
  const { data: allBidansData } = useBidanAccounts();
  const setLocationMutation = useSetBidanLocation();

  // Safely extract arrays from response data - handle paginated responses
  const bidansWithoutLocation = Array.isArray(bidansWithoutLocationData?.data?.data)
    ? bidansWithoutLocationData.data.data
    : Array.isArray(bidansWithoutLocationData?.data)
    ? bidansWithoutLocationData.data
    : Array.isArray(bidansWithoutLocationData)
    ? bidansWithoutLocationData
    : [];

  const locations = Array.isArray(locationsData) ? locationsData : [];
  const allBidans = Array.isArray(allBidansData?.data?.data)
    ? allBidansData.data.data
    : Array.isArray(allBidansData?.data)
    ? allBidansData.data
    : Array.isArray(allBidansData)
    ? allBidansData
    : [];

  // Pre-select bidan from URL param
  useEffect(() => {
    if (preSelectedBidanId && allBidans.length > 0) {
      const bidan = allBidans.find((b) => b.id === Number(preSelectedBidanId));
      if (bidan) {
        setSelectedBidan(bidan);
      }
    }
  }, [preSelectedBidanId, allBidans]);

  // Convert locations to map markers
  const mapMarkers: MapMarker[] = locations.map((loc: BidanLocation) => ({
    id: loc.id,
    position: { lat: loc.latitude, lng: loc.longitude },
    label: loc.bidan?.bidan_name || loc.address_label,
    info: (
      <div>
        <div>{loc.address_label}</div>
        {loc.phone_override && (
          <div className="text-xs">
            <PhoneOutlined /> {loc.phone_override}
          </div>
        )}
      </div>
    ),
  }));

  const handleSelectBidan = (bidan: BidanAccount) => {
    setSelectedBidan(bidan);
    setSelectedPosition(null);
    setAddressLabel('');
    setPhoneOverride(bidan.phone || '');
    setNotes('');
    setOperatingHours(defaultOperatingHours);
  };

  const handleLocationSelect = (position: MapPosition) => {
    setSelectedPosition(position);
  };

  const handleOperatingHourChange = (
    index: number,
    field: 'open' | 'close' | 'is_closed',
    value: string | boolean
  ) => {
    const newHours = [...operatingHours];
    newHours[index] = { ...newHours[index], [field]: value };
    setOperatingHours(newHours);
  };

  const handleSaveLocation = async () => {
    if (!selectedBidan) {
      message.error('Pilih bidan terlebih dahulu');
      return;
    }
    if (!selectedBidan.user_id) {
      message.error('ID User Bidan tidak valid. Silakan pilih bidan lain.');
      console.error('Invalid bidan user_id:', selectedBidan);
      return;
    }
    if (!selectedPosition) {
      message.error('Pilih lokasi di peta');
      return;
    }
    if (!addressLabel.trim()) {
      message.error('Label alamat wajib diisi');
      return;
    }

    console.log('Saving location for bidan:', selectedBidan);
    console.log('Bidan user_id:', selectedBidan.user_id);
    console.log('Position:', selectedPosition);

    try {
      await setLocationMutation.mutateAsync({
        bidanId: selectedBidan.user_id, // Use user_id instead of id
        data: {
          latitude: selectedPosition.lat,
          longitude: selectedPosition.lng,
          address_label: addressLabel,
          phone_override: phoneOverride || undefined,
          notes: notes || undefined,
          operating_hours: operatingHours,
        },
      });
      message.success('Lokasi berhasil disimpan');
      // Reset form
      setSelectedBidan(null);
      setSelectedPosition(null);
      setAddressLabel('');
      setPhoneOverride('');
      setNotes('');
      setOperatingHours(defaultOperatingHours);
    } catch (err: any) {
      console.error('Location save error:', err);
      if (err.response?.data?.message) {
        message.error(`Gagal menyimpan: ${err.response.data.message}`);
      } else {
        message.error('Terjadi kesalahan saat menyimpan lokasi');
      }
    }
  };

  return (
    <div className="p-6">
      <Title level={4} className="mb-6">
        Lokasi Praktik Bidan
      </Title>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Bidan List */}
        <Card title="Bidan Tanpa Lokasi" className="lg:col-span-1">
          {loadingBidans ? (
            <Skeleton active paragraph={{ rows: 5 }} />
          ) : bidansWithoutLocation && bidansWithoutLocation.length > 0 ? (
            <List
              dataSource={bidansWithoutLocation}
              renderItem={(bidan: BidanAccount) => (
                <List.Item
                  className={`cursor-pointer rounded-lg transition-colors ${
                    selectedBidan?.id === bidan.id
                      ? 'bg-pink-50 border-l-4 border-[#FA6978]'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => handleSelectBidan(bidan)}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        icon={<UserOutlined />}
                        style={{
                          backgroundColor:
                            selectedBidan?.id === bidan.id ? '#FA6978' : '#ccc',
                        }}
                      />
                    }
                    title={bidan.bidan_name}
                    description={
                      <div>
                        <div className="text-xs">{bidan.email}</div>
                        <div className="text-xs">{bidan.phone}</div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          ) : (
            <Empty description="Semua bidan sudah memiliki lokasi" />
          )}

          <Divider />

          {/* Also show bidans with location for editing */}
          <Text strong className="mb-2 block">
            Bidan dengan Lokasi
          </Text>
          {loadingLocations ? (
            <Skeleton active paragraph={{ rows: 3 }} />
          ) : locations && locations.length > 0 ? (
            <List
              size="small"
              dataSource={locations}
              renderItem={(loc: BidanLocation) => (
                <List.Item className="cursor-pointer hover:bg-gray-50 rounded">
                  <List.Item.Meta
                    avatar={<EnvironmentOutlined style={{ color: '#FA6978' }} />}
                    title={
                      <span className="text-sm">{loc.bidan?.bidan_name || 'Unknown'}</span>
                    }
                    description={
                      <span className="text-xs">{loc.address_label}</span>
                    }
                  />
                  <Tag color="green" className="text-xs">
                    Aktif
                  </Tag>
                </List.Item>
              )}
            />
          ) : (
            <Text type="secondary" className="text-sm">
              Belum ada lokasi terdaftar
            </Text>
          )}
        </Card>

        {/* Right Panel - Map and Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Map */}
          <Card
            title={
              <span>
                <EnvironmentOutlined /> Peta Lokasi
              </span>
            }
            extra={
              selectedBidan && (
                <Tag color="processing">
                  Mengatur lokasi untuk: {selectedBidan.bidan_name}
                </Tag>
              )
            }
          >
            {loadingLocations ? (
              <Skeleton.Image style={{ width: '100%', height: 400 }} active />
            ) : (
              <>
                <MapPicker
                  markers={mapMarkers}
                  selectedPosition={selectedPosition}
                  onLocationSelect={handleLocationSelect}
                  editable={!!selectedBidan}
                  height={400}
                />
                {selectedBidan && (
                  <Text type="secondary" className="mt-2 block text-sm">
                    Klik pada peta untuk menentukan lokasi praktik, atau drag marker
                    untuk mengubah posisi.
                  </Text>
                )}
              </>
            )}
          </Card>

          {/* Location Form */}
          {selectedBidan && selectedPosition && (
            <Card title="Detail Lokasi">
              <Form layout="vertical">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Form.Item label="Label Alamat *" required>
                    <Input
                      value={addressLabel}
                      onChange={(e) => setAddressLabel(e.target.value)}
                      placeholder="Contoh: Klinik Bidan Sari"
                      prefix={<EnvironmentOutlined />}
                    />
                  </Form.Item>

                  <Form.Item label="No. Telepon (Override)">
                    <Input
                      value={phoneOverride}
                      onChange={(e) => setPhoneOverride(e.target.value)}
                      placeholder="Kosongkan untuk menggunakan nomor utama"
                      prefix={<PhoneOutlined />}
                    />
                  </Form.Item>
                </div>

                <Form.Item label="Koordinat">
                  <div className="flex gap-4">
                    <Input
                      value={selectedPosition.lat.toFixed(6)}
                      disabled
                      addonBefore="Lat"
                    />
                    <Input
                      value={selectedPosition.lng.toFixed(6)}
                      disabled
                      addonBefore="Lng"
                    />
                  </div>
                </Form.Item>

                <Form.Item label="Catatan">
                  <TextArea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    placeholder="Catatan tambahan tentang lokasi praktik..."
                  />
                </Form.Item>

                <Divider />

                <Form.Item
                  label={
                    <span>
                      <ClockCircleOutlined /> Jam Operasional
                    </span>
                  }
                >
                  <div className="space-y-2">
                    {operatingHours.map((hours, index) => (
                      <div key={hours.day} className="flex items-center gap-4">
                        <span className="w-20 font-medium">{hours.day}</span>
                        <Switch
                          size="small"
                          checked={!hours.is_closed}
                          onChange={(checked) =>
                            handleOperatingHourChange(index, 'is_closed', !checked)
                          }
                        />
                        {!hours.is_closed ? (
                          <Space>
                            <TimePicker
                              value={dayjs(hours.open, 'HH:mm')}
                              format="HH:mm"
                              onChange={(time) =>
                                handleOperatingHourChange(
                                  index,
                                  'open',
                                  time?.format('HH:mm') || '08:00'
                                )
                              }
                              size="small"
                            />
                            <span>-</span>
                            <TimePicker
                              value={dayjs(hours.close, 'HH:mm')}
                              format="HH:mm"
                              onChange={(time) =>
                                handleOperatingHourChange(
                                  index,
                                  'close',
                                  time?.format('HH:mm') || '17:00'
                                )
                              }
                              size="small"
                            />
                          </Space>
                        ) : (
                          <Tag color="default">Tutup</Tag>
                        )}
                      </div>
                    ))}
                  </div>
                </Form.Item>

                <Divider />

                <Form.Item className="mb-0">
                  <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    onClick={handleSaveLocation}
                    loading={setLocationMutation.isPending}
                    style={{ backgroundColor: '#FA6978' }}
                  >
                    Simpan Lokasi
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default BidanLocationsPage;
