// TODO: Implement bookshelf types (Shelves, Reading Lists, Categories).
export interface Shelf {
  id: string;
  name: string;
  bookIds: string[];
  createdAt: string;
}
