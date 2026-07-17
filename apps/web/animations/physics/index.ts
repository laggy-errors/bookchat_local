'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { usePrefersReducedMotion, ANIMATION_DURATIONS, ANIMATION_EASINGS } from '../shared';

// ==========================================
// 1. GRAVITY / FALL PHYSICS (usePaperDrop)
// ==========================================

export interface PaperDropOptions {
  active?: boolean;
  delay?: number;
  onComplete?: () => void;
  weight?: 'light' | 'normal' | 'heavy'; // Dictates fall velocity, air resistance drift, and landing bounce
  tilt?: number; // Custom final rotation slant
}

/**
 * Reusable hook to apply realistic gravity/fall physics to paper objects.
 * Models air resistance, sinusoidal horizontal sways (fluttering), and elastic soft landing.
 */
export function usePaperDrop(
  elementRef: React.RefObject<HTMLElement | null>,
  options: PaperDropOptions = {}
) {
  const {
    active = true,
    delay = 0,
    onComplete,
    weight = 'normal',
    tilt,
  } = options;

  const isReduced = usePrefersReducedMotion();
  const tweenRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    const el = elementRef.current;
    if (!el || !active) return;

    if (tweenRef.current) {
      tweenRef.current.kill();
    }

    const tl = gsap.timeline({
      delay,
      onComplete: () => {
        if (onComplete) onComplete();
      },
    });
    tweenRef.current = tl;

    // Determine final organic rotation slant
    const finalRotate = tilt !== undefined ? tilt : (Math.random() - 0.5) * 8;

    if (isReduced) {
      // Reduced motion: Clean, high-contrast, non-disorienting fade-in with minimal translation
      gsap.set(el, { transformOrigin: 'center center' });
      tl.fromTo(el,
        {
          opacity: 0,
          y: -10,
          scale: 0.98,
          rotate: finalRotate,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: ANIMATION_DURATIONS.normal,
          ease: ANIMATION_EASINGS.gsapPaper,
        }
      );
      return;
    }

    // High-fidelity skeuomorphic gravity sequence based on paper weight
    gsap.set(el, { transformOrigin: 'center top' });

    if (weight === 'light') {
      // Light parchment/feather weight: low terminal velocity, high drift sways
      tl.fromTo(el,
        {
          y: -250,
          scale: 1.12,
          rotate: finalRotate - 20,
          opacity: 0,
          boxShadow: '0 35px 50px rgba(0,0,0,0.22)',
        },
        {
          y: 0,
          scale: 1,
          opacity: 1,
          duration: 1.35,
          ease: 'power1.out', // Low acceleration, high air resistance
        }
      );

      // Horizontal sway (sinusoidal flutter)
      tl.fromTo(el,
        { x: -35 },
        {
          x: 0,
          duration: 1.35,
          ease: 'sine.inOut',
        },
        '<'
      );

      // Rotational flutter
      tl.to(el, {
        rotate: finalRotate + 8,
        duration: 0.45,
        ease: 'sine.inOut',
      }, '<')
      .to(el, {
        rotate: finalRotate - 4,
        duration: 0.45,
        ease: 'sine.inOut',
      })
      .to(el, {
        rotate: finalRotate,
        duration: 0.45,
        ease: 'sine.inOut',
      });

      // Shadow squashing on landing
      tl.to(el, {
        boxShadow: '1px 2px 6px rgba(0,0,0,0.12)',
        duration: 0.4,
        ease: 'power2.out',
      }, '-=0.4');

    } else if (weight === 'heavy') {
      // Heavy cardstock/cover weight: rapid fall, very minimal drift, solid micro-bounce
      tl.fromTo(el,
        {
          y: -150,
          scale: 1.05,
          rotate: finalRotate - 4,
          opacity: 0,
          boxShadow: '0 40px 60px rgba(0,0,0,0.3)',
        },
        {
          y: 0,
          scale: 1,
          rotate: finalRotate,
          opacity: 1,
          boxShadow: '3px 4px 12px rgba(0,0,0,0.2)',
          duration: 0.45,
          ease: 'back.out(2.2)', // Fast, crisp rebound bounce
        }
      );

      // Micro drift
      tl.fromTo(el,
        { x: -5 },
        {
          x: 0,
          duration: 0.45,
          ease: 'power2.out',
        },
        '<'
      );

    } else {
      // Normal paper (sticky notes, bookmarks): standard balance of drift and landing bounce
      tl.fromTo(el,
        {
          y: -200,
          scale: 1.1,
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
          duration: ANIMATION_DURATIONS.slow + 0.15,
          ease: ANIMATION_EASINGS.gsapSpring, // Elegant spring bounce
        }
      );

      // Moderate pendulum drift
      tl.fromTo(el,
        { x: -20 },
        {
          x: 0,
          duration: ANIMATION_DURATIONS.slow + 0.15,
          ease: 'sine.inOut',
        },
        '<'
      );

      // Twist flutter
      tl.to(el, {
        rotate: finalRotate + 6,
        duration: (ANIMATION_DURATIONS.slow + 0.15) * 0.5,
        ease: 'sine.inOut',
      }, '<')
      .to(el, {
        rotate: finalRotate,
        duration: (ANIMATION_DURATIONS.slow + 0.15) * 0.5,
        ease: 'sine.inOut',
      });
    }

    return () => {
      if (tweenRef.current) {
        tweenRef.current.kill();
      }
    };
  }, [elementRef, active, delay, weight, isReduced, tilt]);
}

