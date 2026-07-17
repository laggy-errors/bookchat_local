import { prisma } from '../prisma';
import { NotFoundError, UnauthorizedError } from '../utils/errors';
import { ensureBookExists } from './book.service';

export class AnnotationService {
  async listAnnotations(userId: string, bookId?: string) {
    const whereClause: any = { userId };
    if (bookId) {
      whereClause.bookId = bookId;
    }

    return await prisma.annotation.findMany({
      where: whereClause,
      include: {
        book: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getAnnotation(annotationId: string, userId: string) {
    const anno = await prisma.annotation.findUnique({
      where: { id: annotationId },
      include: { book: true },
    });

    if (!anno) {
      throw new NotFoundError('Annotation not found');
    }

    if (anno.userId !== userId) {
      throw new UnauthorizedError('Access denied');
    }

    return anno;
  }

  async createAnnotation(
    userId: string,
    data: { bookId: string; chapter?: string | null; pageNumber?: number | null; highlightedText?: string | null; notes: string }
  ) {
    // Verify/ensure book exists
    await ensureBookExists(data.bookId);

    return await prisma.annotation.create({
      data: {
        userId,
        bookId: data.bookId,
        chapter: data.chapter || null,
        pageNumber: data.pageNumber || null,
        highlightedText: data.highlightedText || null,
        notes: data.notes,
      },
      include: {
        book: true,
      },
    });
  }

  async updateAnnotation(
    annotationId: string,
    userId: string,
    data: { chapter?: string | null; pageNumber?: number | null; highlightedText?: string | null; notes?: string }
  ) {
    const anno = await prisma.annotation.findUnique({
      where: { id: annotationId },
    });

    if (!anno) {
      throw new NotFoundError('Annotation not found');
    }

    if (anno.userId !== userId) {
      throw new UnauthorizedError('Access denied');
    }

    return await prisma.annotation.update({
      where: { id: annotationId },
      data: {
        chapter: data.chapter !== undefined ? data.chapter : anno.chapter,
        pageNumber: data.pageNumber !== undefined ? data.pageNumber : anno.pageNumber,
        highlightedText: data.highlightedText !== undefined ? data.highlightedText : anno.highlightedText,
        notes: data.notes !== undefined ? data.notes : anno.notes,
      },
      include: {
        book: true,
      },
    });
  }

  async deleteAnnotation(annotationId: string, userId: string) {
    const anno = await prisma.annotation.findUnique({
      where: { id: annotationId },
    });

    if (!anno) {
      throw new NotFoundError('Annotation not found');
    }

    if (anno.userId !== userId) {
      throw new UnauthorizedError('Access denied');
    }

    return await prisma.annotation.delete({
      where: { id: annotationId },
    });
  }
}

export const annotationService = new AnnotationService();
