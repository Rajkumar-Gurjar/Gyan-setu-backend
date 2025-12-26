import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  language: z.enum(['pa', 'hi', 'en']).default('pa'),
  schoolCode: z.string().min(1),
  class: z.number().optional(),
  section: z.string().optional(),
  role: z.enum(['student', 'teacher', 'admin']).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});
