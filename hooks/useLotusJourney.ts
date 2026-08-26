'use client';

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Scroll-linked journey for the global lotus motif.
 *
 * The single rule this file exists to enforce: the lotus is a *function of
 * scroll position*, never an animation with a duration of its own. There are no
 * timeouts, no CSS transitions and no independent tweens — one timeline is
 * scrubbed by ScrollTrigger, so scrolling faster rotates it faster, stopping
 * stops it, and scrolling back up reverses it. Any given scroll offset always
 * produces exactly one lotus position and rotation.
 *
 * Every waypoint is expressed as a *fraction of the viewport* and passed as a
 * function, so `invalidateOnRefresh` recomputes them on resize instead of
 * baking in stale pixel values. Every segment is a `fromTo` with both endpoints
 * declared, which is what makes the journey deterministic: a `to`-only tween
 * would record its start value from whatever the element happened to look like
 * when the timeline was last rendered, and drift after a refresh.
 */

interface Waypoint {
  /** Horizontal offset of the lotus centre from the viewport centre, as a fraction of viewport width. */
  x: number;
  /** Distance of the lotus centre from the viewport top, as a fraction of viewport height. */
  y: number;
  scale: number;
  opacity: number;
  /**
   * Share of the journey spent travelling *into* this waypoint, in arbitrary
   * units that sum to 100. Ignored on the first waypoint, which is the origin.
   */
  duration: number;
}

/**
 * Phase boundaries are the ones set out in the brief: 0–20% emerging, 20–55%
 * crossing the boundary, 55–80% travelling right, 80–100% settling.
 */
const DESKTOP_WAYPOINTS: Waypoint[] = [
  // Centred exactly on the hero's bottom border, so only the upper half of the
  // flower is inside the first viewport and it reads as emerging from the edge.
  { x: 0.0, y: 1.0, scale: 0.85, opacity: 0.9, duration: 0 },
  { x: 0.02, y: 0.88, scale: 0.88, opacity: 0.9, duration: 20 },
  { x: 0.24, y: 0.44, scale: 1.0, opacity: 0.85, duration: 35 },
  { x: 0.31, y: 0.64, scale: 0.95, opacity: 0.6, duration: 25 },
  // Comes to rest as a quiet ornamental anchor in the lower right.
  { x: 0.33, y: 0.7, scale: 0.9, opacity: 0.35, duration: 20 },
];

/**
 * Mobile is a different composition rather than a scaled-down desktop one:
 * much less lateral travel, so the lotus never sweeps across the whole screen,
 * and less total rotation so it reads as slower at the same scroll distance.
 */
const MOBILE_WAYPOINTS: Waypoint[] = [
  { x: 0.0, y: 1.0, scale: 0.85, opacity: 0.85, duration: 0 },
  { x: 0.01, y: 0.9, scale: 0.88, opacity: 0.9, duration: 20 },
  { x: 0.1, y: 0.52, scale: 0.95, opacity: 0.8, duration: 35 },
  { x: 0.14, y: 0.7, scale: 0.92, opacity: 0.5, duration: 25 },
  { x: 0.15, y: 0.74, scale: 0.9, opacity: 0.3, duration: 20 },
];

const DESKTOP_ROTATION = 360;
const MOBILE_ROTATION = 240;

/** The journey spans the hero, the products section and the craft story. */
const JOURNEY_START_TRIGGER = "#home";
const JOURNEY_END_TRIGGER = "#craft";

const vw = () => window.innerWidth;
const vh = () => window.innerHeight;

function buildJourney(el: HTMLElement, waypoints: Waypoint[], totalRotation: number) {
  const origin = waypoints[0];
  const legs = waypoints.slice(1);
  const total = legs.reduce((sum, wp) => sum + wp.duration, 0);

  gsap.set(el, {
    xPercent: -50,
    yPercent: -50,
    transformOrigin: "50% 50%",
    force3D: true,
    x: () => vw() * origin.x,
    y: () => vh() * origin.y,
    rotation: 0,
    scale: origin.scale,
    opacity: origin.opacity,
  });

  const tl = gsap.timeline({
    defaults: { ease: "none", immediateRender: false },
    scrollTrigger: {
      trigger: JOURNEY_START_TRIGGER,
      start: "top top",
      endTrigger: JOURNEY_END_TRIGGER,
      end: "bottom center",
      // `true` — not a number. Lenis already smooths the scroll position, so
      // this locks the lotus to it exactly; a numeric scrub is what produces
      // the "still catching up after I stopped scrolling" lag.
      scrub: true,
      invalidateOnRefresh: true,
    },
  });

  // Rotation spans the whole timeline as a single linear tween, which makes
  // rotation identically equal to (scroll progress x totalRotation).
  tl.fromTo(el, { rotation: 0 }, { rotation: totalRotation, duration: total }, 0);

  let at = 0;
  legs.forEach((to, i) => {
    const from = waypoints[i];
    tl.fromTo(
      el,
      {
        x: () => vw() * from.x,
        y: () => vh() * from.y,
        scale: from.scale,
        opacity: from.opacity,
      },
      {
        x: () => vw() * to.x,
        y: () => vh() * to.y,
        scale: to.scale,
        opacity: to.opacity,
        duration: to.duration,
      },
      at
    );
    at += to.duration;
  });
}

export function useLotusJourney(lotusId: string | null) {
  useEffect(() => {
    if (!lotusId || typeof window === "undefined") return;

    const el = document.getElementById(lotusId);
    if (!el) return;

    // The waypoints are anchored to homepage sections; without them there is no
    // journey to build and ScrollTrigger would silently fall back to the body.
    if (
      !document.querySelector(JOURNEY_START_TRIGGER) ||
      !document.querySelector(JOURNEY_END_TRIGGER)
    ) {
      return;
    }

    // Reduced motion: no travel, no rotation, no scroll coupling. The lotus
    // stays as a static ornament at its resting position and the page is
    // completely usable without it.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const rest = DESKTOP_WAYPOINTS[DESKTOP_WAYPOINTS.length - 1];
      gsap.set(el, {
        xPercent: -50,
        yPercent: -50,
        transformOrigin: "50% 50%",
        x: vw() * rest.x,
        y: vh() * rest.y,
        rotation: 0,
        scale: rest.scale,
        opacity: rest.opacity,
      });
      return () => {
        gsap.set(el, { clearProps: "all" });
      };
    }

    const mm = gsap.matchMedia();
    mm.add("(min-width: 768px)", () => {
      buildJourney(el, DESKTOP_WAYPOINTS, DESKTOP_ROTATION);
    });
    mm.add("(max-width: 767px)", () => {
      buildJourney(el, MOBILE_WAYPOINTS, MOBILE_ROTATION);
    });

    // Section offsets are only correct once the fonts and the hero image have
    // settled, otherwise the journey is measured against a shorter page.
    let cancelled = false;
    const refresh = () => {
      if (!cancelled) ScrollTrigger.refresh();
    };

    document.fonts?.ready.then(refresh).catch(() => {});
    if (document.readyState === "complete") {
      refresh();
    } else {
      window.addEventListener("load", refresh);
    }

    return () => {
      cancelled = true;
      window.removeEventListener("load", refresh);
      mm.revert();
    };
  }, [lotusId]);
}

export default useLotusJourney;
