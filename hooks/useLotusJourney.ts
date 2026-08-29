'use client';

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface Waypoint {
  /** Horizontal offset of the lotus centre from the viewport centre, as a fraction of viewport width. */
  x: number;
  /** Distance of the lotus centre from the viewport top, as a fraction of viewport height. */
  y: number;
  scale: number;
  opacity: number;
  duration: number;
}

/**
 * Editorial Lotus Waypoints:
 * - Waypoint 01 (Hero): Bottom center of hero frame, facing UPWARDS (0deg).
 * - Waypoint 02 (Hero Exit / Section 2 Entry): Rotates to face DOWNWARDS, continuous scroll entry.
 * - Waypoint 03 (Section 3 CraftStory): Travels to RIGHT-BOTTOM composition.
 * - Waypoint 04 (Section 4 ShopByFabric): Travels to MIDDLE-BOTTOM composition.
 */
const DESKTOP_WAYPOINTS: Waypoint[] = [
  { x: 0.0, y: 1.0, scale: 0.95, opacity: 0.95, duration: 0 },
  { x: 0.02, y: 0.85, scale: 0.92, opacity: 0.9, duration: 20 },
  { x: 0.28, y: 0.62, scale: 0.9, opacity: 0.85, duration: 35 },
  { x: 0.30, y: 0.75, scale: 0.85, opacity: 0.65, duration: 25 },
  { x: 0.0, y: 0.82, scale: 0.8, opacity: 0.45, duration: 20 },
];

const MOBILE_WAYPOINTS: Waypoint[] = [
  { x: 0.0, y: 1.0, scale: 0.85, opacity: 0.9, duration: 0 },
  { x: 0.01, y: 0.88, scale: 0.85, opacity: 0.88, duration: 20 },
  { x: 0.12, y: 0.58, scale: 0.82, opacity: 0.75, duration: 35 },
  { x: 0.14, y: 0.72, scale: 0.8, opacity: 0.55, duration: 25 },
  { x: 0.0, y: 0.8, scale: 0.75, opacity: 0.4, duration: 20 },
];

const DESKTOP_ROTATION = 360;
const MOBILE_ROTATION = 240;

const JOURNEY_START_TRIGGER = "#home";
const JOURNEY_END_TRIGGER = "#fabrics";

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
      scrub: true, // Direct 1-to-1 sync with Lenis / scroll position (0 lag)
      invalidateOnRefresh: true,
    },
  });

  // Rotation spans the whole timeline as a linear scrubbed tween
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

    if (
      !document.querySelector(JOURNEY_START_TRIGGER) ||
      !document.querySelector(JOURNEY_END_TRIGGER)
    ) {
      return;
    }

    // Reduced motion accessibility fallback: lotus stays static ornament at Hero bottom
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const origin = DESKTOP_WAYPOINTS[0];
      gsap.set(el, {
        xPercent: -50,
        yPercent: -50,
        transformOrigin: "50% 50%",
        x: vw() * origin.x,
        y: vh() * origin.y,
        rotation: 0,
        scale: origin.scale,
        opacity: origin.opacity,
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
