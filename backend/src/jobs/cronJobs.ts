import cron from 'node-cron';
import { runSystemAlertCheck } from '../alert-engine/alertService';

export function initializeCronJobs() {
  console.log('[CRON] Initializing automated alert & health inspection jobs...');

  // Run alert check every hour (and once on startup)
  cron.schedule('0 * * * *', async () => {
    console.log('[CRON] Running scheduled system alert check...');
    try {
      await runSystemAlertCheck();
    } catch (err) {
      console.error('[CRON] Error during system alert check:', err);
    }
  });

  // Run initial check immediately on server start
  setTimeout(async () => {
    try {
      await runSystemAlertCheck();
    } catch (err) {
      console.error('[CRON] Initial alert check error:', err);
    }
  }, 5000);
}
