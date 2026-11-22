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
  Tooltip,
} from 'antd';
import {
  EnvironmentOutlined,
  UserOutlined,
  PhoneOutlined,
  ClockCircleOutlined,
  SaveOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import { useSearchParams } from 'react-router-dom';
import dayjs from 'dayjs';
import MapPicker, { type MapPosition, type MapMarker } from '@/components/Map/MapPicker';
import {
  useBidansWithoutLocation,
  useBidanLocations,
  useSetBidanLocation,
  useUpdateBidanLocation,
  useToggleBidanLocationActive,
  useBidanAccounts,
} from '@/hooks/useBidanManagement';
import type { BidanAccount, BidanLocation, OperatingHours } from '@/features/admin/bidan.types';

const { Title, Text } = Typography;
const { TextArea } = Input;

const DEFAULT_CENTER: MapPosition = { lat: -6.914744, lng: 107.60981 };

const defaultOperatingHours: OperatingHours[] = [
  { day: 'Senin', open: '08:00', close: '17:00', is_closed: false },
  { day: 'Selasa', open: '08:00', close: '17:00', is_closed: false },
  { day: 'Rabu', open: '08:00', close: '17:00', is_closed: false },
  { day: 'Kamis', open: '08:00', close: '17:00', is_closed: false },
  { day: 'Jumat', open: '08:00', close: '17:00', is_closed: false },
  { day: 'Sabtu', open: '08:00', close: '12:00', is_closed: false },
  { day: 'Minggu', open: '08:00', close: '12:00', is_closed: true },
];

function normalizeOperatingHours(raw: unknown): OperatingHours[] {
  if (Array.isArray(raw) && raw.length > 0 && typeof raw[0] === 'object' && raw[0] !== null && 'day' in raw[0]) {
    return (raw as OperatingHours[]).map((item) => ({
      day: item.day || 'Hari',
      open: item.open || '08:00',
      close: item.close || '17:00',
      is_closed: Boolean(item.is_closed),
    }));
  }
  return defaultOperatingHours.map((h) => ({ ...h }));
}

const BidanLocationsPage = () => {
  const [searchParams] = useSearchParams();
  const preSelectedBidanId = searchParams.get('bidan');

  const [selectedBidan, setSelectedBidan] = useState<BidanAccount | null>(null);
  const [editingLocation, setEditingLocation] = useState<BidanLocation | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<MapPosition | null>(null);
  const [mapCenter, setMapCenter] = useState<MapPosition | null>(null);
  const [addressLabel, setAddressLabel] = useState('');
  const [phoneOverride, setPhoneOverride] = useState('');
  const [notes, setNotes] = useState('');
  const [operatingHours, setOperatingHours] = useState<OperatingHours[]>(defaultOperatingHours);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  // React Query hooks
  const { data: bidansWithoutLocationData, isLoading: loadingBidans } = useBidansWithoutLocation();
  const { data: locationsData, isLoading: loadingLocations } = useBidanLocations();
  const { data: allBidansData } = useBidanAccounts();
  const setLocationMutation = useSetBidanLocation();
  const updateLocationMutation = useUpdateBidanLocation();
  const toggleActiveMutation = useToggleBidanLocationActive();

  const bidansWithoutLocation: BidanAccount[] = Array.isArray((bidansWithoutLocationData as any)?.data?.data)
    ? (bidansWithoutLocationData as any).data.data
    : Array.isArray((bidansWithoutLocationData as any)?.data)
    ? (bidansWithoutLocationData as any).data
    : Array.isArray(bidansWithoutLocationData)
    ? bidansWithoutLocationData
    : [];

  const locations: BidanLocation[] = Array.isArray(locationsData) ? locationsData : [];
  const allBidans: BidanAccount[] = Array.isArray((allBidansData as any)?.data?.data)
    ? (allBidansData as any).data.data
    : Array.isArray((allBidansData as any)?.data)
    ? (allBidansData as any).data
    : Array.isArray(allBidansData)
    ? (allBidansData as any)
    : [];

  // Pre-select bidan from URL param
  useEffect(() => {
    if (preSelectedBidanId && allBidans.length > 0) {
      const targetId = Number(preSelectedBidanId);
      const existingLoc = locations.find((l: any) => Number(l.bidan_id) === targetId);
      if (existingLoc) {
        handleSelectExistingLocation(existingLoc);
        return;
      }
      const bidan = allBidans.find((b) => b.id === targetId || b.user_id === targetId);
      if (bidan) {
        handleSelectBidan(bidan);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preSelectedBidanId, allBidans.length, locations.length]);

  const mapMarkers: MapMarker[] = locations
    .map((loc: any) => {
      const lat = Number(loc.latitude ?? loc.lat);
      const lng = Number(loc.longitude ?? loc.lng);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
      return {
        id: loc.id ?? loc.bidan_location_id,
        position: { lat, lng },
        label: loc.bidan?.bidan_name || loc.bidan?.name || loc.address_label || 'PMB',
        info: (
          <div>
            <div>{loc.address_label}</div>
            <div className="text-xs mt-1">
              Status: <strong>{loc.is_active ? 'Aktif' : 'Nonaktif'}</strong>
            </div>
            {loc.phone_override && (
              <div className="text-xs">
                <PhoneOutlined /> {loc.phone_override}
              </div>
            )}
          </div>
        ),
      } as MapMarker;
    })
    .filter((m): m is MapMarker => m !== null);

  const initialMapCenter: MapPosition =
    mapCenter ?? (mapMarkers.length > 0 ? mapMarkers[0].position : DEFAULT_CENTER);

  const isEditing = Boolean(editingLocation);
  const canEditMap = Boolean(selectedBidan || editingLocation);

  const resetForm = () => {
    setSelectedBidan(null);
    setEditingLocation(null);
    setSelectedPosition(null);
    setAddressLabel('');
    setPhoneOverride('');
    setNotes('');
    setOperatingHours(defaultOperatingHours.map((h) => ({ ...h })));
  };

  const handleSelectBidan = (bidan: BidanAccount) => {
    setEditingLocation(null);
    setSelectedBidan(bidan);
    setSelectedPosition(null);
    setAddressLabel('');
    setPhoneOverride(bidan.phone || '');
    setNotes('');
    setOperatingHours(defaultOperatingHours.map((h) => ({ ...h })));
  };

  const handleSelectExistingLocation = (loc: BidanLocation) => {
    const raw: any = loc;
    const lat = Number(raw.latitude ?? raw.lat);
    const lng = Number(raw.longitude ?? raw.lng);

    setSelectedBidan(null);
    setEditingLocation(loc);
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      const pos = { lat, lng };
      setSelectedPosition(pos);
      setMapCenter(pos);
    } else {
      setSelectedPosition(null);
    }
    setAddressLabel(loc.address_label || '');
    setPhoneOverride(loc.phone_override || '');
    setNotes(loc.notes || '');
    setOperatingHours(normalizeOperatingHours(loc.operating_hours));
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

  const handleToggleActive = async (loc: BidanLocation) => {
    const locId = loc.id ?? (loc as any).bidan_location_id;
    if (!locId) return;

    setTogglingId(locId);
    try {
      const res = await toggleActiveMutation.mutateAsync(locId);
      message.success(res.is_active ? 'Lokasi klinik diaktifkan' : 'Lokasi klinik dinonaktifkan');
      if (editingLocation && (editingLocation.id ?? (editingLocation as any).bidan_location_id) === locId) {
        setEditingLocation({ ...editingLocation, is_active: res.is_active });
      }
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Gagal mengubah status lokasi');
    } finally {
      setTogglingId(null);
    }
  };

  const handleSaveLocation = async () => {
    if (!selectedBidan && !editingLocation) {
      message.error('Pilih bidan atau lokasi terlebih dahulu');
      return;
    }
    if (!selectedPosition) {
      message.error('Pilih titik lokasi pada peta');
      return;
    }
    if (!addressLabel.trim()) {
      message.error('Label alamat wajib diisi');
      return;
    }

    try {
      if (editingLocation) {
        const locId = editingLocation.id ?? (editingLocation as any).bidan_location_id;
        await updateLocationMutation.mutateAsync({
          locationId: locId,
          data: {
            lat: selectedPosition.lat,
            lng: selectedPosition.lng,
            address_label: addressLabel.trim(),
            phone_override: phoneOverride.trim() || undefined,
            notes: notes.trim() || undefined,
            operating_hours: operatingHours,
          },
        });
        message.success('Perubahan lokasi berhasil disimpan');
        resetForm();
      } else if (selectedBidan) {
        const bidanUserId = selectedBidan.user_id ?? selectedBidan.id;
        if (!bidanUserId) {
          message.error('ID User Bidan tidak valid.');
          return;
        }
        await setLocationMutation.mutateAsync({
          bidanId: bidanUserId,
          data: {
            lat: selectedPosition.lat,
            lng: selectedPosition.lng,
            address_label: addressLabel.trim(),
            phone_override: phoneOverride.trim() || undefined,
            notes: notes.trim() || undefined,
            operating_hours: operatingHours,
          },
        });
        message.success('Lokasi berhasil disimpan');
        resetForm();
      }
    } catch (err: any) {
      message.error(
        err?.response?.data?.message || 'Terjadi kesalahan saat menyimpan lokasi'
      );
    }
  };

  const activeEditingName = editingLocation
    ? (editingLocation as any).bidan?.bidan_name ||
      (editingLocation as any).bidan?.name ||
      editingLocation.address_label
    : selectedBidan?.bidan_name || (selectedBidan as any)?.name;

  const isSaving = setLocationMutation.isPending || updateLocationMutation.isPending;

  return (
    <div className="p-6">
      <Title level={4} className="mb-6">
        Lokasi Praktik Bidan
      </Title>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Bidan List */}
        <Card title="Bidan Tanpa Lokasi" className="lg:col-span-1">
          {loadingBidans ? (
            <Skeleton active paragraph={{ rows: 4 }} />
          ) : bidansWithoutLocation.length > 0 ? (
            <List
              dataSource={bidansWithoutLocation}
              renderItem={(bidan: BidanAccount) => {
                const isSelected = selectedBidan?.user_id === bidan.user_id;
                return (
                  <List.Item
                    className={`cursor-pointer rounded-lg px-2 transition-colors ${
                      isSelected
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
                            backgroundColor: isSelected ? '#FA6978' : '#ccc',
                          }}
                        />
                      }
                      title={bidan.bidan_name || (bidan as any).name}
                      description={
                        <div>
                          <div className="text-xs">{bidan.email}</div>
                          {bidan.phone && <div className="text-xs">{bidan.phone}</div>}
                        </div>
                      }
                    />
                  </List.Item>
                );
              }}
            />
          ) : (
            <Empty description="Semua bidan sudah memiliki lokasi" />
          )}

          <Divider />

          <div className="flex items-center justify-between mb-2">
            <Text strong>Bidan dengan Lokasi</Text>
            <Text type="secondary" className="text-xs">
              Klik untuk edit
            </Text>
          </div>
          {loadingLocations ? (
            <Skeleton active paragraph={{ rows: 3 }} />
          ) : locations.length > 0 ? (
            <List
              size="small"
              dataSource={locations}
              renderItem={(loc: BidanLocation) => {
                const locId = loc.id ?? (loc as any).bidan_location_id;
                const editingId = editingLocation?.id ?? (editingLocation as any)?.bidan_location_id;
                const isSelected = editingId === locId;

                return (
                  <List.Item
                    className={`cursor-pointer rounded-lg !px-3 !py-2.5 transition-colors flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-pink-50 border-l-4 border-[#FA6978]'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleSelectExistingLocation(loc)}
                  >
                    <div className="flex items-start gap-2.5 min-w-0 flex-1">
                      <EnvironmentOutlined
                        className="mt-1 shrink-0"
                        style={{ color: loc.is_active ? '#FA6978' : '#9ca3af', fontSize: 16 }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {(loc as any).bidan?.bidan_name ||
                            (loc as any).bidan?.name ||
                            'Unknown'}
                        </div>
                        <div className="text-xs text-gray-500 line-clamp-2 mt-0.5">
                          {loc.address_label}
                        </div>
                      </div>
                    </div>
                    <div
                      className="flex items-center gap-2 shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Tag
                        color={loc.is_active ? 'green' : 'default'}
                        style={{ marginInlineEnd: 0 }}
                        className="text-xs leading-5"
                      >
                        {loc.is_active ? 'Aktif' : 'Nonaktif'}
                      </Tag>
                      <Tooltip title={loc.is_active ? 'Nonaktifkan lokasi' : 'Aktifkan lokasi'}>
                        <Switch
                          size="small"
                          checked={Boolean(loc.is_active)}
                          loading={togglingId === locId}
                          onChange={() => handleToggleActive(loc)}
                        />
                      </Tooltip>
                    </div>
                  </List.Item>
                );
              }}
            />
          ) : (
            <Text type="secondary" className="text-sm">
              Belum ada lokasi terdaftar
            </Text>
          )}
        </Card>

        {/* Right Panel - Map and Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card
            title={
              <span>
                <EnvironmentOutlined /> Peta Lokasi
              </span>
            }
            extra={
              canEditMap && (
                <Space>
                  <Tag color={isEditing ? 'pink' : 'processing'}>
                    {isEditing ? 'Edit lokasi: ' : 'Atur lokasi: '}
                    {activeEditingName}
                  </Tag>
                  <Button size="small" icon={<CloseOutlined />} onClick={resetForm}>
                    Batal
                  </Button>
                </Space>
              )
            }
          >
            {loadingLocations ? (
              <Skeleton.Image style={{ width: '100%', height: 400 }} active />
            ) : (
              <>
                <MapPicker
                  initialPosition={initialMapCenter}
                  markers={mapMarkers}
                  selectedPosition={selectedPosition}
                  onLocationSelect={handleLocationSelect}
                  editable={canEditMap}
                  height={400}
                />
                {canEditMap ? (
                  <Text type="secondary" className="mt-2 block text-sm">
                    Klik pada peta atau drag marker biru untuk mengoreksi titik lokasi praktik.
                  </Text>
                ) : (
                  <Text type="secondary" className="mt-2 block text-sm">
                    Pilih salah satu bidan di panel kiri untuk mengatur atau mengedit lokasi praktiknya.
                  </Text>
                )}
              </>
            )}
          </Card>

          {/* Location Form */}
          {canEditMap && selectedPosition && (
            <Card
              title={isEditing ? 'Edit Detail Lokasi Praktik' : 'Detail Lokasi Baru'}
              extra={
                editingLocation && (
                  <Space>
                    <Text className="text-xs text-gray-600">Status Tampil:</Text>
                    <Switch
                      checked={Boolean(editingLocation.is_active)}
                      checkedChildren="Aktif"
                      unCheckedChildren="Nonaktif"
                      loading={
                        togglingId ===
                        (editingLocation.id ?? (editingLocation as any).bidan_location_id)
                      }
                      onChange={() => handleToggleActive(editingLocation)}
                    />
                  </Space>
                )
              }
            >
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
                  <Space>
                    <Button
                      type="primary"
                      icon={<SaveOutlined />}
                      onClick={handleSaveLocation}
                      loading={isSaving}
                      style={{ backgroundColor: '#FA6978', borderColor: '#FA6978' }}
                    >
                      {isEditing ? 'Simpan Perubahan' : 'Simpan Lokasi'}
                    </Button>
                    <Button onClick={resetForm}>Batal</Button>
                  </Space>
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
