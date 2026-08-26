'use client';

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register ScrollTrigger plugin on client side
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface ScrollRevealProps {
  children: React.ReactNode;
  direction?: "up" | "down" | "left" | "right" | "fade";
  delay?: number;
  duration?: number;
  distance?: number;
  className?: string;
}

export default function ScrollReveal({
  children,
  direction = "up",
  delay = 0,
  duration = 0.85,
  distance = 25,
  className,
}: ScrollRevealProps) {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Respect prefers-reduced-motion user settings
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const element = elementRef.current;
    if (!element) return;

    let x = 0;
    let y = 0;

    // Defend against horizontal layout overflow on mobile screens by using vertical offsets
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
    const finalDirection = isMobile && (direction === "left" || direction === "right") ? "up" : direction;

    if (finalDirection === "up") y = distance;
    else if (finalDirection === "down") y = -distance;
    else if (finalDirection === "left") x = distance;
    else if (finalDirection === "right") x = -distance;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        element,
        {
          opacity: 0,
          x,
          y,
        },
        {
          opacity: 1,
          x: 0,
          y: 0,
          duration,
          delay,
          ease: "power2.out",
          scrollTrigger: {
            trigger: element,
            start: "top 88%",
            toggleActions: "play none none reverse",
          },
        }
      );
    });

    return () => ctx.revert(); // clean up ScrollTrigger on unmount to prevent leaks during SPA navigation
  }, [direction, delay, duration, distance]);

  return (
    <div ref={elementRef} className={className}>
      {children}
    </div>
  );
}
