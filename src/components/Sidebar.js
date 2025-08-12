import React from 'react';
import { Menu } from 'antd';
import {
  HomeOutlined,
  SettingOutlined,
  ExperimentOutlined,
} from '@ant-design/icons';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();
  const selectedKey = location.pathname;

  const items = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: <Link to="/">主页</Link>,
    },
    {
      key: '/config',
      icon: <SettingOutlined />,
      label: <Link to="/config">配置</Link>,
    },
    {
      key: '/log',
      icon: <SettingOutlined />,
      label: <Link to="/log">日志</Link>,
    },
    {
      key: '/demo',
      icon: <ExperimentOutlined />,
      label: <Link to="/demo">演示</Link>,
    },
  ];

  return (
    <Menu
      theme="dark"
      mode="inline"
      selectedKeys={[selectedKey]}
      items={items}
      style={{ height: '100vh', borderRight: 0 }}
    />
  );
};

export default Sidebar;
