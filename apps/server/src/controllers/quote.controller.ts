import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { quoteService } from '../services/quote.service';
import { UnauthorizedError } from '../utils/errors';

export class QuoteController {
  async listQuotes(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) throw new UnauthorizedError();

      const { bookId } = req.query;
      const quotes = await quoteService.listQuotes(userId, bookId as string);

      res.status(200).json({
        status: 'success',
        data: quotes,
      });
    } catch (error) {
      next(error);
    }
  }

  async getQuote(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) throw new UnauthorizedError();

      const { quoteId } = req.params;
      const quote = await quoteService.getQuote(quoteId, userId);

      res.status(200).json({
        status: 'success',
        data: quote,
      });
    } catch (error) {
      next(error);
    }
  }

  async createQuote(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) throw new UnauthorizedError();

      const quote = await quoteService.createQuote(userId, req.body);

      res.status(201).json({
        status: 'success',
        data: quote,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateQuote(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) throw new UnauthorizedError();

      const { quoteId } = req.params;
      const quote = await quoteService.updateQuote(quoteId, userId, req.body);

      res.status(200).json({
        status: 'success',
        data: quote,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteQuote(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) throw new UnauthorizedError();

      const { quoteId } = req.params;
      await quoteService.deleteQuote(quoteId, userId);

      res.status(200).json({
        status: 'success',
        message: 'Quote deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const quoteController = new QuoteController();
