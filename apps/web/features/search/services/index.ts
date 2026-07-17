import { BaseService } from '../../../services/base-service';
import { SearchResult } from '../types';

// TODO: Implement full-text book indices and search provider endpoints.
export class SearchService extends BaseService {
  constructor() {
    super('/api/search');
  }

  async searchBooks(query: string): Promise<SearchResult[]> {
    // TODO: Connect to backend search indexer (e.g. Postgres Full-Text Search, Elasticsearch)
    return [];
  }
}
