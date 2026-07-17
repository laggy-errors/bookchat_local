import { z } from 'zod';

export const updateProfileSchema = z.object({
  body: z.object({
    displayName: z.string().min(1).optional(),
    bio: z.string().max(500).optional(),
    avatarUrl: z.string().url().optional().or(z.literal('')),
  }),
});

export const userIdParamSchema = z.object({
  params: z.object({
    userId: z.string().uuid(),
  }),
});
