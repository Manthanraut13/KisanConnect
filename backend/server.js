require('dotenv').config();
const app = require('./src/app');
const { sequelize } = require('./src/config/db.config');
const logger = require('./src/utils/logger');
const { initJobs } = require('./src/jobs/cron');

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await sequelize.authenticate();
    logger.info('Database connected');

    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      logger.info('Models synced');
    }
  } catch (err) {
    logger.warn(`Database connection warning: ${err.message}. Server starting...`);
  }

  try {
    // Initialize scheduled cron jobs
    initJobs();
  } catch (err) {
    logger.warn(`Cron init warning: ${err.message}`);
  }

  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
  });
};

start();
