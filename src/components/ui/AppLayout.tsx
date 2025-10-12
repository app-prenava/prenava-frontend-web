import { useState, ReactNode } from 'react';
import { Layout } from 'antd';
import AppSidebar, { MenuItem } from './AppSidebar';
import AppNavbar from './AppNavbar';

const { Sider, Header, Content } = Layout;

type AppLayoutProps = {
  children: ReactNode;
  menuItems: MenuItem[];
  userName: string;
  userRole: string;
  userAvatar?: string;
  onLogout: () => void;
  appName?: string;
};

export default function AppLayout({
  children,
  menuItems,
  userName,
  userRole,
  userAvatar,
  onLogout,
  appName,
}: AppLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed} width={256}>
        <AppSidebar
          menuItems={menuItems}
          collapsed={collapsed}
          appName={appName}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: '#fff', height: 'auto' }}>
          <AppNavbar
            collapsed={collapsed}
            onToggleCollapse={() => setCollapsed(!collapsed)}
            userName={userName}
            userRole={userRole}
            userAvatar={userAvatar}
            onLogout={onLogout}
          />
        </Header>
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: '#fff',
            borderRadius: 8,
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