// ==========================================
// 2. FOLD / UNFOLD PHYSICS (usePaperFoldUnfold)
// ==========================================

export interface PaperFoldOptions {
  direction?: 'top' | 'left' | 'right' | 'bottom'; // Which side serves as the crease hinge
  delay?: number;
  onComplete?: () => void;
  tension?: number; // Tension of the paper crease resistance (spring strength)
}

/**
 * Custom hook to simulate folding and unfolding of paper panels, menus, or annotations.
 * Models crease shadow lines, physical fiber resistance, and an organic springy rebound.
 */
export function usePaperFoldUnfold(
  elementRef: React.RefObject<HTMLElement | null>,
  isOpen: boolean,
  options: PaperFoldOptions = {}
) {
  const {
    direction = 'top',
    delay = 0,
    onComplete,
    tension = 1.6,
  } = options;

  const isReduced = usePrefersReducedMotion();
  const tweenRef = useRef<gsap.core.Tween | gsap.core.Timeline | null>(null);

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    if (tweenRef.current) {
      tweenRef.current.kill();
    }

    // Set 3D perspective context on the parent container if not already set
    const parent = el.parentElement;
    if (parent) {
      gsap.set(parent, { perspective: 1200, transformStyle: 'preserve-3d' });
    }

    // Map hinges to transform-origin values
    const originMap = {
      top: 'center top',
      bottom: 'center bottom',
      left: 'left center',
      right: 'right center',
    };
    gsap.set(el, { 
      transformOrigin: originMap[direction], 
      backfaceVisibility: 'hidden',
      transformStyle: 'preserve-3d'
    });

    if (isReduced) {
      // Reduced motion: high performance, eye-safe cross-fade without 3D rotations
      tweenRef.current = gsap.to(el, {
        opacity: isOpen ? 1 : 0,
        scale: isOpen ? 1 : 0.97,
        duration: ANIMATION_DURATIONS.normal,
        ease: ANIMATION_EASINGS.gsapPaper,
        delay,
        onComplete,
      });
      return;
    }

    const tl = gsap.timeline({
      delay,
      onComplete,
    });
    tweenRef.current = tl;

    if (isOpen) {
      // UNFOLDING SEQUENCE
      // Undergoes high initial paper resistance at the crease line, opens rapidly, and springs back
      const rotVars = {
        top: { rotateX: -95, skewX: 3 },
        bottom: { rotateX: 95, skewX: -3 },
        left: { rotateY: 95, skewY: 3 },
        right: { rotateY: -95, skewY: -3 },
      };

      const finalRot = {
        top: { rotateX: 0, skewX: 0 },
        bottom: { rotateX: 0, skewX: 0 },
        left: { rotateY: 0, skewY: 0 },
        right: { rotateY: 0, skewY: 0 },
      };

      gsap.set(el, rotVars[direction]);

      tl.fromTo(el,
        {
          opacity: 0.3,
          ...rotVars[direction],
        },
        {
          opacity: 1,
          ...finalRot[direction],
          duration: ANIMATION_DURATIONS.slow + 0.1,
          ease: `back.out(${tension})`, // Rebound spring as the page settles flat
        }
      );

      // Crease shadow dissipation simulation
      tl.fromTo(el,
        { filter: 'brightness(0.85) contrast(1.15)' },
        {
          filter: 'brightness(1) contrast(1)',
          duration: ANIMATION_DURATIONS.slow + 0.1,
          ease: 'power2.out',
        },
        '<'
      );

    } else {
      // FOLDING SEQUENCE
      // Folds neatly back into the spine/crease line with deceleration
      const foldRot = {
        top: { rotateX: -95, skewX: 1.5 },
        bottom: { rotateX: 95, skewX: -1.5 },
        left: { rotateY: 95, skewY: 1.5 },
        right: { rotateY: -95, skewY: -1.5 },
      };

      tl.to(el, {
        opacity: 0,
        ...foldRot[direction],
        filter: 'brightness(0.8) contrast(1.2)',
        duration: ANIMATION_DURATIONS.normal,
        ease: 'power2.inOut',
      });
    }

    return () => {
      if (tweenRef.current) {
        tweenRef.current.kill();
      }
    };
  }, [elementRef, isOpen, direction, delay, tension, isReduced, onComplete]);
}

