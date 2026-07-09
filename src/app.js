import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import logger from './config/logger.js';
import { errorHandler } from './middlewares/error.middleware.js';
import healthRouter from './routes/health.routes.js';
import cookieParser from 'cookie-parser';
import authRouter from './routes/auth.routes.js';
import roleRouter from './routes/role.routes.js';
import permissionRouter from './routes/permission.routes.js';
import organizationRouter from './routes/organization.routes.js';
import userRouter from './routes/user.routes.js';

const app = express();

// Global Middlewares
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded());
app.use(cookieParser());
app.use('/uploads', express.static('public/uploads'));

// Request Logger Middleware
app.use((req, res, next) => {
  logger.http(`${req.method} ${req.originalUrl}`);
  next();
});

// Routes Declaration
app.use('/api/v1/health', healthRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/roles', roleRouter);
app.use('/api/v1/permissions', permissionRouter);
app.use('/api/v1/organizations', organizationRouter);
app.use('/api/v1/users', userRouter);

// Global Error Handler Middleware (MUST be last)
app.use(errorHandler);

export { app };
