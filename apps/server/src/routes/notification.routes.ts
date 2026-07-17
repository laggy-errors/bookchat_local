import { Router } from 'express';
import { notificationController } from '../controllers/notification.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/', notificationController.listNotifications);
router.patch('/:notificationId/read', notificationController.markAsRead);
router.post('/read-all', notificationController.markAllAsRead);

export const notificationRoutes = router;
