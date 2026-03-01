import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { getDataDir } from '../utils/data-dir.js';

export async function openDashboard() {
  const dataDir = getDataDir();
  const configPath = path.join(dataDir, 'config.json');
  const pidPath = path.join(dataDir, 'ag-quota-dashboard.pid');
  
  let port = '3000';
  
  if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    port = config.port || '3000';
  }
  
  // Check if server is running
  if (fs.existsSync(pidPath)) {
    const pid = parseInt(fs.readFileSync(pidPath, 'utf-8'));
    try {
      process.kill(pid, 0);
    } catch {
      console.log('ag-quota-dashboard is not running');
      console.log('Start it with: ag-quota-dashboard start -d');
      return;
    }
  } else {
    console.log('ag-quota-dashboard is not running');
    console.log('Start it with: ag-quota-dashboard start -d');
    return;
  }
  
  const url = `http://localhost:${port}`;
  
  // Use platform-specific open command
  const openCmd = process.platform === 'win32' ? 'start' 
    : process.platform === 'darwin' ? 'open' 
    : 'xdg-open';
  
  exec(`${openCmd} ${url}`);
  console.log(`Opening ${url} in your browser...`);
}
