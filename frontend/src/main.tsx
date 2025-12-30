import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import '@arco-design/web-react/dist/css/arco.css';
import './index.css';
import Dashboard from './pages/dashboard';
import PatientList from './pages/patients/list';
import PatientDetail from './pages/patients/detail';
import AiConsult from './pages/ai-consult';
import Login from './pages/login';
import { isLoggedIn, removeToken } from './api/auth';

import { Layout as ArcoLayout, Menu, Button, Avatar, Dropdown, Space, Breadcrumb, Divider } from '@arco-design/web-react';
import {
  IconDashboard, IconUserGroup, IconFacebook,
  IconSettings, IconNotification, IconApps, IconUser
} from '@arco-design/web-react/icon';

const MenuItem = Menu.Item;
const { Sider, Content, Header } = ArcoLayout;

// 需要登录才能访问的路由
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  // 根据路径决定选中的菜单项
  const getSelectedKey = () => {
    if (location.pathname.startsWith('/patients')) return '2';
    if (location.pathname.startsWith('/ai-consult')) return '3';
    return '1';
  };

  const handleLogout = () => {
    removeToken();
    navigate('/login');
  };

  const dropList = (
    <Menu>
      <Menu.Item key='1'>用户设置</Menu.Item>
      <Menu.Item key='2' onClick={handleLogout}>退出登录</Menu.Item>
    </Menu>
  );

  return (
    <ArcoLayout className="app-layout" style={{ height: '100vh', background: 'var(--bg-color)' }}>

      {/* 顶部导航栏 - 增加阴影和高度 */}
      <Header style={{
        height: 64,
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(229, 230, 235, 0.5)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 24px',
        zIndex: 100,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
        position: 'sticky',
        top: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img
            src="/svg.png"
            alt="智面诊"
            style={{
              width: 32,
              height: 32,
              marginRight: 12,
              objectFit: 'contain'
            }}
          />
          <div className="gradient-text" style={{ fontSize: 20, fontWeight: 700 }}>
            智面诊
          </div>
          <Divider type="vertical" style={{ margin: '0 16px', height: 20, borderColor: '#e5e6eb' }} />
          <div style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 400 }}>
            中医美容管理平台
          </div>
        </div>

        <Space size="large">
          <Button shape="circle" type="text" icon={<IconNotification style={{ fontSize: 18, color: 'var(--text-primary)' }} />} />
          <Button shape="circle" type="text" icon={<IconSettings style={{ fontSize: 18, color: 'var(--text-primary)' }} />} />
          <Dropdown droplist={dropList} position='br'>
            <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '4px 8px', borderRadius: 20, transition: 'all 0.3s' }} className="user-dropdown">
              <Avatar size={32} style={{ backgroundColor: 'var(--primary-color)', marginRight: 8 }}>
                <IconUser />
              </Avatar>
              <span style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 500 }}>Admin</span>
            </div>
          </Dropdown>
        </Space>
      </Header>

      <ArcoLayout>
        {/* 左侧侧边栏 - 优化选中态 */}
        <Sider
          width={240}
          collapsed={collapsed}
          onCollapse={setCollapsed}
          collapsible
          trigger={null}
          breakpoint="xl"
          style={{
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)',
            borderRight: '1px solid rgba(229, 230, 235, 0.5)',
            boxShadow: '2px 0 8px rgba(0,0,0,0.02)'
          }}
        >
          <Menu
            selectedKeys={[getSelectedKey()]}
            style={{ width: '100%', height: '100%', background: 'transparent', padding: '16px 8px' }}
            onClickMenuItem={(key) => {
              if (key === '1') navigate('/dashboard');
              if (key === '2') navigate('/patients');
              if (key === '3') navigate('/ai-consult');
            }}
          >
            <div style={{ padding: '0 12px 12px', fontSize: 12, color: 'var(--text-tertiary)' }}>MENU</div>
            <MenuItem key="1"><IconDashboard /> 数据看板</MenuItem>
            <MenuItem key="2"><IconUserGroup /> 患者中心</MenuItem>
            <MenuItem key="3"><IconFacebook /> AI 面诊演示</MenuItem>

            <div style={{ padding: '24px 12px 12px', fontSize: 12, color: 'var(--text-tertiary)' }}>MANAGEMENT</div>
            <MenuItem key="4"><IconApps /> 产品管理</MenuItem>
            <MenuItem key="5"><IconSettings /> 后台设置</MenuItem>
          </Menu>

          <div
            style={{
              position: 'absolute',
              bottom: 16,
              left: 16,
              right: 16,
            }}
          >
            <Button
              long
              type="outline"
              size="mini"
              onClick={() => setCollapsed(!collapsed)}
              style={{ borderRadius: 8, borderColor: '#e5e6eb', color: 'var(--text-secondary)' }}
            >
              {collapsed ? '展开' : '收起侧边栏'}
            </Button>
          </div>
        </Sider>

        {/* 内容区域 - 增加内边距 */}
        <ArcoLayout style={{ padding: '0 24px 24px', overflow: 'hidden' }}>
          <Breadcrumb style={{ margin: '4px 0', fontSize: 12, color: 'var(--text-tertiary)' }}>
            <Breadcrumb.Item>首页</Breadcrumb.Item>
            {location.pathname.startsWith('/dashboard') && <Breadcrumb.Item>数据看板</Breadcrumb.Item>}
            {location.pathname.startsWith('/patients') && <Breadcrumb.Item>患者中心</Breadcrumb.Item>}
            {location.pathname.startsWith('/ai-consult') && <Breadcrumb.Item>AI 面诊</Breadcrumb.Item>}
            {location.pathname.includes('/detail') || location.pathname.match(/\/patients\/\d+/) ? <Breadcrumb.Item>患者详情</Breadcrumb.Item> : null}
          </Breadcrumb>

          <Content style={{
            background: 'transparent',
            overflow: 'auto',
            minHeight: 'calc(100vh - 140px)',
            borderRadius: 'var(--border-radius-lg)',
          }}>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/patients" element={<PatientList />} />
              <Route path="/patients/:id" element={<PatientDetail />} />
              <Route path="/ai-consult" element={<AiConsult />} />
            </Routes>
          </Content>

          {/* 页脚 */}
          <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-tertiary)', fontSize: 12 }}>
            © 2025 智面诊 (Face AI SaaS). All Rights Reserved.
          </div>
        </ArcoLayout>
      </ArcoLayout>
    </ArcoLayout>
  );
};

const App = () => {
  const location = useLocation();

  if (location.pathname === '/login') {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
      </Routes>
    );
  }

  return (
    <ProtectedRoute>
      <MainLayout />
    </ProtectedRoute>
  );
};

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
