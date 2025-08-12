import {configPath} from './Deploy'
const fs = require('fs');
const fsPromises = fs.promises;


export async function readAppConf() {
  return new Promise(async (resolve, reject) => {
    if (!fs.existsSync(configPath)) return reject(new Error('app.conf 文件不存在'));

    const txt = await fsPromises.readFile(configPath, 'utf-8')
    const lines = txt
      .split(/\r?\n/)
      .filter(line => line.trim() && !line.startsWith('#'))
      .filter(Boolean);
    const obj = {};
    lines.forEach(line => {
      const [k, v] = line.split('=').map(s => s.trim());
      obj[k] = v;
    });
    return resolve(obj);
  });
}

export function saveAppConf(content) {
  const Conf = Object.entries(content).map(([k, v]) => `${k} = ${v}`).join('\n');
  fs.writeFileSync(configPath, Conf, 'utf-8');
  return true;
}