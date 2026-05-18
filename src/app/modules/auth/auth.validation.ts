import { z } from 'zod';

const verifyEmailValidationSchema = z.object({
  email: z.string().email('Invalid email address'),
  code: z.string().length(6, 'Verification code must be exactly 6 digits'),
});

const resendOtpValidationSchema = z.object({
  email: z.string().email('Invalid email address'),
});

const loginValidationSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const forgotPasswordValidationSchema = z.object({
  email: z.string().email('Invalid email address'),
});

const resetPasswordValidationSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

export const AuthValidation = {
  verifyEmailValidationSchema,
  resendOtpValidationSchema,
  loginValidationSchema,
  forgotPasswordValidationSchema,
  resetPasswordValidationSchema,
};
