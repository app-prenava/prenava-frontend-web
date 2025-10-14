<<<<<<< HEAD
import { useState } from 'react';

// Mock data untuk user dari aplikasi mobile Prenava
const mockUsers = [
    {
        id: 1,
        name: "Sari Indah",
        email: "sari.indah@email.com",
        phone: "+62 812 3456 7890",
        age: 28,
        pregnancyWeek: 24,
        lastVisit: "2024-01-15",
        status: "Aktif",
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
    },
    {
        id: 2,
        name: "Maya Sari",
        email: "maya.sari@email.com",
        phone: "+62 813 4567 8901",
        age: 25,
        pregnancyWeek: 18,
        lastVisit: "2024-01-14",
        status: "Aktif",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
    },
    {
        id: 3,
        name: "Rina Wati",
        email: "rina.wati@email.com",
        phone: "+62 814 5678 9012",
        age: 30,
        pregnancyWeek: 32,
        lastVisit: "2024-01-13",
        status: "Aktif",
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face"
    },
    {
        id: 4,
        name: "Dewi Lestari",
        email: "dewi.lestari@email.com",
        phone: "+62 815 6789 0123",
        age: 26,
        pregnancyWeek: 12,
        lastVisit: "2024-01-12",
        status: "Aktif",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face"
    },
    {
        id: 5,
        name: "Lina Putri",
        email: "lina.putri@email.com",
        phone: "+62 816 7890 1234",
        age: 29,
        pregnancyWeek: 28,
        lastVisit: "2024-01-11",
        status: "Aktif",
        avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face"
    },
    {
        id: 6,
        name: "Nina Sari",
        email: "nina.sari@email.com",
        phone: "+62 817 8901 2345",
        age: 27,
        pregnancyWeek: 20,
        lastVisit: "2024-01-10",
        status: "Aktif",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
    },
    {
        id: 7,
        name: "Tina Maharani",
        email: "tina.maharani@email.com",
        phone: "+62 818 9012 3456",
        age: 31,
        pregnancyWeek: 36,
        lastVisit: "2024-01-09",
        status: "Aktif",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face"
    },
    {
        id: 8,
        name: "Kina Dewi",
        email: "kina.dewi@email.com",
        phone: "+62 819 0123 4567",
        age: 24,
        pregnancyWeek: 16,
        lastVisit: "2024-01-08",
        status: "Aktif",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
    }
];

