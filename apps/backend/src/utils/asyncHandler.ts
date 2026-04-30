import { Request, Response, NextFunction, RequestHandler } from 'express';
import { AuthRequest } from '../types';

// Wraps an async controller function
// so you never need to write try/catch in controllers
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Same but for routes that use AuthRequest (with req.user)
export function asyncAuthHandler(
  fn: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>
): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req as AuthRequest, res, next)).catch(next);
  };
}