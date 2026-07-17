import { BaseService } from '../../../services/base-service';
import { UserStats } from '../types';

// TODO: Implement user profiles storage and activity metrics services.
export class ProfileService extends BaseService {
  constructor() {
    super('/api/profiles');
  }

  async fetchStats(userId: string): Promise<UserStats> {
    // TODO: Connect to backend database tracking user reading progress metrics
    return { booksRead: 0, totalReadingMinutes: 0, currentStreakDays: 0 };
  }
}
