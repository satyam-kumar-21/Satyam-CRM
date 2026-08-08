import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { apiRateLimiter } from './middlewares/rateLimiter';
import { errorHandler } from './middlewares/errorMiddleware';
import superAdminRoutes from './routes/superAdminRoutes'

const app: Application = express();

// Security Middlewares
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  })
);

// Standard Middlewares
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/api', apiRateLimiter);
app.use('/api/v1/super-admin', superAdminRoutes )

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Global Error Handler
app.use(errorHandler);

export default app;