'use client';

import React, { useEffect, useRef } from "react";
import gsap from "gsap";

export default function HeroAnimation({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check user preference for reduced motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      // Animate background image (scale 1.05 -> 1, subtle opacity 0.85 -> 1)
      tl.fromTo(".hero-image", 
        { scale: 1.05, opacity: 0.85 }, 
        { scale: 1, opacity: 1, duration: 1.5 }
      );

      // Animate heading parts (y: 35 -> 0, opacity 0 -> 1)
      tl.fromTo(".hero-title-part", 
        { y: 35, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.85, stagger: 0.15 },
        "-=1.1"
      );

      // Animate paragraph text (y: 15 -> 0, opacity 0 -> 1)
      tl.fromTo(".hero-p", 
        { y: 15, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.65 },
        "-=0.55"
      );

      // Animate CTA buttons (y: 10 -> 0, opacity 0 -> 1)
      tl.fromTo(".hero-btn", 
        { y: 10, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.1 },
        "-=0.4"
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-full">
      {children}
    </div>
  );
}
