import { apiClient } from '../lib/api-client';

/**
 * Base Service class from which other domain services inherit.
 * Provides a standardized method to construct API routes.
 */
export class BaseService {
  protected basePath: string;

  constructor(basePath: string) {
    this.basePath = basePath;
  }

  protected async get<T>(path = ''): Promise<T> {
    return apiClient<T>(`${this.basePath}${path}`);
  }

  protected async post<T>(path = '', body: unknown): Promise<T> {
    return apiClient<T>(`${this.basePath}${path}`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }
}
