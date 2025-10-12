import { Button, Dropdown, Avatar, Breadcrumb } from 'antd';
import { MenuFoldOutlined, MenuUnfoldOutlined, UserOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { useLocation } from 'react-router-dom';

// Custom Notification Icon
const NotificationIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={1.5} 
    stroke="currentColor" 
    className="w-5 h-5"
    style={{ 
      display: 'block',
      margin: 'auto'
    }}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
  </svg>
);

type AppNavbarProps = {
  collapsed: boolean;
  onToggleCollapse: () => void;
  userName: string;
  userRole: string;
  userAvatar?: string;
  onLogout: () => void;
};

export default function AppNavbar({
  collapsed,
  onToggleCollapse,
  userName,
  userRole,
  userAvatar,
  onLogout,
}: AppNavbarProps) {
  const location = useLocation();

  // Function to generate breadcrumb based on current path
  const getBreadcrumbItems = () => {
    const path = location.pathname;
    
    if (path === '/dinkes') {
      return [
        {
          title: 'Pages',
        },
        {
          title: 'Dashboard',
        },
      ];
    } else if (path === '/dinkes/users') {
      return [
        {
          title: 'Pages',
        },
        {
          title: 'Users',
        },
      ];
    }
    
    // Default breadcrumb
    return [
      {
        title: 'Pages',
      },
      {
        title: 'Dashboard',
      },
    ];
  };

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      label: (
        <div className="py-2">
          <div className="font-semibold">{userName}</div>
          <div className="text-xs text-gray-500 capitalize">{userRole}</div>
        </div>
      ),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      label: 'Logout',
      onClick: onLogout,
      danger: true,
    },
  ];

  return (
    <div className="flex items-center justify-between px-6 h-21 bg-white border-b border-gray-200">
      {/* Left Section - Toggle Button + Breadcrumb */}
      <div className="flex items-center gap-4">
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={onToggleCollapse}
          style={{ fontSize: '18px', width: 56, height: 56 }}
        />
        
        {/* Breadcrumb */}
        <Breadcrumb
          items={getBreadcrumbItems()}
          style={{ fontSize: '14px' }}
        />
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Notification */}
        <Button
          type="text"
          icon={<NotificationIcon />}
          style={{ 
            width: 48, 
            height: 48,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0
          }}
        />

        {/* User Dropdown */}
        <Dropdown menu={{ items: userMenuItems }} trigger={['click']} placement="bottomRight">
          <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 px-3 py-2 rounded-lg transition">
            <Avatar
              size="default"
              src={userAvatar}
              icon={!userAvatar && <UserOutlined />}
              style={{ backgroundColor: '#FA6978' }}
            />
            <div className="hidden md:block">
              <div className="text-sm font-medium">{userName}</div>
              <div className="text-xs text-gray-500 capitalize">{userRole}</div>
            </div>
          </div>
        </Dropdown>
      </div>
    </div>
  );
}
