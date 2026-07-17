'use client';

import { useThemeStore } from '../../stores/theme-store';
import { useEffect, useState } from 'react';

// Animation state machine types as specified in Volume 14 section 4
export type AnimationState = 'Initial' | 'Enter' | 'Idle' | 'Hover' | 'Active' | 'Exit' | 'Disabled';

export interface StateMachineConfig<T> {
  Initial: T;
  Enter: T;
  Idle: T;
  Hover: T;
  Active: T;
  Exit: T;
  Disabled: T;
}

// Timing values (Volume 1 section 3) and Duration tokens (Volume 13)
export const ANIMATION_DURATIONS = {
  fast: 0.15,     // 150ms
  normal: 0.3,    // 300ms
  slow: 0.5,      // 500ms
  pageTurn: 0.7,  // Curved heavy flip
  bookOpen: 0.9,  // Hardcover visual pivot
  breathing: 4.0, // Idle slow ambient breath
};

// Easing token translation (Volume 13)
export const ANIMATION_EASINGS = {
  paper: 'cubic-bezier(0.25, 0.8, 0.25, 1)',      // Smooth sliding glide
  book: 'cubic-bezier(0.645, 0.045, 0.355, 1)',   // Heavy structural curve
  spring: 'cubic-bezier(0.43, 1.95, 0.02, 0.74)', // Organic spring bounce
  // GSAP approximations:
  gsapPaper: 'power2.out',
  gsapBook: 'power3.inOut',
  gsapSpring: 'back.out(2.0)',
  gsapBreathing: 'sine.inOut',
};

/**
 * Hook to read the consolidated prefers-reduced-motion preference,
 * combining the global user theme store toggle and the system media query.
 */
export function usePrefersReducedMotion() {
  const storeReducedMotion = useThemeStore((state) => state.reducedMotion);
  const [systemReducedMotion, setSystemReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setSystemReducedMotion(mediaQuery.matches);

    const listener = (event: MediaQueryListEvent) => {
      setSystemReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  return storeReducedMotion || systemReducedMotion;
}

/**
 * Helper to adjust GSAP or Framer Motion parameters based on reduced-motion preference.
 * Replace complex spatial shifts/rotations with gentle fades, retaining timing and usability.
 */
export function getMotionConfig<T extends Record<string, any>>(
  normalConfig: T,
  reducedConfig: Partial<T>,
  isReduced: boolean
): T {
  if (isReduced) {
    return { ...normalConfig, ...reducedConfig };
  }
  return normalConfig;
}
