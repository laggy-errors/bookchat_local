import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { presenceService } from '../services/presence.service';
import { UnauthorizedError } from '../utils/errors';

export class PresenceController {
  async getMyPresence(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) throw new UnauthorizedError();

      const presence = await presenceService.getPresence(userId);
      res.status(200).json({
        status: 'success',
        data: presence,
      });
    } catch (error) {
      next(error);
    }
  }

  async updatePresence(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) throw new UnauthorizedError();

      const presence = await presenceService.updatePresence(userId, req.body);
      res.status(200).json({
        status: 'success',
        data: presence,
      });
    } catch (error) {
      next(error);
    }
  }

  async getActiveBookReaders(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { bookId } = req.params;
      const readers = await presenceService.getActiveReadersInBook(bookId);
      res.status(200).json({
        status: 'success',
        data: readers,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const presenceController = new PresenceController();
