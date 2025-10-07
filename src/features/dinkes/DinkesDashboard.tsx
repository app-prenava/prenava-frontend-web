import { useNavigate } from 'react-router-dom';
import { storage } from '@/lib/storage';

export default function DinkesDashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    storage.removeToken();
    storage.removeRole();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900">
                Dashboard Dinkes
              </h1>
              <p className="text-gray-600 mt-2">
                Selamat datang di dashboard Dinas Kesehatan
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="px-6 py-2 rounded-lg text-white font-medium transition hover:opacity-90"
              style={{ backgroundColor: '#FA6978' }}
            >
              Logout
            </button>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-green-50 rounded-lg border border-green-200">
                <div className="text-4xl mb-3">🏥</div>
                <h3 className="font-semibold text-lg mb-2">Role Anda</h3>
                <p className="text-gray-600">Dinkes</p>
              </div>
              
              <div className="p-6 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-4xl mb-3">📊</div>
                <h3 className="font-semibold text-lg mb-2">Status</h3>
                <p className="text-gray-600">Aktif</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
