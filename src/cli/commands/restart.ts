import { stop } from './stop.js';
import { start } from './start.js';

export async function restart(options: { port?: string }) {
  console.log('Restarting ag-quota-dashboard...');
  await stop();
  await new Promise(resolve => setTimeout(resolve, 1000));
  await start(options);
}
