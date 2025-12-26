import { z } from 'zod';
import { registerSchema, loginSchema } from '../validation/schemas/Auth.schema';

export type RegisterBody = z.infer<typeof registerSchema>;
export type LoginBody = z.infer<typeof loginSchema>;
