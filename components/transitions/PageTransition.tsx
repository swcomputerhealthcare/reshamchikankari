'use client';

import React, {
  createContext,
  useContext,
  useRef,
  useState,
  ReactNode,
} from "react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useLenisContext } from "@/components/providers/SmoothScrollProvider";

type TransitionContextType = {
  navigate: (href: string) => void;
};

const TransitionContext = createContext<TransitionContextType | null>(null);

export function usePageTransition() {
  const context = useContext(TransitionContext);
  if (!context) {
    throw new Error(
      "usePageTransition must be used inside PageTransitionProvider"
    );
  }
  return context;
}

export function PageTransitionProvider({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const currentPathname = usePathname();
  const { stop, start } = useLenisContext();

  const [isTransitioning, setIsTransitioning] = useState(false);
  const navigating = useRef(false);

  // Guarantee scrolling is unlocked whenever currentPathname changes
  React.useEffect(() => {
    setIsTransitioning(false);
    navigating.current = false;
    start();
  }, [currentPathname, start]);

  const navigate = (href: string) => {
    // Ignore navigation to current pathname or if already navigating
    if (navigating.current || href === currentPathname) return;

    navigating.current = true;
    stop(); // Lock scrolling during transition
    setIsTransitioning(true);

    // Wait until curtain completely covers the viewport
    setTimeout(() => {
      router.push(href);

      // Allow Next.js render time before retracting curtain
      setTimeout(() => {
        setIsTransitioning(false);
        navigating.current = false;
        start(); // Unlock scrolling after transition
      }, 300);
    }, 700);
  };

  return (
    <TransitionContext.Provider value={{ navigate }}>
      {children}

      <AnimatePresence mode="wait">
        {isTransitioning && (
          <React.Fragment key="page-transition">
            {/* Layer 1: Rose Accent Hairline Layer (z-[9998]) */}
            <motion.div
              className="fixed inset-0 z-[9998] pointer-events-none bg-[#E694AA]"
              initial={{ clipPath: "inset(100% 0 0 0)" }}
              animate={{ clipPath: "inset(0% 0 0 0)" }}
              exit={{ clipPath: "inset(0 0 100% 0)" }}
              transition={{
                duration: 0.75,
                ease: [0.76, 0, 0.24, 1],
              }}
            />

            {/* Layer 2: Muted Sage Main Curtain (z-[9999]) */}
            <motion.div
              className="fixed inset-0 z-[9999] pointer-events-none bg-[#7C7A5A] flex flex-col justify-between p-6 sm:p-12 overflow-hidden select-none"
              initial={{ clipPath: "inset(100% 0 0 0)" }}
              animate={{ clipPath: "inset(0% 0 0 0)" }}
              exit={{ clipPath: "inset(0 0 100% 0)" }}
              transition={{
                duration: 0.65,
                delay: 0.06,
                ease: [0.76, 0, 0.24, 1],
              }}
            >
              {/* Editorial Top Monogram Detail */}
              <div className="flex justify-between items-center text-[9px] sm:text-[10px] font-mono tracking-[0.3em] uppercase text-[#FFF9F4]/60">
                <span>AWADH ARTISAN HOUSE</span>
                <span>LUCKNOW / EST. TRADITION</span>
              </div>

              {/* Center Zone: Footer-Style Jumbo Gilda Display Wordmark + Lotus Motif */}
              <div className="flex-1 flex flex-col items-center justify-center text-center my-auto">
                <h1 className="font-display font-bold uppercase text-[8vw] sm:text-[10vw] lg:text-[11vw] leading-[0.82] tracking-tight text-[#FFF9F4] select-none">
                  RESHAM CHIKANKARI
                </h1>

                <div className="relative w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 mt-6 sm:mt-8">
                  <Image
                    src="/images/lotus2.svg"
                    alt="Lotus Decorative Motif"
                    fill
                    priority
                    unoptimized
                    className="object-contain filter drop-shadow-md brightness-110 opacity-95"
                  />
                </div>
              </div>

              {/* Editorial Bottom Metadata */}
              <div className="flex justify-between items-end">
                <div className="text-[#FFF9F4]">
                  <span className="font-display text-xs sm:text-base tracking-[0.28em] uppercase block text-[#FFF9F4]">
                    Resham Chikankari
                  </span>
                  <span className="font-sans text-[9px] sm:text-[10px] tracking-widest text-[#FFF9F4]/60 uppercase block mt-1">
                    Handcrafted Couture
                  </span>
                </div>

                <div className="text-[#E694AA]">
                  <span className="font-mono text-xs tracking-[0.25em]">
                    01 / 04
                  </span>
                </div>
              </div>
            </motion.div>
          </React.Fragment>
        )}
      </AnimatePresence>
    </TransitionContext.Provider>
  );
}
