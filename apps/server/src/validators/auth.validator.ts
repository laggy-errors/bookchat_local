import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters long'),
    username: z.string().min(3, 'Username must be at least 3 characters long').optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string(),
  }),
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string(),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string(),
    password: z.string().min(8, 'Password must be at least 8 characters long'),
  }),
});

export const requestVerificationSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
  }),
});

export const verifyEmailSchema = z.object({
  body: z.object({
    token: z.string(),
  }),
});

