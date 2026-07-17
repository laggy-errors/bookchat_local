import { prisma } from '../prisma';
import { NotFoundError } from '../utils/errors';

export const KNOWN_BOOKS: Record<string, { title: string; author: string }> = {
  'vol-2': { title: 'Volume II: Visual Design', author: 'A. Scribe & G. Archivist' },
  'vol-3': { title: 'Volume III: Component Design', author: 'H. Typographer & L. Binder' },
  'vol-6': { title: 'Volume VI: Feature Orchestration', author: 'C. Codecraft & J. Font' },
  'vol-10': { title: 'Volume X: Frontend Architecture', author: 'M. Struct & S. Workspace' },
  'vol-13': { title: 'Volume XIII: Design Tokens', author: 'T. Spec & V. Variables' },
};

export async function ensureBookExists(bookId: string) {
  const book = await prisma.book.findUnique({
    where: { id: bookId },
  });
  if (!book) {
    const details = KNOWN_BOOKS[bookId] || { title: 'Unknown Chronicle', author: 'Anonymous' };
    return await prisma.book.create({
      data: {
        id: bookId,
        title: details.title,
        author: details.author,
      },
    });
  }
  return book;
}

export class BookService {
  async listBooks() {
    return await prisma.book.findMany();
  }

  async getBook(bookId: string) {
    let book = await prisma.book.findUnique({
      where: { id: bookId },
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
    });
    if (!book) {
      const ensuredBook = await ensureBookExists(bookId);
      return {
        ...ensuredBook,
        creator: null,
      };
    }
    return book;
  }

  async createBook(data: {
    title: string;
    author?: string;
    description?: string;
    coverUrl?: string;
    isbn?: string;
    creatorId?: string;
    coverColor?: string;
  }) {
    // 1. Generate unique 6-8 character alphanumeric joinCode
    let joinCode = '';
    let isUnique = false;
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    while (!isUnique) {
      const length = Math.floor(Math.random() * 3) + 6; // 6 to 8 characters
      let code = '';
      for (let i = 0; i < length; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      const existing = await prisma.book.findUnique({
        where: { joinCode: code },
      });
      if (!existing) {
        joinCode = code;
        isUnique = true;
      }
    }

    // 2. Create the book and its initial CREATOR membership inside a transaction
    return await prisma.$transaction(async (tx) => {
      const book = await tx.book.create({
        data: {
          title: data.title,
          author: data.author || 'Anonymous',
          description: data.description || null,
          coverUrl: data.coverUrl || null,
          isbn: data.isbn || null,
          creatorId: data.creatorId || null,
          coverColor: data.coverColor || 'burgundy',
          joinCode,
        },
      });

      // 3. Create creator membership if creatorId is provided
      if (data.creatorId) {
        await tx.bookMembership.create({
          data: {
            bookId: book.id,
            userId: data.creatorId,
            role: 'CREATOR',
          },
        });
      }

      return book;
    });
  }

  async joinBook(userId: string, code: string) {
    const cleanCode = code.trim().toUpperCase();
    const book = await prisma.book.findUnique({
      where: { joinCode: cleanCode },
    });

    if (!book) {
      throw new NotFoundError('The volume code you provided does not match any bound chronicle in our archives.');
    }

    // Check if membership already exists
    let membership = await prisma.bookMembership.findUnique({
      where: {
        bookId_userId: {
          bookId: book.id,
          userId,
        },
      },
    });

    if (!membership) {
      membership = await prisma.bookMembership.create({
        data: {
          bookId: book.id,
          userId,
          role: 'MEMBER',
        },
      });
    }

    return { book, membership };
  }

  async getVisibleMembers(userId: string, bookId: string) {
    const book = await prisma.book.findUnique({
      where: { id: bookId },
    });

    if (!book) {
      throw new NotFoundError('Volume not found.');
    }

    // 1. Fetch all book memberships
    const memberships = await prisma.bookMembership.findMany({
      where: { bookId },
      include: {
        user: {
          include: {
            profile: true,
            readerPresence: true,
          },
        },
      },
    });

    // Fallback if there are no memberships (e.g. predefined book)
    if (memberships.length === 0) {
      // Return all active readers from presence
      const presenceList = await prisma.readerPresence.findMany({
        where: {
          activeBookId: bookId,
          online: true,
        },
        include: {
          user: {
            include: {
              profile: true,
            },
          },
        },
      });

      return presenceList.map(p => {
        const u = p.user;
        const name = u.profile?.displayName || u.username || u.email || `Scribe ${u.id.substring(0, 4)}`;
        return {
          userId: u.id,
          name,
          role: u.id === userId ? 'You' : 'Scribe',
          status: p.currentChapter ? `Reading ${p.currentChapter}` : 'Flipping pages',
          online: p.online,
          typing: p.typing,
        };
      });
    }

    // 2. Identify requesting user's membership and check if they are the creator
    const userMem = memberships.find(m => m.userId === userId);
    const isCreator = book.creatorId === userId || (userMem && userMem.role === 'CREATOR');

    let visibleMemberships = memberships;

    if (!isCreator) {
      // Requester is a MEMBER: they can only see creator(s), themselves, and visibility grants
      // Fetch visibility grants
      const grants = await prisma.visibilityGrant.findMany({
        where: {
          bookId,
          viewerId: userId,
        },
      });

      const allowedUserIds = new Set(grants.map(g => g.visibleUserId));

      visibleMemberships = memberships.filter(m => {
        const isRequestingUser = m.userId === userId;
        const isBookCreator = m.userId === book.creatorId || m.role === 'CREATOR';
        const isGranted = allowedUserIds.has(m.userId);
        return isRequestingUser || isBookCreator || isGranted;
      });
    }

    // 3. Map to final format with nickname overrides
    const overrides = await prisma.nicknameOverride.findMany({
      where: {
        ownerId: userId,
        bookId,
      },
    });
    const nicknameMap = new Map(overrides.map(o => [o.targetUserId, o.nickname]));

    return visibleMemberships.map(m => {
      const u = m.user;
      const profile = u.profile;
      const presence = u.readerPresence;

      const overrideName = nicknameMap.get(u.id);
      const name = overrideName || profile?.displayName || u.username || u.email || `Scribe ${u.id.substring(0, 4)}`;
      
      let role = m.role;
      if (u.id === userId) {
        role = 'You';
      } else if (role === 'CREATOR') {
        role = 'Creator';
      } else {
        role = 'Scribe';
      }

      const isOnline = presence?.online && presence.activeBookId === bookId;

      return {
        userId: u.id,
        name,
        role,
        status: isOnline
          ? (presence.currentChapter ? `Reading ${presence.currentChapter}` : 'Flipping pages')
          : 'Away',
        online: isOnline || false,
        typing: isOnline ? (presence?.typing || false) : false,
      };
    });
  }
}

export const bookService = new BookService();

