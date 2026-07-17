import { BaseService } from '../../../services/base-service';
import { Shelf } from '../types';

// TODO: Implement user shelves database / local storage client integrations.
export class BookshelfService extends BaseService {
  constructor() {
    super('/api/bookshelves');
  }

  async getShelves(): Promise<Shelf[]> {
    // TODO: Implement fetching user shelves from api
    return [];
  }
}
