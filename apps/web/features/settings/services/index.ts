import { BaseService } from '../../../services/base-service';
import { ReaderSettings } from '../types';

// TODO: Implement settings configuration storage and synchronizers.
export class SettingsService extends BaseService {
  constructor() {
    super('/api/settings');
  }

  async saveSettings(settings: ReaderSettings): Promise<void> {
    // TODO: Connect to user configuration endpoints
  }
}
