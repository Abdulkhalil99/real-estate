import { z } from 'zod';

export const createInquirySchema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .trim()
    .min(2, 'Name must be at least 2 characters'),

  email: z
    .string({ required_error: 'Email is required' })
    .email('Please enter a valid email')
    .toLowerCase()
    .trim(),

  phone: z.string().trim().optional(),

  message: z
    .string({ required_error: 'Message is required' })
    .trim()
    .min(10, 'Message must be at least 10 characters')
    .max(1000, 'Message cannot exceed 1000 characters'),

  propertyId: z
    .string({ required_error: 'Property ID is required' })
    .min(1),
});

export const updateInquiryStatusSchema = z.object({
  status: z.enum(['NEW', 'CONTACTED', 'CLOSED'], {
    required_error: 'Status is required',
  }),
});

export type CreateInquiryDto        = z.infer<typeof createInquirySchema>;
export type UpdateInquiryStatusDto  = z.infer<typeof updateInquiryStatusSchema>;