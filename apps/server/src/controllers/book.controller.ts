import { Request, Response, NextFunction } from 'express';
import { bookService } from '../services/book.service';
import { AuthenticatedRequest } from '../middleware/auth';
import { prisma } from '../prisma';
import { UnauthorizedError, NotFoundError, ForbiddenError, BadRequestError } from '../utils/errors';

export class BookController {
  async listMyBooks(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const currentUserId = authReq.user?.id;
      if (!currentUserId) {
        throw new UnauthorizedError('User not authenticated');
      }

      const books = await prisma.book.findMany({
        where: {
          memberships: {
            some: {
              userId: currentUserId,
            },
          },
        },
        include: {
          creator: {
            select: {
              id: true,
              username: true,
              email: true,
              profile: {
                select: {
                  displayName: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      const booksWithUnreadCount = await Promise.all(
        books.map(async (book) => {
          const participants = await prisma.conversationParticipant.findMany({
            where: {
              userId: currentUserId,
              conversation: {
                bookId: book.id,
              },
            },
            select: {
              conversationId: true,
              lastReadAt: true,
            },
          });

          let unreadMessageCount = 0;
          for (const p of participants) {
            const count = await prisma.message.count({
              where: {
                conversationId: p.conversationId,
                senderId: { not: currentUserId },
                createdAt: { gt: p.lastReadAt },
                deletedAt: null,
              },
            });
            unreadMessageCount += count;
          }

          return {
            ...book,
            unreadMessageCount,
          };
        })
      );

      res.status(200).json({
        status: 'success',
        data: booksWithUnreadCount,
      });
    } catch (error) {
      next(error);
    }
  }

  async listBooks(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const books = await bookService.listBooks();
      res.status(200).json({
        status: 'success',
        data: books,
      });
    } catch (error) {
      next(error);
    }
  }

  async getBook(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { bookId } = req.params;
      const book = await bookService.getBook(bookId);
      res.status(200).json({
        status: 'success',
        data: book,
      });
    } catch (error) {
      next(error);
    }
  }

  async createBook(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const creatorId = authReq.user?.id;
      const book = await bookService.createBook({
        ...req.body,
        creatorId,
      });
      res.status(201).json({
        status: 'success',
        data: book,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateBook(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const currentUserId = authReq.user?.id;
      if (!currentUserId) {
        throw new UnauthorizedError('User not authenticated');
      }

      const { bookId } = req.params;
      const { title, author, description, coverUrl, isbn, coverColor } = req.body;

      // Ensure user is the creator of this book
      const book = await prisma.book.findUnique({
        where: { id: bookId },
      });

      if (!book) {
        throw new NotFoundError('Book not found');
      }

      if (book.creatorId !== currentUserId) {
        throw new ForbiddenError('Only the book creator can edit this volume');
      }

      const updated = await prisma.book.update({
        where: { id: bookId },
        data: {
          title: title !== undefined ? title : undefined,
          author: author !== undefined ? author : undefined,
          description: description !== undefined ? description : undefined,
          coverUrl: coverUrl !== undefined ? coverUrl : undefined,
          isbn: isbn !== undefined ? isbn : undefined,
          coverColor: coverColor !== undefined ? coverColor : undefined,
        },
      });

      res.status(200).json({
        status: 'success',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  async joinBook(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.user?.id;
      if (!userId) {
        throw new Error('User not authenticated');
      }
      const { code } = req.body;
      const result = await bookService.joinBook(userId, code);
      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getVisibleMembers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.user?.id;
      if (!userId) {
        throw new Error('User not authenticated');
      }
      const { bookId } = req.params;
      const members = await bookService.getVisibleMembers(userId, bookId);
      res.status(200).json({
        status: 'success',
        data: members,
      });
    } catch (error) {
      next(error);
    }
  }

  async listVisibilityGrants(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.user?.id;
      if (!userId) {
        throw new UnauthorizedError('User not authenticated');
      }
      const { bookId } = req.params;

      // Ensure requesting user is the creator of the book
      const book = await prisma.book.findUnique({
        where: { id: bookId },
      });
      if (!book) {
        throw new NotFoundError('Book not found');
      }
      if (book.creatorId !== userId) {
        throw new ForbiddenError('Only the book creator can view visibility grants');
      }

      const grants = await prisma.visibilityGrant.findMany({
        where: { bookId },
        include: {
          viewer: {
            select: {
              id: true,
              username: true,
              email: true,
              profile: true,
            },
          },
          visibleUser: {
            select: {
              id: true,
              username: true,
              email: true,
              profile: true,
            },
          },
        },
      });

      res.status(200).json({
        status: 'success',
        data: grants,
      });
    } catch (error) {
      next(error);
    }
  }

  async createVisibilityGrant(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.user?.id;
      if (!userId) {
        throw new UnauthorizedError('User not authenticated');
      }
      const { bookId } = req.params;
      const { viewerId, visibleUserId } = req.body;

      if (!viewerId || !visibleUserId) {
        throw new BadRequestError('viewerId and visibleUserId are required');
      }

      // Ensure requesting user is the creator of the book
      const book = await prisma.book.findUnique({
        where: { id: bookId },
      });
      if (!book) {
        throw new NotFoundError('Book not found');
      }
      if (book.creatorId !== userId) {
        throw new ForbiddenError('Only the book creator can manage visibility grants');
      }

      const grant = await prisma.visibilityGrant.upsert({
        where: {
          bookId_viewerId_visibleUserId: {
            bookId,
            viewerId,
            visibleUserId,
          },
        },
        create: {
          bookId,
          granterId: userId,
          viewerId,
          visibleUserId,
        },
        update: {},
      });

      // Retrieve full grant with user details to return
      const fullGrant = await prisma.visibilityGrant.findUnique({
        where: { id: grant.id },
        include: {
          viewer: {
            select: { id: true, username: true, email: true, profile: true },
          },
          visibleUser: {
            select: { id: true, username: true, email: true, profile: true },
          },
        },
      });

      // Emit socket event to notify other clients in the book that visibility has changed
      const io = req.app.get('io');
      if (io) {
        io.emit('visibility:updated', { bookId });
      }

      res.status(201).json({
        status: 'success',
        data: fullGrant,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteVisibilityGrant(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.user?.id;
      if (!userId) {
        throw new UnauthorizedError('User not authenticated');
      }
      const { bookId, grantId } = req.params;

      // Ensure requesting user is the creator of the book
      const book = await prisma.book.findUnique({
        where: { id: bookId },
      });
      if (!book) {
        throw new NotFoundError('Book not found');
      }
      if (book.creatorId !== userId) {
        throw new ForbiddenError('Only the book creator can manage visibility grants');
      }

      const grant = await prisma.visibilityGrant.findFirst({
        where: { id: grantId, bookId },
      });
      if (!grant) {
        throw new NotFoundError('Visibility grant not found in this book');
      }

      await prisma.visibilityGrant.delete({
        where: { id: grantId },
      });

      // Emit socket event to notify other clients in the book that visibility has changed
      const io = req.app.get('io');
      if (io) {
        io.emit('visibility:updated', { bookId });
      }

      res.status(200).json({
        status: 'success',
        message: 'Visibility grant successfully revoked',
      });
    } catch (error) {
      next(error);
    }
  }

  async removeMember(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const currentUserId = authReq.user?.id;
      if (!currentUserId) {
        throw new UnauthorizedError('User not authenticated');
      }
      const { bookId, userId: targetUserId } = req.params;

      const book = await prisma.book.findUnique({
        where: { id: bookId },
      });
      if (!book) {
        throw new NotFoundError('Book not found');
      }

      const isTargetCreator = book.creatorId === targetUserId;

      if (currentUserId === book.creatorId) {
        if (targetUserId === currentUserId) {
          throw new ForbiddenError('Creator cannot remove themself from the book. Use Close Book instead.');
        }
      } else {
        if (isTargetCreator) {
          throw new ForbiddenError("A non-creator can never remove the book's creator.");
        }

        const visibleMembers = await bookService.getVisibleMembers(currentUserId, bookId);
        const isVisible = visibleMembers.some(m => m.userId === targetUserId);
        if (!isVisible) {
          throw new ForbiddenError('You do not have permission to remove this member.');
        }
      }

      await prisma.visibilityGrant.deleteMany({
        where: {
          bookId,
          OR: [
            { viewerId: targetUserId },
            { visibleUserId: targetUserId }
          ]
        }
      });

      await prisma.bookMembership.deleteMany({
        where: {
          bookId,
          userId: targetUserId,
        }
      });

      const io = req.app.get('io');
      if (io) {
        io.emit('members:updated', { bookId });
        io.emit('visibility:updated', { bookId });
      }

      res.status(200).json({
        status: 'success',
        message: 'Member successfully removed',
      });
    } catch (error) {
      next(error);
    }
  }

  async updateNickname(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const currentUserId = authReq.user?.id;
      if (!currentUserId) {
        throw new UnauthorizedError('User not authenticated');
      }
      const { bookId, userId: targetUserId } = req.params;
      const { nickname } = req.body;

      if (nickname === undefined || nickname === null) {
        throw new BadRequestError('Nickname is required');
      }

      if (nickname.trim() === '') {
        await prisma.nicknameOverride.deleteMany({
          where: {
            ownerId: currentUserId,
            bookId,
            targetUserId,
          }
        });
      } else {
        await prisma.nicknameOverride.upsert({
          where: {
            ownerId_bookId_targetUserId: {
              ownerId: currentUserId,
              bookId,
              targetUserId,
            }
          },
          create: {
            ownerId: currentUserId,
            bookId,
            targetUserId,
            nickname: nickname.trim(),
          },
          update: {
            nickname: nickname.trim(),
          }
        });
      }

      const io = req.app.get('io');
      if (io) {
        io.emit('members:updated', { bookId });
      }

      res.status(200).json({
        status: 'success',
        message: 'Nickname override successfully saved',
        data: { nickname: nickname.trim() || null },
      });
    } catch (error) {
      next(error);
    }
  }

  async leaveBook(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest;
      const currentUserId = authReq.user?.id;
      if (!currentUserId) {
        throw new UnauthorizedError('User not authenticated');
      }
      const { bookId } = req.params;

      const book = await prisma.book.findUnique({
        where: { id: bookId },
      });
      if (!book) {
        throw new NotFoundError('Volume not found.');
      }

      // Block creator self-removal to prevent orphaned books
      if (book.creatorId === currentUserId) {
        throw new ForbiddenError('As the creator of this book, you cannot leave it. You must close/delete the book or transfer ownership instead.');
      }

      // Delete the requesting user's membership
      await prisma.bookMembership.deleteMany({
        where: {
          bookId,
          userId: currentUserId,
        }
      });

      // Dissolve visibility grants associated with this user
      await prisma.visibilityGrant.deleteMany({
        where: {
          bookId,
          OR: [
            { viewerId: currentUserId },
            { visibleUserId: currentUserId }
          ]
        }
      });

      // Clear nickname overrides for this user in this book
      await prisma.nicknameOverride.deleteMany({
        where: {
          bookId,
          OR: [
            { ownerId: currentUserId },
            { targetUserId: currentUserId }
          ]
        }
      });

      const io = req.app.get('io');
      if (io) {
        io.emit('members:updated', { bookId });
        io.emit('visibility:updated', { bookId });
      }

      res.status(200).json({
        status: 'success',
        message: 'You have successfully left this volume shelf.',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const bookController = new BookController();
