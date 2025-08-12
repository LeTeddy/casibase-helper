// src/utils/logManager.js
const fs = require('fs');
const path = require('path');

// 日志文件路径
const logDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}
const logFile = path.join(logDir, 'app.log');

// 内存里保存最近 1000 条
let logs = [];
const MAX_LOGS = 1000;

export function addLog(type, message) {
  const logEntry = {
    id: Date.now() + Math.random(),
    type,   // 'info' or 'error'
    message,
    time: new Date().toISOString()
  };

  // 存到内存
  logs.push(logEntry);
  if (logs.length > MAX_LOGS) {
    logs.shift();
  }

  // 追加写文件
  const fileLine = `[${logEntry.time}] [${type.toUpperCase()}] ${message}\n`;
  fs.appendFileSync(logFile, fileLine);

  return logEntry;
}

export function getLogs() {
  return logs;
}

export function clearLogs() {
  logs = [];
  fs.writeFileSync(logFile, '');
}
