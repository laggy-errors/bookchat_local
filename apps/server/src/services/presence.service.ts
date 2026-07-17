import { prisma } from '../prisma';

export class PresenceService {
  async getPresence(userId: string) {
    return await prisma.readerPresence.findUnique({
      where: { userId },
    });
  }

  async updatePresence(
    userId: string,
    data: { activeBookId?: string; currentChapter?: string; typing?: boolean; online?: boolean }
  ) {
    return await prisma.readerPresence.upsert({
      where: { userId },
      update: {
        ...data,
        lastSeen: new Date(),
      },
      create: {
        userId,
        ...data,
        lastSeen: new Date(),
      },
    });
  }

  async getActiveReadersInBook(bookId: string) {
    return await prisma.readerPresence.findMany({
      where: {
        activeBookId: bookId,
        online: true,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
          },
        },
      },
    });
  }
}

export const presenceService = new PresenceService();
// Export name matches exactly
