'use client';

import gsap from 'gsap';
import { ANIMATION_DURATIONS, ANIMATION_EASINGS } from '../shared';

interface PageTurnOptions {
  container: HTMLElement;
  direction: 'next' | 'prev';
  isReduced: boolean;
  themeClassNames?: {
    surface: string;
    border: string;
    ink: string;
  };
  onPageSwap: () => void; // Called exactly at the 50% split point when page content changes
  onComplete?: () => void;
}

/**
 * Executes a pristine, 3D skeuomorphic page turn animation.
 * Features:
 * - Temporary 3D curved leaf insertion
 * - Dual-sided projection (Front/Back page flip)
 * - Dynamic cast shadow that stretches, blurs, and fades based on lift angle
 * - Spring-based back-action bounce on landing (easing tokens)
 * - Proper layout-thrashing prevention and cleanup
 */
export function performPageTurn(options: PageTurnOptions) {
  const { container, direction, isReduced, themeClassNames, onPageSwap, onComplete } = options;

  if (isReduced) {
    // Reduced motion fallback: Beautiful cross-fade
    const tl = gsap.timeline({
      onComplete: () => {
        if (onComplete) onComplete();
      }
    });

    tl.to(container, {
      opacity: 0.15,
      duration: ANIMATION_DURATIONS.fast,
      ease: 'power1.out',
      onComplete: onPageSwap
    });

    tl.to(container, {
      opacity: 1,
      duration: ANIMATION_DURATIONS.normal,
      ease: 'power1.in'
    });

    return;
  }

  // --- FULL SKEUOMORPHIC 3D PAGE TURN ---
  const rect = container.getBoundingClientRect();
  const halfWidth = rect.width / 2;
  const height = rect.height;

  // Set perspective on book container
  gsap.set(container, { perspective: 1800, transformStyle: 'preserve-3d' });

  // Create temporary turning leaf container
  const leaf = document.createElement('div');
  leaf.className = 'absolute top-0 bottom-0 pointer-events-none z-30';
  leaf.style.width = `${halfWidth}px`;
  leaf.style.height = `${height}px`;
  leaf.style.transformStyle = 'preserve-3d';

  // Create front and back faces for the leaf to handle dual-sided visibility
  const frontFace = document.createElement('div');
  const backFace = document.createElement('div');

  const surfaceBg = themeClassNames?.surface || 'bg-[#fdfaf2]';
  const borderCol = themeClassNames?.border || 'border-[#e8dfcb]';

  // Base styling for both faces
  [frontFace, backFace].forEach((face, idx) => {
    face.className = `absolute inset-0 ${surfaceBg} border-y border-r border-[#cfc3ab]/30 shadow-sm overflow-hidden flex flex-col justify-between p-4 md:p-8`;
    face.style.backfaceVisibility = 'hidden';
    face.style.transformStyle = 'preserve-3d';
    
    // Add realistic stacked paper edges to the flipping page
    const edge = document.createElement('div');
    edge.className = `absolute right-0 inset-y-0 w-[2px] bg-gradient-to-l from-black/10 to-transparent`;
    face.appendChild(edge);
  });

  // Back face needs to be rotated 180deg around Y to face the opposite direction
  backFace.style.transform = 'rotateY(180deg)';

  // Mock text contents on turning page faces to create text-turning illusion
  const renderMockPageContent = (face: HTMLDivElement, isFront: boolean) => {
    const paperLine = document.createElement('div');
    paperLine.className = 'space-y-4 w-full h-full opacity-35 font-serif italic text-xs py-4';
    
    const title = document.createElement('div');
    title.className = 'h-4 bg-current rounded-sm w-1/3 mb-6';
    paperLine.appendChild(title);

    for (let i = 0; i < 6; i++) {
      const line = document.createElement('div');
      line.className = `h-2.5 bg-current rounded-sm ${i % 2 === 0 ? 'w-full' : 'w-[85%]'}`;
      paperLine.appendChild(line);
    }
    face.appendChild(paperLine);
  };

  renderMockPageContent(frontFace, true);
  renderMockPageContent(backFace, false);

  leaf.appendChild(frontFace);
  leaf.appendChild(backFace);

  // Create realistic dynamic shadow cast onto remaining pages
  const shadow = document.createElement('div');
  shadow.className = 'absolute top-0 bottom-0 bg-black pointer-events-none z-20';
  shadow.style.width = `${halfWidth}px`;
  shadow.style.height = `${height}px`;
  shadow.style.transformOrigin = direction === 'next' ? 'left center' : 'right center';

  container.appendChild(shadow);
  container.appendChild(leaf);

  // Set origins and positions based on direction
  if (direction === 'next') {
    // Turning right page to left side
    leaf.style.right = '0';
    leaf.style.transformOrigin = 'left center';
    shadow.style.right = '0';
    
    gsap.set(leaf, { rotateY: 0, skewY: 0, rotateX: 0 });
    gsap.set(shadow, { opacity: 0, scaleX: 1, skewY: 0 });

    const tl = gsap.timeline({
      onComplete: () => {
        // Cleanup elements from DOM
        leaf.remove();
        shadow.remove();
        if (onComplete) onComplete();
      }
    });

    // SEQUENCE PHASE 1 & 2: Corner lift & Edge curl
    // Corner lifts up with physical page flex/twist, curling along the edge
    tl.to(leaf, {
      skewY: -3,
      rotateX: 1.5,
      duration: ANIMATION_DURATIONS.pageTurn * 0.15,
      ease: 'power1.out',
    });

    // SEQUENCE PHASE 3: Natural arch
    // Reaching peak verticality at 90 degrees with natural curved leaf arching
    tl.to(leaf, {
      rotateY: -90,
      skewY: -8, // Maximum curvature at peak height
      rotateX: 3,
      scaleX: 0.97,
      duration: ANIMATION_DURATIONS.pageTurn * 0.35,
      ease: 'power2.in',
      onComplete: () => {
        // Trigger actual state swaps of page contents underneath at peak verticality
        onPageSwap();
      }
    });

    // SEQUENCE PHASE 4: Shadow sweep
    // Shadow stretches outward, blurring, and darkening as leaf gains elevation
    tl.to(shadow, {
      opacity: 0.24,
      scaleX: 0.62,
      skewY: -7,
      filter: 'blur(10px)',
      duration: ANIMATION_DURATIONS.pageTurn * 0.5,
      ease: 'power2.in',
    }, '<');

    // SEQUENCE PHASE 5: Settle with tiny bounce
    // Falling flat with spring-back rebound and uncurling flat
    tl.to(leaf, {
      rotateY: -180,
      skewY: 0,
      rotateX: 0,
      scaleX: 1,
      duration: ANIMATION_DURATIONS.pageTurn * 0.5,
      ease: ANIMATION_EASINGS.gsapSpring, // Back-spring easing for landing
    });

    // Mirror and dissolve shadow onto left side of book as leaf lands
    tl.set(shadow, {
      left: '0',
      right: 'auto',
      transformOrigin: 'right center',
    }, '-=0.35');

    tl.to(shadow, {
      opacity: 0,
      scaleX: 1,
      skewY: 0,
      filter: 'blur(0px)',
      duration: ANIMATION_DURATIONS.pageTurn * 0.5,
      ease: ANIMATION_EASINGS.gsapSpring,
    }, '<');

  } else {
    // Turning left page to right side
    leaf.style.left = '0';
    leaf.style.transformOrigin = 'right center';
    shadow.style.left = '0';

    gsap.set(leaf, { rotateY: 0, skewY: 0, rotateX: 0 });
    gsap.set(shadow, { opacity: 0, scaleX: 1, skewY: 0 });

    const tl = gsap.timeline({
      onComplete: () => {
        leaf.remove();
        shadow.remove();
        if (onComplete) onComplete();
      }
    });

    // SEQUENCE PHASE 1 & 2: Corner lift & Edge curl
    tl.to(leaf, {
      skewY: 3,
      rotateX: -1.5,
      duration: ANIMATION_DURATIONS.pageTurn * 0.15,
      ease: 'power1.out',
    });

    // SEQUENCE PHASE 3: Natural arch
    tl.to(leaf, {
      rotateY: 90,
      skewY: 8,
      rotateX: -3,
      scaleX: 0.97,
      duration: ANIMATION_DURATIONS.pageTurn * 0.35,
      ease: 'power2.in',
      onComplete: () => {
        onPageSwap();
      }
    });

    // SEQUENCE PHASE 4: Shadow sweep
    tl.to(shadow, {
      opacity: 0.24,
      scaleX: 0.62,
      skewY: 7,
      filter: 'blur(10px)',
      duration: ANIMATION_DURATIONS.pageTurn * 0.5,
      ease: 'power2.in',
    }, '<');

    // SEQUENCE PHASE 5: Settle with tiny bounce
    tl.to(leaf, {
      rotateY: 180,
      skewY: 0,
      rotateX: 0,
      scaleX: 1,
      duration: ANIMATION_DURATIONS.pageTurn * 0.5,
      ease: ANIMATION_EASINGS.gsapSpring,
    });

    tl.set(shadow, {
      right: '0',
      left: 'auto',
      transformOrigin: 'left center',
    }, '-=0.35');

    tl.to(shadow, {
      opacity: 0,
      scaleX: 1,
      skewY: 0,
      filter: 'blur(0px)',
      duration: ANIMATION_DURATIONS.pageTurn * 0.5,
      ease: ANIMATION_EASINGS.gsapSpring,
    }, '<');
  }
}
