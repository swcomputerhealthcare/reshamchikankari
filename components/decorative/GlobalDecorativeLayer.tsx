'use client';

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function GlobalDecorativeLayer() {
  const lotusRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const isHome = pathname === "/";

  useEffect(() => {
    if (typeof window === "undefined" || !lotusRef.current || !isHome) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const element = lotusRef.current;

    const ctx = gsap.context(() => {
      // 1. Initial State (Waypoint 01: Hero Bottom Boundary, Center, Upright)
      gsap.set(element, {
        xPercent: -50,
        yPercent: 50,
        left: "50%",
        top: "calc(100svh - 64px)",
        scale: 0.85,
        rotation: 0,
        opacity: 0.95,
        force3D: true,
      });

      // 2. Timeline scrubbing lotus position & rotation dynamically linked to scroll progress
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: "#home",
          start: "top top",
          endTrigger: "#craft",
          end: "bottom center",
          scrub: 0.2, // Smooth, instant deterministic scroll link
          invalidateOnRefresh: true,
        },
      });

      // Phase A -> Phase B: Hero Bottom -> Section 02 Transition
      tl.to(element, {
        top: "130svh",
        left: "65%",
        rotation: 120,
        scale: 0.9,
        ease: "none",
      })
      // Phase B -> Phase C: Transition -> Story / Atelier Craft Section (#craft lower-right)
      .to(element, {
        top: "210svh",
        left: "82%",
        rotation: 270,
        scale: 0.92,
        ease: "none",
      })
      // Phase C -> Phase D: Settles around lower-right margin of story section
      .to(element, {
        top: "280svh",
        left: "88%",
        rotation: 360,
        scale: 0.85,
        opacity: 0.88,
        ease: "none",
      });

      // Refresh ScrollTrigger after initial layout renders
      ScrollTrigger.refresh();
    }, lotusRef);

    return () => ctx.revert();
  }, [isHome]);

  if (!isHome) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-20 overflow-hidden select-none"
      aria-hidden="true"
    >
      <div
        ref={lotusRef}
        className="absolute w-[clamp(150px,16vw,230px)] aspect-square will-change-transform"
        style={{ pointerEvents: "none" }}
      >
        <Image
          src="/images/lotus2.svg"
          alt="Lotus Decorative Motif"
          fill
          priority
          unoptimized
          className="object-contain filter drop-shadow-md brightness-110 opacity-100"
          sizes="(max-width: 768px) 150px, 230px"
        />
      </div>
    </div>
  );
}
