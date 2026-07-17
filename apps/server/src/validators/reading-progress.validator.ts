import { z } from 'zod';

export const updateReadingProgressSchema = z.object({
  body: z.object({
    bookId: z.string(),
    pagesRead: z.number().int().nonnegative().optional(),
    chaptersCompleted: z.number().int().nonnegative().optional(),
    readingTime: z.number().int().nonnegative().optional(), // in minutes
  }),
});

export const getReadingProgressSchema = z.object({
  params: z.object({
    bookId: z.string(),
  }),
});
