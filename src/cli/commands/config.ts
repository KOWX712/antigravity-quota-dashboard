import fs from 'fs';
import path from 'path';
import { getDataDir } from '../utils/data-dir.js';

export async function configCmd(options: { set?: string; delete?: string }) {
  const dataDir = getDataDir();
  
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  const configPath = path.join(dataDir, 'config.json');
  let config: Record<string, string> = {};
  
  if (fs.existsSync(configPath)) {
    config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  }
  
  if (options.set) {
    const [key, value] = options.set.split('=');
    if (!key || !value) {
      console.error('Invalid format. Use: --set key=value');
      process.exit(1);
    }
    config[key] = value;
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log(`Set ${key}=${value}`);
  } else if (options.delete) {
    delete config[options.delete];
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log(`Deleted ${options.delete}`);
  } else {
    console.log('ag-quota-dashboard Configuration:');
    console.log(`  Data directory: ${dataDir}`);
    if (Object.keys(config).length === 0) {
      console.log('  (no custom config set)');
    } else {
      Object.entries(config).forEach(([key, value]) => {
        console.log(`  ${key}: ${value}`);
      });
    }
  }
}
