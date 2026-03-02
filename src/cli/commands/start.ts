import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { getDataDir } from '../utils/data-dir.js';

export async function start(options: { port?: string; daemon?: boolean }) {
  const port = options.port || '3000';
  const daemon = options.daemon || false;
  const dataDir = getDataDir();
  
  // Create data directory if it doesn't exist
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  const dbPath = path.join(dataDir, 'db.sqlite');
  const logPath = path.join(dataDir, 'ag-quota-dashboard.log');
  
  // Write PID file
  const pidPath = path.join(dataDir, 'ag-quota-dashboard.pid');
  
  // Check if already running
  if (fs.existsSync(pidPath)) {
    const pid = parseInt(fs.readFileSync(pidPath, 'utf-8'));
    try {
      process.kill(pid, 0);
      console.log('ag-quota-dashboard is already running (PID:', pid, ')');
      console.log('Use "ag-quota-dashboard dashboard" to see the URL');
      return;
    } catch {
      // Process not running, remove stale PID
      fs.unlinkSync(pidPath);
    }
  }
  
  console.log('Starting ag-quota-dashboard on port', port);
  
  if (daemon) {
    // Daemon mode: fully detach from terminal
    const serverProcess = spawn(
      'npx',
      ['next', 'start', '-p', port],
      {
        cwd: process.cwd(),
        env: {
          ...process.env,
          PORT: port,
          DB_PATH: dbPath,
        },
        detached: true,
        stdio: 'ignore',
        shell: true,
      }
    );
    
    // Unref to allow parent to exit even if child is running
    serverProcess.unref();
    
    // Write PID
    fs.writeFileSync(pidPath, serverProcess.pid?.toString() || '');
    
    console.log('ag-quota-dashboard started in daemon mode (PID:', serverProcess.pid, ')');
    console.log(`Dashboard: http://localhost:${port}`);
    console.log(`Logs: ${logPath}`);
    
    // Save config
    const configPath = path.join(dataDir, 'config.json');
    fs.writeFileSync(configPath, JSON.stringify({ port, daemon: true }, null, 2));
    
    return;
  }
  
  // Foreground mode: keep attached to terminal (original behavior)
  const serverProcess = spawn(
    'npx',
    ['next', 'start', '-p', port],
    {
      cwd: process.cwd(),
      env: {
        ...process.env,
        PORT: port,
        DB_PATH: dbPath,
      },
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: true,
    }
  );
  
  // Write PID
  fs.writeFileSync(pidPath, serverProcess.pid?.toString() || process.pid.toString());
  
  // Log output
  const logStream = fs.createWriteStream(logPath, { flags: 'a' });
  serverProcess.stdout?.pipe(logStream);
  serverProcess.stderr?.pipe(logStream);
  
  serverProcess.on('error', (err) => {
    console.error('Failed to start server:', err);
    fs.unlinkSync(pidPath);
  });
  
  // Wait for server to start
  await new Promise((resolve) => setTimeout(resolve, 3000));
  
  console.log('ag-quota-dashboard started successfully!');
  console.log(`Dashboard: http://localhost:${port}`);
  console.log(`Logs: ${logPath}`);
  
  // Save config
  const configPath = path.join(dataDir, 'config.json');
  fs.writeFileSync(configPath, JSON.stringify({ port }, null, 2));
}
