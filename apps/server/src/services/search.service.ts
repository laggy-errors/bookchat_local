import { prisma } from '../prisma';

export class SearchService {
  async searchBooks(query: string) {
    return await prisma.book.findMany({
      where: {
        OR: [
          { title: { contains: query } },
          { author: { contains: query } },
        ],
      },
    });
  }

  async searchMessages(query: string, userId: string) {
    return await prisma.message.findMany({
      where: {
        content: { contains: query },
        conversation: {
          participants: {
            some: { userId },
          },
        },
      },
      include: {
        conversation: true,
      },
    });
  }
}

export const searchService = new SearchService();
