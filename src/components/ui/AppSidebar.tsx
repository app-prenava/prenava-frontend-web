import { Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import type { MenuProps } from 'antd';
import logoUrl from '@/assets/logo.png';

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

  const antdMenuItems: MenuProps['items'] = menuItems.map((item) => ({
    key: item.key,
    icon: item.icon,
    label: item.label,
    onClick: () => navigate(item.path),
  }));

  const selectedKey = menuItems.find((item) => item.path === location.pathname)?.key || menuItems[0]?.key;

  return (
    <div className="h-full bg-white">
      {/* Logo Section */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-200 bg-white">
        <img src={logoUrl} alt={appName} className="w-10 h-10" />
        {!collapsed && (
          <div>
            <h1 className="font-semibold text-lg" style={{ color: '#FA6978' }}>{appName}</h1>
          </div>
        )}
      </div>

      {/* Menu */}
      <Menu
        theme="light"
        mode="inline"
        selectedKeys={[selectedKey]}
        items={antdMenuItems}
        style={{ borderRight: 0, backgroundColor: 'white' }}
        className="bg-white"
      />
    </div>
  );
}
