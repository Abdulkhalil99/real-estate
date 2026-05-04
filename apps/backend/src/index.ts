import express, { Application } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

import { env } from './config/env';
import { CONSTANTS } from './config/constants';
import { logger, morganStream } from './utils/logger';
import routes from './routes/index';
import uploadRoutes from './routes/upload.routes';
import { errorMiddleware, setupProcessHandlers } from './middleware/error.middleware';
import { helmetMiddleware, hppMiddleware, apiRateLimit, authRateLimit } from './middleware/security.middleware';
import { compressionMiddleware, cacheHeaders, responseTime } from './middleware/performance.middleware';
import { HttpError } from './utils/apiResponse';

// Handle crashes gracefully
setupProcessHandlers();

const app: Application = express();

// ── Performance ───────────────────────────────────────────────────────────────
app.use(compressionMiddleware);
app.use(responseTime);

// ── Security ──────────────────────────────────────────────────────────────────
app.use(helmetMiddleware);
app.use(hppMiddleware);
app.use(cors({
  origin:       env.FRONTEND_URL,
  credentials:  true,
  methods:      ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Parsing ───────────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Logging ───────────────────────────────────────────────────────────────────
if (!env.isTest) {
  app.use(morgan(
    env.isDevelopment ? 'dev' : 'combined',
    { stream: { write: (msg: string) => morganStream(msg) } }
  ));
}

// ── Static files ──────────────────────────────────────────────────────────────
// Serve uploaded images publicly
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// ── Health check ──────────────────────────────────────────────────────────────
// Not rate-limited so monitoring tools can always reach it
app.get('/health', (_req, res) => {
  res.json({
    status:      'ok',
    timestamp:   new Date().toISOString(),
    environment: env.NODE_ENV,
    version:     process.env.npm_package_version || '1.0.0',
    uptime:      Math.floor(process.uptime()) + 's',
  });
});

// ── API routes ────────────────────────────────────────────────────────────────
// Apply stricter rate limit to auth endpoints
app.use(`${CONSTANTS.API_PREFIX}/auth`, authRateLimit);

// General rate limit for all API routes
app.use(CONSTANTS.API_PREFIX, apiRateLimit);

// Cache headers for public GET requests
app.use(cacheHeaders);

// Mount routes
app.use(CONSTANTS.API_PREFIX, routes);
app.use(`${CONSTANTS.API_PREFIX}/upload`, uploadRoutes);

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  HttpError.notFound(res, `Route ${req.method} ${req.path}`);
});

// ── Error handler ─────────────────────────────────────────────────────────────
// Must be LAST — Express detects error handlers by 4 parameters
app.use(errorMiddleware);

// ── Start server ──────────────────────────────────────────────────────────────
if (require.main === module) {
  app.listen(env.PORT, () => {
    logger.info(`Server started in ${env.NODE_ENV} mode`);
    logger.info(`Health:     http://localhost:${env.PORT}/health`);
    logger.info(`API:        http://localhost:${env.PORT}${CONSTANTS.API_PREFIX}`);
    logger.info(`Uploads:    http://localhost:${env.PORT}/uploads`);
  });
}

export default app;
