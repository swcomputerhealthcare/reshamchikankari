'use client';

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function HeroLotus() {
  const rotationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !rotationRef.current) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // 1. Initial State: Facing UPWARDS (rotation: 0deg), 0.95 high visibility opacity
      gsap.set(rotationRef.current, {
        rotation: 0,
        transformOrigin: "center center",
        force3D: true,
      });

      // 2. Continuous slow 360deg rotation around center + scroll scrubbed rotation into next section
      gsap.to(rotationRef.current, {
        rotation: 180,
        ease: "none",
        scrollTrigger: {
          trigger: "#home",
          start: "top top",
          end: "bottom 30%",
          scrub: 0.3,
        },
      });
    }, rotationRef);

    return () => ctx.revert();
  }, []);

  return (
    /* Stable position wrapper attached directly to bottom border of hero frame */
    <div
      className="lotus-position absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2 pointer-events-none select-none z-30"
      style={{ pointerEvents: "none" }}
      aria-hidden="true"
    >
      {/* High-visibility upright motif element (Opacity 0.95) */}
      <div
        ref={rotationRef}
        className="lotus-rotation w-[clamp(180px,18vw,280px)] aspect-square"
        style={{
          transformOrigin: "center center",
          willChange: "transform",
          opacity: 0.95,
        }}
      >
        <Image
          src="/images/lotus2.svg"
          alt="Lotus Decorative Motif"
          fill
          priority
          unoptimized
          className="object-contain filter drop-shadow-md brightness-110 opacity-100 lotus-svg"
          sizes="(max-width: 768px) 220px, 280px"
        />
      </div>
    </div>
  );
}
