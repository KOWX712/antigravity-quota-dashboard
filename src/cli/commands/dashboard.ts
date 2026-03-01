import fs from 'fs';
import path from 'path';
import { getDataDir } from '../utils/data-dir.js';

export async function dashboard() {
  const dataDir = getDataDir();
  const configPath = path.join(dataDir, 'config.json');
  
  let port = '3000';
  
  if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    port = config.port || '3000';
  }
  
  console.log('ag-quota-dashboard:');
  console.log(`  http://localhost:${port}`);
}
