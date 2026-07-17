import { z } from 'zod';

export const createConversationSchema = z.object({
  body: z.object({
    id: z.string().optional(),
    title: z.string().min(1, 'Title is required'),
    type: z.enum(['DIRECT', 'GROUP']).default('GROUP'),
    bookId: z.string().optional(),
    participantUserIds: z.array(z.string()).min(1, 'At least one participant is required'),
  }),
});

export const conversationIdParamSchema = z.object({
  params: z.object({
    conversationId: z.string(),
  }),
});
