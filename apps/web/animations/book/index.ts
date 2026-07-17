'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { usePrefersReducedMotion, ANIMATION_DURATIONS, ANIMATION_EASINGS } from '../shared';

interface HardcoverConfig {
  leftPageSelector?: string;
  rightPageSelector?: string;
  gutterSelector?: string;
}

/**
 * Custom hook/functions to orchestrate the hardcover opening/closing state machine.
 * Implements 3D skeuomorphic layout rotation pivoting on the center gutter.
 */
export function useHardcoverAnimation(
  containerRef: React.RefObject<HTMLElement | null>,
  isOpen: boolean,
  config: HardcoverConfig = {},
  onComplete?: () => void
) {
  const isReduced = usePrefersReducedMotion();
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const leftPage = config.leftPageSelector ? container.querySelector(config.leftPageSelector) : null;
    const rightPage = config.rightPageSelector ? container.querySelector(config.rightPageSelector) : null;
    const gutter = config.gutterSelector ? container.querySelector(config.gutterSelector) : null;

    if (timelineRef.current) {
      timelineRef.current.kill();
    }

    const tl = gsap.timeline({
      onComplete: () => {
        if (onComplete) onComplete();
      }
    });
    timelineRef.current = tl;

    if (isOpen) {
      // ENTER STATE
      if (isReduced) {
        // Reduced Motion: Simple high-performance fade-in
        tl.fromTo(container, 
          { opacity: 0 }, 
          { 
            opacity: 1, 
            duration: ANIMATION_DURATIONS.normal, 
            ease: ANIMATION_EASINGS.gsapPaper 
          }
        );
      } else {
        // High-fidelity 3D Hardcover Open
        // Set 3D perspective context on the container
        gsap.set(container, { perspective: 1500, transformStyle: 'preserve-3d' });

        const targets: any[] = [];
        if (leftPage) {
          gsap.set(leftPage, { transformOrigin: 'right center', backfaceVisibility: 'hidden' });
          targets.push({ el: leftPage, from: { rotateY: -28, skewY: 1.5 }, to: { rotateY: 0, skewY: 0 } });
        }
        if (rightPage) {
          gsap.set(rightPage, { transformOrigin: 'left center', backfaceVisibility: 'hidden' });
          targets.push({ el: rightPage, from: { rotateY: 28, skewY: -1.5 }, to: { rotateY: 0, skewY: 0 } });
        }

        // Master container zooms in slightly from depth and opens its hinges
        tl.fromTo(container,
          { scale: 0.94, opacity: 0 },
          { 
            scale: 1, 
            opacity: 1, 
            duration: ANIMATION_DURATIONS.bookOpen, 
            ease: ANIMATION_EASINGS.gsapBook 
          }
        );

        targets.forEach((target) => {
          tl.fromTo(target.el,
            target.from,
            { 
              ...target.to, 
              duration: ANIMATION_DURATIONS.bookOpen, 
              ease: ANIMATION_EASINGS.gsapBook 
            },
            '<' // Synchronize with container scale-in
          );
        });

        if (gutter) {
          tl.fromTo(gutter,
            { opacity: 0.3, scaleY: 0.9 },
            { 
              opacity: 1, 
              scaleY: 1, 
              duration: ANIMATION_DURATIONS.bookOpen, 
              ease: ANIMATION_EASINGS.gsapBook 
            },
            '<'
          );
        }
      }
    } else {
      // EXIT STATE
      if (isReduced) {
        tl.to(container, { 
          opacity: 0, 
          duration: ANIMATION_DURATIONS.normal, 
          ease: ANIMATION_EASINGS.gsapPaper 
        });
      } else {
        // High-fidelity 3D Hardcover Close
        const targets: any[] = [];
        if (leftPage) targets.push({ el: leftPage, to: { rotateY: -35, skewY: 2 } });
        if (rightPage) targets.push({ el: rightPage, to: { rotateY: 35, skewY: -2 } });

        tl.to(container, {
          scale: 0.93,
          opacity: 0,
          duration: ANIMATION_DURATIONS.bookOpen * 0.8,
          ease: ANIMATION_EASINGS.gsapBook,
        });

        targets.forEach((target) => {
          tl.to(target.el, {
            ...target.to,
            duration: ANIMATION_DURATIONS.bookOpen * 0.8,
            ease: ANIMATION_EASINGS.gsapBook,
          }, '<');
        });
      }
    }

    return () => {
      if (timelineRef.current) {
        timelineRef.current.kill();
      }
    };
  }, [containerRef, isOpen, isReduced, config.leftPageSelector, config.rightPageSelector, config.gutterSelector]);
}
