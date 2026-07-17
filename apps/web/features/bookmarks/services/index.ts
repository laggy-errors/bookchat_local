import { BaseService } from '../../../services/base-service';
import { Bookmark } from '../types';

// TODO: Implement bookmark persistency handlers and cloud syncer APIs.
export class BookmarksService extends BaseService {
  constructor() {
    super('/api/bookmarks');
  }

  async fetchBookmarks(bookId: string): Promise<Bookmark[]> {
    // TODO: Implement bookmark sync load
    return [];
  }
}
