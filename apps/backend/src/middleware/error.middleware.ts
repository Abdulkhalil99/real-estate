import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { logger } from '../utils/logger';
import { env } from '../config/env';
import { AppError } from '../utils/errors';

// Re-export AppError so other files can import from one place
export { AppError } from '../utils/errors';

export function errorMiddleware(
  err:  Error,
  req:  Request,
  res:  Response,
  _next: NextFunction
): void {
  // Always log — include request context so we can reproduce the issue
  logger.error({
    message: err.message,
    name:    err.name,
    url:     req.url,
    method:  req.method,
    ip:      req.ip,
    stack:   env.isDevelopment ? err.stack : undefined,
  });

  // ── Our own intentional errors ───────────────────────────────────────────
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ success: false, error: err.message });
    return;
  }

  // ── Multer file upload errors ─────────────────────────────────────────────
  if (err instanceof multer.MulterError) {
    const messages: Record<string, string> = {
      LIMIT_FILE_SIZE:       'File too large. Maximum 5MB.',
      LIMIT_FILE_COUNT:      'Too many files. Maximum 10.',
      LIMIT_UNEXPECTED_FILE: 'Wrong field name. Use "images" or "avatar".',
    };
    res.status(400).json({ success: false, error: messages[err.code] || err.message });
    return;
  }

  // ── Prisma errors ─────────────────────────────────────────────────────────
  // P2002 = unique constraint failed (duplicate email etc.)
  // P2025 = record not found
  const prismaErr = err as { code?: string; meta?: { target?: string[] } };
  if (prismaErr.code === 'P2002') {
    const field = prismaErr.meta?.target?.[0] || 'field';
    res.status(409).json({ success: false, error: `${field} already exists` });
    return;
  }
  if (prismaErr.code === 'P2025') {
    res.status(404).json({ success: false, error: 'Record not found' });
    return;
  }

  // ── JWT errors ────────────────────────────────────────────────────────────
  if (err.name === 'JsonWebTokenError') {
    res.status(401).json({ success: false, error: 'Invalid token' });
    return;
  }
  if (err.name === 'TokenExpiredError') {
    res.status(401).json({ success: false, error: 'Token expired' });
    return;
  }

  // ── Zod validation errors ─────────────────────────────────────────────────
  if (err.name === 'ZodError') {
    const zodErr = (err as unknown) as { errors: { path: (string | number)[]; message: string }[] };
    const details = zodErr.errors.map((e) => ({
      field:   e.path.join('.'),
      message: e.message,
    }));
    res.status(422).json({ success: false, error: 'Validation failed', details });
    return;
  }

  // ── Syntax error in JSON body ─────────────────────────────────────────────
  if (err instanceof SyntaxError && 'body' in err) {
    res.status(400).json({ success: false, error: 'Invalid JSON in request body' });
    return;
  }

  // ── Unknown / unexpected error ────────────────────────────────────────────
  // Never expose internal details in production
  res.status(500).json({
    success: false,
    error:   env.isProduction ? 'Internal server error' : err.message,
    ...(env.isDevelopment && { stack: err.stack }),
  });
}

// Catch unhandled promise rejections and exceptions
// These would otherwise crash the Node process silently
export function setupProcessHandlers(): void {
  process.on('unhandledRejection', (reason: unknown) => {
    logger.error('Unhandled promise rejection:', reason);
    // In production, crash and let the process manager restart
    if (env.isProduction) process.exit(1);
  });

  process.on('uncaughtException', (err: Error) => {
    logger.error('Uncaught exception:', err);
    process.exit(1);
  });
}
