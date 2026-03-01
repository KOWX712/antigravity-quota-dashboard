import fs from 'fs';
import path from 'path';
import { getDataDir } from '../utils/data-dir.js';

export async function logs(options: { follow?: boolean; lines?: string }) {
  const dataDir = getDataDir();
  const logPath = path.join(dataDir, 'ag-quota-dashboard.log');
  
  if (!fs.existsSync(logPath)) {
    console.log('No logs found. Is ag-quota-dashboard running?');
    return;
  }
  
  const lineCount = parseInt(options.lines || '50');
  
  if (options.follow) {
    console.log(`Tailing logs (Ctrl+C to exit)...`);
    
    const stream = fs.createReadStream(logPath, { encoding: 'utf-8' });
    stream.on('data', (chunk) => {
      process.stdout.write(chunk);
    });
  } else {
    const content = fs.readFileSync(logPath, 'utf-8');
    const lines = content.split('\n').filter(Boolean);
    const lastLines = lines.slice(-lineCount);
    lastLines.forEach(line => console.log(line));
  }
}
