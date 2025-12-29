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
import { isLoggedIn, removeToken, getToken } from './api/auth';

import { Layout as ArcoLayout, Menu, Button, Avatar, Dropdown, Space, Breadcrumb, Message, Badge } from '@arco-design/web-react';
import {
  IconDashboard, IconUserGroup, IconFacebook, IconPoweroff,
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
    <ArcoLayout className="app-layout" style={{ height: '100vh', background: '#f0f2f5' }}>

      {/* 顶部导航栏 */}
      <Header style={{
        height: 60,
        background: '#fff',
        borderBottom: '1px solid #e5e6eb',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 20px',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div
            className="logo"
            style={{
              width: 32,
              height: 32,
              background: '#165DFF',
              borderRadius: 4,
              marginRight: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 'bold',
              fontSize: 20
            }}
          >
            A
          </div>
          <div style={{ fontSize: 18, fontWeight: 600, color: '#1d2129' }}>Arco 美容管理平台</div>
        </div>

        <Space size="large">
          <Button shape="circle" icon={<IconNotification />} />
          <Button shape="circle" icon={<IconSettings />} />
          <Dropdown droplist={dropList} position='br'>
            <Avatar size={32} style={{ backgroundColor: '#165DFF', cursor: 'pointer' }}>
              <IconUser />
            </Avatar>
          </Dropdown>
        </Space>
      </Header>

      <ArcoLayout>
        {/* 左侧侧边栏 */}
        <Sider
          width={220}
          collapsed={collapsed}
          onCollapse={setCollapsed}
          collapsible
          trigger={null}
          breakpoint="xl"
          style={{ background: '#fff', borderRight: '1px solid #e5e6eb' }}
        >
          <Menu
            selectedKeys={[getSelectedKey()]}
            style={{ width: '100%', height: '100%' }}
            onClickMenuItem={(key) => {
              if (key === '1') navigate('/dashboard');
              if (key === '2') navigate('/patients');
              if (key === '3') navigate('/ai-consult');
            }}
          >
            <MenuItem key="1"><IconDashboard /> 数据看板</MenuItem>
            <MenuItem key="2"><IconUserGroup /> 患者中心</MenuItem>
            <MenuItem key="3"><IconFacebook /> AI 面诊演示</MenuItem>
            {/* 模拟一些其他菜单项以填充视觉 */}
            <MenuItem key="4"><IconApps /> 产品管理</MenuItem>
            <MenuItem key="5"><IconSettings /> 后台设置</MenuItem>
          </Menu>

          <div
            style={{
              position: 'absolute',
              bottom: 10,
              left: 0,
              width: '100%',
              textAlign: 'center',
              padding: 10,
              borderTop: '1px solid #f2f3f5'
            }}
          >
            <Button type="text" size="mini" onClick={() => setCollapsed(!collapsed)}>
              {collapsed ? '展开' : '收起侧边栏'}
            </Button>
          </div>
        </Sider>

        {/* 内容区域 */}
        <ArcoLayout style={{ padding: '0 24px 24px' }}>
          <Breadcrumb style={{ margin: '16px 0' }}>
            <Breadcrumb.Item>首页</Breadcrumb.Item>
            {location.pathname.startsWith('/dashboard') && <Breadcrumb.Item>数据看板</Breadcrumb.Item>}
            {location.pathname.startsWith('/patients') && <Breadcrumb.Item>患者中心</Breadcrumb.Item>}
            {location.pathname.startsWith('/ai-consult') && <Breadcrumb.Item>AI 面诊</Breadcrumb.Item>}
            {location.pathname.includes('/detail') || location.pathname.match(/\/patients\/\d+/) ? <Breadcrumb.Item>患者详情</Breadcrumb.Item> : null}
          </Breadcrumb>

          <Content style={{ background: 'transparent', overflow: 'auto', minHeight: 'calc(100vh - 120px)' }}>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/patients" element={<PatientList />} />
              <Route path="/patients/:id" element={<PatientDetail />} />
              <Route path="/ai-consult" element={<AiConsult />} />
            </Routes>
          </Content>
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
