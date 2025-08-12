import React, { useState, useEffect } from 'react';
import { Layout, ConfigProvider, Switch as AntSwitch } from 'antd';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import * as Deploy from './backends/Deploy';
import './i18n';
import Sidebar from './components/Sidebar';
import HomePage from './components/HomePage';
import ConfPage from './components/ConfPage';
import LogPage from './components/LogPage';
import Titlebar from './components/Titlebar';
import "./assets/App.css";

const { Content, Sider } = Layout;

function App() {
  const [localVersion, setLocalVersion] = useState(null);
  const [latestVersion, setLatestVersion] = useState(null);
  const [checkingVersion, setCheckingVersion] = useState(true);
  const [stepsStatus, setStepsStatus] = useState(['wait', 'wait', 'wait']);
  const [currentStep, setCurrentStep] = useState(0);
  const [running, setRunning] = useState(false);
  const [errorInfo, setErrorInfo] = useState(['', '', '']);
  const [darkMode, setDarkMode] = useState(false);
  const deploySteps = ['srcCheck', 'confCheck', 'deployApp']
  const [backend, setBackend] = useState(null);
  const [frontend, setFrontend] = useState(null);


  // 版本检查
  useEffect(() => {
    setCheckingVersion(true);
    // TODO: write a function in backend/Deploy.js
    setTimeout(() => {
      setLocalVersion('1.0.0');
      setLatestVersion('1.1.0');
      setCheckingVersion(false);
    }, 800);
  }, []);

  const runStep = async (index) => {
    // 设置当前步骤为执行中
    setStepsStatus(prev => {
      const newStatus = [...prev];
      newStatus[index] = 'process';
      return newStatus;
    });
    setErrorInfo(prev => {
      const newErrors = [...prev];
      newErrors[index] = '';
      return newErrors;
    });

    const processureName = deploySteps[index];

    try {
      let processureResult = false;

      switch (processureName) {
        case 'srcCheck':
          processureResult = await Deploy.srcCheck();
          break;
        case 'confCheck':
          processureResult = await Deploy.confCheck();
          break;
        case 'deployApp':
          processureResult = await Deploy.deployApp();
          break;
        default:
          console.log("没有匹配的值");
      }

      if (processureResult) {
        console.log(processureResult);
        setStepsStatus(prev => {
          const newStatus = [...prev];
          newStatus[index] = 'finish';
          return newStatus;
        });

        if (index < deploySteps.length - 1) {
          setCurrentStep(index + 1);
          runStep(index + 1);
        } else {
          // final step, always be deploy app
          setBackend(processureResult.backend);
          setFrontend(processureResult.frontend);
          setRunning(false);
        }
      }
    } catch (err) {
      // 出错时
      console.error(err);
      setStepsStatus(prev => {
        const newStatus = [...prev];
        newStatus[index] = 'error';
        return newStatus;
      });
      setErrorInfo(prev => {
        const newErrors = [...prev];
        newErrors[index] = err.message || '执行失败，请检查日志';
        return newErrors;
      });
      setRunning(false);
    }
  };

  
  const stop = () => {
    backend?.kill();
    frontend?.close();
    setBackend(null);
    setFrontend(null);
    console.log('服务已关闭');
  }

  // 操作方法
  const handleDeploy = () => {
    setRunning(true);
    setStepsStatus(['wait', 'wait', 'wait']);
    setCurrentStep(0);
    runStep(0);
  };

  const handleStop = () => {
    setStepsStatus(['wait', 'wait', 'wait']);
    setCurrentStep(0);
    stop();
    setRunning(false);
  };

  const handleRetry = () => {
    setRunning(true);
    stop();
    runStep(currentStep);
  };

  const handleUpdate = () => {
    alert('更新逻辑');
  };

  return (
    <ConfigProvider theme={"default"}>
      <Router>
        <Layout>
          <Titlebar />
          <Layout>
            <Sider collapsible>
              <Sidebar />
            </Sider>
            <Content className='content'>
              <Switch>
                <Route exact path="/">
                  <HomePage
                    localVersion={localVersion}
                    latestVersion={latestVersion}
                    checkingVersion={checkingVersion}
                    stepsStatus={stepsStatus}
                    currentStep={currentStep}
                    running={running}
                    errorInfo={errorInfo}
                    onDeploy={handleDeploy}
                    onStop={handleStop}
                    onRetry={handleRetry}
                    onUpdate={handleUpdate}
                    deploySteps={deploySteps}
                  />
                </Route>
                <Route path="/config" component={ConfPage} />
                <Route path="/log" component={LogPage} />
              </Switch>
            </Content>
          </Layout>
        </Layout>
      </Router>
    </ConfigProvider>
  );
}

export default App;
