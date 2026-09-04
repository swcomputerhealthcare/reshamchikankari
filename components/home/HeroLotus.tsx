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
      const homeEl = document.querySelector("#home") || rotationRef.current?.parentElement;
      if (!homeEl) return;

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
          trigger: homeEl,
          start: "top top",
          end: "bottom 30%",
          scrub: true,
        },
      });
    }, rotationRef);

    return () => ctx.revert();
  }, []);

  return (
    /* Intentional heritage seal wrapper positioned cleanly on hero bottom border */
    <div
      className="lotus-position absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-[calc(38%+16px)] sm:translate-y-[calc(38%+24px)] lg:translate-y-[calc(38%+33.16px)] pointer-events-none select-none z-40"
      style={{ pointerEvents: "none" }}
      aria-hidden="true"
    >
      {/* Refined editorial motif element */}
      <div
        ref={rotationRef}
        className="lotus-rotation w-[180px] sm:w-[240px] lg:w-[310px] h-[141.5px] sm:h-[188.6px] lg:h-[243.67px] relative"
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
          className="object-contain filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.18)] brightness-110 opacity-100 lotus-svg transition-all"
          sizes="(max-width: 640px) 180px, (max-width: 1024px) 240px, 310px"
        />
      </div>
    </div>
  );
}
