import { z } from 'zod';

// ─── CREATE ───────────────────────────────────────────────────────────────────
export const createPropertySchema = z.object({
  title: z
    .string({ required_error: 'Title is required' })
    .trim()
    .min(5,   'Title must be at least 5 characters')
    .max(200, 'Title cannot exceed 200 characters'),

  description: z
    .string({ required_error: 'Description is required' })
    .trim()
    .min(20, 'Description must be at least 20 characters'),

  price: z
    .number({ required_error: 'Price is required', invalid_type_error: 'Price must be a number' })
    .positive('Price must be a positive number')
    .max(100_000_000, 'Price seems too high'),

  status: z.enum(
    ['FOR_SALE', 'FOR_RENT', 'SOLD', 'RENTED'],
    { required_error: 'Status is required' }
  ),

  type: z.enum(
    ['HOUSE', 'APARTMENT', 'CONDO', 'LAND', 'COMMERCIAL'],
    { required_error: 'Property type is required' }
  ),

  // Location
  address: z.string({ required_error: 'Address is required' }).trim().min(5),
  city:    z.string({ required_error: 'City is required'    }).trim().min(2),
  state:   z.string({ required_error: 'State is required'   }).trim().min(2),
  zipCode: z.string({ required_error: 'Zip code is required'}).trim().min(4),
  country: z.string().trim().default('Tunisia'),

  // Details
  bedrooms:  z
    .number({ invalid_type_error: 'Bedrooms must be a number' })
    .int('Bedrooms must be a whole number')
    .min(0).max(20),

  bathrooms: z
    .number({ invalid_type_error: 'Bathrooms must be a number' })
    .min(0).max(20),

  area: z
    .number({ required_error: 'Area is required', invalid_type_error: 'Area must be a number' })
    .positive('Area must be positive'),

  yearBuilt: z
    .number()
    .int()
    .min(1800, 'Year built seems too old')
    .max(new Date().getFullYear() + 1, 'Year built cannot be in the future')
    .optional(),

  featured: z.boolean().default(false),

  // Images — array of URLs
  images: z
    .array(z.string().url('Each image must be a valid URL'))
    .max(20, 'Maximum 20 images allowed')
    .default([]),
});

// ─── UPDATE ───────────────────────────────────────────────────────────────────
// Every field is optional for updates
export const updatePropertySchema = createPropertySchema.partial();

// ─── STATUS UPDATE ────────────────────────────────────────────────────────────
export const updateStatusSchema = z.object({
  status: z.enum(['FOR_SALE', 'FOR_RENT', 'SOLD', 'RENTED'], {
    required_error: 'Status is required',
  }),
});

// ─── QUERY PARAMS ─────────────────────────────────────────────────────────────
export const propertyQuerySchema = z.object({
  page:      z.string().optional().default('1'),
  limit:     z.string().optional().default('10'),
  city:      z.string().optional(),
  state:     z.string().optional(),
  status:    z.enum(['FOR_SALE', 'FOR_RENT', 'SOLD', 'RENTED']).optional(),
  type:      z.enum(['HOUSE', 'APARTMENT', 'CONDO', 'LAND', 'COMMERCIAL']).optional(),
  minPrice:  z.string().optional(),
  maxPrice:  z.string().optional(),
  bedrooms:  z.string().optional(),
  featured:  z.string().optional(),
  sortBy:    z.enum(['price', 'createdAt', 'area', 'bedrooms']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  q:         z.string().optional(),   // full-text search
});

// ─── TYPES ────────────────────────────────────────────────────────────────────
export type CreatePropertyDto  = z.infer<typeof createPropertySchema>;
export type UpdatePropertyDto  = z.infer<typeof updatePropertySchema>;
export type UpdateStatusDto    = z.infer<typeof updateStatusSchema>;
export type PropertyQueryDto   = z.infer<typeof propertyQuerySchema>;