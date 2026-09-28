const app = require('./app');
const logger = require('./utils/logger');
const { checkDatabaseConnection } = require('./config/database');

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, async () => {
  logger.info(`Teen Expense Tracker Backend running on port ${PORT} [NODE_ENV=${process.env.NODE_ENV || 'development'}]`);
  
  // Check Supabase connectivity on startup
  const dbHealth = await checkDatabaseConnection();
  logger.info(`Database connectivity: ${dbHealth.status} - ${dbHealth.message}`);
});

// Graceful shutdown handling
function gracefulShutdown(signal) {
  logger.info(`${signal} signal received: closing HTTP server.`);
  server.close(() => {
    logger.info('HTTP server closed cleanly.');
    process.exit(0);
  });
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

module.exports = server;
