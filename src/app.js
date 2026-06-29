import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import logger from './config/logger.js';
import { errorHandler } from './middlewares/error.middleware.js';
import healthRouter from './routes/health.routes.js';

const app = express();

// Global Middlewares
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));

// Request Logger Middleware
app.use((req, res, next) => {
  logger.http(`${req.method} ${req.originalUrl}`);
  next();
});

// Routes Declaration
app.use('/api/v1/health', healthRouter);

// Global Error Handler Middleware (MUST be last)
app.use(errorHandler);

export { app };
