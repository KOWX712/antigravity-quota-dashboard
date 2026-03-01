#!/usr/bin/env node

import { Command } from 'commander';
import { start } from './commands/start.js';
import { stop } from './commands/stop.js';
import { restart } from './commands/restart.js';
import { status } from './commands/status.js';
import { dashboard } from './commands/dashboard.js';
import { openDashboard } from './commands/open.js';
import { logs } from './commands/logs.js';
import { configCmd } from './commands/config.js';

const program = new Command();

program
  .name('ag-quota-dashboard')
  .description('CLI tool for Antigravity Quota Dashboard')
  .version('1.0.0');

program
  .command('start')
  .description('Start the ag-quota-dashboard service')
  .option('-p, --port <port>', 'Port to run the server on', '3000')
  .option('-d, --daemon', 'Run in background (daemon mode)', false)
  .action(start);

program
  .command('stop')
  .description('Stop the ag-quota-dashboard service')
  .action(stop);

program
  .command('restart')
  .description('Restart the ag-quota-dashboard service')
  .option('-p, --port <port>', 'Port to run the server on', '3000')
  .action(restart);

program
  .command('status')
  .description('Check if ag-quota-dashboard is running')
  .action(status);

program
  .command('dashboard')
  .description('Show the dashboard URL')
  .action(dashboard);

program
  .command('open')
  .description('Open the dashboard in your browser')
  .action(openDashboard);

program
  .command('logs')
  .description('View ag-quota-dashboard logs')
  .option('-f, --follow', 'Follow log output', false)
  .option('-n, --lines <number>', 'Number of lines to show', '50')
  .action(logs);

program
  .command('config')
  .description('Show or edit configuration')
  .option('-s, --set <key=value>', 'Set a config value')
  .option('-d, --delete <key>', 'Delete a config key')
  .action(configCmd);

program.parse();
