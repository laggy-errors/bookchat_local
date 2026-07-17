/**
 * DESIGN TOKEN COMPANION SYSTEM (VOLUME 13)
 * Strongly typed design token system for programmatic and JS-based references
 * (e.g. Framer Motion, canvas layouts, chart visualizations, etc.).
 */

export const DESIGN_TOKENS = {
  colors: {
    paper: {
      bg: 'var(--paper-bg)',
      surface: 'var(--paper-surface)',
      surfaceDim: 'var(--paper-surface-dim)',
      border: 'var(--paper-border)',
      borderDim: 'var(--paper-border-dim)',
    },
    ink: {
      primary: 'var(--ink-primary)',
      secondary: 'var(--ink-secondary)',
      muted: 'var(--ink-muted)',
      light: 'var(--ink-light)',
    },
    accent: {
      red: 'var(--accent-red)',
      gold: 'var(--accent-gold)',
      green: 'var(--accent-green)',
      blue: 'var(--accent-blue)',
    },
    sticky: {
      yellow: {
        bg: 'var(--sticky-yellow-bg)',
        ink: 'var(--sticky-yellow-ink)',
        border: 'var(--sticky-yellow-border)',
      },
      pink: {
        bg: 'var(--sticky-pink-bg)',
        ink: 'var(--sticky-pink-ink)',
        border: 'var(--sticky-pink-border)',
      },
      blue: {
        bg: 'var(--sticky-blue-bg)',
        ink: 'var(--sticky-blue-ink)',
        border: 'var(--sticky-blue-border)',
      },
      green: {
        bg: 'var(--sticky-green-bg)',
        ink: 'var(--sticky-green-ink)',
        border: 'var(--sticky-green-border)',
      }
    },
    status: {
      success: {
        text: 'var(--status-success)',
        bg: 'var(--status-success-bg)',
        border: 'var(--status-success-border)',
      },
      error: {
        text: 'var(--status-error)',
        bg: 'var(--status-error-bg)',
        border: 'var(--status-error-border)',
      },
      warning: {
        text: 'var(--status-warning)',
        bg: 'var(--status-warning-bg)',
        border: 'var(--status-warning-border)',
      },
      info: {
        text: 'var(--status-info)',
        bg: 'var(--status-info-bg)',
        border: 'var(--status-info-border)',
      }
    }
  },
  typography: {
    families: {
      serif: 'var(--font-family-serif)',
      sans: 'var(--font-family-sans)',
      handwritten: 'var(--font-family-handwritten)',
      playfair: 'var(--font-family-playfair)',
    },
    sizes: {
      display: 'var(--size-display)',
      heading: 'var(--size-heading)',
      chapter: 'var(--size-chapter)',
      body: 'var(--size-body)',
      caption: 'var(--size-caption)',
      notes: 'var(--size-notes)',
      signature: 'var(--size-signature)',
      button: 'var(--size-button)',
      label: 'var(--size-label)',
      input: 'var(--size-input)',
    }
  },
  spacing: {
    space1: 'var(--space-1)',
    space2: 'var(--space-2)',
    space3: 'var(--space-3)',
    space4: 'var(--space-4)',
    space5: 'var(--space-5)',
    space6: 'var(--space-6)',
    space7: 'var(--space-7)',
    space8: 'var(--space-8)',
    space9: 'var(--space-9)',
    space10: 'var(--space-10)',
    space11: 'var(--space-11)',
    space12: 'var(--space-12)',
    space13: 'var(--space-13)',
    space14: 'var(--space-14)',
    space15: 'var(--space-15)',
    space16: 'var(--space-16)',
  },
  radius: {
    sm: 'var(--radius-sm)',
    md: 'var(--radius-md)',
    lg: 'var(--radius-lg)',
    paper: 'var(--radius-paper)',
    book: 'var(--radius-book)',
  },
  shadows: {
    paper: 'var(--shadow-paper-val)',
    page: 'var(--shadow-page-val)',
    book: 'var(--shadow-book-val)',
    sticky: 'var(--shadow-sticky-val)',
    hover: 'var(--shadow-hover-val)',
    depth: 'var(--shadow-depth-val)',
  },
  motion: {
    duration: {
      fast: 'var(--duration-fast)',
      normal: 'var(--duration-normal)',
      slow: 'var(--duration-slow)',
    },
    easing: {
      paper: 'var(--ease-paper)',
      book: 'var(--ease-book)',
      spring: 'var(--ease-spring)',
    }
  },
  zindex: {
    base: 'var(--z-base)',
    page: 'var(--z-page)',
    sticky: 'var(--z-sticky)',
    dialog: 'var(--z-dialog)',
    modal: 'var(--z-modal)',
    tooltip: 'var(--z-tooltip)',
  },
  breakpoints: {
    mobile: 'var(--breakpoint-mobile)',
    tablet: 'var(--breakpoint-tablet)',
    desktop: 'var(--breakpoint-desktop)',
    wide: 'var(--breakpoint-wide)',
  },
  accessibility: {
    focusRing: 'var(--focus-ring-outline)',
    focusRingOffset: 'var(--focus-ring-offset)',
  }
} as const;

export type ThemeType = 
  | 'classic-library'
  | 'vintage-journal'
  | 'night-reading'
  | 'rainy-evening'
  | 'fireplace'
  | 'collector-edition'
  | 'lined-journal';

export const THEMES: Record<ThemeType, { name: string; description: string }> = {
  'classic-library': {
    name: 'Classic Library',
    description: 'Rich mahogany desk, warm vellum pages, and soft charcoal inks.'
  },
  'vintage-journal': {
    name: 'Vintage Journal',
    description: 'Tea-stained parchment, worn spine overlays, and old sepia iron-gall inks.'
  },
  'night-reading': {
    name: 'Night Reading',
    description: 'Low-contrast eye-safe dark mode with warm candle glows and dim amber paper.'
  },
  'rainy-evening': {
    name: 'Rainy Evening',
    description: 'Cool window-sill slate borders, overcast sky pages, and wet midnight-navy script.'
  },
  'fireplace': {
    name: 'Fireplace',
    description: 'Charred timber boundaries, warm terracotta paper, and brick-ember accents.'
  },
  'collector-edition': {
    name: 'Collector Edition',
    description: 'Imperial emerald bindings, heavy cream ivory sheets, and gilded gold leaf highlights.'
  },
  'lined-journal': {
    name: 'Lined Journal',
    description: 'Hand-ruled ledger paper, red margin guidelines, and elegant italic script.'
  }
};
