import { Response, NextFunction } from 'express';
import { AuthRequest, JwtPayload, UserRole } from '../types';
import { verifyAccessToken } from '../utils/token';
import { HttpError } from '../utils/apiResponse';
import jwt from 'jsonwebtoken';

export function authenticate(req: AuthRequest, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : null;

    if (!token) {
      HttpError.unauthorized(res, 'No token provided');
      return;
    }

    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      HttpError.unauthorized(res, 'Access token expired');
    } else if (error instanceof jwt.JsonWebTokenError) {
      HttpError.unauthorized(res, 'Invalid token');
    } else {
      HttpError.unauthorized(res, 'Authentication failed');
    }
  }
}

export function authorize(...roles: UserRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      HttpError.unauthorized(res);
      return;
    }
    if (!roles.includes(req.user.role)) {
      HttpError.forbidden(res, 'You do not have permission to do this');
      return;
    }
    next();
  };
}