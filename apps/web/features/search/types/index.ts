// TODO: Implement full-text queries, catalog query filters, and keyword hit models.
export interface SearchResult {
  bookId: string;
  title: string;
  matches: {
    pageNumber: number;
    snippet: string;
  }[];
}
