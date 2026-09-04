'use client';

import React, { createContext, useContext, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface LenisContextType {
  lenis: Lenis | null;
  stop: () => void;
  start: () => void;
}

const LenisContext = createContext<LenisContextType>({
  lenis: null,
  stop: () => {},
  start: () => {},
});

export function useLenisContext() {
  return useContext(LenisContext);
}

export default function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    // 1. Single Global Lenis Instance with responsive physics (duration: 0.95)
    const lenis = new Lenis({
      duration: 0.95,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1.1,
      touchMultiplier: 1.5,
      autoResize: true,
    });

    lenisRef.current = lenis;

    // 2. Connect Lenis to GSAP ScrollTrigger
    lenis.on("scroll", ScrollTrigger.update);

    const updateLenis = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(updateLenis);
    gsap.ticker.lagSmoothing(1000, 16);

    // 3. ResizeObserver to dynamically recalculate page height when dynamic content/images render
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined" && document.body) {
      resizeObserver = new ResizeObserver(() => {
        lenis.resize();
        ScrollTrigger.refresh();
      });
      resizeObserver.observe(document.body);
    }

    // 4. Window event listeners for page load and window resize
    const handleResize = () => {
      lenis.resize();
      ScrollTrigger.refresh();
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("load", handleResize);

    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("load", handleResize);
      gsap.ticker.remove(updateLenis);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Sync scroll position, unlock scrolling, and refresh layout height on route change
  useEffect(() => {
    if (lenisRef.current) {
      // ALWAYS guarantee scrolling is unlocked on route change
      lenisRef.current.start();
      lenisRef.current.scrollTo(0, { immediate: true });
      lenisRef.current.resize();
      ScrollTrigger.refresh();
    }

    // Staggered safety height recalculations to catch async images and client component hydration
    const timer1 = setTimeout(() => {
      if (lenisRef.current) {
        lenisRef.current.start();
        lenisRef.current.resize();
        ScrollTrigger.refresh();
      }
    }, 150);

    const timer2 = setTimeout(() => {
      if (lenisRef.current) {
        lenisRef.current.resize();
        ScrollTrigger.refresh();
      }
    }, 600);

    const timer3 = setTimeout(() => {
      if (lenisRef.current) {
        lenisRef.current.resize();
        ScrollTrigger.refresh();
      }
    }, 1200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [pathname]);

  const stop = () => lenisRef.current?.stop();
  const start = () => lenisRef.current?.start();

  return (
    <LenisContext.Provider value={{ lenis: lenisRef.current, stop, start }}>
      {children}
    </LenisContext.Provider>
  );
}
