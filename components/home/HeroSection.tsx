'use client';

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface HeroSlide {
  id: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  image: string;
  alt: string;
  focalPoint: {
    desktop: string;
    tablet: string;
    mobile: string;
  };
  mobileFit?: "cover" | "contain";
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: "timeless-elegance",
    eyebrow: "LUXURY CHIKANKARI | HERITAGE EDITION",
    title: "Timeless Elegance",
    subtitle: "Graceful silhouettes handcrafted with love in Lucknow's ancient atelier.",
    ctaText: "SHOP KURTIS →",
    ctaLink: "/shop?category=kurtis-kurtas",
    image: "/images/hero/pc%20viewport%20(1).png",
    alt: "Resham Chikankari Rose Pink Handcrafted Kurti in Lucknow Heritage Courtyard",
    focalPoint: {
      desktop: "78% 30%",
      tablet: "74% 28%",
      mobile: "74% 22%",
    },
    mobileFit: "cover",
  },
  {
    id: "effortless-grace",
    eyebrow: "CO-ORD SETS | MODERN ETHNIC",
    title: "Effortless Grace",
    subtitle: "Chic pastel sets for breezy summer days and intimate family gatherings.",
    ctaText: "SHOP CO-ORD SETS →",
    ctaLink: "/shop?category=coord-sets",
    image: "/images/hero/pc%20viewport%20(2).png",
    alt: "Mint Green Chikankari Co-ord Set on Palace Steps",
    focalPoint: {
      desktop: "75% 35%",
      tablet: "73% 36%",
      mobile: "72% 32%",
    },
    mobileFit: "cover",
  },
  {
    id: "everyday-luxury",
    eyebrow: "AUTHENTIC HANDLOOM",
    title: "Everyday Luxury",
    subtitle: "Intricate shadow embroidery on cloud-soft organic cotton & Modal.",
    ctaText: "EXPLORE COLLECTION →",
    ctaLink: "/shop",
    image: "/images/hero/pc%20viewport%20(3).png",
    alt: "White and Yellow Hand Embroidered Chikankari Kurtis in Awadh Courtyard",
    focalPoint: {
      desktop: "68% 35%",
      tablet: "67% 38%",
      mobile: "67% 38%",
    },
    mobileFit: "cover",
  },
  {
    id: "royal-awadhi-charm",
    eyebrow: "HERITAGE REIMAGINED",
    title: "Royal Awadhi Charm",
    subtitle: "Classic monochrome & earthy tones reimagined with contemporary tailoring.",
    ctaText: "SHOP ETHNIC WEAR →",
    ctaLink: "/shop",
    image: "/images/hero/pc%20viewport%20(4).png",
    alt: "Black White and Beige Handcrafted Chikankari Suits",
    focalPoint: {
      desktop: "65% 35%",
      tablet: "67% 38%",
      mobile: "68% 38%",
    },
    mobileFit: "cover",
  },
  {
    id: "vibrant-spectrum",
    eyebrow: "ROYAL PALETTE COLLECTION",
    title: "Vibrant Spectrum",
    subtitle: "A vibrant celebration of Lucknowi craftsmanship across rich, poetic hues.",
    ctaText: "VIEW ALL COLLECTIONS →",
    ctaLink: "/shop",
    image: "/images/hero/pc%20viewport%20(5).png",
    alt: "Resham Chikankari Full Color Spectrum Handcrafted Lineup",
    focalPoint: {
      desktop: "50% 35%",
      tablet: "50% 45%",
      mobile: "50% 50%",
    },
    mobileFit: "cover",
  },
];

