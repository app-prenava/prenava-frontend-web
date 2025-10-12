import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { storage } from '@/lib/storage';
import LogoutModal from '@/components/ui/LogoutModal';

export default function BidanDashboard() {
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

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
                Dashboard Bidan
              </h1>
              <p className="text-gray-600 mt-2">
                Selamat datang di dashboard bidan
              </p>
            </div>
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="px-6 py-2 rounded-lg text-white font-medium transition hover:opacity-90"
              style={{ backgroundColor: '#FA6978' }}
            >
              Logout
            </button>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-pink-50 rounded-lg border border-pink-200">
                <div className="text-4xl mb-3">👩‍⚕️</div>
                <h3 className="font-semibold text-lg mb-2">Role Anda</h3>
                <p className="text-gray-600">Bidan</p>
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

      <LogoutModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
      />
    </div>
  );
}
