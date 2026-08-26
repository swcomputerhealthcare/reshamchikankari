'use client';

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import gsap from "gsap";

interface FooterRevealProps {
  children: ReactNode;
  className?: string;
}

/**
 * Fraction of the viewport height the lockup must cross before it reveals.
 * 0.85 == GSAP's `start: "top 85%"`.
 */
const REVEAL_LINE = 0.85;

/**
 * Thin client wrapper that reveals the oversized footer brand lockup.
 *
 * Deliberately minimal: the markup itself stays authored in the server-rendered
 * Footer and is targeted here via `data-reveal` attributes, so nothing but this
 * wrapper is shipped as client JS.
 *
 * Why IntersectionObserver rather than ScrollTrigger:
 *  - The Footer lives in the (store) layout, so it mounts once and never
 *    remounts across client-side navigation. A ScrollTrigger's `start` offset is
 *    cached at creation time, so after a few route changes it can point past the
 *    new page's max scroll — with `once: true` there is no second chance, and the
 *    brand lockup would stay stuck at `opacity: 0`. IntersectionObserver is
 *    resolved by the browser against current layout every time, so it cannot go
 *    stale.
 *  - It also costs no scroll listener and no layout recalculation.
 *
 * Other performance / correctness notes:
 *  - Animates `opacity` / `transform` only, so it can never cause layout shift.
 *  - ONE paused timeline, played once, then the observer disconnects.
 *  - Everything is created inside a `gsap.context` and torn down with
 *    `ctx.revert()`, which also strips the inline styles GSAP added.
 *  - Bails out under `prefers-reduced-motion`, and bails out if the lockup is
 *    already on screen at first paint, leaving it in its natural visible state.
 */
export default function FooterReveal({ children, className }: FooterRevealProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    // Respect prefers-reduced-motion: no hiding, no animation, no observer.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // If the lockup has already crossed the reveal line on first paint — short
    // pages like an empty cart, or a restored scroll position — leave it alone.
    // This effect runs after the first paint, so hiding it here would blink
    // content the browser has already drawn.
    if (root.getBoundingClientRect().top < window.innerHeight * REVEAL_LINE) return;

    const words = root.querySelectorAll<HTMLElement>("[data-reveal='word']");
    const mark = root.querySelectorAll<HTMLElement>("[data-reveal='mark']");
    if (words.length < 2 || mark.length < 1) return;

    let observer: IntersectionObserver | undefined;

    const ctx = gsap.context(() => {
      // Pre-reveal state.
      gsap.set(words, { yPercent: 14, opacity: 0 });
      gsap.set(mark, { scale: 0.85, rotate: -4, opacity: 0 });

      // RESHAM rises, the lotus signs itself in, then CHIKANKARI resolves.
      const tl = gsap.timeline({ defaults: { ease: "power3.out" }, paused: true });
      tl.to(words[0], { yPercent: 0, opacity: 1, duration: 0.9 })
        .to(mark, { scale: 1, rotate: 0, opacity: 1, duration: 0.8 }, "-=0.55")
        .to(words[1], { yPercent: 0, opacity: 1, duration: 0.9 }, "-=0.6");

      observer = new IntersectionObserver(
        (entries, obs) => {
          if (!entries.some((entry) => entry.isIntersecting)) return;
          obs.disconnect();
          tl.play();
        },
        // Pull the viewport's bottom edge up so the reveal fires at REVEAL_LINE.
        { rootMargin: `0px 0px -${Math.round((1 - REVEAL_LINE) * 100)}% 0px` }
      );
      observer.observe(root);
    }, root);

    return () => {
      observer?.disconnect();
      ctx.revert();
    };
  }, []);

  return (
    <div ref={rootRef} className={className}>
      {children}
    </div>
  );
}
