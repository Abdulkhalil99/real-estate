import { Request } from 'express';

// ─── USER TYPES ───────────────────────────────────────────────────────────────
export type UserRole = 'ADMIN' | 'AGENT' | 'USER';

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

// Extends Express's Request type so req.user is available after auth middleware
export interface AuthRequest extends Request {
  user?: JwtPayload;
}

// ─── PROPERTY TYPES ───────────────────────────────────────────────────────────
export type PropertyStatus = 'FOR_SALE' | 'FOR_RENT' | 'SOLD' | 'RENTED';
export type PropertyType   = 'HOUSE' | 'APARTMENT' | 'CONDO' | 'LAND' | 'COMMERCIAL';

// ─── API TYPES ────────────────────────────────────────────────────────────────
export interface PaginationQuery {
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PropertyQuery extends PaginationQuery {
  city?: string;
  minPrice?: string;
  maxPrice?: string;
  type?: PropertyType;
  status?: PropertyStatus;
  bedrooms?: string;
}

// ─── RESPONSE TYPES ───────────────────────────────────────────────────────────
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  details?: unknown;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface PaginatedData<T> {
  items: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}