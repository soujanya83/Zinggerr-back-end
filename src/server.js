import connectDB from './config/db.js';
import { app } from './app.js';
import { env } from './config/env.js';
import logger from './config/logger.js';

// Handle Uncaught Exceptions
process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception: ${err.message}`);
  if (err.stack) logger.debug(err.stack);
  process.exit(1);
});

// Bootstrap application
const startServer = async () => {
  try {
    // 1. Connect to Database
    await connectDB();

    // 2. Start Listening
    const server = app.listen(env.PORT, () => {
      logger.info(`Server is running at http://localhost:${env.PORT}`);
    });

    // Handle Unhandled Rejections
    process.on('unhandledRejection', (reason, promise) => {
      logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
      server.close(() => {
        process.exit(1);
      });
    });
  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
