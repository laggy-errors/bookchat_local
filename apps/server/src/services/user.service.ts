import { prisma } from '../prisma';
import { NotFoundError } from '../utils/errors';

export class UserService {
  async getProfile(userId: string) {
    let profile = await prisma.profile.findUnique({
      where: { userId },
    });
    if (!profile) {
      // Find the user first to populate default display name
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });
      if (!user) {
        throw new NotFoundError('User not found');
      }
      
      profile = await prisma.profile.create({
        data: {
          userId,
          displayName: user.username || user.email.split('@')[0],
          bio: 'A registered scribe of the ledger.',
        },
      });
    }
    return profile;
  }

  async updateProfile(userId: string, data: { displayName?: string; bio?: string; avatarUrl?: string }) {
    const updated = await prisma.profile.upsert({
      where: { userId },
      update: data,
      create: {
        userId,
        ...data,
      },
    });
    return updated;
  }

  async deleteAccount(userId: string) {
    // Soft delete user by setting deletedAt timestamp
    return await prisma.user.update({
      where: { id: userId },
      data: { deletedAt: new Date() },
    });
  }
}

export const userService = new UserService();
