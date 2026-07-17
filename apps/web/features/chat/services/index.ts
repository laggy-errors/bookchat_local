import { BaseService } from '../../../services/base-service';
import { MarginMessage } from '../types';

// TODO: Implement margin socket connections and messaging services.
export class ChatService extends BaseService {
  constructor() {
    super('/api/chat');
  }

  async fetchMessages(bookId: string, page: number): Promise<MarginMessage[]> {
    // TODO: Implement REST API load for page-level discussions
    return [];
  }
}
