import React, { useEffect, useState } from 'react';
import { Button, Space, Tag } from 'antd';
import * as Log from '../backends/Log';

const LogPage = () => {
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState('all');
  // 初始化时加载已有日志
  useEffect(() => {
    setLogs(Log.getLogs());
  }, []);

  // 模拟订阅：这里因为你在 node.js 直接调用 addLog 时，
  // 可以主动调用 setLogs 来刷新（比如在你启动后端的时候）
  const refreshLogs = () => {
    setLogs([...Log.getLogs()]);
  };

  const clearLogs = () => {
    Log.clearLogs();
    setLogs([]);
  };

  const filteredLogs = logs.filter(log => {
    if (filter === 'all') return true;
    return log.type === filter;
  });

  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* 操作按钮 */}
      <Space style={{ marginBottom: 12 }}>
        <Button type={filter === 'all' ? 'primary' : 'default'} onClick={() => setFilter('all')}>
          全部
        </Button>
        <Button type={filter === 'info' ? 'primary' : 'default'} onClick={() => setFilter('info')}>
          普通日志
        </Button>
        <Button type={filter === 'error' ? 'primary' : 'default'} danger onClick={() => setFilter('error')}>
          错误日志
        </Button>
        <Button onClick={clearLogs}>清空</Button>
        <Button onClick={refreshLogs}>刷新</Button>
      </Space>

      {/* 日志列表 */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          border: '1px solid #f0f0f0',
          borderRadius: 4,
          padding: 8,
          background: '#fafafa',
        }}
      >
        {filteredLogs.map(log => (
          <div key={log.id} style={{ marginBottom: 6 }}>
            {log.type === 'error' ? (
              <Tag color="red">ERROR</Tag>
            ) : (
              <Tag color="blue">INFO</Tag>
            )}
            <span style={{ whiteSpace: 'pre-wrap' }}>
              [{log.time}] {log.message}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LogPage;
