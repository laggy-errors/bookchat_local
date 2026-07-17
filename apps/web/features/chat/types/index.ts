// TODO: Implement margin notes, margin discussions, and real-time text threads.
export interface MarginMessage {
  id: string;
  bookId: string;
  pageNumber: number;
  userId: string;
  username: string;
  content: string;
  timestamp: string;
}
