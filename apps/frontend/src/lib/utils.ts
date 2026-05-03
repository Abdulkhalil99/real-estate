import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { PropertyStatus, PropertyType } from '@/types';

export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

export function formatPrice(price: number, status?: PropertyStatus): string {
  const f = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'TND', maximumFractionDigits: 0 }).format(price);
  return status === 'FOR_RENT' ? f + '/mo' : f;
}

export function formatArea(area: number): string { return area.toLocaleString() + ' m²'; }

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function getStatusConfig(status: PropertyStatus): { label: string; className: string } {
  const map: Record<PropertyStatus, { label: string; className: string }> = {
    FOR_SALE: { label: 'For Sale', className: 'badge-sale'   },
    FOR_RENT: { label: 'For Rent', className: 'badge-rent'   },
    SOLD:     { label: 'Sold',     className: 'badge-sold'   },
    RENTED:   { label: 'Rented',   className: 'badge-rented' },
  };
  return map[status];
}

export function getTypeLabel(type: PropertyType): string {
  const map: Record<PropertyType, string> = {
    HOUSE: 'House', APARTMENT: 'Apartment', CONDO: 'Condo', LAND: 'Land', COMMERCIAL: 'Commercial',
  };
  return map[type];
}

export function getPrimaryImage(images: { url: string; isPrimary?: boolean }[]): string {
  if (!images || images.length === 0) return 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800';
  return images.find((i) => i.isPrimary)?.url ?? images[0].url;
}
