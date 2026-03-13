import React, { useState, useEffect } from 'react';
import { Space, Table, Button, Input, Modal, Spin, Card } from 'antd';
import { SearchOutlined, PlusOutlined, FilterOutlined, EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getRekomendasiGerakan, deleteRekomendasiGerakan } from '../admin.api';
import { RekomendasiGerakan } from '../admin.types';
import ConfirmDialog from '../components/ConfirmDialog';

const { Column } = Table;

interface DataType extends RekomendasiGerakan {
    key: React.Key;
}

interface ConfirmDialogState {
    isOpen: boolean;
    itemName: string;
}

export default function RekomendasiOlahragaPage() {
    const navigate = useNavigate();
    const [items, setItems] = useState<DataType[]>([]);
    const [filteredItems, setFilteredItems] = useState<DataType[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');
    const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({
        isOpen: false,
        itemName: '',
    });
    const [actionLoading, setActionLoading] = useState(false);
    const [detailOpen, setDetailOpen] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);
    const [detail, setDetail] = useState<RekomendasiGerakan | null>(null);

    useEffect(() => {
        fetchItems();
    }, []);

    useEffect(() => {
        filterItems();
    }, [items, searchText]);

    const fetchItems = async () => {
        try {
            setLoading(true);
            const result = await getRekomendasiGerakan();
            const withKey = result.data.map((item) => ({
                ...item,
                key: item.id,
            }));
            setItems(withKey);
        } catch (error) {
            console.error('Failed to fetch rekomendasi gerakan:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterItems = () => {
        let filtered = items;
        if (searchText) {
            filtered = filtered.filter(item =>
                item.activity.toLowerCase().includes(searchText.toLowerCase())
            );
        }
        setFilteredItems(filtered);
    };

    const handleSearch = (value: string) => {
        setSearchText(value);
    };

    const handleDelete = (name: string) => {
        setConfirmDialog({
            isOpen: true,
            itemName: name,
        });
    };

    const openDetail = (record: DataType) => {
        setDetailOpen(true);
        setDetailLoading(true);
        try {
            setDetail(record);
        } catch (e) {
            console.error('Failed to load detail:', e);
            setDetail(null);
        } finally {
            setDetailLoading(false);
        }
    };

    const confirmAction = async () => {
        try {
            setActionLoading(true);
            await deleteRekomendasiGerakan(confirmDialog.itemName);
            setItems(prev => prev.filter(item => item.activity !== confirmDialog.itemName));
            setConfirmDialog({ isOpen: false, itemName: '' });
        } catch (error: any) {
            console.error('Failed to delete:', error);
            alert(error?.response?.data?.message || `Gagal menghapus: ${error}`);
        } finally {
            setActionLoading(false);
        }
    };

    const cancelAction = () => {
        setConfirmDialog({ isOpen: false, itemName: '' });
    };

    const getImageUrl = (path: string | null) => {
        if (!path) return null;
        return `${import.meta.env.VITE_API_BASE}/storage/${path}`;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Rekomendasi Gerakan</h1>
                    <p className="text-gray-600">Kelola semua rekomendasi gerakan olahraga</p>
                </div>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    style={{ backgroundColor: '#FA6978', borderColor: '#FA6978' }}
                    onClick={() => navigate('/admin/create-rekomendasi')}
                >
                    Tambah Gerakan
                </Button>
            </div>

            {/* Search and Filter Bar */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-4">
                    <div className="flex-1">
                        <Input
                            placeholder="Cari aktivitas..."
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
                    dataSource={filteredItems}
                    loading={loading}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) => `${range[0]}-${range[1]} dari ${total} gerakan`,
                    }}
                >
                    <Column
                        title="Nama Aktivitas"
                        dataIndex="activity"
                        key="activity"
                        render={(activity: string) => (
                            <div className="font-medium">{activity}</div>
                        )}
                    />
                    <Column
                        title="Link Video"
                        dataIndex="video_link"
                        key="video_link"
                        render={(link: string) => (
                            link ? (
                                <a
                                    href={link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 hover:underline"
                                >
                                    {link.length > 50 ? link.substring(0, 50) + '...' : link}
                                </a>
                            ) : (
                                <span className="text-gray-400">-</span>
                            )
                        )}
                    />
                    <Column
                        title="Action"
                        key="action"
                        render={(_: unknown, record: DataType) => (
                            <Space size="middle">
                                <Button
                                    type="text"
                                    icon={<EyeOutlined />}
                                    title="Lihat Detail"
                                    onClick={() => openDetail(record)}
                                />
                                <Button
                                    type="text"
                                    icon={<EditOutlined />}
                                    title="Edit"
                                    onClick={() => navigate(`/admin/edit-rekomendasi/${encodeURIComponent(record.activity)}`)}
                                />
                                <Button
                                    type="text"
                                    danger
                                    icon={<DeleteOutlined />}
                                    title="Hapus"
                                    onClick={() => handleDelete(record.activity)}
                                />
                            </Space>
                        )}
                    />
                </Table>
            </div>

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                title="Konfirmasi Hapus"
                message={`Apakah Anda yakin ingin menghapus "${confirmDialog.itemName}"?`}
                confirmText="Hapus"
                cancelText="Batal"
                confirmButtonColor="red"
                onConfirm={confirmAction}
                onCancel={cancelAction}
                loading={actionLoading}
            />

            {/* Detail Modal */}
            <Modal
                open={detailOpen}
                onCancel={() => setDetailOpen(false)}
                footer={null}
                width={800}
                title={<div className="font-semibold">Detail Rekomendasi Gerakan</div>}
            >
                {detailLoading ? (
                    <div className="flex justify-center items-center py-10">
                        <Spin />
                    </div>
                ) : (
                    <div>
                        {/* Images */}
                        <div className="flex gap-4 mb-6 justify-center">
                            {[detail?.picture_1, detail?.picture_2, detail?.picture_3].map((pic, idx) => (
                                pic ? (
                                    <img
                                        key={idx}
                                        src={getImageUrl(pic)!}
                                        alt={`Gambar ${idx + 1}`}
                                        className="w-32 h-32 rounded-lg object-cover border border-gray-200"
                                    />
                                ) : (
                                    <div key={idx} className="w-32 h-32 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200">
                                        <span className="text-gray-400 text-xs">No Image</span>
                                    </div>
                                )
                            ))}
                        </div>

                        <Card bordered>
                            <div className="grid grid-cols-3 gap-y-3">
                                <div className="col-span-1 text-gray-600">Nama Aktivitas</div>
                                <div className="col-span-2">: {detail?.activity || '-'}</div>

                                <div className="col-span-1 text-gray-600">Link Video</div>
                                <div className="col-span-2">
                                    : {detail?.video_link ? (
                                        <a href={detail.video_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                            {detail.video_link}
                                        </a>
                                    ) : '-'}
                                </div>

                                <div className="col-span-1 text-gray-600">Deskripsi</div>
                                <div className="col-span-2">: {detail?.long_text || '-'}</div>

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
