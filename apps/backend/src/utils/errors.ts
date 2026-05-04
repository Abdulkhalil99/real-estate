// Base class — all our errors extend this
export class AppError extends Error {
  constructor(
    public message:       string,
    public statusCode:    number  = 400,
    public isOperational: boolean = true  // operational = expected error (bad input, not found)
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

// 400 — the client sent bad data
export class ValidationError extends AppError {
  constructor(message: string) { super(message, 400); this.name = 'ValidationError'; }
}

// 401 — not logged in
export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') { super(message, 401); this.name = 'UnauthorizedError'; }
}

// 403 — logged in but not allowed
export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') { super(message, 403); this.name = 'ForbiddenError'; }
}

// 404 — resource does not exist
export class NotFoundError extends AppError {
  constructor(resource = 'Resource') { super(`${resource} not found`, 404); this.name = 'NotFoundError'; }
}

// 409 — conflict (e.g. duplicate email)
export class ConflictError extends AppError {
  constructor(message: string) { super(message, 409); this.name = 'ConflictError'; }
}

// 429 — too many requests
export class RateLimitError extends AppError {
  constructor(message = 'Too many requests') { super(message, 429); this.name = 'RateLimitError'; }
}
