const cron = require('node-cron');
const logger = require('../utils/logger');
const { runForecastRefresh } = require('../controllers/webhook.controller');

// Run every day at 5:00 AM IST (23:30 UTC)
const initJobs = () => {
  cron.schedule('30 23 * * *', async () => {
    logger.info('Running cron job: refresh-forecasts');
    try {
      await runForecastRefresh();
      logger.info('Cron job success: refresh-forecasts');
    } catch (error) {
      logger.error(`Cron job failed: refresh-forecasts - ${error.message}`);
    }
  }, {
    scheduled: true,
    timezone: "Asia/Kolkata"
  });

  logger.info('Cron jobs initialized');
};

module.exports = { initJobs };