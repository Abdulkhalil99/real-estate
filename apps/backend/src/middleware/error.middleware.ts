import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { logger } from '../utils/logger';
import { env } from '../config/env';

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 400,
    public isOperational: boolean = true
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export function errorMiddleware(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  logger.error({
    message:  err.message,
    stack:    env.isDevelopment ? err.stack : undefined,
    url:      req.url,
    method:   req.method,
  });

  // Our own intentional errors
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ success: false, error: err.message });
    return;
  }

  // Multer file upload errors
  if (err instanceof multer.MulterError) {
    const messages: Record<string, string> = {
      LIMIT_FILE_SIZE:       'File too large. Maximum 5MB per image.',
      LIMIT_FILE_COUNT:      'Too many files. Maximum 10 images per upload.',
      LIMIT_UNEXPECTED_FILE: 'Wrong field name. Use "images" or "avatar".',
    };
    res.status(400).json({
      success: false,
      error: messages[err.code] || err.message,
    });
    return;
  }

  // Prisma known errors
  if (err.constructor.name === 'PrismaClientKnownRequestError') {
    const prismaErr = err as { code?: string };
    if (prismaErr.code === 'P2002') {
      res.status(409).json({ success: false, error: 'This record already exists' });
      return;
    }
    if (prismaErr.code === 'P2025') {
      res.status(404).json({ success: false, error: 'Record not found' });
      return;
    }
  }

  // Unknown errors
  res.status(500).json({
    success: false,
    error: env.isProduction ? 'Internal server error' : err.message,
    ...(env.isDevelopment && { stack: err.stack }),
  });
}