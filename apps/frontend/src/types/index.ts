export type UserRole       = 'ADMIN' | 'AGENT' | 'USER';
export type PropertyStatus = 'FOR_SALE' | 'FOR_RENT' | 'SOLD' | 'RENTED';
export type PropertyType   = 'HOUSE' | 'APARTMENT' | 'CONDO' | 'LAND' | 'COMMERCIAL';
export type InquiryStatus  = 'NEW' | 'CONTACTED' | 'CLOSED';

export interface User {
  id: string; email: string; firstName: string; lastName: string;
  role: UserRole; phone?: string; avatar?: string; createdAt: string;
  _count?: { properties: number; inquiries: number };
}

export interface PropertyImage {
  id: string; url: string; alt?: string; isPrimary: boolean; order: number;
}

export interface Agent {
  id: string; firstName: string; lastName: string; phone?: string; email?: string; avatar?: string;
}

export interface Property {
  id: string; title: string; description: string; price: number;
  status: PropertyStatus; type: PropertyType; address: string;
  city: string; state: string; zipCode: string; country: string;
  bedrooms: number; bathrooms: number; area: number; yearBuilt?: number;
  featured: boolean; agentId: string; agent: Agent; images: PropertyImage[];
  createdAt: string; updatedAt: string;
  _count?: { inquiries: number };
}

export interface Inquiry {
  id: string; name: string; email: string; phone?: string; message: string;
  status: InquiryStatus; propertyId: string;
  property?: { id: string; title: string; city: string };
  createdAt: string;
}

export interface Pagination {
  total: number; page: number; limit: number;
  totalPages: number; hasNextPage: boolean; hasPrevPage: boolean;
}

export interface PaginatedResponse<T> { items: T[]; pagination: Pagination; }

export interface PropertyFilters {
  page?: number; limit?: number; city?: string;
  status?: PropertyStatus; type?: PropertyType;
  minPrice?: number; maxPrice?: number; bedrooms?: number;
  featured?: boolean; sortBy?: string; sortOrder?: 'asc' | 'desc'; q?: string;
}

export interface AuthResponse {
  user: User; accessToken: string; refreshToken: string;
}

export interface PropertyStats {
  total: number; forSale: number; forRent: number;
  sold: number; rented: number; featured: number;
}
