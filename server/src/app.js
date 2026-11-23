import express from 'express';
import cors from 'cors';
import { clerkMiddleware } from '@clerk/express';
import { config } from './config/index.js';
import healthRoutes from './routes/healthRoutes.js';
import contractRoutes from './routes/contractRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { ApiError } from './utils/apiError.js';

const app = express();

app.use(
  cors({
    origin: (origin, callback) => {

      if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1') || origin === config.clientUrl) {
        callback(null, true);
      } else {
        callback(new Error('Blocked by CORS policy'));
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(
  clerkMiddleware({
    publishableKey: config.clerkPublishableKey || undefined,
    secretKey: config.clerkSecretKey || undefined,
  })
);

app.use('/api', healthRoutes);

app.use('/api/contracts', contractRoutes);

app.use((req, res, next) => {
  next(ApiError.notFound(`Endpoint ${req.method} ${req.originalUrl} not found.`));
});

app.use(errorHandler);

export default app;
