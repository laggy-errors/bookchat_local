'use client';

import gsap from 'gsap';
import { usePrefersReducedMotion, ANIMATION_DURATIONS, ANIMATION_EASINGS } from '../shared';

/**
 * Animates a newly-placed sticky note onto the page ledger.
 * Simulates a fluttering paper falling down, landing with a skew rotation and spring-cushion bounce.
 */
export function animateStickyNoteLanding(element: HTMLElement, isReduced: boolean) {
  if (!element) return;

  if (isReduced) {
    // Elegant fade
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

  // Skeuomorphic flutter & drop
  // We establish top center as the adhesive anchor hinge
  gsap.set(element, { transformOrigin: 'center top' });

  // Generate an organic landing rotation slant between -4deg and +4deg
  const finalRotate = (Math.random() - 0.5) * 8;

  gsap.fromTo(element,
    {
      y: -30,
      scale: 1.15,
      rotate: finalRotate - 12,
      opacity: 0,
      boxShadow: '0 30px 45px rgba(0,0,0,0.25)',
    },
    {
      y: 0,
      scale: 1,
      rotate: finalRotate,
      opacity: 1,
      boxShadow: '2px 3px 8px rgba(0,0,0,0.15)',
      duration: ANIMATION_DURATIONS.slow,
      ease: ANIMATION_EASINGS.gsapSpring,
    }
  );
}

/**
 * Reusable hover animation state-machine for sticky notes.
 * Pivots the lower un-glued page edge up when hover is active.
 */
export function setupStickyNoteHover(element: HTMLElement, isReduced: boolean) {
  if (!element || isReduced) return null;

  const onMouseEnter = () => {
    gsap.to(element, {
      rotateX: -15, // Lift the lower edge slightly toward the viewer
      y: -2,
      boxShadow: '3px 8px 16px rgba(0,0,0,0.18)',
      duration: ANIMATION_DURATIONS.fast,
      ease: 'power2.out',
    });
  };

  const onMouseLeave = () => {
    gsap.to(element, {
      rotateX: 0,
      y: 0,
      boxShadow: '2px 3px 8px rgba(0,0,0,0.15)',
      duration: ANIMATION_DURATIONS.normal,
      ease: 'power2.inOut',
    });
  };

  element.addEventListener('mouseenter', onMouseEnter);
  element.addEventListener('mouseleave', onMouseLeave);

  return () => {
    element.removeEventListener('mouseenter', onMouseEnter);
    element.removeEventListener('mouseleave', onMouseLeave);
  };
}
