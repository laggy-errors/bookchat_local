'use client';

import { useEffect } from 'react';
import { useThemeStore } from '../stores/theme-store';

/**
 * Syncs the theme store state with document.documentElement data attributes.
 */
export function ThemeSync() {
  const { theme, highContrast, largeText, reducedMotion } = useThemeStore();

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    root.setAttribute('data-theme', theme);

    if (highContrast) {
      root.setAttribute('data-contrast', 'high');
    } else {
      root.removeAttribute('data-contrast');
    }

    if (largeText) {
      root.setAttribute('data-text-scale', 'large');
    } else {
      root.removeAttribute('data-text-scale');
    }

    if (reducedMotion) {
      root.setAttribute('data-reduced-motion', 'true');
    } else {
      root.removeAttribute('data-reduced-motion');
    }
  }, [theme, highContrast, largeText, reducedMotion]);

  return null;
}
