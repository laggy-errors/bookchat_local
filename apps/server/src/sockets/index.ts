import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { config } from '../config';
import { prisma } from '../prisma';
import { presenceService } from '../services/presence.service';

let ioInstance: Server | null = null;

export function getIO(): Server | null {
  return ioInstance;
}

export async function broadcastUnreadCount(userId: string, bookId: string) {
  try {
    const participants = await prisma.conversationParticipant.findMany({
      where: {
        userId,
        conversation: {
          bookId,
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
          senderId: { not: userId },
          createdAt: { gt: p.lastReadAt },
          deletedAt: null,
        },
      });
      unreadMessageCount += count;
    }

    if (ioInstance) {
      console.log(`[Socket] Broadcasting unread:updated to user:${userId} for book ${bookId}: ${unreadMessageCount}`);
      ioInstance.to(`user:${userId}`).emit('unread:updated', {
        bookId,
        unreadMessageCount,
      });
    }
  } catch (error) {
    console.error(`Failed to broadcast unread count for user ${userId} and book ${bookId}:`, error);
  }
}

export function initSocketServer(server: HttpServer): Server {
  const io = new Server(server, {
    cors: {
      origin: config.corsOrigin,
      methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT'],
    },
  });

  ioInstance = io;

  io.on('connection', (socket: Socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Join notification room for specific users
    socket.on('user:join', (userId: string) => {
      if (!userId) return;
      socket.join(`user:${userId}`);
      console.log(`Socket ${socket.id} joined user notification room: user:${userId}`);
    });

    // 1. user:online
    socket.on('user:online', async (data: { userId: string; activeBookId?: string; currentChapter?: string }) => {
      console.log(`[Socket] user:online for user ${data.userId}`);
      if (!data.userId) return;
      socket.data.userId = data.userId;

      const presence = await presenceService.updatePresence(data.userId, {
        online: true,
        activeBookId: data.activeBookId,
        currentChapter: data.currentChapter,
      });

      const fullPresence = await prisma.readerPresence.findUnique({
        where: { userId: data.userId },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              username: true,
            },
          },
          activeBook: true,
        },
      });

      io.emit('user:online', fullPresence || presence);
    });

    // 2. user:offline
    socket.on('user:offline', async (data: { userId: string }) => {
      console.log(`[Socket] user:offline for user ${data.userId}`);
      if (!data.userId) return;

      const presence = await presenceService.updatePresence(data.userId, {
        online: false,
      });

      const fullPresence = await prisma.readerPresence.findUnique({
        where: { userId: data.userId },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              username: true,
            },
          },
          activeBook: true,
        },
      });

      io.emit('user:offline', fullPresence || presence);
    });

    // 3. typing:start
    socket.on('typing:start', async (data: { userId: string; conversationId: string }) => {
      console.log(`[Socket] typing:start for user ${data.userId} in chat ${data.conversationId}`);
      if (!data.userId) return;

      await presenceService.updatePresence(data.userId, {
        typing: true,
      });

      const fullPresence = await prisma.readerPresence.findUnique({
        where: { userId: data.userId },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              username: true,
            },
          },
          activeBook: true,
        },
      });

      socket.to(data.conversationId).emit('typing:start', {
        ...data,
        presence: fullPresence,
      });
    });

    // 4. typing:stop
    socket.on('typing:stop', async (data: { userId: string; conversationId: string }) => {
      console.log(`[Socket] typing:stop for user ${data.userId} in chat ${data.conversationId}`);
      if (!data.userId) return;

      await presenceService.updatePresence(data.userId, {
        typing: false,
      });

      const fullPresence = await prisma.readerPresence.findUnique({
        where: { userId: data.userId },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              username: true,
            },
          },
          activeBook: true,
        },
      });

      socket.to(data.conversationId).emit('typing:stop', {
        ...data,
        presence: fullPresence,
      });
    });

    // 5. message:new
    socket.on('message:new', (data: { conversationId: string; message: any }) => {
      console.log(`[Socket] message:new in chat ${data.conversationId}`);
      socket.to(data.conversationId).emit('message:new', data);
      socket.to(`chat:${data.conversationId}`).emit('message:new', data);
    });

    // 6. message:edited
    socket.on('message:edited', (data: { conversationId: string; messageId: string; newContent: string; message: any }) => {
      console.log(`[Socket] message:edited in chat ${data.conversationId}`);
      socket.to(data.conversationId).emit('message:edited', data);
      socket.to(`chat:${data.conversationId}`).emit('message:edited', data);
    });

    // 7. message:deleted
    socket.on('message:deleted', (data: { conversationId: string; messageId: string }) => {
      console.log(`[Socket] message:deleted in chat ${data.conversationId}`);
      socket.to(data.conversationId).emit('message:deleted', data);
      socket.to(`chat:${data.conversationId}`).emit('message:deleted', data);
    });

    // 10. message:read
    socket.on('message:read', (data: { conversationId: string; messageId: string; readAt: string }) => {
      console.log(`[Socket] message:read in chat ${data.conversationId}`);
      socket.to(data.conversationId).emit('message:read', data);
      socket.to(`chat:${data.conversationId}`).emit('message:read', data);
    });

    // 8. notification:new
    socket.on('notification:new', (data: { receiverId: string; notificationId: string; title: string; message?: string; type?: string; color?: string; page?: number }) => {
      console.log(`[Socket] notification:new targeting user ${data.receiverId}`);
      io.to(`user:${data.receiverId}`).emit('notification:new', data);
    });

    // 9. bookmark:created
    socket.on('bookmark:created', (data: { userId: string; bookmarkId: string; bookId?: string; bookmark?: any }) => {
      console.log(`[Socket] bookmark:created for user ${data.userId}`);
      socket.broadcast.emit('bookmark:created', data);
    });

    // Handle joining chat rooms for isolated messaging namespaces
    socket.on('room:join', (room: string) => {
      socket.join(room);
      console.log(`Socket ${socket.id} joined room: ${room}`);
    });

    socket.on('room:leave', (room: string) => {
      socket.leave(room);
      console.log(`Socket ${socket.id} left room: ${room}`);
    });

    socket.on('disconnect', async () => {
      console.log(`Socket disconnected: ${socket.id}`);
      if (socket.data.userId) {
        const presence = await presenceService.updatePresence(socket.data.userId, {
          online: false,
          typing: false,
        });

        const fullPresence = await prisma.readerPresence.findUnique({
          where: { userId: socket.data.userId },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                username: true,
              },
            },
            activeBook: true,
          },
        });

        io.emit('user:offline', fullPresence || presence);
      }
    });
  });

  return io;
}
