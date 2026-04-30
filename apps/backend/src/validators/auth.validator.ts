import { z } from 'zod';

export const registerSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .email('Please enter a valid email')
    .toLowerCase()
    .trim(),
  password: z
    .string({ required_error: 'Password is required' })
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain uppercase, lowercase, and a number'
    ),
  firstName: z.string({ required_error: 'First name is required' }).trim().min(2).max(50),
  lastName:  z.string({ required_error: 'Last name is required' }).trim().min(2).max(50),
  phone:     z.string().optional(),
});

export const loginSchema = z.object({
  email:    z.string({ required_error: 'Email is required' }).email().toLowerCase().trim(),
  password: z.string({ required_error: 'Password is required' }).min(1),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string({ required_error: 'Refresh token is required' }).min(1),
});

export const updateProfileSchema = z.object({
  firstName: z.string().trim().min(2).max(50).optional(),
  lastName:  z.string().trim().min(2).max(50).optional(),
  phone:     z.string().optional(),
  avatar:    z.string().url('Avatar must be a valid URL').optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string({ required_error: 'Current password is required' }).min(1),
  newPassword: z
    .string({ required_error: 'New password is required' })
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain uppercase, lowercase, and a number'
    ),
});

export type RegisterDto      = z.infer<typeof registerSchema>;
export type LoginDto         = z.infer<typeof loginSchema>;
export type RefreshTokenDto  = z.infer<typeof refreshTokenSchema>;
export type UpdateProfileDto = z.infer<typeof updateProfileSchema>;
export type ChangePasswordDto = z.infer<typeof changePasswordSchema>;