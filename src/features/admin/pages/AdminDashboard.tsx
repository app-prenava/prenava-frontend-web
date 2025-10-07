import { useEffect, useState } from 'react';
import { getUserList } from '../admin.api';
import { UserListItem } from '../admin.types';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalBidan: 0,
    totalDinkes: 0,
    totalIbuHamil: 0,
    totalUsers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const result = await getUserList();
        const users = result.users;

        setStats({
          totalBidan: users.filter((u: UserListItem) => u.role === 'bidan').length,
          totalDinkes: users.filter((u: UserListItem) => u.role === 'dinkes').length,
          totalIbuHamil: users.filter((u: UserListItem) => u.role === 'ibu_hamil').length,
          totalUsers: users.length,
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Total Bidan',
      value: stats.totalBidan,
      icon: '👩‍⚕️',
      color: '#FA6978',
    },
    {
      title: 'Total Dinkes',
      value: stats.totalDinkes,
      icon: '🏥',
      color: '#4F46E5',
    },
    {
      title: 'Total Ibu Hamil',
      value: stats.totalIbuHamil,
      icon: '🤰',
      color: '#10B981',
    },
    {
      title: 'Total Pengguna',
      value: stats.totalUsers,
      icon: '👥',
      color: '#F59E0B',
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900">Dashboard Admin</h1>
        <p className="text-gray-600 mt-2">
          Selamat datang di panel admin Prenava
        </p>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Memuat data...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((card) => (
            <div
              key={card.title}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                  style={{ backgroundColor: `${card.color}20` }}
                >
                  {card.icon}
                </div>
              </div>
              <h3 className="text-gray-600 text-sm font-medium mb-1">
                {card.title}
              </h3>
              <p className="text-3xl font-bold" style={{ color: card.color }}>
                {card.value}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Aksi Cepat</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a
            href="/admin/create-account"
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition group"
          >
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl group-hover:scale-110 transition"
                style={{ backgroundColor: '#FA697820' }}
              >
                ➕
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 group-hover:text-[#FA6978] transition">
                  Buat Akun Baru
                </h3>
                <p className="text-sm text-gray-600">
                  Tambah akun bidan atau dinkes
                </p>
              </div>
            </div>
          </a>

          <a
            href="/admin/users"
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition group"
          >
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl group-hover:scale-110 transition"
                style={{ backgroundColor: '#4F46E520' }}
              >
                📋
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 group-hover:text-[#4F46E5] transition">
                  Lihat Daftar User
                </h3>
                <p className="text-sm text-gray-600">
                  Kelola semua pengguna sistem
                </p>
              </div>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
