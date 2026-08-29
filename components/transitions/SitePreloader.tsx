'use client';

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useLenisContext } from "@/components/providers/SmoothScrollProvider";

export default function SitePreloader({ children }: { children: React.ReactNode }) {
  const { stop, start } = useLenisContext();
  const [isMounted, setIsMounted] = useState(false);
  const [showPreloader, setShowPreloader] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    setIsMounted(true);
    
    // Check if user has already seen preloader in this session
    const hasSeen = sessionStorage.getItem("rc_preloader_seen");
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (hasSeen === "true" || prefersReduced) {
      setIsFinished(true);
      return;
    }

    // First time in session: show preloader & lock scrolling
    setShowPreloader(true);
    stop();

    // 2-Second Sweet Spot Minimum Duration
    const MIN_PRELOADER_TIME = 2000;
    const MAX_SAFETY_TIME = 3500;
    let isResourceReady = false;

    // 1. Font readiness check
    if (document.fonts) {
      document.fonts.ready.then(() => {
        isResourceReady = true;
      }).catch(() => {
        isResourceReady = true;
      });
    } else {
      isResourceReady = true;
    }

    // 2. Preload critical hero images in background
    if (typeof window !== "undefined") {
      const img1 = new window.Image();
      img1.src = "/images/Hero%20Image%201%20-%20ChatGPT.png";
      const img2 = new window.Image();
      img2.src = "/images/chikankari_hero.png";
    }

    // 3. Staggered Timeline Animation Sequence:
    // 0-900ms: Title & Subtitle fade in
    // 900-1700ms: Progress line draws 0 -> 100%
    // 1700-1900ms: 200ms brief hold at 100%
    // 1900ms+: Exit curtain reveal
    const animateProgress = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;

      const progressStartMs = 900;
      const progressDurationMs = 800; // 900ms to 1700ms

      let rawProgress = 0;
      if (elapsed >= progressStartMs) {
        rawProgress = Math.min(100, ((elapsed - progressStartMs) / progressDurationMs) * 100);
      }

      // If progress reaches 100% before 2000ms or before resources are ready, hold at 100% until MIN_PRELOADER_TIME
      const canExit = elapsed >= MIN_PRELOADER_TIME && (isResourceReady || elapsed >= MAX_SAFETY_TIME);

      setProgress(rawProgress);

      if (!canExit || rawProgress < 100) {
        rafRef.current = requestAnimationFrame(animateProgress);
      } else {
        // Trigger curtain opening sequence at 1900ms-2000ms
        triggerExitSequence();
      }
    };

    rafRef.current = requestAnimationFrame(animateProgress);

    const safetyTimer = setTimeout(() => {
      isResourceReady = true;
    }, MAX_SAFETY_TIME);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      clearTimeout(safetyTimer);
    };
  }, [stop]);

  const triggerExitSequence = () => {
    // 1. Fade brand content gently (1700ms - 1900ms hold, then fade)
    setIsExiting(true);

    // 2. Slide curtain panel upward (1900ms - 2600ms exit)
    setTimeout(() => {
      sessionStorage.setItem("rc_preloader_seen", "true");
      setIsFinished(true);
      setShowPreloader(false);
      start(); // Unlock Lenis smooth scroll
    }, 950); // 250ms content fade + 700ms curtain slide
  };

  if (!isMounted) {
    // SSR initial shell: completely render full-screen ivory cover to prevent white flash
    return (
      <>
        <div
          aria-hidden="true"
          className="fixed inset-0 w-screen h-[100dvh] z-[999999] bg-[#FAF7F2] text-[#161616] flex flex-col justify-between p-6 sm:p-12 overflow-hidden select-none pointer-events-auto"
        >
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <span className="text-[10px] font-sans font-bold uppercase tracking-[0.3em] text-[#E694AA] mb-3">
              HANDCRAFTED IN LUCKNOW
            </span>
            <h1 className="font-display font-medium text-4xl sm:text-6xl tracking-wide text-[#161616]">
              RESHAM CHIKANKARI
            </h1>
          </div>
        </div>
        <div className="opacity-0 pointer-events-none">{children}</div>
      </>
    );
  }

  return (
    <>
      <AnimatePresence mode="wait">
        {showPreloader && !isFinished && (
          <motion.div
            key="site-preloader-curtain"
            initial={{ y: "0%" }}
            exit={{ y: "-100%" }}
            transition={{
              duration: 0.75,
              delay: 0.2,
              ease: [0.76, 0, 0.24, 1],
            }}
            className="fixed inset-0 w-screen h-[100dvh] z-[999999] bg-[#FAF7F2] text-[#161616] flex flex-col justify-between p-6 sm:p-12 md:p-16 overflow-hidden select-none touch-none pointer-events-auto"
            style={{ paddingBottom: "calc(2rem + env(safe-area-inset-bottom, 0px))" }}
          >
            {/* Top Eyebrow Detail */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: isExiting ? 0 : 0.6 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="flex justify-between items-center text-[10px] sm:text-[11px] font-mono tracking-[0.3em] uppercase text-[#161616]"
            >
              <span>ATELIER OPENING SEQUENCE</span>
              <span>LUCKNOW, INDIA</span>
            </motion.div>

            {/* Center Brand Lockup: Staggered Entrance (300-700ms Title, 700-1200ms Subtitle & Lotus) */}
            <motion.div
              animate={{ opacity: isExiting ? 0 : 1, y: isExiting ? -16 : 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="flex-1 flex flex-col items-center justify-center text-center my-auto"
            >
              {/* 300-700ms: RESHAM CHIKANKARI Fades In */}
              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                className="font-display font-medium text-4xl sm:text-6xl lg:text-7xl tracking-wide text-[#161616]"
              >
                RESHAM CHIKANKARI
              </motion.h1>

              {/* 700-1200ms: Subtitle + Subtle Lotus Motif Appears */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
                className="flex flex-col items-center mt-3"
              >
                <span className="text-[10px] sm:text-xs font-sans font-bold uppercase tracking-[0.3em] text-[#E694AA] block">
                  HANDCRAFTED IN LUCKNOW
                </span>

                <div className="relative w-12 h-12 sm:w-14 sm:h-14 mt-5">
                  <Image
                    src="/images/lotus2.svg"
                    alt="Lotus Heritage Motif"
                    width={56}
                    height={56}
                    priority
                    unoptimized
                    className="w-12 h-12 sm:w-14 sm:h-14 object-contain filter brightness-90 opacity-60"
                  />
                </div>
              </motion.div>
            </motion.div>

            {/* Bottom Section: 01 -- Progress Line -- LUCKNOW (Draws 900ms -> 1700ms) */}
            <motion.div
              animate={{ opacity: isExiting ? 0 : 1 }}
              transition={{ duration: 0.25 }}
              className="w-full space-y-3 max-w-5xl mx-auto"
            >
              <div className="flex justify-between items-center text-[10px] sm:text-xs font-mono font-bold tracking-[0.22em] uppercase text-[#161616]/75">
                <span>01</span>
                <span>LUCKNOW</span>
              </div>

              {/* 1px Progress Line Slowly Drawing Across */}
              <div className="w-full h-[1px] bg-[#161616]/15 relative overflow-hidden">
                <div
                  className="h-full bg-[#161616] transition-all duration-75 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Website Reveal Container with Elevation */}
      <motion.div
        initial={{ opacity: 0.96, y: showPreloader ? 24 : 0 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.75, delay: 0.35, ease: "easeOut" }}
        className="w-full h-full flex flex-col"
      >
        {children}
      </motion.div>
    </>
  );
}
