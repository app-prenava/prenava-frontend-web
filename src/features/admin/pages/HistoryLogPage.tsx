import React, { useState, useEffect, useMemo } from 'react';
import { Table, Tag, Input, Button, Select, DatePicker, Avatar, Tooltip, Empty } from 'antd';
import {
    SearchOutlined,
    HistoryOutlined,
    DownloadOutlined,
    ReloadOutlined,
    UserOutlined,
    LoginOutlined,
    LogoutOutlined,
    EditOutlined,
    PlusCircleOutlined,
    MobileOutlined,
    GlobalOutlined,
    ClockCircleOutlined,
    LockOutlined,
    HeartOutlined,
    MedicineBoxOutlined,
    CoffeeOutlined,
    ThunderboltOutlined,
    CheckCircleOutlined,
    StopOutlined,
} from '@ant-design/icons';
import { getHistoryLogs } from '../admin.api';
import { HistoryLog } from '../admin.types';
import type { ColumnsType } from 'antd/es/table';

const { RangePicker } = DatePicker;

interface DataType extends HistoryLog {
    key: React.Key;
}

const ACTION_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode; category: string }> = {
    // 🔐 Autentikasi
    'Login': { label: 'Login', color: 'blue', icon: <LoginOutlined />, category: 'Autentikasi' },
    'Logout': { label: 'Logout', color: 'default', icon: <LogoutOutlined />, category: 'Autentikasi' },
    'Registrasi': { label: 'Registrasi', color: 'blue', icon: <PlusCircleOutlined />, category: 'Autentikasi' },
    'Ganti Password': { label: 'Ganti Password', color: 'cyan', icon: <LockOutlined />, category: 'Autentikasi' },
    'login': { label: 'Login', color: 'blue', icon: <LoginOutlined />, category: 'Autentikasi' },
    'logout': { label: 'Logout', color: 'default', icon: <LogoutOutlined />, category: 'Autentikasi' },
    'register': { label: 'Registrasi', color: 'blue', icon: <PlusCircleOutlined />, category: 'Autentikasi' },

    // 👤 Pengelolaan Profil
    'Update Profil': { label: 'Update Profil', color: 'orange', icon: <EditOutlined />, category: 'Profil' },
    'update_profil': { label: 'Update Profil', color: 'orange', icon: <EditOutlined />, category: 'Profil' },

    // 🛡️ Administrasi
    'Akun Dinonaktifkan': { label: 'Akun Dinonaktifkan', color: 'volcano', icon: <StopOutlined />, category: 'Administrasi' },
    'Akun Diaktifkan': { label: 'Akun Diaktifkan', color: 'green', icon: <CheckCircleOutlined />, category: 'Administrasi' },

    // 🩺 Kesehatan & Deteksi
    'Deteksi Depresi': { label: 'Deteksi Depresi', color: 'magenta', icon: <HeartOutlined />, category: 'Kesehatan' },
    'Deteksi Anemia': { label: 'Deteksi Anemia', color: 'volcano', icon: <MedicineBoxOutlined />, category: 'Kesehatan' },
    'deteksi_depresi': { label: 'Deteksi Depresi', color: 'magenta', icon: <HeartOutlined />, category: 'Kesehatan' },
    'deteksi_anemia': { label: 'Deteksi Anemia', color: 'volcano', icon: <MedicineBoxOutlined />, category: 'Kesehatan' },

    // 🥗 Rekomendasi
    'Rekomendasi Makanan': { label: 'Rekomendasi Makanan', color: 'purple', icon: <CoffeeOutlined />, category: 'Rekomendasi' },
    'Rekomendasi Gerakan': { label: 'Rekomendasi Gerakan', color: 'geekblue', icon: <ThunderboltOutlined />, category: 'Rekomendasi' },
    'rekomendasi_makanan': { label: 'Rekomendasi Makanan', color: 'purple', icon: <CoffeeOutlined />, category: 'Rekomendasi' },
    'rekomendasi_gerakan': { label: 'Rekomendasi Gerakan', color: 'geekblue', icon: <ThunderboltOutlined />, category: 'Rekomendasi' },
};

const ROLE_COLORS: Record<string, string> = {
    admin: 'red',
    bidan: 'blue',
    dinkes: 'green',
    ibu_hamil: 'pink',
};

