import { BaseService } from '../../../services/base-service';
import { NotificationPreference } from '../types';

// TODO: Implement notification manager and push dispatchers integrations.
export class NotificationsService extends BaseService {
  constructor() {
    super('/api/notifications');
  }

  async getPreferences(): Promise<NotificationPreference[]> {
    // TODO: Implement loading user notification configurations
    return [];
  }
}
