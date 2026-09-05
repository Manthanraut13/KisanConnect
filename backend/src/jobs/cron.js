const cron = require('node-cron');
const axios = require('axios');
const logger = require('../utils/logger');

// Run every day at 5:00 AM IST (23:30 UTC)
const initJobs = () => {
  cron.schedule('30 23 * * *', async () => {
    logger.info('Running cron job: refresh-forecasts');
    try {
      // Get the deployed backend URL or fallback to localhost
      const apiUrl = process.env.APP_URL || 'http://localhost:5000';
      
      const response = await axios.post(
        `${apiUrl}/api/webhooks/refresh-forecasts`,
        {},
        {
          headers: {
            'x-webhook-secret': process.env.WEBHOOK_SECRET,
            'Content-Type': 'application/json'
          },
          timeout: 120000 // 2 min timeout for AI processing
        }
      );
      
      logger.info(`Cron job success: refresh-forecasts. Triggered batch processing.`);
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