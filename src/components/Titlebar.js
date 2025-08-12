import React from 'react';
import { Layout, Button } from 'antd';
const { Header } = Layout;
import { CloseOutlined, MinusOutlined } from '@ant-design/icons';
import '../assets/TitleBar.css';
const { ipcRenderer } = require('electron')

const TitleBar = () => {
  const minimizeWindow = () => {
    ipcRenderer.send("window-minimize");
  };
  const closeWindow = () => {
    ipcRenderer.send("window-close");
  };

  return (
    <Header className="titlebar">
      <div className="title">
        <img
          src="https://cdn.casibase.org/img/casibase.png"
          alt="Casibase"
          className="logo"
        />
        <span className="titleText">Casibase Helper</span>
      </div>
      <div className="window-controls">
        <div
          className="control-btn"
          onClick={minimizeWindow}
          role="button"
          tabIndex={0}
        >
          <MinusOutlined />
        </div>
        <div
          className="control-btn close-btn"
          onClick={closeWindow}
          title="关闭"
          role="button"
          tabIndex={0}
        >
          <CloseOutlined />
        </div>
      </div>
    </Header>
  );
};

export default TitleBar;
