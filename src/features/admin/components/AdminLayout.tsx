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

const AddBannerIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

const ShopIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3a3 3 0 0 1 3-3m3 0a3 3 0 0 0-3-3m-3 3a3 3 0 0 1-3 3m3-3v1.5M9 9.75l6 6m-6-6v1.5m6-6v-1.5m-6 6h6" />
  </svg>
);

const TipsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
  </svg>
);

const CategoryIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
  </svg>
);

const SubscriptionIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
  </svg>
);

const ApplicationIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
  </svg>
);

const LocationIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
  </svg>
);

const SportIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5ZM6.75 8.25l2.478-1.239a3.75 3.75 0 0 1 5.544 0L17.25 8.25M9 20.25l1.5-6.75L8.25 12h7.5l-2.25 1.5L15 20.25" />
  </svg>
);

const HistoryLogIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
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
      key: 'subscription-plans',
      icon: <SubscriptionIcon />,
      label: 'Paket Langganan',
      path: '/admin/subscription-plans',
    },
    {
      key: 'bidan-management',
      icon: <CreateAccountIcon />,
      label: 'Manajemen Bidan',
      children: [
        {
          key: 'bidan-applications',
          icon: <ApplicationIcon />,
          label: 'Pengajuan Akun',
          path: '/admin/bidan-applications',
        },
        {
          key: 'bidan-users',
          icon: <UsersIcon />,
          label: 'Daftar Bidan',
          path: '/admin/bidan-users',
        },
        {
          key: 'bidan-locations',
          icon: <LocationIcon />,
          label: 'Lokasi Praktik',
          path: '/admin/bidan-locations',
        },
      ],
    },
    {
      key: 'dinkes-management',
      icon: <UsersIcon />,
      label: 'Manajemen Dinkes',
      path: '/admin/dinkes-users',
    },
    {
      key: 'add-banner',
      icon: <AddBannerIcon />,
      label: 'Banner',
      path: '/admin/add-banner',
    },
    {
      key: 'shop',
      icon: <ShopIcon />,
      label: 'Shop',
      path: '/admin/shop',
    },
    {
      key: 'rekomendasi-olahraga',
      icon: <SportIcon />,
      label: 'Rekomendasi Olahraga',
      path: '/admin/rekomendasi-olahraga',
    },
    {
      key: 'tips-management',
      icon: <TipsIcon />,
      label: 'Tips',
      children: [
        {
          key: 'tip-categories',
          icon: <CategoryIcon />,
          label: 'Kategori Tips',
          path: '/admin/tip-categories',
        },
        {
          key: 'tips',
          icon: <TipsIcon />,
          label: 'Tips Kehamilan',
          path: '/admin/tips',
        },
      ],
    },
    {
      key: 'history-log',
      icon: <HistoryLogIcon />,
      label: 'History Log',
      path: '/admin/history-log',
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