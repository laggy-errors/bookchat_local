import { BaseService } from './base-service';
import { apiClient } from '../lib/api-client';

export interface BookResponse {
  id: string;
  title: string;
  author: string;
  description?: string;
  coverUrl?: string;
  isbn?: string;
  coverColor?: string;
  creatorId?: string;
  joinCode?: string;
  createdAt: string;
  updatedAt: string;
  creator?: {
    id: string;
    username?: string;
    email: string;
    profile?: {
      displayName?: string;
    };
  };
}

export class BookService extends BaseService {
  constructor() {
    super('/api/books');
  }

  async list(): Promise<BookResponse[]> {
    return this.get<BookResponse[]>();
  }

  async listMine(): Promise<BookResponse[]> {
    return this.get<BookResponse[]>('/mine');
  }

  async getBook(bookId: string): Promise<BookResponse> {
    return this.get<BookResponse>(`/${bookId}`);
  }

  async create(data: {
    title: string;
    author?: string;
    description?: string;
    coverUrl?: string;
    isbn?: string;
    coverColor?: string;
  }): Promise<BookResponse> {
    return this.post<BookResponse>('', data);
  }

  async joinBook(code: string): Promise<{ book: BookResponse; membership: any }> {
    return this.post<{ book: BookResponse; membership: any }>('/join', { code });
  }

  async getVisibleMembers(bookId: string): Promise<any[]> {
    return this.get<any[]>(`/${bookId}/visible-members`);
  }

  async update(bookId: string, data: {
    title?: string;
    author?: string;
    description?: string;
    coverUrl?: string;
    isbn?: string;
    coverColor?: string;
  }): Promise<BookResponse> {
    return apiClient<BookResponse>(`/api/books/${bookId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }
}

export const bookService = new BookService();
