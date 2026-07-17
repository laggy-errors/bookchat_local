import { z } from 'zod';

export const createBookSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    author: z.string().optional(),
    description: z.string().optional(),
    coverUrl: z.string().url().or(z.string().length(0)).optional(),
    isbn: z.string().optional(),
    coverColor: z.string().optional(),
  }),
});

export const bookIdParamSchema = z.object({
  params: z.object({
    bookId: z.string().min(1),
  }),
});

export const joinBookSchema = z.object({
  body: z.object({
    code: z.string().min(1, 'Join code is required'),
  }),
});