export default function HistoryLogPage() {
    const [logs, setLogs] = useState<DataType[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');
    const [selectedRole, setSelectedRole] = useState<string>('all');
    const [selectedAction, setSelectedAction] = useState<string>('all');
    const [dateRange, setDateRange] = useState<[string, string] | null>(null);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const result = await getHistoryLogs();
            console.log('--- DEBUG HISTORY LOG ---');
            console.log('Total data diterima:', result.data.length);
            console.table(result.data.slice(0, 10).map(l => ({ 
                id: l.id, 
                user: l.user_name, 
                action: l.action, 
                activity_type: l.activity_type 
            })));
            
            const logsWithKey = result.data.map((log) => ({
                ...log,
                key: log.id,
            }));
            setLogs(logsWithKey);
        } catch (error) {
            console.error('Failed to fetch history logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredLogs = useMemo(() => {
        let filtered = logs;

        if (selectedRole !== 'all') {
            filtered = filtered.filter(log => log.user_role === selectedRole);
        }

        if (selectedAction !== 'all') {
            const targetLabel = ACTION_CONFIG[selectedAction]?.label;
            filtered = filtered.filter(log => {
                const actionKey = log.activity_type || log.action || 'unknown_action';
                const logLabel = ACTION_CONFIG[actionKey]?.label || 
                    (log.activity_label || actionKey.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()));
                return logLabel === targetLabel;
            });
        }

        if (searchText) {
            const s = searchText.toLowerCase();
            filtered = filtered.filter(log =>
                (log.user_name?.toLowerCase().includes(s)) ||
                (log.user_email?.toLowerCase().includes(s)) ||
                (log.description?.toLowerCase().includes(s))
            );
        }

        if (dateRange) {
            const [start, end] = dateRange;
            filtered = filtered.filter(log => {
                const logDate = new Date(log.created_at).toISOString().split('T')[0];
                return logDate >= start && logDate <= end;
            });
        }

        return filtered;
    }, [logs, selectedRole, selectedAction, searchText, dateRange]);

    const stats = useMemo(() => {
        const uniqueUsers = new Set(logs.map(l => l.user_id)).size;
        const todayCount = logs.filter(l => {
            const today = new Date().toISOString().split('T')[0];
            return new Date(l.created_at).toISOString().split('T')[0] === today;
        }).length;
        return { total: logs.length, uniqueUsers, todayCount };
    }, [logs]);

    const getActionTag = (log: any) => {
        const actionKey = log.activity_type || log.action || 'unknown_action';
        const config = ACTION_CONFIG[actionKey] || {
            label: log.activity_label || actionKey.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
            color: 'default',
            icon: <HistoryOutlined />,
        };
        return (
            <Tag icon={config.icon} color={config.color}>
                {config.label}
            </Tag>
        );
    };

    const handleExportCSV = () => {
        const headers = ['No', 'User', 'Email', 'Role', 'Aktivitas', 'Deskripsi', 'IP Address', 'Device', 'Waktu'];
        const rows = filteredLogs.map((log, i) => [
            i + 1,
            log.user_name || '-',
            log.user_email || '-',
            log.user_role || '-',
            log.action,
            log.description || '-',
            log.ip_address || '-',
            log.device || '-',
            new Date(log.created_at).toLocaleString('id-ID'),
        ]);

        const csvContent = [headers, ...rows].map(r => r.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `history-log-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const columns: ColumnsType<DataType> = [
        {
            title: 'User',
            key: 'user',
            width: 250,
            render: (_, record) => (
                <div className="flex items-center gap-3">
                    <Avatar
                        size={36}
                        style={{ backgroundColor: '#FA6978', flexShrink: 0 }}
                        icon={<UserOutlined />}
                    >
                        {record.user_name?.charAt(0).toUpperCase()}
                    </Avatar>
                    <div className="min-w-0">
                        <div className="font-medium text-gray-900 truncate">{record.user_name || '-'}</div>
                        <div className="text-xs text-gray-500 truncate">{record.user_email || '-'}</div>
                    </div>
                </div>
            ),
        },
        {
            title: 'Role',
            dataIndex: 'user_role',
            key: 'user_role',
            width: 120,
            render: (role: string) => (
                <Tag color={ROLE_COLORS[role] || 'default'}>
                    {(role || '-').toUpperCase().replace('_', ' ')}
                </Tag>
            ),
        },
        {
            title: 'Aktivitas',
            key: 'action',
            width: 180,
            render: (_, record) => getActionTag(record),
        },
        {
            title: 'Deskripsi',
            dataIndex: 'description',
            key: 'description',
            width: 220,
            ellipsis: true,
            render: (desc: string) => (
                <Tooltip title={desc}>
                    <span className="text-gray-600">{desc || '-'}</span>
                </Tooltip>
            ),
        },
        {
            title: 'IP Address',
            dataIndex: 'ip_address',
            key: 'ip_address',
            width: 140,
            render: (ip: string) => (
                <span className="text-gray-500 font-mono text-xs">{ip || '-'}</span>
            ),
        },
        {
            title: 'Device',
            dataIndex: 'device',
            key: 'device',
            width: 150,
            ellipsis: true,
            render: (device: string) => (
                <Tooltip title={device}>
                    <div className="flex items-center gap-1">
                        <MobileOutlined className="text-gray-400" />
                        <span className="text-gray-500 text-xs">{device || '-'}</span>
                    </div>
                </Tooltip>
            ),
        },
        {
            title: 'Waktu',
            dataIndex: 'created_at',
            key: 'created_at',
            width: 180,
            sorter: (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
            defaultSortOrder: 'descend',
            render: (date: string) => (
                <div className="flex items-center gap-1.5">
                    <ClockCircleOutlined className="text-gray-400 text-xs" />
                    <div>
                        <div className="text-sm text-gray-900">
                            {new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                        <div className="text-xs text-gray-500">
                            {new Date(date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    </div>
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">History Log</h1>
                    <p className="text-gray-600">Pantau aktivitas pengguna di aplikasi mobile</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        icon={<ReloadOutlined />}
                        onClick={fetchLogs}
                        loading={loading}
                    >
                        Refresh
                    </Button>
                    <Button
                        icon={<DownloadOutlined />}
                        onClick={handleExportCSV}
                        disabled={filteredLogs.length === 0}
                        style={{ backgroundColor: '#FA6978', borderColor: '#FA6978', color: '#fff' }}
                    >
                        Export CSV
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#FEE2E5' }}>
                            <HistoryOutlined style={{ color: '#FA6978', fontSize: '18px' }} />
                        </div>
                        <div>
                            <div className="text-sm text-gray-500">Total Log</div>
                            <div className="text-xl font-semibold text-gray-900">{stats.total}</div>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#E0F2FE' }}>
                            <UserOutlined style={{ color: '#0284C7', fontSize: '18px' }} />
                        </div>
                        <div>
                            <div className="text-sm text-gray-500">User Unik</div>
                            <div className="text-xl font-semibold text-gray-900">{stats.uniqueUsers}</div>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#DCFCE7' }}>
                            <ClockCircleOutlined style={{ color: '#16A34A', fontSize: '18px' }} />
                        </div>
                        <div>
                            <div className="text-sm text-gray-500">Aktivitas Hari Ini</div>
                            <div className="text-xl font-semibold text-gray-900">{stats.todayCount}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search and Filter Bar */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex-1 min-w-[200px]">
                        <Input
                            placeholder="Cari berdasarkan nama atau email..."
                            prefix={<SearchOutlined />}
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            size="large"
                            allowClear
                        />
                    </div>
                    <Select
                        value={selectedRole}
                        onChange={setSelectedRole}
                        style={{ width: 150 }}
                        size="large"
                        options={[
                            { value: 'all', label: 'Semua Role' },
                            { value: 'admin', label: 'Admin' },
                            { value: 'bidan', label: 'Bidan' },
                            { value: 'dinkes', label: 'Dinkes' },
                            { value: 'ibu_hamil', label: 'Ibu Hamil' },
                        ]}
                    />
                    <Select
                        value={selectedAction}
                        onChange={setSelectedAction}
                        style={{ width: 220 }}
                        size="large"
                        placeholder="Pilih Aktivitas"
                    >
                        <Select.Option value="all">Semua Aktivitas</Select.Option>
                        {Array.from(new Set(Object.values(ACTION_CONFIG).map(v => v.category))).map(category => (
                            <Select.OptGroup key={category} label={category}>
                                {Object.entries(ACTION_CONFIG)
                                    .filter(([_, val]) => val.category === category)
                                    // Filter unique labels within groups to avoid duplicates like 'Registrasi'
                                    .reduce((acc: any[], [key, val]) => {
                                        if (!acc.find(item => item.label === val.label)) {
                                            acc.push({ key, label: val.label });
                                        }
                                        return acc;
                                    }, [])
                                    .map(item => (
                                        <Select.Option key={item.key} value={item.key}>
                                            {item.label}
                                        </Select.Option>
                                    ))}
                            </Select.OptGroup>
                        ))}
                    </Select>
                    <RangePicker
                        size="large"
                        onChange={(_, dateStrings) => {
                            if (dateStrings[0] && dateStrings[1]) {
                                setDateRange([dateStrings[0], dateStrings[1]]);
                            } else {
                                setDateRange(null);
                            }
                        }}
                        placeholder={['Dari Tanggal', 'Sampai Tanggal']}
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <Table<DataType>
                    dataSource={filteredLogs}
                    columns={columns}
                    loading={loading}
                    scroll={{ x: 1200 }}
                    pagination={{
                        pageSize: 15,
                        showSizeChanger: true,
                        pageSizeOptions: ['10', '15', '25', '50'],
                        showQuickJumper: true,
                        showTotal: (total, range) => `${range[0]}-${range[1]} dari ${total} log`,
                    }}
                    locale={{
                        emptyText: (
                            <Empty
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                description={
                                    <span className="text-gray-500">
                                        {loading ? 'Memuat data...' : 'Belum ada data history log'}
                                    </span>
                                }
                            />
                        ),
                    }}
                />
            </div>
        </div>
    );
}
