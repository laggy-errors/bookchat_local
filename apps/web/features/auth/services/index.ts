import { BaseService } from '../../../services/base-service';
import { UserProfile } from '../../../types';

export interface AuthResponse {
  user: UserProfile;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

export class AuthService extends BaseService {
  constructor() {
    super('/api/auth');
  }

  async login(body: { email: string; passwordPlain: string }): Promise<AuthResponse> {
    return this.post<AuthResponse>('/login', {
      email: body.email,
      password: body.passwordPlain,
    });
  }

  async register(body: { email: string; passwordHash: string; username?: string }): Promise<AuthResponse> {
    return this.post<AuthResponse>('/register', {
      email: body.email,
      password: body.passwordHash,
      username: body.username,
    });
  }

  async refresh(refreshToken: string): Promise<RefreshResponse> {
    return this.post<RefreshResponse>('/refresh', { refreshToken });
  }

  async logout(refreshToken: string): Promise<{ success: boolean }> {
    return this.post<{ success: boolean }>('/logout', { refreshToken });
  }

  async forgotPassword(email: string): Promise<{ success: boolean }> {
    return this.post<{ success: boolean }>('/forgot-password', { email });
  }

  async resetPassword(body: { token: string; passwordPlain: string }): Promise<{ success: boolean }> {
    return this.post<{ success: boolean }>('/reset-password', {
      token: body.token,
      password: body.passwordPlain,
    });
  }

  async requestVerification(email: string): Promise<{ success: boolean }> {
    return this.post<{ success: boolean }>('/request-verification', { email });
  }

  async verifyEmail(token: string): Promise<{ success: boolean }> {
    return this.post<{ success: boolean }>('/verify-email', { token });
  }
}

export const authService = new AuthService();
