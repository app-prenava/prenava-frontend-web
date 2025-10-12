import { useNavigate, useLocation } from 'react-router-dom';
import logoUrl from '@/assets/logo.png';
import { SidebarItem } from './SidebarItem';

export type MenuItem = {
  key: string;
  icon?: React.ReactNode;
  label: string;
  path: string;
};

type AppSidebarProps = {
  menuItems: MenuItem[];
  collapsed: boolean;
  appName?: string;
};

export default function AppSidebar({
  menuItems,
  collapsed,
  appName = 'Prenava',
}: AppSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const selectedKey = menuItems.find((item) => item.path === location.pathname)?.key || menuItems[0]?.key;

  return (
    <div className="h-full bg-white">
      {/* Logo Section */}
      <div className="flex items-start justify-start px-6 py-5 border-b border-gray-200 bg-white">
        <img src={logoUrl} alt={appName} className="w-10 h-10 flex-shrink-0 mt-1" />
        {!collapsed && (
          <div className="ml-3 flex items-end h-10">
            <h1 className="font-semibold text-lg leading-none m-0" style={{ color: '#FA6978' }}>{appName}</h1>
          </div>
        )}
      </div>

      {/* Menu */}
      <div className="px-4 py-2">
        {menuItems.map((item) => (
          <SidebarItem
            key={item.key}
            label={item.label}
            icon={item.icon}
            active={item.key === selectedKey}
            collapsed={collapsed}
            onClick={() => navigate(item.path)}
          />
        ))}
      </div>
      
    </div>
  );
}
