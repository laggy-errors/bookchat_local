import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { chatService } from '../services/chat.service';
import { UnauthorizedError } from '../utils/errors';

export class ChatController {
  async listConversations(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) throw new UnauthorizedError();

      const chats = await chatService.listConversations(userId);
      res.status(200).json({
        status: 'success',
        data: chats,
      });
    } catch (error) {
      next(error);
    }
  }

  async getConversation(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) throw new UnauthorizedError();

      const { conversationId } = req.params;
      const chat = await chatService.getConversation(conversationId, userId);
      res.status(200).json({
        status: 'success',
        data: chat,
      });
    } catch (error) {
      next(error);
    }
  }

  async createConversation(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) throw new UnauthorizedError();

      const chat = await chatService.createConversation(userId, req.body);
      res.status(201).json({
        status: 'success',
        data: chat,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const chatController = new ChatController();
