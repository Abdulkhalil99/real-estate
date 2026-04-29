// ─── PROPERTY TYPES ───────────────────────────────────────────────────────────
export type PropertyStatus = 'FOR_SALE' | 'FOR_RENT' | 'SOLD' | 'RENTED';
export type PropertyType = 'HOUSE' | 'APARTMENT' | 'CONDO' | 'LAND' | 'COMMERCIAL';

export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  status: PropertyStatus;
  type: PropertyType;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  bedrooms: number;
  bathrooms: number;
  area: number;          // square meters
  images: string[];      // array of image URLs
  createdAt: string;
  updatedAt: string;
}

// ─── USER TYPES ───────────────────────────────────────────────────────────────
export type UserRole = 'ADMIN' | 'AGENT' | 'USER';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
  createdAt: string;
}

// ─── API RESPONSE TYPES ───────────────────────────────────────────────────────
// Every API response follows this shape — consistent and predictable
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ─── INQUIRY TYPES ────────────────────────────────────────────────────────────
export interface Inquiry {
  id: string;
  propertyId: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  status: 'NEW' | 'CONTACTED' | 'CLOSED';
  createdAt: string;
}