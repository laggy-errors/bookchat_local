'use client';

import gsap from 'gsap';
import { usePrefersReducedMotion, ANIMATION_DURATIONS, ANIMATION_EASINGS } from '../shared';

/**
 * Animates a silk bookmark ribbon falling down from the top spine/edge of the book.
 * Scales the ribbon vertically (from top origin) and adds a physical gravity sway.
 */
export function animateBookmarkRibbon(element: HTMLElement, isReduced: boolean) {
  if (!element) return;

  if (isReduced) {
    // Gentle fade
    gsap.fromTo(element,
      { opacity: 0 },
      { 
        opacity: 1, 
        duration: ANIMATION_DURATIONS.normal, 
        ease: ANIMATION_EASINGS.gsapPaper 
      }
    );
    return;
  }

  // Anchor the scale from top center of ribbon
  gsap.set(element, { transformOrigin: 'center top' });

  // Timeline for scale down + vertical stretch + organic sway
  const tl = gsap.timeline();

  tl.fromTo(element,
    {
      scaleY: 0,
      opacity: 0,
      skewX: -8,
    },
    {
      scaleY: 1,
      opacity: 1,
      skewX: 0,
      duration: ANIMATION_DURATIONS.slow,
      ease: ANIMATION_EASINGS.gsapSpring,
    }
  );

  // Subtly sway the hanging fabric tail twice to denote rest
  tl.to(element, {
    skewX: 3,
    duration: 0.6,
    ease: 'sine.inOut',
  })
  .to(element, {
    skewX: -1.5,
    duration: 0.5,
    ease: 'sine.inOut',
  })
  .to(element, {
    skewX: 0,
    duration: 0.4,
    ease: 'sine.inOut',
  });
}
