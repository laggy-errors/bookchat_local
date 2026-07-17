import { Router } from 'express';
import { chatController } from '../controllers/chat.controller';
import { authMiddleware } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createConversationSchema, conversationIdParamSchema } from '../validators/chat.validator';

const router = Router();

router.use(authMiddleware);

router.get('/', chatController.listConversations);
router.get('/:conversationId', validate(conversationIdParamSchema), chatController.getConversation);
router.post('/', validate(createConversationSchema), chatController.createConversation);

export const chatRoutes = router;
