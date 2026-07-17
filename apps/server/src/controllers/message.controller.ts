import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { messageService } from '../services/message.service';
import { UnauthorizedError } from '../utils/errors';
import { getIO } from '../sockets';

export class MessageController {
  async listMessages(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) throw new UnauthorizedError();

      const { conversationId } = req.params;
      const pageQuery = req.query.page;
      const page = pageQuery !== undefined ? parseInt(pageQuery as string, 10) : undefined;
      const result = await messageService.listMessages(conversationId, userId, page);
      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async createMessage(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) throw new UnauthorizedError();

      const { conversationId } = req.params;
      const { id, content, messageType, replyToId } = req.body;
      const msg = await messageService.createMessage(conversationId, userId, { id, content, messageType, replyToId });
      res.status(201).json({
        status: 'success',
        data: msg,
      });
    } catch (error) {
      next(error);
    }
  }

  async editMessage(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) throw new UnauthorizedError();

      const { messageId } = req.params;
      const { content } = req.body;
      const msg = await messageService.editMessage(messageId, userId, content);
      res.status(200).json({
        status: 'success',
        data: msg,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteMessage(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) throw new UnauthorizedError();

      const { messageId } = req.params;
      await messageService.deleteMessage(messageId, userId);
      res.status(200).json({
        status: 'success',
        message: 'Message successfully soft-deleted',
      });
    } catch (error) {
      next(error);
    }
  }

  async readMessage(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) throw new UnauthorizedError();

      const { messageId } = req.params;
      const msg = await messageService.markMessageAsRead(messageId, userId);

      const io = getIO();
      if (io) {
        const payload = {
          conversationId: msg.conversationId,
          messageId: msg.id,
          readAt: msg.readAt,
        };
        io.to(`chat:${msg.conversationId}`).emit('message:read', payload);
        io.to(msg.conversationId).emit('message:read', payload);
      }

      res.status(200).json({
        status: 'success',
        data: msg,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const messageController = new MessageController();