export default function BidanUsersPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    const filteredUsers = mockUsers.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || user.status.toLowerCase() === filterStatus.toLowerCase();
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Daftar User</h2>
                    <p className="text-gray-600 mt-1">Kelola data user aplikasi mobile Prenava</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Cari user..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent w-64"
                        />
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    >
                        <option value="all">Semua Status</option>
                        <option value="aktif">Aktif</option>
                        <option value="tidak aktif">Tidak Aktif</option>
                    </select>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total User</p>
                            <p className="text-2xl font-bold text-gray-900">{mockUsers.length}</p>
                        </div>
                        <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">User Aktif</p>
                            <p className="text-2xl font-bold text-gray-900">{mockUsers.filter(u => u.status === 'Aktif').length}</p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Kunjungan Minggu Ini</p>
                            <p className="text-2xl font-bold text-gray-900">24</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Users Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredUsers.map((user) => (
                    <div key={user.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                        {/* User Options Menu */}
                        <div className="flex justify-end mb-4">
                            <button className="p-1 text-gray-400 hover:text-gray-600 transition">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                </svg>
                            </button>
                        </div>

                        {/* Profile Picture */}
                        <div className="flex justify-center mb-4">
                            <img
                                src={user.avatar}
                                alt={user.name}
                                className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                            />
                        </div>

                        {/* User Info */}
                        <div className="text-center mb-4">
                            <h3 className="font-semibold text-lg text-gray-900 mb-1">{user.name}</h3>
                            <p className="text-sm text-gray-600">Ibu Hamil - Minggu {user.pregnancyWeek}</p>
                        </div>

                        {/* Contact Info */}
                        <div className="space-y-2 mb-4">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <svg className="w-4 h-4 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                <span>{user.phone}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <svg className="w-4 h-4 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <span className="truncate">{user.email}</span>
                            </div>
                        </div>

                        {/* Status and Last Visit */}
                        <div className="flex items-center justify-between text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.status === 'Aktif'
                                    ? 'bg-green-100 text-green-600'
                                    : 'bg-gray-100 text-gray-600'
                                }`}>
                                {user.status}
                            </span>
                            <span className="text-gray-500">
                                Kunjungan: {new Date(user.lastVisit).toLocaleDateString('id-ID')}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {filteredUsers.length === 0 && (
                <div className="text-center py-12">
                    <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada user ditemukan</h3>
                    <p className="text-gray-500">Coba ubah kata kunci pencarian atau filter status.</p>
                </div>
            )}
        </div>
    );
=======
import React, { useState, useEffect } from 'react';
import { Card, Col, Row, Input, Button, Avatar, Tag, Spin } from 'antd';
import { SearchOutlined, FilterOutlined, CheckCircleOutlined, CloseCircleOutlined, PhoneOutlined, MailOutlined } from '@ant-design/icons';
import BidanLayout from '../components/BidanLayout';
import { getIbuHamilUsers } from '../bidan.api';
import { User } from '@/features/admin/admin.types';

interface DataType extends User {
  key: React.Key;
}

export default function BidanUsersPage() {
  const [users, setUsers] = useState<DataType[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<DataType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    fetchIbuHamilUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchText]);

  const fetchIbuHamilUsers = async () => {
    try {
      setLoading(true);
      const result = await getIbuHamilUsers();
      const usersWithKey = result.data.map((user) => ({
        ...user,
        key: user.user_id,
      }));
      setUsers(usersWithKey);
    } catch (error) {
      console.error('Failed to fetch ibu hamil users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Filter by search text (name)
    if (searchText) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
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

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <BidanLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Manajemen Ibu Hamil</h1>
            <p className="text-gray-600">Kelola data ibu hamil dalam sistem</p>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by name..."
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

        {/* Cards Grid */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Spin size="large" />
            </div>
          ) : (
            <Row gutter={[16, 16]}>
              {filteredUsers.map((user) => (
                <Col xs={24} sm={12} md={8} lg={6} key={user.user_id}>
                  <Card 
                    title="" 
                    variant="borderless"
                    className="h-full"
                    bodyStyle={{ padding: '20px' }}
                  >
                    <div className="flex flex-col items-center text-center">
                      {/* Profile Picture */}
                      <Avatar
                        size={80}
                        style={{ backgroundColor: '#FA6978', marginBottom: '16px' }}
                      >
                        {getInitials(user.name)}
                      </Avatar>

                      {/* Name */}
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {user.name}
                      </h3>

                      {/* Role */}
                      <p className="text-sm text-gray-600 mb-3">
                        Ibu Hamil
                      </p>

                      {/* Status */}
                      <div className="mb-4">
                        {getStatusTag(user.is_active)}
                      </div>

                      {/* Contact Info */}
                      <div className="w-full space-y-2">
                        <div className="flex items-center justify-center text-sm text-gray-600">
                          <MailOutlined className="mr-2 text-pink-500" />
                          <span className="truncate">{user.email}</span>
                        </div>
                        <div className="flex items-center justify-center text-sm text-gray-600">
                          <PhoneOutlined className="mr-2 text-pink-500" />
                          <span>+12 345 6789 0</span>
                        </div>
                      </div>

                      {/* Created Date */}
                      <div className="mt-4 pt-4 border-t border-gray-100 w-full">
                        <p className="text-xs text-gray-500">
                          Bergabung: {new Date(user.created_at).toLocaleDateString('id-ID')}
                        </p>
                      </div>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          )}

          {!loading && filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">👥</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Tidak ada data ibu hamil
              </h3>
              <p className="text-gray-600">
                {searchText ? 'Tidak ada hasil pencarian' : 'Belum ada data ibu hamil yang terdaftar'}
              </p>
            </div>
          )}
        </div>
      </div>
    </BidanLayout>
  );
>>>>>>> 7d78440 (feat: bidan dashboard)
}