// ==========================================
// 3. PHYSICAL COMPRESSION (usePaperCompression)
// ==========================================

export interface CompressionOptions {
  enabled?: boolean;
  intensity?: 'soft' | 'medium' | 'hard'; // Elastic strength of the fibers
}

/**
 * Hook to apply realistic physical compression on element click/press.
 * Instead of generic uniform scaling, this simulates Poisson's ratio:
 * the element compresses vertically (squeeze) while bulging slightly horizontally,
 * accompanied by shadow sharpening to represent proximity to the surface desk.
 */
export function usePaperCompression(
  elementRef: React.RefObject<HTMLElement | null>,
  options: CompressionOptions = {}
) {
  const { enabled = true, intensity = 'medium' } = options;
  const isReduced = usePrefersReducedMotion();

  useEffect(() => {
    const el = elementRef.current;
    if (!el || !enabled) return;

    let originalBoxShadow = '';
    
    const handlePress = () => {
      if (isReduced) {
        // Reduced motion: Clean opacity shift feedback
        gsap.to(el, {
          opacity: 0.82,
          duration: ANIMATION_DURATIONS.fast,
          ease: 'power1.out',
        });
        return;
      }

      // Record current shadow to restore correctly later
      const computed = window.getComputedStyle(el);
      originalBoxShadow = computed.boxShadow;

      // Map elastic coefficients
      const config = {
        soft: { scaleY: 0.98, scaleX: 1.004, shadow: '0px 2px 4px rgba(0,0,0,0.12)' },
        medium: { scaleY: 0.95, scaleX: 1.01, shadow: '0px 1px 3px rgba(0,0,0,0.15)' },
        hard: { scaleY: 0.91, scaleX: 1.02, shadow: '0px 0.5px 1.5px rgba(0,0,0,0.18)' },
      };

      const spec = config[intensity];

      gsap.to(el, {
        scaleY: spec.scaleY,
        scaleX: spec.scaleX,
        boxShadow: spec.shadow,
        duration: 0.12,
        ease: 'power2.out',
      });
    };

    const handleRelease = () => {
      if (isReduced) {
        gsap.to(el, {
          opacity: 1,
          duration: ANIMATION_DURATIONS.normal,
          ease: 'power1.in',
        });
        return;
      }

      // Dynamic rebound bounce as fibers expand back to resting state
      gsap.to(el, {
        scaleY: 1,
        scaleX: 1,
        boxShadow: originalBoxShadow || '2px 3px 8px rgba(0,0,0,0.15)',
        duration: 0.38,
        ease: 'back.out(3.5)', // Elastic overshoot spring back
      });
    };

    // Attach listeners for both pointer and touch
    el.addEventListener('mousedown', handlePress);
    el.addEventListener('mouseup', handleRelease);
    el.addEventListener('mouseleave', handleRelease);
    
    el.addEventListener('touchstart', handlePress, { passive: true });
    el.addEventListener('touchend', handleRelease, { passive: true });
    el.addEventListener('touchcancel', handleRelease, { passive: true });

    return () => {
      el.removeEventListener('mousedown', handlePress);
      el.removeEventListener('mouseup', handleRelease);
      el.removeEventListener('mouseleave', handleRelease);

      el.removeEventListener('touchstart', handlePress);
      el.removeEventListener('touchend', handleRelease);
      el.removeEventListener('touchcancel', handleRelease);
    };
  }, [elementRef, enabled, intensity, isReduced]);
}
