import { Router } from 'express';
import { presenceController } from '../controllers/presence.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/me', presenceController.getMyPresence);
router.put('/me', presenceController.updatePresence);
router.get('/books/:bookId', presenceController.getActiveBookReaders);

export const presenceRoutes = router;
