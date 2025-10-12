import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { storage } from '@/lib/storage';
import AppLayout from '@/components/ui/AppLayout';
import { MenuItem } from '@/components/ui/AppSidebar';

type DinkesLayoutProps = {
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

export default function DinkesLayout({ children }: DinkesLayoutProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    storage.removeToken();
    storage.removeRole();
    navigate('/login');
  };

  // Menu items for Dinkes dashboard - simplified to match design
  const menuItems: MenuItem[] = [
    {
      key: 'dashboard',
      icon: <DashboardIcon />,
      label: 'Dashboard',
      path: '/dinkes',
    },
    {
      key: 'users',
      icon: <UsersIcon />,
      label: 'Users',
      path: '/dinkes/users',
    },
  ];

  const userName = 'Irdan';
  const userRole = 'Dinkes';
  const userAvatar = undefined;

  return (
    <AppLayout
      menuItems={menuItems}
      userName={userName}
      userRole={userRole}
      userAvatar={userAvatar}
      onLogout={handleLogout}
      appName="Prenava"
    >
      {children}
    </AppLayout>
  );
}
