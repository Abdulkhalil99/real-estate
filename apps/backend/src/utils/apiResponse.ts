import { Response } from 'express';
import { ApiSuccessResponse, ApiErrorResponse } from '../types';

// Send a successful response — always the same shape
export function sendSuccess<T>(
  res: Response,
  data: T,
  message?: string,
  statusCode: number = 200
): void {
  const response: ApiSuccessResponse<T> = {
    success: true,
    data,
    ...(message ? { message } : {}),
  };
  res.status(statusCode).json(response);
}

// Send a created response (201 status)
export function sendCreated<T>(res: Response, data: T, message?: string): void {
  sendSuccess(res, data, message, 201);
}

// Send an error response — always the same shape
export function sendError(
  res: Response,
  error: string,
  statusCode: number = 400,
  details?: unknown
): void {
  // Build the response object step by step — avoids the spread-unknown issue
  const response: ApiErrorResponse & { details?: unknown } = {
    success: false,
    error,
  };

  if (details !== undefined) {
    response.details = details;
  }

  res.status(statusCode).json(response);
}

// Common HTTP error shortcuts
export const HttpError = {
  badRequest: (res: Response, message: string) =>
    sendError(res, message, 400),

  unauthorized: (res: Response, message = 'Unauthorized') =>
    sendError(res, message, 401),

  forbidden: (res: Response, message = 'Forbidden') =>
    sendError(res, message, 403),

  notFound: (res: Response, resource = 'Resource') =>
    sendError(res, `${resource} not found`, 404),

  serverError: (res: Response, message = 'Internal server error') =>
    sendError(res, message, 500),
};