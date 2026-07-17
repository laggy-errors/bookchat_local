import { prisma } from '../prisma';
import { NotFoundError, UnauthorizedError } from '../utils/errors';
import { ensureBookExists } from './book.service';

export class QuoteService {
  async listQuotes(userId: string, bookId?: string) {
    const whereClause: any = { userId };
    if (bookId) {
      whereClause.bookId = bookId;
    }

    return await prisma.quote.findMany({
      where: whereClause,
      include: {
        book: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getQuote(quoteId: string, userId: string) {
    const quote = await prisma.quote.findUnique({
      where: { id: quoteId },
      include: { book: true },
    });

    if (!quote) {
      throw new NotFoundError('Quote not found');
    }

    if (quote.userId !== userId) {
      throw new UnauthorizedError('Access denied');
    }

    return quote;
  }

  async createQuote(
    userId: string,
    data: { bookId: string; content: string; pageNumber?: number | null }
  ) {
    // Verify/ensure book exists
    await ensureBookExists(data.bookId);

    return await prisma.quote.create({
      data: {
        userId,
        bookId: data.bookId,
        content: data.content,
        pageNumber: data.pageNumber || null,
      },
      include: {
        book: true,
      },
    });
  }

  async updateQuote(
    quoteId: string,
    userId: string,
    data: { content?: string; pageNumber?: number | null }
  ) {
    const quote = await prisma.quote.findUnique({
      where: { id: quoteId },
    });

    if (!quote) {
      throw new NotFoundError('Quote not found');
    }

    if (quote.userId !== userId) {
      throw new UnauthorizedError('Access denied');
    }

    return await prisma.quote.update({
      where: { id: quoteId },
      data: {
        content: data.content !== undefined ? data.content : quote.content,
        pageNumber: data.pageNumber !== undefined ? data.pageNumber : quote.pageNumber,
      },
      include: {
        book: true,
      },
    });
  }

  async deleteQuote(quoteId: string, userId: string) {
    const quote = await prisma.quote.findUnique({
      where: { id: quoteId },
    });

    if (!quote) {
      throw new NotFoundError('Quote not found');
    }

    if (quote.userId !== userId) {
      throw new UnauthorizedError('Access denied');
    }

    return await prisma.quote.delete({
      where: { id: quoteId },
    });
  }
}

export const quoteService = new QuoteService();
