'use client';

import gsap from 'gsap';
import { usePrefersReducedMotion, ANIMATION_DURATIONS, ANIMATION_EASINGS } from '../shared';

/**
 * Animates a list of chat/ledger messages, staggering their entrances.
 */
export function animateChatListEntrance(container: HTMLElement, isReduced: boolean) {
  if (!container) return;

  const children = container.querySelectorAll('.chat-bubble, .ledger-row');
  if (children.length === 0) return;

  if (isReduced) {
    gsap.fromTo(children,
      { opacity: 0 },
      { 
        opacity: 1, 
        duration: ANIMATION_DURATIONS.normal, 
        stagger: 0.05,
        ease: 'power1.out' 
      }
    );
    return;
  }

  gsap.fromTo(children,
    {
      opacity: 0,
      y: 12,
      scale: 0.98,
    },
    {
      opacity: 1,
      y: 0,
      scale: 1,
      stagger: 0.08, // Staggered ripple entrance
      duration: ANIMATION_DURATIONS.normal,
      ease: ANIMATION_EASINGS.gsapSpring,
    }
  );
}

/**
 * Animates a single newly added chat bubble message.
 */
export function animateNewMessage(bubble: HTMLElement, isReduced: boolean) {
  if (!bubble) return;

  if (isReduced) {
    gsap.fromTo(bubble,
      { opacity: 0 },
      { opacity: 1, duration: ANIMATION_DURATIONS.fast }
    );
    return;
  }

  gsap.fromTo(bubble,
    {
      opacity: 0,
      y: 15,
      scale: 0.95,
      transformOrigin: 'bottom right', // Pop out from the side
    },
    {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: ANIMATION_DURATIONS.normal,
      ease: ANIMATION_EASINGS.gsapSpring,
    }
  );
}
