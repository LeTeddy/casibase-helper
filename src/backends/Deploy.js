import { addLog } from './Log';
const fs = require('fs');
const fsPromises = fs.promises;
const path = require('path');
const https = require('https');
const { spawn } = require('child_process');
const unzipper = require('unzipper');
const http = require('http');
const serveHandler = require('serve-handler');

export const configPath = './userData/conf/app.conf';
const binaryPath = './userData/casibase.exe';
const dataPath = './userData/data';
const staticPath = './userData/web/build';

export function srcCheck() {
  return new Promise(async (resolve, reject) => {
    try {
      const binaryExists = fs.existsSync(binaryPath);
      const staticExists = fs.existsSync(staticPath);
      const dataExists = fs.existsSync(dataPath);

      if (binaryExists && staticExists & dataExists) {
        console.log('二进制文件和静态文件已存在');
        return resolve(true);
      }

      console.log('缺少文件，开始下载...');

      // 简单示例：下载 zip 文件到临时目录
      const zipFile = path.join(__dirname, 'temp.zip');
      const file = fs.createWriteStream(zipFile);

      https.get(githubReleaseUrl, (res) => {
        res.pipe(file);
        file.on('finish', async () => {
          file.close();

          // 解压到当前目录
          fs.createReadStream(zipFile)
            .pipe(unzipper.Extract({ path: __dirname }))
            .on('close', () => {
              fs.unlinkSync(zipFile); // 删除 zip
              console.log('下载并解压完成');
              resolve();
            });
        });
      }).on('error', (err) => {
        reject(err);
      });
    } catch (err) {
      reject(err);
    }
  });
}

export function confCheck() {
  return new Promise(async (resolve, reject) => {
    try {
      if (!fs.existsSync(configPath)) return reject(new Error('app.conf 文件不存在'));

      const lines = (await fsPromises.readFile(configPath, 'utf-8')).split(/\r?\n/).filter(Boolean);
      for (const line of lines) {
        if (line.trim() && !line.includes('=')) {
          return reject(new Error(`配置格式错误: ${line}`));
        }
        const confItem = line.split('=');
        console.log(confItem);
        if (!checkConfItem(confItem[0].trim(), confItem[1].trim())) {
          return reject(new Error(`配置错误: ${confItem[0]}`));
        }
      }

      console.log('配置文件校验通过');
      resolve(true);
    } catch (err) {
      reject(err);
    }
  });
}

export function deployApp() {
  return new Promise((resolve, reject) => {
    let backend, frontend;
    let backendReady = false;
    let frontendReady = false;

    try {
      const backendDir = path.join(binaryPath, '..');

      // 启动 Go 后端
      backend = spawn('./casibase.exe', {
        cwd: backendDir,
        windowsHide: true,
        stdio: ['pipe', 'pipe', 'pipe']
      });

      backend.stdout.on('data', (data) => {
        const msg = data.toString();
        addLog('info', msg.trim());
        console.log(`[Go STDOUT] ${msg.trim()}`);

        if (!backendReady && msg.includes('http server Running on')) {
          console.log('✅ Go 服务已启动');
          backendReady = true;
          checkReady();
        }
      });

      backend.stderr.on('data', (data) => {
        addLog('error', data.toString().trim());
        console.error(`[Go STDERR] ${data.toString().trim()}`);
        cleanup();
        reject(data);
      });

      // backend.on('error', (err) => {
      //   addLog('error', err.toString().trim());
      //   console.error('Go 进程启动失败:', err);
      //   cleanup();
      //   reject(err);
      // });

      backend.on('close', (code) => {
        addLog('info', `Go 进程退出，代码: ${code}`);
        console.log(`Go 进程退出，代码: ${code}`);
      });

      // 启动前端
      frontend = http.createServer((req, res) => {
        return serveHandler(req, res, { public: path.join(process.cwd(), staticPath) });
      });

      frontend.listen(3000, () => {
        console.log('✅ 前端已启动：http://localhost:3000');
        frontendReady = true;
        checkReady();
      });

      frontend.on('error', (err) => {
        console.error('前端启动失败:', err);
        cleanup();
        reject(err);
      });

      // 检查两个服务是否都准备好了
      function checkReady() {
        if (backendReady && frontendReady) {
          resolve({
            backend,
            frontend
          });
        }
      }

      // 停止两个服务
      function cleanup() {
        if (backend && !backend.killed) backend.kill();
        if (frontend && frontend.listening) frontend.close();
        console.log('服务已关闭');
      }

    } catch (err) {
      cleanup();
      reject(err);
    }
  });
}

function checkConfItem(confItemName, confItemValue) {
  // check confItem by rule here
  switch (confItemName) {
    case 'dbName':
      if (confItemValue === '') {
        // dbName cannot be empty
        return false;
      }
      break;
  }
  return true;
}