import { prisma } from '../prisma';
import { NotFoundError } from '../utils/errors';

export class ChatService {
  async listConversations(userId: string) {
    return await prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            userId,
          },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                username: true,
              },
            },
          },
        },
      },
    });
  }

  async getConversation(conversationId: string, userId: string) {
    const chat = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        participants: {
          some: {
            userId,
          },
        },
      },
      include: {
        participants: true,
      },
    });

    if (!chat) {
      throw new NotFoundError('Conversation not found or access denied');
    }

    return chat;
  }

  async createConversation(userId: string, data: { id?: string; title: string; type: 'DIRECT' | 'GROUP'; bookId?: string; participantUserIds: string[] }) {
    const allParticipantIds = Array.from(new Set([userId, ...data.participantUserIds]));

    return await prisma.conversation.create({
      data: {
        id: data.id,
        title: data.title,
        type: data.type,
        bookId: data.bookId,
        participants: {
          create: allParticipantIds.map(id => ({
            userId: id,
          })),
        },
      },
    });
  }
}

export const chatService = new ChatService();
