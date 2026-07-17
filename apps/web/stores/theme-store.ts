import { create } from 'zustand';
import { ThemeType } from '../app/tokens';

export interface ThemeState {
  theme: ThemeType;
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
  setTheme: (theme: ThemeType) => void;
  toggleHighContrast: () => void;
  toggleLargeText: () => void;
  toggleReducedMotion: () => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: 'classic-library',
  highContrast: false,
  largeText: false,
  reducedMotion: false,
  setTheme: (theme) => set({ theme }),
  toggleHighContrast: () => set((state) => ({ highContrast: !state.highContrast })),
  toggleLargeText: () => set((state) => ({ largeText: !state.largeText })),
  toggleReducedMotion: () => set((state) => ({ reducedMotion: !state.reducedMotion })),
}));
