import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import hpp from 'hpp';
import { CONSTANTS } from '../config/constants';

// ── Helmet ────────────────────────────────────────────────────────────────────
// Adds ~14 security-related HTTP response headers automatically
export const helmetMiddleware = helmet({
  // Allow images from our upload server
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  // Content Security Policy — controls what resources the browser can load
  contentSecurityPolicy: {
    directives: {
      defaultSrc:  ["'self'"],
      imgSrc:      ["'self'", 'data:', 'https:', 'http:'],
      scriptSrc:   ["'self'"],
      styleSrc:    ["'self'", "'unsafe-inline'"],
    },
  },
});

// ── HPP — HTTP Parameter Pollution protection ─────────────────────────────────
// Prevents attackers from sending duplicate query params like ?status=SOLD&status=FOR_SALE
export const hppMiddleware = hpp();

// ── General API rate limit ────────────────────────────────────────────────────
// 100 requests per 15 minutes per IP
export const apiRateLimit = rateLimit({
  windowMs: CONSTANTS.RATE_LIMIT_WINDOW_MS,
  max:      CONSTANTS.RATE_LIMIT_MAX_REQUESTS,
  message:  { success: false, error: 'Too many requests. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders:   false,
});

// ── Strict rate limit for auth routes ────────────────────────────────────────
// Prevents brute-force login attacks — 10 attempts per 15 minutes
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      10,
  message:  { success: false, error: 'Too many login attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders:   false,
});

// ── Request size logger ───────────────────────────────────────────────────────
// Log large requests — useful for detecting abuse
export function requestLogger(req: Request, _res: Response, next: NextFunction): void {
  const contentLength = req.headers['content-length'];
  if (contentLength && parseInt(contentLength) > 1024 * 1024) {
    // Log requests over 1MB
    console.warn(`Large request: ${req.method} ${req.path} (${contentLength} bytes)`);
  }
  next();
}
