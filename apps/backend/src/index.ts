import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import { env } from './config/env';
import { CONSTANTS } from './config/constants';
import { logger } from './utils/logger';
import routes from './routes/index';
import { errorMiddleware } from './middleware/error.middleware';
import { HttpError } from './utils/apiResponse';

import path from 'path';
import uploadRoutes from './routes/upload.routes';

const app: Application = express();

// ─── SECURITY MIDDLEWARE ──────────────────────────────────────────────────────
app.use(helmet());

app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

const limiter = rateLimit({
  windowMs: CONSTANTS.RATE_LIMIT_WINDOW_MS,
  max: CONSTANTS.RATE_LIMIT_MAX_REQUESTS,
  message: { success: false, error: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(CONSTANTS.API_PREFIX, limiter);

// ─── PARSING MIDDLEWARE ───────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── LOGGING MIDDLEWARE ───────────────────────────────────────────────────────
// Skip logging in test environment so tests are clean
if (!env.isTest) {
  app.use(morgan('dev', {
    stream: { write: (message) => logger.http(message.trim()) },
  }));
}

// ─── HEALTH CHECK ─────────────────────────────────────────────────────────────
// This is at root level (not under /api/v1) so Docker/infra can hit it easily
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    version: '1.0.0',
  });
});

// ─── API ROUTES ───────────────────────────────────────────────────────────────
app.use(CONSTANTS.API_PREFIX, routes);

// ADD after the existing app.use(CONSTANTS.API_PREFIX, routes) line:

// Serve uploaded images as static files
// This makes http://localhost:5000/uploads/properties/file.jpg work
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Register upload routes
// Note: upload routes are separate because they use multer middleware
app.use(`${CONSTANTS.API_PREFIX}/upload`, uploadRoutes);

// ─── 404 HANDLER ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  HttpError.notFound(res, `Route ${req.method} ${req.path}`);
});

// ─── ERROR HANDLER ────────────────────────────────────────────────────────────
// MUST be last — Express identifies error handlers by 4 parameters
app.use(errorMiddleware);

// ─── START SERVER ─────────────────────────────────────────────────────────────
if (require.main === module) {
  app.listen(env.PORT, () => {
    logger.info(`Server running in ${env.NODE_ENV} mode`);
    logger.info(`Health:     http://localhost:${env.PORT}/health`);
    logger.info(`API:        http://localhost:${env.PORT}${CONSTANTS.API_PREFIX}`);
    logger.info(`Auth:       http://localhost:${env.PORT}${CONSTANTS.API_PREFIX}/auth`);
    logger.info(`Properties: http://localhost:${env.PORT}${CONSTANTS.API_PREFIX}/properties`);
  });
}

export default app;