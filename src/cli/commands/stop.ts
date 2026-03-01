import fs from 'fs';
import path from 'path';
import { getDataDir } from '../utils/data-dir.js';

export async function stop() {
  const dataDir = getDataDir();
  const pidPath = path.join(dataDir, 'ag-quota-dashboard.pid');
  
  if (!fs.existsSync(pidPath)) {
    console.log('ag-quota-dashboard is not running');
    return;
  }
  
  const pid = parseInt(fs.readFileSync(pidPath, 'utf-8'));
  
  try {
    process.kill(pid, 'SIGTERM');
    console.log('ag-quota-dashboard stopped (PID:', pid, ')');
    fs.unlinkSync(pidPath);
  } catch {
    console.log('Failed to stop ag-quota-dashboard. Process may have already exited.');
    fs.unlinkSync(pidPath);
  }
}
