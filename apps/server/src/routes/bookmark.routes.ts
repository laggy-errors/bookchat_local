import { Router } from 'express';
import { bookmarkController } from '../controllers/bookmark.controller';
import { authMiddleware } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createBookmarkSchema, bookmarkIdParamSchema } from '../validators/bookmark.validator';

const router = Router();

router.use(authMiddleware);

router.get('/', bookmarkController.listBookmarks);
router.post('/', validate(createBookmarkSchema), bookmarkController.createBookmark);
router.delete('/:bookmarkId', validate(bookmarkIdParamSchema), bookmarkController.deleteBookmark);

export const bookmarkRoutes = router;