export default function HeroSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % HERO_SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  }, []);

  // Autoplay every 5.5 seconds
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(nextSlide, 5500);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide]);

  // Touch Swipe Handlers for Mobile & Tablet
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > minSwipeDistance) {
      nextSlide();
    } else if (distance < -minSwipeDistance) {
      prevSlide();
    }
  };

  const currentSlide = HERO_SLIDES[currentIndex];

  return (
    <section
      id="home"
      aria-label="Heritage Collections Carousel"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative w-full h-[58vh] min-h-[420px] max-h-[520px] sm:h-[68vh] sm:min-h-[500px] sm:max-h-[640px] lg:h-[90vh] lg:min-h-[680px] lg:max-h-none bg-[#1a1c18] overflow-hidden select-none"
    >
      {/* Background Image Carousel with Cross-Fade */}
      <AnimatePresence mode="sync">
        <motion.div
          key={currentSlide.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="absolute inset-0 z-0"
        >
          {/* Responsive Ultra-HD Background */}
          <div className="absolute inset-0">
            <Image
              src={currentSlide.image}
              alt={currentSlide.alt}
              fill
              priority={currentIndex === 0}
              unoptimized={true}
              sizes="100vw"
              className={`hero-slide-image transition-all duration-700 ${
                currentSlide.mobileFit === "contain"
                  ? "object-contain sm:object-cover"
                  : "object-cover"
              }`}
              style={
                {
                  '--obj-pos-mobile': currentSlide.focalPoint.mobile,
                  '--obj-pos-tablet': currentSlide.focalPoint.tablet,
                  '--obj-pos-desktop': currentSlide.focalPoint.desktop,
                } as React.CSSProperties
              }
            />
          </div>

          {/* Desktop Left Editorial Scrim: Preserves wide editorial look */}
          <div className="hidden lg:block absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 via-45% to-transparent pointer-events-none" />

          {/* Tablet Left/Bottom Scrim */}
          <div className="hidden sm:block lg:hidden absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 via-50% to-transparent pointer-events-none" />

          {/* Mobile Bottom Scrim: Keeps upper half bright and model faces clear, darkens lower half for text */}
          <div className="block sm:hidden absolute inset-0 bg-gradient-to-t from-black/95 via-black/55 via-45% to-transparent pointer-events-none" />

          {/* Bottom Scrim for desktop/tablet controls */}
          <div className="hidden sm:block absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-black/75 via-black/30 to-transparent pointer-events-none" />
        </motion.div>
      </AnimatePresence>

      {/* Foreground Content (Left-Aligned on Desktop/Tablet, Lower Anchor on Mobile) */}
      <div className="relative z-20 max-w-7xl mx-auto h-full flex flex-col justify-end sm:justify-center px-5 sm:px-12 lg:px-16 pb-14 sm:pb-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="max-w-xl text-left space-y-2.5 sm:space-y-5"
          >
            {/* Eyebrow */}
            <span className="text-[9.5px] sm:text-xs font-sans font-medium tracking-[0.22em] sm:tracking-[0.25em] uppercase text-white/90 block drop-shadow-sm">
              {currentSlide.eyebrow}
            </span>

            {/* Title */}
            <h1 className="font-display text-2xl xs:text-3xl sm:text-5xl lg:text-7xl text-white leading-[1.12] sm:leading-[1.08] tracking-tight drop-shadow-md font-normal">
              {currentSlide.title}
            </h1>

            {/* Subtitle */}
            <p className="font-sans text-xs sm:text-sm lg:text-base text-white/90 leading-relaxed max-w-md font-light drop-shadow-sm line-clamp-2 sm:line-clamp-none">
              {currentSlide.subtitle}
            </p>

            {/* Peach CTA Button */}
            <div className="pt-1 sm:pt-2">
              <Link
                href={currentSlide.ctaLink}
                className="inline-flex items-center justify-center px-6 sm:px-7 py-3 sm:py-3.5 bg-[#F5C4BE] hover:bg-[#ebaea6] text-brand-black font-sans text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] transition-all duration-200 shadow-xl hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <span>{currentSlide.ctaText}</span>
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Controls */}
      {/* Bottom Left Chevron */}
      <button
        type="button"
        onClick={prevSlide}
        aria-label="Previous Slide"
        className="absolute left-3 sm:left-8 bottom-4 sm:bottom-10 z-30 p-2 sm:p-3 rounded-full bg-black/40 hover:bg-black/75 text-white/90 hover:text-white border border-white/20 backdrop-blur-xs transition-all cursor-pointer flex items-center justify-center shadow-md active:scale-95"
      >
        <ChevronLeft className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
      </button>

      {/* Bottom Right Chevron */}
      <button
        type="button"
        onClick={nextSlide}
        aria-label="Next Slide"
        className="absolute right-3 sm:right-8 bottom-4 sm:bottom-10 z-30 p-2 sm:p-3 rounded-full bg-black/40 hover:bg-black/75 text-white/90 hover:text-white border border-white/20 backdrop-blur-xs transition-all cursor-pointer flex items-center justify-center shadow-md active:scale-95"
      >
        <ChevronRight className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
      </button>

      {/* Bottom Centered Pagination Dots */}
      <div className="absolute bottom-5 sm:bottom-11 left-0 right-0 z-30 flex justify-center items-center gap-1.5 sm:gap-2.5 pointer-events-auto">
        {HERO_SLIDES.map((slide, idx) => {
          const isActive = idx === currentIndex;
          return (
            <button
              key={slide.id}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`transition-all duration-300 rounded-full cursor-pointer p-1 ${
                isActive ? "scale-110" : "opacity-60 hover:opacity-100"
              }`}
            >
              <span
                className={`block rounded-full transition-all duration-300 ${
                  isActive
                    ? "w-2.5 h-2.5 sm:w-3 sm:h-3 bg-white ring-2 ring-white/50"
                    : "w-1.5 h-1.5 sm:w-2.5 sm:h-2.5 bg-white/50 border border-white/80"
                }`}
              />
            </button>
          );
        })}
      </div>
    </section>
  );
}
