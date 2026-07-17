import { prisma } from '../prisma';
import { NotFoundError, UnauthorizedError } from '../utils/errors';

export class BookmarkService {
  async listBookmarks(userId: string) {
    return await prisma.bookmark.findMany({
      where: { userId },
      include: {
        book: true,
        message: true,
        conversation: true,
      },
    });
  }

  async createBookmark(userId: string, data: { bookId?: string; messageId?: string; pageNumber?: number; notes?: string }) {
    return await prisma.bookmark.create({
      data: {
        userId,
        bookId: data.bookId,
        messageId: data.messageId,
        pageNumber: data.pageNumber,
        notes: data.notes,
      },
    });
  }

  async deleteBookmark(bookmarkId: string, userId: string) {
    const bookmark = await prisma.bookmark.findUnique({
      where: { id: bookmarkId },
    });

    if (!bookmark) {
      throw new NotFoundError('Bookmark not found');
    }

    if (bookmark.userId !== userId) {
      throw new UnauthorizedError('Access denied');
    }

    return await prisma.bookmark.delete({
      where: { id: bookmarkId },
    });
  }

  async listConversationBookmarks(userId: string, conversationId: string) {
    return await prisma.bookmark.findMany({
      where: {
        userId,
        conversationId,
      },
      orderBy: {
        pageNumber: 'asc',
      },
    });
  }

  async createConversationBookmark(userId: string, conversationId: string, pageNumber: number) {
    // Enforce a hard cap of 6 bookmarks per (userId, conversationId) pair
    const count = await prisma.bookmark.count({
      where: {
        userId,
        conversationId,
      },
    });

    if (count >= 6) {
      // Throw error with clear message as requested
      throw new Error('Limit of 6 active bookmarks reached. Please remove an existing bookmark first.');
    }

    const existing = await prisma.bookmark.findFirst({
      where: {
        userId,
        conversationId,
        pageNumber,
      },
    });

    if (existing) {
      return existing;
    }

    return await prisma.bookmark.create({
      data: {
        userId,
        conversationId,
        pageNumber,
      },
    });
  }

  async deleteConversationBookmark(userId: string, conversationId: string, bookmarkId: string) {
    const bookmark = await prisma.bookmark.findUnique({
      where: { id: bookmarkId },
    });

    if (!bookmark) {
      throw new NotFoundError('Bookmark not found');
    }

    if (bookmark.userId !== userId || bookmark.conversationId !== conversationId) {
      throw new UnauthorizedError('Access denied');
    }

    return await prisma.bookmark.delete({
      where: { id: bookmarkId },
    });
  }
}

export const bookmarkService = new BookmarkService();
