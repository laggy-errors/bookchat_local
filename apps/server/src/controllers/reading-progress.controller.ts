import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { readingProgressService } from '../services/reading-progress.service';
import { UnauthorizedError } from '../utils/errors';

export class ReadingProgressController {
  async getReadingProgress(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) throw new UnauthorizedError();

      const { bookId } = req.params;
      const progress = await readingProgressService.getReadingProgress(userId, bookId);

      res.status(200).json({
        status: 'success',
        data: progress,
      });
    } catch (error) {
      next(error);
    }
  }

  async listReadingProgress(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) throw new UnauthorizedError();

      const progressList = await readingProgressService.listReadingProgress(userId);

      res.status(200).json({
        status: 'success',
        data: progressList,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateReadingProgress(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) throw new UnauthorizedError();

      const { bookId, pagesRead, chaptersCompleted, readingTime } = req.body;
      const progress = await readingProgressService.updateReadingProgress(userId, bookId, {
        pagesRead,
        chaptersCompleted,
        readingTime,
      });

      res.status(200).json({
        status: 'success',
        data: progress,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteReadingProgress(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) throw new UnauthorizedError();

      const { bookId } = req.params;
      await readingProgressService.deleteReadingProgress(userId, bookId);

      res.status(200).json({
        status: 'success',
        message: 'Reading progress deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const readingProgressController = new ReadingProgressController();
