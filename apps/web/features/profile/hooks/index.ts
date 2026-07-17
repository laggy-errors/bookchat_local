'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUserStore } from '../../../stores/user-store';
import { apiClient } from '../../../lib/api-client';

export interface ProfileData {
  displayName: string;
  bio: string;
  avatarUrl: string;
}

export function useProfile() {
  const { user, setUser } = useUserStore();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchProfile = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const res = await apiClient<any>('/api/users/profile');
      if (res) {
        setProfile({
          displayName: res.displayName || user.username || user.email || 'Anonymous Scribe',
          bio: res.bio || 'Keeper of silent words, seeker of golden wisdom.',
          avatarUrl: res.avatarUrl || '',
        });
      }
    } catch (err) {
      console.warn('Could not fetch user profile:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateProfile = async (updates: Partial<ProfileData>) => {
    if (!user) return;
    setIsLoading(true);
    try {
      const res = await apiClient<any>('/api/users/profile', {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
      
      if (res) {
        const updated = {
          displayName: res.displayName || updates.displayName || '',
          bio: res.bio || updates.bio || '',
          avatarUrl: res.avatarUrl || updates.avatarUrl || '',
        };
        setProfile(updated);
        
        // Synchronize display name back to the core user store
        setUser({
          ...user,
          username: updated.displayName || user.username,
        });
      }
    } catch (err) {
      console.error('Failed to update user profile:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    profile,
    isLoading,
    updateProfile,
    refresh: fetchProfile,
  };
}
