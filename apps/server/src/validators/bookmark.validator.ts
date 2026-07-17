import { z } from 'zod';

export const createBookmarkSchema = z.object({
  body: z.object({
    bookId: z.string().optional(),
    messageId: z.string().uuid().optional(),
    pageNumber: z.number().int().positive().optional(),
    notes: z.string().optional(),
  }),
});

export const bookmarkIdParamSchema = z.object({
  params: z.object({
    bookmarkId: z.string().uuid(),
  }),
});
