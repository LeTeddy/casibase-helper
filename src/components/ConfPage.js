import React, { useEffect, useState } from 'react';
import { Table, Input, Button, Form, Space, Typography, message, Card, Switch } from 'antd';
import { EditOutlined, SaveOutlined, ReloadOutlined } from '@ant-design/icons';
import { readAppConf, saveAppConf } from '../backends/Conf';

const ConfPage = () => {
  const [config, setConfig] = useState([]);
  const [loading, setLoading] = useState(false);
  const [useSQLite, setUseSQLite] = useState(true);
  const [filteredConfig, setFilteredConfig] = useState([]);
  const displayedKeys = ['isDemoMode', 'disablePreviewMode', 'logoUrl'];

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const conf = await readAppConf();
      if (conf.driverName === 'sqlite') {
        setUseSQLite(true);
      } else {
        setUseSQLite(false);
      }
      const filtered = Object.entries(conf)
        .filter(([k]) => displayedKeys.includes(k))
        .map(([key, value]) => ({ key, value }));
      setConfig(conf);
      setFilteredConfig(filtered);
    } catch (err) {
      message.error(`读取配置失败：${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 初始化加载
  useEffect(() => {
    fetchConfig();
  }, []);

  // 保存配置
  const handleSave = async () => {
    setLoading(true);
    try {
      filteredConfig.forEach(({ key, value }) => {
        if (key in config) {
          config[key] = value;
        }
      })
      if (useSQLite) {
        config['driverName'] = 'sqlite';
        config['dataSourceName'] = './database.sqlite';
      }
      await saveAppConf(config);
      message.success('配置已保存');
    } catch (err) {
      message.error(`保存失败：${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: '配置项',
      dataIndex: 'key',
      key: 'key',
      width: '40%',
      render: (text) => <Typography.Text strong>{text}</Typography.Text>,
    },
    {
      title: '值',
      dataIndex: 'value',
      key: 'value',
      width: '50%',
      render: (text, record, index) => (
        <Input
          value={text}
          onChange={(e) => {
            const newData = [...filteredConfig];
            newData[index].value = e.target.value;
            setFilteredConfig(newData);
          }}
        />
      ),
    },
  ];

  return (
    <div>
      <Card
        extra={
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchConfig}
              loading={loading}
            >
              重新读取
            </Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSave}
              loading={loading}
            >
              保存
            </Button>
          </Space>
        }
      >
        <Card
          title={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>数据库配置</span>
              <Switch
                checked={useSQLite}
                onChange={setUseSQLite}
                checkedChildren="预置 SQLite"
                unCheckedChildren="自定义"
              />
            </div>
          }
          style={{ marginBottom: 24 }}
        >
          {useSQLite ? (
            <div>使用预置 SQLite 本地文件，无需额外配置</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
              {[
                { label: '数据源', key: 'dataSourceName' },
                { label: '数据库驱动', key: 'driverName' },
                { label: '数据库名称', key: 'dbName' },
              ].map(({ label, key }) => (
                <Input
                  key={key}
                  addonBefore={<span style={{ display: 'inline-block', width: 100 }}>{label}</span>}
                  value={config[key] || ''}
                  onChange={e => setConfig(prev => ({
                    ...prev,
                    [key]: e.target.value
                  }))}
                />
              ))}
            </div>
          )}
        </Card>
        <Table
          dataSource={filteredConfig}
          columns={columns}
          pagination={false}
          rowKey={(r, idx) => `${r.key}-${idx}`}
          size="middle"
          bordered
          scroll={{ y: 230 }}
        />
      </Card>
    </div>
  );
}

export default ConfPage;