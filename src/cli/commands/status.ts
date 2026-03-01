import fs from 'fs';
import path from 'path';
import { getDataDir } from '../utils/data-dir.js';

export async function status() {
  const dataDir = getDataDir();
  const pidPath = path.join(dataDir, 'ag-quota-dashboard.pid');
  const configPath = path.join(dataDir, 'config.json');
  
  let port = '3000';
  
  if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    port = config.port || '3000';
  }
  
  if (!fs.existsSync(pidPath)) {
    console.log('ag-quota-dashboard is NOT running');
    console.log(`Run 'ag-quota-dashboard start' to start the dashboard`);
    return;
  }
  
  const pid = parseInt(fs.readFileSync(pidPath, 'utf-8'));
  
  try {
    process.kill(pid, 0);
    
    console.log('ag-quota-dashboard is RUNNING');
    console.log(`  PID: ${pid}`);
    console.log(`  Port: ${port}`);
    console.log(`  URL: http://localhost:${port}`);
  } catch {
    console.log('ag-quota-dashboard is NOT running (stale PID file)');
    fs.unlinkSync(pidPath);
  }
}
