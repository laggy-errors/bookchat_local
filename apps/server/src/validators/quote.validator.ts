import { z } from 'zod';

export const createQuoteSchema = z.object({
  body: z.object({
    bookId: z.string(),
    content: z.string().min(1, 'Quote content cannot be empty'),
    pageNumber: z.number().int().positive().optional().nullable(),
  }),
});

export const updateQuoteSchema = z.object({
  body: z.object({
    content: z.string().min(1, 'Quote content cannot be empty').optional(),
    pageNumber: z.number().int().positive().optional().nullable(),
  }),
  params: z.object({
    quoteId: z.string(),
  }),
});

export const quoteIdParamSchema = z.object({
  params: z.object({
    quoteId: z.string(),
  }),
});
