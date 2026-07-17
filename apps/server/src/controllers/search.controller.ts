import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { searchService } from '../services/search.service';
import { BadRequestError, UnauthorizedError } from '../utils/errors';

export class SearchController {
  async searchBooks(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { q } = req.query;
      if (!q || typeof q !== 'string') {
        throw new BadRequestError('Search query parameter q is required and must be a string');
      }

      const results = await searchService.searchBooks(q);
      res.status(200).json({
        status: 'success',
        data: results,
      });
    } catch (error) {
      next(error);
    }
  }

  async searchMessages(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) throw new UnauthorizedError();

      const { q } = req.query;
      if (!q || typeof q !== 'string') {
        throw new BadRequestError('Search query parameter q is required and must be a string');
      }

      const results = await searchService.searchMessages(q, userId);
      res.status(200).json({
        status: 'success',
        data: results,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const searchController = new SearchController();
