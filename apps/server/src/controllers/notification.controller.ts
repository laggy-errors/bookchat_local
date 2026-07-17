import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { notificationService } from '../services/notification.service';
import { UnauthorizedError } from '../utils/errors';

export class NotificationController {
  async listNotifications(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) throw new UnauthorizedError();

      const notifications = await notificationService.listNotifications(userId);
      res.status(200).json({
        status: 'success',
        data: notifications,
      });
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) throw new UnauthorizedError();

      const { notificationId } = req.params;
      await notificationService.markAsRead(notificationId, userId);
      res.status(200).json({
        status: 'success',
        message: 'Notification marked as read',
      });
    } catch (error) {
      next(error);
    }
  }

  async markAllAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) throw new UnauthorizedError();

      await notificationService.markAllAsRead(userId);
      res.status(200).json({
        status: 'success',
        message: 'All notifications marked as read',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const notificationController = new NotificationController();
