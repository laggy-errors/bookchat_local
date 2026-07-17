import { z } from 'zod';

export const createMessageSchema = z.object({
  body: z.object({
    id: z.string().optional(),
    content: z.string().min(1, 'Message content cannot be empty'),
    messageType: z.string().default('TEXT'),
    replyToId: z.string().nullable().optional(),
  }),
  params: z.object({
    conversationId: z.string(),
  }),
});

export const updateMessageSchema = z.object({
  body: z.object({
    content: z.string().min(1, 'Message content cannot be empty'),
  }),
  params: z.object({
    conversationId: z.string(),
    messageId: z.string(),
  }),
});

export const messageIdParamSchema = z.object({
  params: z.object({
    messageId: z.string(),
  }),
});
