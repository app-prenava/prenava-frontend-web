import { ReactNode, useState } from 'react';
<<<<<<< HEAD
import { useNavigate, useLocation } from 'react-router-dom';
import { storage } from '@/lib/storage';
import BidanSidebar from './BidanSidebar';
import BidanHeader from './BidanHeader';

type BidanLayoutProps = {
    children: ReactNode;
};

export default function BidanLayout({ children }: BidanLayoutProps) {
    const navigate = useNavigate();
    const location = useLocation();
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    const handleLogout = () => {
        storage.removeToken();
        storage.removeRole();
        navigate('/login');
    };

    // Get current page title for breadcrumb
    const getPageTitle = () => {
        if (location.pathname === '/bidan') return 'Dashboard';
        if (location.pathname === '/bidan/users') return 'Users';
        return 'Dashboard';
    };

    const getBreadcrumb = () => {
        if (location.pathname === '/bidan') return ['Pages', 'Dashboard'];
        if (location.pathname === '/bidan/users') return ['Pages', 'Users'];
        return ['Pages', 'Dashboard'];
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <BidanSidebar />

            <div className="flex-1 flex flex-col">
                <BidanHeader
                    pageTitle={getPageTitle()}
                    breadcrumb={getBreadcrumb()}
                    onLogout={() => setShowLogoutConfirm(true)}
                />

                <main className="flex-1 overflow-auto p-8">
                    {children}
                </main>
            </div>

            {/* Logout Confirmation Modal */}
            {showLogoutConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold mb-4">Konfirmasi Logout</h3>
                        <p className="text-gray-600 mb-6">Apakah Anda yakin ingin keluar dari akun?</p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setShowLogoutConfirm(false)}
                                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
=======
import { useNavigate } from 'react-router-dom';
import { storage } from '@/lib/storage';
import AppLayout from '@/components/ui/AppLayout';
import { MenuItem } from '@/components/ui/AppSidebar';
import LogoutModal from '@/components/ui/LogoutModal';

type BidanLayoutProps = {
  children: ReactNode;
};

// Custom SVG Icons
const DashboardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
  </svg>
);

const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
  </svg>
);

export default function BidanLayout({ children }: BidanLayoutProps) {
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    storage.removeToken();
    storage.removeRole();
    storage.removeUserName();
    navigate('/login');
  };

  // Menu items for Bidan dashboard
  const menuItems: MenuItem[] = [
    {
      key: 'dashboard',
      icon: <DashboardIcon />,
      label: 'Dashboard',
      path: '/bidan',
    },
    {
      key: 'users',
      icon: <UsersIcon />,
      label: 'Users',
      path: '/bidan/users',
    },
  ];

  const userName = storage.getUserName() || 'User';
  const userRole = storage.getRole() || 'Bidan';
  const userAvatar = undefined;

  return (
    <>
      <AppLayout
        menuItems={menuItems}
        userName={userName}
        userRole={userRole}
        userAvatar={userAvatar}
        onLogout={() => setShowLogoutConfirm(true)}
        appName="Prenava"
      >
        {children}
      </AppLayout>

      <LogoutModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
      />
    </>
  );
}

>>>>>>> 7d78440 (feat: bidan dashboard)
