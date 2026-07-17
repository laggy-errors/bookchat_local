import { z } from 'zod';

export const createAnnotationSchema = z.object({
  body: z.object({
    bookId: z.string(),
    chapter: z.string().optional().nullable(),
    pageNumber: z.number().int().positive().optional().nullable(),
    highlightedText: z.string().optional().nullable(),
    notes: z.string().min(1, 'Annotation notes cannot be empty'),
  }),
});

export const updateAnnotationSchema = z.object({
  body: z.object({
    chapter: z.string().optional().nullable(),
    pageNumber: z.number().int().positive().optional().nullable(),
    highlightedText: z.string().optional().nullable(),
    notes: z.string().min(1, 'Annotation notes cannot be empty').optional(),
  }),
  params: z.object({
    annotationId: z.string(),
  }),
});

export const annotationIdParamSchema = z.object({
  params: z.object({
    annotationId: z.string(),
  }),
});

export const bookIdParamSchema = z.object({
  params: z.object({
    bookId: z.string(),
  }),
});
