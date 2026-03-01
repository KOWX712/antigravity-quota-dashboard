import os from 'os';
import path from 'path';

export function getDataDir(): string {
  const home = os.homedir();
  
  if (process.platform === 'win32') {
    return path.join(process.env.APPDATA || path.join(home, 'AppData', 'Roaming'), 'ag-quota-dashboard');
  } else if (process.platform === 'darwin') {
    return path.join(home, 'Library', 'Application Support', 'ag-quota-dashboard');
  } else {
    return path.join(process.env.XDG_DATA_HOME || path.join(home, '.local', 'share'), 'ag-quota-dashboard');
  }
}
