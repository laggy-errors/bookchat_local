import { Router } from 'express';
import { searchController } from '../controllers/search.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/books', searchController.searchBooks);
router.get('/messages', searchController.searchMessages);

export const searchRoutes = router;
