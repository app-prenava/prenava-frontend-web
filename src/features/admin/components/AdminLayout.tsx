import { ReactNode, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { storage } from '@/lib/storage';
import Sidebar from './Sidebar';
import LogoutModal from '@/components/ui/LogoutModal';

type AdminLayoutProps = {
  children: ReactNode;
};

export default function AdminLayout({ children }: AdminLayoutProps) {
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    storage.removeToken();
    storage.removeRole();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar onLogout={() => setShowLogoutConfirm(true)} />
      
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-8">{children}</div>
      </main>

      <LogoutModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
      />
    </div>
  );
}