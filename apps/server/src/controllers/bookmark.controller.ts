import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { bookmarkService } from '../services/bookmark.service';
import { UnauthorizedError } from '../utils/errors';

export class BookmarkController {
  async listBookmarks(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) throw new UnauthorizedError();

      const bookmarks = await bookmarkService.listBookmarks(userId);
      res.status(200).json({
        status: 'success',
        data: bookmarks,
      });
    } catch (error) {
      next(error);
    }
  }

  async createBookmark(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) throw new UnauthorizedError();

      const bookmark = await bookmarkService.createBookmark(userId, req.body);
      res.status(201).json({
        status: 'success',
        data: bookmark,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteBookmark(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) throw new UnauthorizedError();

      const { bookmarkId } = req.params;
      await bookmarkService.deleteBookmark(bookmarkId, userId);
      res.status(200).json({
        status: 'success',
        message: 'Bookmark deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async listConversationBookmarks(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) throw new UnauthorizedError();

      const { id } = req.params;
      const bookmarks = await bookmarkService.listConversationBookmarks(userId, id);
      res.status(200).json({
        status: 'success',
        data: bookmarks,
      });
    } catch (error) {
      next(error);
    }
  }

  async createConversationBookmark(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) throw new UnauthorizedError();

      const { id } = req.params;
      const { pageNumber } = req.body;
      if (typeof pageNumber !== 'number') {
        res.status(400).json({
          status: 'error',
          message: 'pageNumber is required and must be a number',
        });
        return;
      }

      const bookmark = await bookmarkService.createConversationBookmark(userId, id, pageNumber);
      res.status(201).json({
        status: 'success',
        data: bookmark,
      });
    } catch (error: any) {
      if (error.message && error.message.includes('Limit of 6')) {
        res.status(400).json({
          status: 'error',
          message: error.message,
        });
        return;
      }
      next(error);
    }
  }

  async deleteConversationBookmark(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) throw new UnauthorizedError();

      const { id, bookmarkId } = req.params;
      await bookmarkService.deleteConversationBookmark(userId, id, bookmarkId);
      res.status(200).json({
        status: 'success',
        message: 'Bookmark deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const bookmarkController = new BookmarkController();
