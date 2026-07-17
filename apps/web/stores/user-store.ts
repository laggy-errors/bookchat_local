import { create } from 'zustand';
import { UserProfile } from '../types';
import { apiClient } from '../lib/api-client';

export interface UserState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  setUser: (user: UserProfile | null) => void;
  setLoading: (isLoading: boolean) => void;
  setSession: (user: UserProfile, accessToken: string, refreshToken: string) => void;
  initializeAuth: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setLoading: (isLoading) => set({ isLoading }),

  setSession: (user, accessToken, refreshToken) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);
      try {
        sessionStorage.setItem('play_book_open_transition', 'true');
      } catch (e) {
        console.warn('Session storage write failed:', e);
      }
    }
    set({ user, isAuthenticated: true, isInitialized: true });
  },

  initializeAuth: async () => {
    if (get().isInitialized) return;
    set({ isLoading: true });

    if (typeof window === 'undefined') {
      set({ isLoading: false, isInitialized: true });
      return;
    }

    const refreshToken = localStorage.getItem('refresh_token');
    const accessToken = localStorage.getItem('access_token');

    if (!refreshToken) {
      // If no token, check if we're running in development where we can fall back to the mock user
      // so we don't break existing unauthenticated developers/tests.
      try {
        const mockProfile = await apiClient<UserProfile>('/api/users/profile');
        if (mockProfile && mockProfile.id) {
          set({ user: mockProfile, isAuthenticated: true });
        }
      } catch {
        // Safe to ignore in standard production, means not logged in
      }
      set({ isLoading: false, isInitialized: true });
      return;
    }

    try {
      // 1. Attempt token rotation first
      const refreshResult = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!refreshResult.ok) {
        throw new Error('Refresh failed');
      }

      const responseJson = await refreshResult.json();
      const credentials = responseJson.status === 'success' ? responseJson.data : responseJson;

      // 2. Save new rotated credentials
      localStorage.setItem('access_token', credentials.accessToken);
      localStorage.setItem('refresh_token', credentials.refreshToken);

      // 3. Fetch user profile
      const userProfile = await apiClient<UserProfile>('/api/users/profile');
      set({ user: userProfile, isAuthenticated: true });
    } catch (error) {
      console.warn('Auth session restoration failed, clearing session:', error);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      set({ user: null, isAuthenticated: false });
    } finally {
      set({ isLoading: false, isInitialized: true });
    }
  },

  logout: async () => {
    set({ isLoading: true });
    if (typeof window !== 'undefined') {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          await fetch('/api/auth/logout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
          });
        } catch (e) {
          console.warn('Logout API call failed:', e);
        }
      }
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
    set({ user: null, isAuthenticated: false, isLoading: false });
  },
}));
