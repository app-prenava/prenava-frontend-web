import { ReactNode, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { storage } from '@/lib/storage';
import AppLayout from '@/components/ui/AppLayout';
import { MenuItem } from '@/components/ui/AppSidebar';
import LogoutModal from '@/components/ui/LogoutModal';

type AdminLayoutProps = {
  children: ReactNode;
};

// Custom SVG Icons for Admin
const DashboardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
  </svg>
);

const CreateAccountIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
  </svg>
);

const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
  </svg>
);

export default function AdminLayout({ children }: AdminLayoutProps) {
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    storage.removeToken();
    storage.removeRole();
    storage.removeUserName();
    navigate('/login');
  };

  // Menu items for Admin dashboard
  const menuItems: MenuItem[] = [
    {
      key: 'dashboard',
      icon: <DashboardIcon />,
      label: 'Dashboard',
      path: '/admin',
    },
    {
      key: 'user-management',
      icon: <CreateAccountIcon />,
      label: 'Kelola User',
      children: [
        {
          key: 'bidan-users',
          icon: <UsersIcon />,
          label: 'Bidan',
          path: '/admin/bidan-users',
        },
        {
          key: 'dinkes-users',
          icon: <UsersIcon />,
          label: 'Dinkes',
          path: '/admin/dinkes-users',
        },
      ],
    },
  ];

  const userName = storage.getUserName() || 'Admin';
  const userRole = storage.getRole() || 'Admin';
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