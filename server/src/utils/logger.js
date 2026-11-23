import { config } from '../config/index.js';

export const logger = {
  info: (msg, meta = '') => {
    console.log(`[INFO] ${new Date().toISOString()} - ${msg}`, meta);
  },
  warn: (msg, meta = '') => {
    console.warn(`[WARN] ${new Date().toISOString()} - ${msg}`, meta);
  },
  error: (msg, error = '') => {
    if (config.env === 'production') {
      console.error(`[ERROR] ${new Date().toISOString()} - ${msg}`);
    } else {
      console.error(`[ERROR] ${new Date().toISOString()} - ${msg}`, error?.message || error);
    }
  }
};
