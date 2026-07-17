'use client';

import { useState, useEffect, useCallback } from 'react';
import { useThemeStore } from '../../../stores/theme-store';
import { useAudioStore } from '../../../stores/audio-store';
import { useUserStore } from '../../../stores/user-store';
import { apiClient } from '../../../lib/api-client';
import { ThemeType } from '../../../app/tokens';

export function dbThemeToThemeType(dbTheme: string): ThemeType {
  switch (dbTheme) {
    case 'Classic Library': return 'classic-library';
    case 'Vintage Journal': return 'vintage-journal';
    case 'Night Reading': return 'night-reading';
    case 'Rainy Evening': return 'rainy-evening';
    case 'Fireplace': return 'fireplace';
    case 'Collector Edition': return 'collector-edition';
    case 'Lined Journal': return 'lined-journal';
    default: return 'classic-library';
  }
}

export function themeTypeToDbTheme(theme: ThemeType): string {
  switch (theme) {
    case 'classic-library': return 'Classic Library';
    case 'vintage-journal': return 'Vintage Journal';
    case 'night-reading': return 'Night Reading';
    case 'rainy-evening': return 'Rainy Evening';
    case 'fireplace': return 'Fireplace';
    case 'collector-edition': return 'Collector Edition';
    case 'lined-journal': return 'Lined Journal';
    default: return 'Classic Library';
  }
}

export function useSettings() {
  const { user } = useUserStore();
  
  // Theme Zustand selectors
  const theme = useThemeStore((s) => s.theme);
  const highContrast = useThemeStore((s) => s.highContrast);
  const largeText = useThemeStore((s) => s.largeText);
  const reducedMotion = useThemeStore((s) => s.reducedMotion);
  
  const setTheme = useThemeStore((s) => s.setTheme);
  const toggleHighContrast = useThemeStore((s) => s.toggleHighContrast);
  const toggleLargeText = useThemeStore((s) => s.toggleLargeText);
  const toggleReducedMotion = useThemeStore((s) => s.toggleReducedMotion);

  // Audio Zustand selectors
  const masterMute = useAudioStore((s) => s.masterMute);
  const uiVolume = useAudioStore((s) => s.uiVolume);
  const writingVolume = useAudioStore((s) => s.writingVolume);
  const ambienceVolume = useAudioStore((s) => s.ambienceVolume);

  const setMasterMute = useAudioStore((s) => s.setMasterMute);
  const setUiVolume = useAudioStore((s) => s.setUiVolume);
  const setWritingVolume = useAudioStore((s) => s.setWritingVolume);
  const setAmbienceVolume = useAudioStore((s) => s.setAmbienceVolume);

  const [isLoading, setIsLoading] = useState(false);

  // Load preferences from backend on mount/login
  const loadSettings = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const pref = await apiClient<any>('/api/settings/theme');
      if (pref) {
        if (pref.themeName) setTheme(dbThemeToThemeType(pref.themeName));
        if (pref.fontSize) {
          const isLarge = pref.fontSize === 'large';
          if (largeText !== isLarge) toggleLargeText();
        }
        if (pref.reducedMotion !== undefined && reducedMotion !== pref.reducedMotion) toggleReducedMotion();
        if (pref.highContrast !== undefined && highContrast !== pref.highContrast) toggleHighContrast();
        
        // Sound settings
        if (pref.masterMute !== undefined) setMasterMute(pref.masterMute);
        if (pref.uiVolume !== undefined) setUiVolume(pref.uiVolume);
        if (pref.writingVolume !== undefined) setWritingVolume(pref.writingVolume);
        if (pref.ambienceVolume !== undefined) setAmbienceVolume(pref.ambienceVolume);
      }
    } catch (err) {
      console.warn('Failed to load theme preference from backend:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Synchronize on mount if user changes
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Function to save preferences back to backend database
  const saveSettings = useCallback(async (updates: {
    themeName?: string;
    fontSize?: 'small' | 'medium' | 'large';
    reducedMotion?: boolean;
    highContrast?: boolean;
    largeText?: boolean;
    masterMute?: boolean;
    uiVolume?: number;
    writingVolume?: number;
    ambienceVolume?: number;
  }) => {
    if (!user) return;
    try {
      const payload: any = { ...updates };
      // Map frontend fields to backend schema fields
      if (updates.fontSize === undefined && updates.largeText !== undefined) {
        payload.fontSize = updates.largeText ? 'large' : 'medium';
      }
      
      await apiClient('/api/settings/theme', {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.warn('Failed to persist theme preference changes to backend:', err);
    }
  }, [user]);

  return {
    theme,
    highContrast,
    largeText,
    reducedMotion,
    masterMute,
    uiVolume,
    writingVolume,
    ambienceVolume,
    isLoading,
    
    // Theme triggers (syncing directly with backend)
    setTheme: async (newTheme: ThemeType) => {
      setTheme(newTheme);
      await saveSettings({ themeName: themeTypeToDbTheme(newTheme) });
    },
    toggleHighContrast: async () => {
      toggleHighContrast();
      await saveSettings({ highContrast: !highContrast });
    },
    toggleLargeText: async () => {
      toggleLargeText();
      await saveSettings({ fontSize: !largeText ? 'large' : 'medium' });
    },
    toggleReducedMotion: async () => {
      toggleReducedMotion();
      await saveSettings({ reducedMotion: !reducedMotion });
    },
    
    // Audio triggers (syncing directly with backend)
    setMasterMute: async (mute: boolean) => {
      setMasterMute(mute);
      await saveSettings({ masterMute: mute });
    },
    setUiVolume: async (vol: number) => {
      setUiVolume(vol);
      await saveSettings({ uiVolume: vol });
    },
    setWritingVolume: async (vol: number) => {
      setWritingVolume(vol);
      await saveSettings({ writingVolume: vol });
    },
    setAmbienceVolume: async (vol: number) => {
      setAmbienceVolume(vol);
      await saveSettings({ ambienceVolume: vol });
    },
    
    refresh: loadSettings,
  };
}
