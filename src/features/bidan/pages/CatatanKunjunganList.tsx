import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Input, Select, Spin, Empty, Pagination } from 'antd';
import { SearchOutlined, CalendarOutlined } from '@ant-design/icons';
import { getCatatanIbuList } from '../catatan.api';
import type { CatatanIbu } from '../catatan.types';

const PAGE_SIZE = 10;

export default function CatatanKunjunganList() {
    const navigate = useNavigate();
    const [catatanList, setCatatanList] = useState<CatatanIbu[]>([]);
    const [filteredList, setFilteredList] = useState<CatatanIbu[]>([]);
    const [paginatedList, setPaginatedList] = useState<CatatanIbu[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchDate, setSearchDate] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        fetchCatatanList();
    }, []);

    useEffect(() => {
        filterCatatan();
    }, [catatanList, searchDate, statusFilter]);

    useEffect(() => {
        paginateData();
    }, [filteredList, currentPage]);

    const fetchCatatanList = async () => {
        try {
            setLoading(true);
            const result = await getCatatanIbuList();
            const list = Array.isArray(result?.data) ? result.data : [];
            setCatatanList(list);
        } catch (error) {
            console.error('Failed to fetch catatan list:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterCatatan = () => {
        let filtered = [...catatanList];

        // Filter by date
        if (searchDate) {
            filtered = filtered.filter((catatan) => {
                const catatanDate = formatDateForSearch(catatan.tanggal_kunjungan);
                return catatanDate.includes(searchDate.toLowerCase());
            });
        }

        // Filter by status
        if (statusFilter !== 'all') {
            filtered = filtered.filter(
                (catatan) => catatan.status_kunjungan === statusFilter
            );
        }

        setFilteredList(filtered);
        setCurrentPage(1); // Reset to first page when filter changes
    };

    const paginateData = () => {
        const startIndex = (currentPage - 1) * PAGE_SIZE;
        const endIndex = startIndex + PAGE_SIZE;
        const paginated = filteredList.slice(startIndex, endIndex);
        setPaginatedList(paginated);
    };

    const formatDateForSearch = (dateStr: string): string => {
        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return dateStr.toLowerCase();
            return date.toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            }).toLowerCase();
        } catch {
            return dateStr.toLowerCase();
        }
    };

    const formatDate = (dateStr: string): string => {
        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return dateStr;
            return date.toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
        } catch {
            return dateStr;
        }
    };

    const getStatusBadge = (status: CatatanIbu['status_kunjungan']) => {
        if (status === 'selesai') {
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    Selesai
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-700">
                <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                Sedang Berlangsung
            </span>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">
                        Riwayat Konsultasi Ibu Hamil
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Kelola dan lihat riwayat konsultasi ibu hamil
                    </p>
                </div>
            </div>

            {/* Search and Filter Bar */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-4">
                    <div className="flex-1">
                        <Input
                            placeholder="Cari berdasarkan tanggal konsultasi (contoh: 15 Januari 2024)"
                            prefix={<SearchOutlined />}
                            value={searchDate}
                            onChange={(e) => setSearchDate(e.target.value)}
                            size="large"
                        />
                    </div>
                    <div className="w-64">
                        <Select
                            placeholder="Filter Status"
                            value={statusFilter}
                            onChange={setStatusFilter}
                            size="large"
                            className="w-full"
                            options={[
                                { label: 'Semua Status', value: 'all' },
                                { label: 'Selesai', value: 'selesai' },
                                { label: 'Sedang Berlangsung', value: 'sedang_berlangsung' },
                            ]}
                        />
                    </div>
                </div>
            </div>

            {/* Cards Grid */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <Spin size="large" />
                    </div>
                ) : filteredList.length === 0 ? (
                    <Empty
                        description={
                            <span className="text-gray-600">
                                {searchDate || statusFilter !== 'all'
                                    ? 'Tidak ada hasil pencarian'
                                    : 'Belum ada catatan kunjungan'}
                            </span>
                        }
                    />
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {paginatedList.map((catatan) => (
                                <Card
                                    key={catatan.catatan_id}
                                    className="cursor-pointer hover:shadow-lg transition-shadow border border-gray-200"
                                    onClick={() =>
                                        navigate(`/catatan-kunjungan/${catatan.catatan_id}`)
                                    }
                                    bodyStyle={{ padding: '24px' }}
                                >
                                    <div className="flex flex-col space-y-4">
                                        {/* Illustration placeholder - you can replace with actual image */}
                                        <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-16 w-16 text-gray-400"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                                />
                                            </svg>
                                        </div>

                                        {/* Patient Name */}
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {catatan.nama_ibu}
                                            </h3>
                                        </div>

                                        {/* Consultation Date */}
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <CalendarOutlined />
                                            <span className="text-sm">
                                                Tanggal Konsultasi : {formatDate(catatan.tanggal_kunjungan)}
                                            </span>
                                        </div>

                                        {/* Status Badge */}
                                        <div>{getStatusBadge(catatan.status_kunjungan)}</div>
                                    </div>
                                </Card>
                            ))}
                        </div>

                        {/* Pagination */}
                        {filteredList.length > PAGE_SIZE && (
                            <div className="flex justify-center mt-8">
                                <Pagination
                                    current={currentPage}
                                    total={filteredList.length}
                                    pageSize={PAGE_SIZE}
                                    onChange={(page) => setCurrentPage(page)}
                                    showSizeChanger={false}
                                    showTotal={(total, range) =>
                                        `${range[0]}-${range[1]} dari ${total} catatan`
                                    }
                                />
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}


