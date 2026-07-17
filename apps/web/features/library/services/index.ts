import { BaseService } from '../../../services/base-service';
import { CatalogBook } from '../types';

// TODO: Implement library catalog HTTP client integrations.
export class LibraryService extends BaseService {
  constructor() {
    super('/api/library');
  }

  async fetchCatalog(): Promise<CatalogBook[]> {
    // TODO: Implement fetching catalog books from backend API
    return [];
  }
}
