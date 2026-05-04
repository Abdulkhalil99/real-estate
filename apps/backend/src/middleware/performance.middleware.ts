import { Request, Response, NextFunction } from 'express';
import compression from 'compression';

// Compress all responses over 1KB
// Skip compression for small responses — overhead is not worth it
export const compressionMiddleware = compression({
  filter: (req: Request, res: Response) => {
    // Do not compress if client says no
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  },
  level: 6,     // compression level 1-9 (6 = good balance of speed vs size)
  threshold: 1024, // only compress responses > 1KB
});

// Add cache headers to static/read-only responses
// This tells browsers and CDNs to cache responses
export function cacheHeaders(req: Request, res: Response, next: NextFunction): void {
  // Public GET responses can be cached for 60 seconds
  if (req.method === 'GET' && !req.headers.authorization) {
    res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=30');
  } else {
    // Authenticated or mutating requests — no caching
    res.setHeader('Cache-Control', 'no-store');
  }
  next();
}

// Measure and log response time
export function responseTime(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    // Log slow responses (over 1 second) as warnings
    if (duration > 1000) {
      console.warn(`Slow response: ${req.method} ${req.path} took ${duration}ms`);
    }
  });
  next();
}
