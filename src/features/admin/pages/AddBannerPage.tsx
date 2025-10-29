import React, { useState, useEffect } from 'react';
import { Space, Table, Tag, Button, Input, Avatar, Switch, Modal, Spin, Card, Image } from 'antd';
import { SearchOutlined, PlusOutlined, FilterOutlined, EyeOutlined, EditOutlined, DeleteOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { getBanners, toggleBannerStatus, deleteBanner } from '../admin.api';
import { Banner } from '../admin.types';
import ConfirmDialog from '../components/ConfirmDialog';

const { Column } = Table;

interface DataType extends Banner {
    key: React.Key;
}

interface ConfirmDialogState {
    isOpen: boolean;
    bannerId: number;
    bannerName: string;
    action: 'activate' | 'deactivate' | 'delete';
}

export default function AddBannerPage() {
    const [banners, setBanners] = useState<DataType[]>([]);
    const [filteredBanners, setFilteredBanners] = useState<DataType[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');
    const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({
        isOpen: false,
        bannerId: 0,
        bannerName: '',
        action: 'deactivate',
    });
    const [actionLoading, setActionLoading] = useState(false);
    const [detailOpen, setDetailOpen] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);
    const [detail, setDetail] = useState<Banner | null>(null);

    useEffect(() => {
        fetchBanners();
    }, []);

    useEffect(() => {
        filterBanners();
    }, [banners, searchText]);

    const fetchBanners = async () => {
        try {
            setLoading(true);
            const result = await getBanners();
            const bannersWithKey = result.data.map((banner) => ({
                ...banner,
                key: banner.id,
            }));
            setBanners(bannersWithKey);
        } catch (error) {
            console.error('Failed to fetch banners:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterBanners = () => {
        let filtered = banners;

        // Filter by search text (name)
        if (searchText) {
            filtered = filtered.filter(banner =>
                banner.name.toLowerCase().includes(searchText.toLowerCase())
            );
        }

        setFilteredBanners(filtered);
    };

    const handleSearch = (value: string) => {
        setSearchText(value);
    };

    const handleStatusToggle = (bannerId: number, bannerName: string, currentStatus: number) => {
        setConfirmDialog({
            isOpen: true,
            bannerId,
            bannerName,
            action: currentStatus === 1 ? 'deactivate' : 'activate',
        });
    };

    const handleDelete = (bannerId: number, bannerName: string) => {
        setConfirmDialog({
            isOpen: true,
            bannerId,
            bannerName,
            action: 'delete',
        });
    };

    const openDetail = async (record: DataType) => {
        setDetailOpen(true);
        setDetailLoading(true);
        try {
            setDetail(record);
        } catch (e) {
            console.error('Failed to load banner detail:', e);
            setDetail(null);
        } finally {
            setDetailLoading(false);
        }
    };

    const confirmAction = async () => {
        try {
            setActionLoading(true);

            if (confirmDialog.action === 'delete') {
                await deleteBanner(confirmDialog.bannerId);
                // Update local state immediately
                setBanners(prev => prev.filter(banner => banner.id !== confirmDialog.bannerId));
            } else {
                const newStatus = confirmDialog.action === 'activate' ? 1 : 0;
                await toggleBannerStatus(confirmDialog.bannerId, newStatus);
                // Update local state immediately
                setBanners(prev => prev.map(banner =>
                    banner.id === confirmDialog.bannerId ? { ...banner, is_active: newStatus } : banner
                ));
            }

            // Close dialog
            setConfirmDialog({
                isOpen: false,
                bannerId: 0,
                bannerName: '',
                action: 'deactivate',
            });
        } catch (error: any) {
            console.error('Failed to perform action:', error);
            let errorMsg = error?.response?.data?.message || `Gagal melakukan aksi: ${error}`;
            alert(errorMsg);
        } finally {
            setActionLoading(false);
        }
    };

    const cancelAction = () => {
        setConfirmDialog({
            isOpen: false,
            bannerId: 0,
            bannerName: '',
            action: 'deactivate',
        });
    };

    const getStatusTag = (isActive: number) => {
        if (isActive === 1) {
            return (
                <Tag icon={<CheckCircleOutlined />} color="success">
                    Active
                </Tag>
            );
        } else {
            return (
                <Tag icon={<CloseCircleOutlined />} color="error">
                    InActive
                </Tag>
            );
        }
    };

    const getConfirmMessage = () => {
        switch (confirmDialog.action) {
            case 'activate':
                return `Apakah Anda yakin ingin mengaktifkan banner ${confirmDialog.bannerName}?`;
            case 'deactivate':
                return `Apakah Anda yakin ingin menonaktifkan banner ${confirmDialog.bannerName}?`;
            case 'delete':
                return `Apakah Anda yakin ingin menghapus banner ${confirmDialog.bannerName}?`;
            default:
                return '';
        }
    };

    const getConfirmText = () => {
        switch (confirmDialog.action) {
            case 'activate':
                return 'Aktifkan';
            case 'deactivate':
                return 'Nonaktifkan';
            case 'delete':
                return 'Hapus';
            default:
                return 'Konfirmasi';
        }
    };

    const getConfirmButtonColor = () => {
        switch (confirmDialog.action) {
            case 'activate':
                return 'green';
            case 'deactivate':
                return 'red';
            case 'delete':
                return 'red';
            default:
                return 'blue';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Add Banner</h1>
                    <p className="text-gray-600">Kelola semua banner dalam sistem</p>
                </div>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    style={{ backgroundColor: '#FA6978', borderColor: '#FA6978' }}
                    onClick={() => window.location.href = '/admin/create-banner'}
                >
                    Tambah Banner
                </Button>
            </div>

            {/* Search and Filter Bar */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-4">
                    <div className="flex-1">
                        <Input
                            placeholder="Search"
                            prefix={<SearchOutlined />}
                            value={searchText}
                            onChange={(e) => handleSearch(e.target.value)}
                            size="large"
                        />
                    </div>
                    <Button icon={<FilterOutlined />}>
                        Filter
                    </Button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <Table<DataType>
                    dataSource={filteredBanners}
                    loading={loading}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) => `${range[0]}-${range[1]} dari ${total} banner`,
                    }}
                >
                    <Column
                        title="Banner"
                        key="banner"
                        render={(_, record: DataType) => (
                            <div className="flex items-center gap-3">
                                <Avatar
                                    size={40}
                                    src={record.image_url ? `${import.meta.env.VITE_API_BASE}/storage/${record.image_url}` : undefined}
                                    style={{ backgroundColor: '#FA6978' }}
                                >
                                    {record.name.charAt(0).toUpperCase()}
                                </Avatar>
                                <div>
                                    <div className="font-medium">{record.name}</div>
                                </div>
                            </div>
                        )}
                    />
                    <Column
                        title="URL"
                        dataIndex="url"
                        key="url"
                        render={(url: string) => (
                            <span className="text-gray-900">
                                {url || 'Link'}
                            </span>
                        )}
                    />
                    <Column
                        title="Status"
                        dataIndex="is_active"
                        key="is_active"
                        render={(isActive: number, record: DataType) => (
                            <div className="flex items-center gap-2">
                                {getStatusTag(isActive)}
                                <Switch
                                    checked={isActive === 1}
                                    onChange={() => handleStatusToggle(record.id, record.name, isActive)}
                                    size="small"
                                    loading={actionLoading && confirmDialog.bannerId === record.id}
                                    disabled={actionLoading}
                                />
                            </div>
                        )}
                    />
                    <Column
                        title="Action"
                        key="action"
                        render={(_, record: DataType) => (
                            <Space size="middle">
                                <Button
                                    type="text"
                                    icon={<EyeOutlined />}
                                    title="View Details"
                                    onClick={() => openDetail(record)}
                                />
                                <Button
                                    type="text"
                                    icon={<EditOutlined />}
                                    title="Edit Banner"
                                />
                                <Button
                                    type="text"
                                    danger
                                    icon={<DeleteOutlined />}
                                    title="Delete Banner"
                                    onClick={() => handleDelete(record.id, record.name)}
                                />
                            </Space>
                        )}
                    />
                </Table>
            </div>

            {/* Confirmation Dialog */}
            <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                title="Konfirmasi"
                message={getConfirmMessage()}
                confirmText={getConfirmText()}
                cancelText="Batal"
                confirmButtonColor={getConfirmButtonColor()}
                onConfirm={confirmAction}
                onCancel={cancelAction}
                loading={actionLoading}
            />

            {/* Detail Modal */}
            <Modal
                open={detailOpen}
                onCancel={() => setDetailOpen(false)}
                footer={null}
                width={720}
                title={<div className="font-semibold">Detail Banner</div>}
            >
                {detailLoading ? (
                    <div className="flex justify-center items-center py-10">
                        <Spin />
                    </div>
                ) : (
                    <div>
                        <div className="flex justify-center mb-6">
                            {detail?.image_url ? (
                                <Image
                                    src={`${import.meta.env.VITE_API_BASE}/storage/${detail.image_url}`}
                                    className="w-40 h-40 rounded-lg object-cover"
                                    alt="Banner Image"
                                />
                            ) : (
                                <div className="w-40 h-40 rounded-lg bg-gray-200 flex items-center justify-center">
                                    <span className="text-gray-400">No Image</span>
                                </div>
                            )}
                        </div>

                        <Card bordered>
                            <div className="grid grid-cols-3 gap-y-3">
                                <div className="col-span-1 text-gray-600">Nama Banner</div>
                                <div className="col-span-2">: {detail?.name || '-'}</div>

                                <div className="col-span-1 text-gray-600">URL</div>
                                <div className="col-span-2">: {detail?.url || '-'}</div>

                                <div className="col-span-1 text-gray-600">Status</div>
                                <div className="col-span-2">: {detail?.is_active === 1 ? 'Active' : 'InActive'}</div>

                                <div className="col-span-1 text-gray-600">Dibuat</div>
                                <div className="col-span-2">: {detail?.created_at ? new Date(detail.created_at).toLocaleDateString('id-ID') : '-'}</div>

                                <div className="col-span-1 text-gray-600">Diupdate</div>
                                <div className="col-span-2">: {detail?.updated_at ? new Date(detail.updated_at).toLocaleDateString('id-ID') : '-'}</div>
                            </div>
                        </Card>
                    </div>
                )}
            </Modal>
        </div>
    );
}