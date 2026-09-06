'use client';

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Sparkles, RefreshCw, Globe, Truck, ShieldCheck } from "lucide-react";

interface AnnouncementItem {
  id: string;
  text: string;
  badge?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

const DEFAULT_ANNOUNCEMENTS: AnnouncementItem[] = [
  {
    id: "exchange",
    text: "Hassle-free exchange within 5 days of delivery",
    badge: "5-DAY GUARANTEE",
    icon: RefreshCw,
  },
  {
    id: "international",
    text: "Free shipping on international orders of $200 and above",
    badge: "WORLDWIDE",
    icon: Globe,
  },
  {
    id: "domestic",
    text: "Complimentary Lucknow Express Delivery on orders above ₹4,000",
    badge: "PAN-INDIA",
    icon: Truck,
  },
  {
    id: "authenticity",
    text: "100% Authentic Hand-Embroidered Chikankari Direct from Lucknow Ateliers",
    badge: "GI CRAFT",
    icon: ShieldCheck,
  },
  {
    id: "artisans",
    text: "Artisan Direct — Empowering 500+ Master Women Craftswomen in Awadh",
    badge: "HERITAGE",
    icon: Sparkles,
  },
];

interface AnnouncementCarouselProps {
  initialText?: string;
}

export default function AnnouncementCarousel({ initialText }: AnnouncementCarouselProps) {
  // Parse any pipe-delimited text from database or fall back to curated announcements
  const announcements: AnnouncementItem[] = React.useMemo(() => {
    if (!initialText || initialText.trim().length === 0) {
      return DEFAULT_ANNOUNCEMENTS;
    }

    const customSegments = initialText
      .split("|")
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.includes("Test 17887"));

    if (customSegments.length === 0) {
      return DEFAULT_ANNOUNCEMENTS;
    }

    // Map custom segments, injecting icons and badges
    const customItems: AnnouncementItem[] = customSegments.map((text, idx) => {
      let icon = Sparkles;
      let badge = "ATELIER";

      const lower = text.toLowerCase();
      if (lower.includes("exchange") || lower.includes("return") || lower.includes("day")) {
        icon = RefreshCw;
        badge = "EASY EXCHANGE";
      } else if (lower.includes("international") || lower.includes("$") || lower.includes("worldwide")) {
        icon = Globe;
        badge = "WORLDWIDE";
      } else if (lower.includes("shipping") || lower.includes("delivery") || lower.includes("₹")) {
        icon = Truck;
        badge = "EXPRESS";
      } else if (lower.includes("authentic") || lower.includes("lucknow")) {
        icon = ShieldCheck;
        badge = "AUTHENTIC";
      }

      return {
        id: `custom_${idx}`,
        text,
        badge,
        icon,
      };
    });

    // Ensure the 2 primary user-requested lines are always present
    const hasExchange = customItems.some((item) =>
      item.text.toLowerCase().includes("exchange")
    );
    const hasIntl = customItems.some((item) =>
      item.text.toLowerCase().includes("international") || item.text.includes("$200")
    );

    const merged = [...customItems];
    if (!hasExchange) {
      merged.unshift(DEFAULT_ANNOUNCEMENTS[0]);
    }
    if (!hasIntl) {
      merged.splice(1, 0, DEFAULT_ANNOUNCEMENTS[1]);
    }

    return merged;
  }, [initialText]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % announcements.length);
  }, [announcements.length]);

  const prevSlide = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + announcements.length) % announcements.length);
  }, [announcements.length]);

  // Autoplay rotation every 3.8 seconds
  useEffect(() => {
    if (isPaused || announcements.length <= 1) return;

    const timer = setInterval(() => {
      nextSlide();
    }, 3800);

    return () => clearInterval(timer);
  }, [isPaused, nextSlide, announcements.length]);

  const currentItem = announcements[currentIndex] || DEFAULT_ANNOUNCEMENTS[0];
  const IconComponent = currentItem.icon || Sparkles;

  // Variants for vertical slide animation
  const slideVariants = {
    enter: (dir: number) => ({
      y: dir > 0 ? 16 : -16,
      opacity: 0,
    }),
    center: {
      y: 0,
      opacity: 1,
      transition: {
        y: { type: "spring" as const, stiffness: 380, damping: 30 },
        opacity: { duration: 0.25 },
      },
    },
    exit: (dir: number) => ({
      y: dir > 0 ? -16 : 16,
      opacity: 0,
      transition: {
        y: { type: "spring" as const, stiffness: 380, damping: 30 },
        opacity: { duration: 0.2 },
      },
    }),
  };

  return (
    <div
      role="region"
      aria-label="Store Announcements"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="w-full bg-[#121212] text-[#FFF9F4] text-[10.5px] sm:text-xs font-sans tracking-[0.14em] uppercase py-2 px-3 sm:px-6 relative overflow-hidden select-none border-b border-white/10"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between min-h-[22px]">
        {/* Previous Button */}
        <button
          type="button"
          onClick={prevSlide}
          aria-label="Previous announcement"
          className="p-1 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer hidden sm:flex items-center justify-center shrink-0"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        {/* Center Animated Message Container */}
        <div className="flex-1 flex items-center justify-center text-center overflow-hidden px-2 min-h-[22px]">
          <AnimatePresence mode="wait" custom={direction} initial={false}>
            <motion.div
              key={currentItem.id}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="flex items-center justify-center gap-2 sm:gap-2.5 font-medium leading-none"
            >
              {/* Optional Subtle Craft Icon */}
              <IconComponent className="w-3 h-3 text-[#E694AA] shrink-0 stroke-[2.2]" />

              {/* Message Text with Highlight Accent */}
              <span className="truncate max-w-[85vw] sm:max-w-none text-[#FFF9F4]">
                {currentItem.text}
              </span>

              {/* Optional Editorial Micro-Badge */}
              {currentItem.badge && (
                <span className="hidden md:inline-block text-[8.5px] tracking-[0.2em] font-bold text-[#E694AA] bg-[#E694AA]/15 px-1.5 py-0.5 rounded-xs border border-[#E694AA]/30">
                  {currentItem.badge}
                </span>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Next Button */}
        <button
          type="button"
          onClick={nextSlide}
          aria-label="Next announcement"
          className="p-1 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer hidden sm:flex items-center justify-center shrink-0"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Micro Progress Dots */}
      <div className="absolute bottom-0.5 left-0 right-0 flex justify-center items-center gap-1 opacity-40 pointer-events-none">
        {announcements.map((_, idx) => (
          <span
            key={idx}
            className={`h-[1.5px] transition-all duration-300 rounded-full ${
              idx === currentIndex ? "w-3 bg-[#E694AA] opacity-90" : "w-1 bg-white/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
