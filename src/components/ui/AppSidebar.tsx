import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import logoUrl from '@/assets/logo.png';
import { SidebarItem } from './SidebarItem';

export type MenuItem = {
  key: string;
  icon?: React.ReactNode;
  label: string;
  path?: string;
  children?: MenuItem[];
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
  const [openKeys, setOpenKeys] = useState<string[]>([]);

  const selectedKey = menuItems.find((item) => {
    if (item.path === location.pathname) return true;
    if (item.children) {
      return item.children.some(child => child.path === location.pathname);
    }
    return false;
  })?.key || menuItems[0]?.key;

  const handleMenuClick = (item: MenuItem) => {
    if (item.children) {
      // Toggle submenu
      setOpenKeys(prev => 
        prev.includes(item.key) 
          ? prev.filter(key => key !== item.key)
          : [...prev, item.key]
      );
    } else if (item.path) {
      // Navigate to page
      navigate(item.path);
    }
  };

  const handleSubmenuClick = (path: string) => {
    navigate(path);
  };

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
          <div key={item.key}>
            <SidebarItem
              label={item.label}
              icon={item.icon}
              active={item.key === selectedKey || (item.children && item.children.some(child => child.path === location.pathname))}
              collapsed={collapsed}
              onClick={() => handleMenuClick(item)}
              hasChildren={!!item.children}
              isOpen={openKeys.includes(item.key)}
            />
            
            {/* Submenu */}
            {item.children && !collapsed && openKeys.includes(item.key) && (
              <div className="ml-6 mt-1 space-y-1">
                {item.children.map((child) => (
                  <SidebarItem
                    key={child.key}
                    label={child.label}
                    icon={child.icon}
                    active={child.path === location.pathname}
                    collapsed={false}
                    onClick={() => handleSubmenuClick(child.path!)}
                    isSubmenu={true}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      
    </div>
  );
}
