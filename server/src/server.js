
import app from './app.js';
import { config } from './config/index.js';
import { connectDB } from './config/db.js';
import { logger } from './utils/logger.js';

async function startServer() {
  try {
    await connectDB();
  } catch (err) {
    logger.error(`Critical Error: Could not connect to MongoDB at ${config.mongodbUri}. Server cannot start without MongoDB.`);
    process.exit(1);
  }

  app.listen(config.port, () => {
    logger.info(`Server running in ${config.env} mode on http://localhost:${config.port}`);
    logger.info(`Health check available at http://localhost:${config.port}/api/health`);
    if (config.devMockAuth) {
      logger.warn(`DEV_MOCK_AUTH is active. Authentication checks will use dev mock user when no Clerk token is supplied.`);
    }
  });
}

startServer();
