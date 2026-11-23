import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import { config } from './index.js';
import { logger } from '../utils/logger.js';

let isConnected = false;
let embeddedMongoInstance = null;

export async function connectDB() {
  if (isConnected && mongoose.connection.readyState === 1) return;

  try {
    logger.info(`Connecting to MongoDB at ${config.mongodbUri}...`);
    const conn = await mongoose.connect(config.mongodbUri, {
      serverSelectionTimeoutMS: 8000,
    });
    isConnected = true;
    logger.info(`MongoDB Connected Successfully: ${conn.connection.host}/${conn.connection.name}`);
    return;
  } catch (err) {
    logger.warn(`Unable to reach primary MongoDB (${err.message}). Falling back to local persistent MongoDB engine...`);
  }

  try {
    logger.info('Starting local persistent MongoDB instance (WiredTiger engine)...');
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    const dbDir = path.resolve(process.cwd(), 'data/mongodb');
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    embeddedMongoInstance = await MongoMemoryServer.create({
      instance: {
        dbPath: dbDir,
        dbName: 'contract_review',
        storageEngine: 'wiredTiger',
      },
    });

    const uri = embeddedMongoInstance.getUri();
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    logger.info(`MongoDB Connected Successfully: ${conn.connection.host}:${conn.connection.port}/${conn.connection.name}`);
    logger.info('All contracts, reviews, embeddings, and chat messages are stored directly in MongoDB.');
  } catch (error) {
    isConnected = false;
    logger.error(`Critical Error: Unable to initialize MongoDB: ${error.message}`);
    throw error;
  }
}

export function isDbConnected() {
  return isConnected && mongoose.connection.readyState === 1;
}

export async function disconnectDB() {
  if (isConnected) {
    await mongoose.disconnect();
    isConnected = false;
  }
  if (embeddedMongoInstance) {
    await embeddedMongoInstance.stop();
    embeddedMongoInstance = null;
  }
}
