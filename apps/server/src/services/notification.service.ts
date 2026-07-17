import { prisma } from '../prisma';


export class NotificationService {
  async listNotifications(userId: string) {
    return await prisma.notification.findMany({
      where: { receiverId: userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markAsRead(notificationId: string, userId: string) {
    return await prisma.notification.updateMany({
      where: {
        id: notificationId,
        receiverId: userId,
      },
      data: {
        read: true,
        status: 'READ',
      },
    });
  }

  async markAllAsRead(userId: string) {
    return await prisma.notification.updateMany({
      where: { receiverId: userId, read: false },
      data: {
        read: true,
        status: 'READ',
      },
    });
  }

  async createNotification(data: { receiverId: string; senderId?: string; type: string; title: string; preview: string }) {
    return await prisma.notification.create({
      data: {
        receiverId: data.receiverId,
        senderId: data.senderId,
        type: data.type,
        title: data.title,
        preview: data.preview,
        status: 'CREATED',
      },
    });
  }
}

export const notificationService = new NotificationService();
