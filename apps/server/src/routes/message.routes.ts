import { Router } from 'express';
import { messageController } from '../controllers/message.controller';
import { authMiddleware } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createMessageSchema, updateMessageSchema, messageIdParamSchema } from '../validators/message.validator';

const router = Router();

router.use(authMiddleware);

// Nest message routes within a conversation ID context or support global endpoints
router.get('/conversations/:conversationId/messages', messageController.listMessages);
router.post('/conversations/:conversationId/messages', validate(createMessageSchema), messageController.createMessage);
router.patch('/conversations/:conversationId/messages/:messageId', validate(updateMessageSchema), messageController.editMessage);
router.delete('/messages/:messageId', validate(messageIdParamSchema), messageController.deleteMessage);
router.post('/messages/:messageId/read', validate(messageIdParamSchema), messageController.readMessage);

export const messageRoutes = router;
