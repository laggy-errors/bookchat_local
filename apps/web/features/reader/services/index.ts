import { BaseService } from '../../../services/base-service';
import { PageContent } from '../types';

// TODO: Implement book paginator and rendering engine integrations.
export class ReaderService extends BaseService {
  constructor() {
    super('/api/reader');
  }

  async getPage(bookId: string, page: number): Promise<PageContent> {
    // TODO: Implement page content retrieval
    return { pageNumber: page, text: '' };
  }
}
