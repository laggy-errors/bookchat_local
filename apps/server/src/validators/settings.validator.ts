import { z } from 'zod';

export const updateThemeSchema = z.object({
  body: z.object({
    themeName: z.string().min(1).optional(),
    fontSize: z.enum(['small', 'medium', 'large']).optional(),
    reducedMotion: z.boolean().optional(),
    highContrast: z.boolean().optional(),
    largeText: z.boolean().optional(),
    masterMute: z.boolean().optional(),
    uiVolume: z.number().min(0).max(1).optional(),
    writingVolume: z.number().min(0).max(1).optional(),
    ambienceVolume: z.number().min(0).max(1).optional(),
  }),
});
