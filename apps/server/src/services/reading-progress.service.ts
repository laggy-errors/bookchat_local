import { prisma } from '../prisma';
import { NotFoundError } from '../utils/errors';
import { ensureBookExists } from './book.service';

export class ReadingProgressService {
  async getReadingProgress(userId: string, bookId: string) {
    let progress = await prisma.readingProgress.findUnique({
      where: {
        userId_bookId: {
          userId,
          bookId,
        },
      },
      include: {
        book: true,
      },
    });

    // If progress record doesn't exist yet, we can return a default representation or initialize it.
    if (!progress) {
      // Let's verify/ensure the book exists first
      await ensureBookExists(bookId);

      progress = await prisma.readingProgress.create({
        data: {
          userId,
          bookId,
          pagesRead: 0,
          chaptersCompleted: 0,
          readingTime: 0,
        },
        include: {
          book: true,
        },
      });
    }

    return progress;
  }

  async listReadingProgress(userId: string) {
    return await prisma.readingProgress.findMany({
      where: { userId },
      include: {
        book: true,
      },
      orderBy: {
        lastOpened: 'desc',
      },
    });
  }

  async updateReadingProgress(
    userId: string,
    bookId: string,
    data: { pagesRead?: number; chaptersCompleted?: number; readingTime?: number }
  ) {
    const existing = await prisma.readingProgress.findUnique({
      where: {
        userId_bookId: {
          userId,
          bookId,
        },
      },
    });

    if (existing) {
      return await prisma.readingProgress.update({
        where: {
          id: existing.id,
        },
        data: {
          pagesRead: data.pagesRead !== undefined ? data.pagesRead : existing.pagesRead,
          chaptersCompleted: data.chaptersCompleted !== undefined ? data.chaptersCompleted : existing.chaptersCompleted,
          readingTime: data.readingTime !== undefined ? data.readingTime : existing.readingTime,
          lastOpened: new Date(),
        },
        include: {
          book: true,
        },
      });
    } else {
      // First, check/ensure if book exists
      await ensureBookExists(bookId);

      return await prisma.readingProgress.create({
        data: {
          userId,
          bookId,
          pagesRead: data.pagesRead || 0,
          chaptersCompleted: data.chaptersCompleted || 0,
          readingTime: data.readingTime || 0,
          lastOpened: new Date(),
        },
        include: {
          book: true,
        },
      });
    }
  }

  async deleteReadingProgress(userId: string, bookId: string) {
    const existing = await prisma.readingProgress.findUnique({
      where: {
        userId_bookId: {
          userId,
          bookId,
        },
      },
    });

    if (!existing) {
      throw new NotFoundError('Reading progress not found');
    }

    return await prisma.readingProgress.delete({
      where: {
        id: existing.id,
      },
    });
  }
}

export const readingProgressService = new ReadingProgressService();
