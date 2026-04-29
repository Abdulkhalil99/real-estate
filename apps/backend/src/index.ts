import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

// Load environment variables from .env file
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

// ─── MIDDLEWARE ───────────────────────────────────────────────────────────────
// helmet: adds security headers to every response
app.use(helmet());

// cors: allows our frontend (on port 3000) to talk to this backend
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

// morgan: logs every request to the console (very useful for debugging)
app.use(morgan('dev'));

// express.json: lets us read JSON from request bodies
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// rateLimit: protects against too many requests from one IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                  // max 100 requests per window
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api', limiter);

// ─── ROUTES ───────────────────────────────────────────────────────────────────
// Health check — lets Docker and CI know the server is alive
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Placeholder — we will add real routes in the next step
app.get('/api', (req: Request, res: Response) => {
  res.json({ message: 'Real Estate Platform API v1.0' });
});

// ─── 404 HANDLER ─────────────────────────────────────────────────────────────
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// ─── ERROR HANDLER ───────────────────────────────────────────────────────────
// This catches any unhandled errors from routes
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({
    error: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message,
  });
});

// ─── START ────────────────────────────────────────────────────────────────────
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`
  ┌─────────────────────────────────────┐
  │  Server running on port ${PORT}        │
  │  Health: http://localhost:${PORT}/health │
  │  API:    http://localhost:${PORT}/api    │
  └─────────────────────────────────────┘
    `);
  });
}

export default app;