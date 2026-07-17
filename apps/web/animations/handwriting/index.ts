'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { usePrefersReducedMotion, ANIMATION_DURATIONS, ANIMATION_EASINGS } from '../shared';

/**
 * Hook to simulate manual quill handwriting / font drawing on vellum paper.
 * Splits text into staggered letters and animates their visibility with a subtle ink bleed effect.
 */
export function useHandwritingAnimation(
  elementRef: React.RefObject<HTMLElement | null>,
  triggerKey: any
) {
  const isReduced = usePrefersReducedMotion();

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    // Isolate text nodes or direct characters
    const text = el.innerText || '';
    if (!text.trim()) return;

    // If reduced motion, just do a fast fade-in of the text block
    if (isReduced) {
      gsap.fromTo(el,
        { opacity: 0 },
        { 
          opacity: 1, 
          duration: ANIMATION_DURATIONS.normal, 
          ease: ANIMATION_EASINGS.gsapPaper 
        }
      );
      return;
    }

    // Split text into span elements for staggered ink bleed
    const chars = text.split('');
    el.innerHTML = '';
    
    chars.forEach((char) => {
      const span = document.createElement('span');
      // Keep whitespace intact
      span.textContent = char === ' ' ? '\u00A0' : char;
      span.style.display = 'inline-block';
      span.style.opacity = '0';
      span.style.filter = 'blur(3px)';
      span.style.transform = 'translateY(1px) scale(0.95)';
      el.appendChild(span);
    });

    // Staggered timeline simulating hand scribbling
    const children = el.children;
    gsap.to(children, {
      opacity: 1,
      filter: 'blur(0px)',
      y: 0,
      scale: 1,
      stagger: 0.04, // Stagger letter drawing
      duration: 0.35,
      ease: 'power1.out',
    });

    return () => {
      // Clean up text if needed on unmount
      el.innerHTML = text;
    };
  }, [elementRef, triggerKey, isReduced]);
}
