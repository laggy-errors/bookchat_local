import { Router } from 'express';
import { bookmarkController } from '../controllers/bookmark.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/:id/bookmarks', bookmarkController.listConversationBookmarks);
router.post('/:id/bookmarks', bookmarkController.createConversationBookmark);
router.delete('/:id/bookmarks/:bookmarkId', bookmarkController.deleteConversationBookmark);

export const conversationRoutes = router;
