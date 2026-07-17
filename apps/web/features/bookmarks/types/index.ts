// TODO: Implement bookmark metadata structures, highlighted ranges, and push-pin definitions.
export interface Bookmark {
  id: string;
  bookId: string;
  pageNumber: number;
  label?: string;
  createdAt: string;
}
