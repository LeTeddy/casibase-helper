import React, { useState, useEffect } from 'react';
import { Card, Steps, Button, Typography, Space, Tag, Spin, message } from 'antd';
import { CheckCircleTwoTone, CloseCircleTwoTone, SyncOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const { Title, Text } = Typography;
const { Step } = Steps;

const HomePage = ({
  localVersion,
  latestVersion,
  checkingVersion,
  stepsStatus,
  currentStep,
  running,
  errorInfo,
  onDeploy,
  onStop,
  onRetry,
  onUpdate,
  deploySteps
}) => {
  const { t } = useTranslation();
  return (
    <div style={{ padding: 24, background: '#f0f2f5', height: '100vh' }}>
      {/* 版本信息 */}
      <Card style={{ marginBottom: 24 }}>
        <Space align="center">
          <Title level={4} style={{ margin: 0 }}>资源文件版本</Title>
          {checkingVersion ? (
            <Spin size="small" />
          ) : localVersion ? (
            <>
              <Tag color="blue">{t('localVersion')}：{localVersion}</Tag>
              {latestVersion && latestVersion !== localVersion && (
                <>
                  <Tag color="orange">{t('latestVersion')}：{latestVersion}</Tag>
                  <Button size="small" type="primary" onClick={onUpdate}>
                    {t('update')}
                  </Button>
                </>
              )}
            </>
          ) : (
            <Tag color="red">未下载</Tag>
          )}
        </Space>
      </Card>

      {/* 部署步骤 */}
      <Card style={{ marginBottom: 24 }}>
        <Steps direction="vertical" current={currentStep}>
          {deploySteps.map((title, idx) => (
            <Step
              key={idx}
              icon={
                stepsStatus[idx] === 'process' ? <SyncOutlined spin /> :
                  stepsStatus[idx] === 'finish' ? <CheckCircleTwoTone style={{ color: 'green' }} /> :
                    stepsStatus[idx] === 'error' ? <CloseCircleTwoTone style={{ color: 'red' }} /> : null
              }
              title={
                <Space>
                  {t('steps.' + title)}
                </Space>
              }
              description={
                stepsStatus[idx] === 'error' ? (
                  <Typography.Text type="danger">{errorInfo[idx]}</Typography.Text>
                ) : null
              }
              status={stepsStatus[idx]}
            />
          ))}
        </Steps>
      </Card>

      {/* 底部按钮 */}
      <Card>
        {!running && stepsStatus.includes('error') ? (
          <Button type="primary" danger block onClick={onRetry}>重试</Button>
        ) : !running && stepsStatus.every(s => s === 'finish') ? (
          <Button type="default" danger block onClick={onStop}>停止</Button>
        ) : !running ? (
          <Button type="primary" block onClick={onDeploy}>部署</Button>
        ) : (
          <Button type="dashed" danger block onClick={onStop}>停止</Button>
        )}
      </Card>
    </div>
  );
};

export default HomePage;