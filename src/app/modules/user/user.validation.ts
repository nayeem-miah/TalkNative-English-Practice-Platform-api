import { z } from 'zod';

const createUserValidationSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),

  role: z.enum(['USER', 'ADMIN']).default('USER'),
});

const updateUserValidationSchema = z
  .object({
    name: z.string().min(1).optional(),
    email: z.string().email().optional(),
    oldPassword: z.string().min(6).optional(),
    newPassword: z.string().min(6).optional(),
    phone: z.string().optional(),
    nativeLanguage: z.string().optional(),
    learningLanguage: z.string().optional(),
    bio: z.string().optional(),
  })
  .refine((data) => !(data.newPassword && !data.oldPassword), {
    message: 'Old password is required to set a new password',
    path: ['oldPassword'],
  });

export const userValidation = {
  createUserValidationSchema,
  updateUserValidationSchema,
};
