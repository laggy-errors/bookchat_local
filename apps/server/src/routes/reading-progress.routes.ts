import { Router } from 'express';
import { readingProgressController } from '../controllers/reading-progress.controller';
import { authMiddleware } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  updateReadingProgressSchema,
  getReadingProgressSchema,
} from '../validators/reading-progress.validator';

const router = Router();

router.use(authMiddleware);

router.get('/', readingProgressController.listReadingProgress);
router.get('/:bookId', validate(getReadingProgressSchema), readingProgressController.getReadingProgress);
router.post('/', validate(updateReadingProgressSchema), readingProgressController.updateReadingProgress);
router.delete('/:bookId', validate(getReadingProgressSchema), readingProgressController.deleteReadingProgress);

export const readingProgressRoutes = router;
