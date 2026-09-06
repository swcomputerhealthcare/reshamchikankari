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
  imageMobile: string;
  alt: string;
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: "timeless-elegance",
    eyebrow: "KURTIS | CO-ORD SETS | ETHNIC WEAR",
    title: "Timeless Elegance",
    subtitle: "Graceful silhouettes for every chapter of you.",
    ctaText: "SHOP KURTIS →",
    ctaLink: "/shop?category=kurtis-kurtas",
    image: "/images/hero-carousel-1.jpg",
    imageMobile: "/images/hero-mobile-1.jpg",
    alt: "Resham Chikankari Timeless Elegance Lineup in Lucknow Heritage Courtyard",
  },
  {
    id: "effortless-together",
    eyebrow: "CO-ORD SETS",
    title: "Effortless Together",
    subtitle: "Stylish sets for easy days and special moments.",
    ctaText: "SHOP CO-ORD SETS →",
    ctaLink: "/shop?category=coord-sets",
    image: "/images/hero-carousel-2.jpg",
    imageMobile: "/images/hero-mobile-2.jpg",
    alt: "Effortless Together Mint Green Chikankari Co-ord Set on Palace Steps",
  },
  {
    id: "everyday-elegance",
    eyebrow: "KURTIS",
    title: "Everyday Elegance",
    subtitle: "Comfortable. Versatile. Always in style.",
    ctaText: "SHOP KURTIS →",
    ctaLink: "/shop?category=kurtis-kurtas",
    image: "/images/hero-carousel-3.jpg",
    imageMobile: "/images/hero-mobile-3.jpg",
    alt: "Everyday Elegance Rose Pink Handcrafted Lucknowi Kurti in Awadh Garden",
  },
  {
    id: "heritage-reimagined",
    eyebrow: "CO-ORD SETS",
    title: "Heritage Reimagined",
    subtitle: "Classic silhouettes, modern comfort.",
    ctaText: "SHOP CO-ORD SETS →",
    ctaLink: "/shop?category=coord-sets",
    image: "/images/hero-carousel-4.jpg",
    imageMobile: "/images/hero-mobile-4.jpg",
    alt: "Heritage Reimagined White and Yellow Chikankari Co-ord Sets",
  },
];

export default function HeroSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

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

  const currentSlide = HERO_SLIDES[currentIndex];

  return (
    <section
      id="home"
      aria-label="Heritage Collections Carousel"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative w-full h-[84vh] min-h-[580px] sm:h-[88vh] sm:min-h-[620px] lg:h-[92vh] lg:min-h-[700px] bg-[#1a1c18] overflow-hidden select-none"
    >
      {/* Background Image Carousel with Cross-Fade */}
      <AnimatePresence mode="sync">
        <motion.div
          key={currentSlide.id}
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: [0.25, 0.1, 0.25, 1] }}
          className="absolute inset-0 z-0"
        >
          {/* Desktop 4K Ultra-HD Background */}
          <div className="hidden sm:block absolute inset-0">
            <Image
              src={currentSlide.image}
              alt={currentSlide.alt}
              fill
              priority={currentIndex === 0}
              quality={92}
              sizes="100vw"
              className="object-cover object-center sm:object-[center_35%]"
            />
          </div>

          {/* Mobile Dedicated Portrait Background */}
          <div className="block sm:hidden absolute inset-0">
            <Image
              src={currentSlide.imageMobile}
              alt={currentSlide.alt}
              fill
              priority={currentIndex === 0}
              quality={92}
              sizes="100vw"
              className="object-cover object-center"
            />
          </div>

          {/* Desktop Left Editorial Scrim: Ensures text legibility matching reference design */}
          <div className="hidden sm:block absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-transparent pointer-events-none" />

          {/* Mobile Scrim: Top subtle gradient for text legibility, bottom gradient for controls */}
          <div className="block sm:hidden absolute inset-0 bg-gradient-to-b from-black/70 via-black/25 to-black/60 pointer-events-none" />

          {/* Bottom Scrim for desktop controls */}
          <div className="hidden sm:block absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/70 via-black/25 to-transparent pointer-events-none" />
        </motion.div>
      </AnimatePresence>

      {/* Foreground Content (Left-Aligned Text & CTA matching reference) */}
      <div className="relative z-20 max-w-7xl mx-auto h-full flex flex-col justify-center px-6 sm:px-12 lg:px-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide.id}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="max-w-xl text-left space-y-4 sm:space-y-6 pt-12 sm:pt-0"
          >
            {/* Eyebrow */}
            <span className="text-[10px] sm:text-xs font-sans font-medium tracking-[0.25em] uppercase text-white/90 block">
              {currentSlide.eyebrow}
            </span>

            {/* Title */}
            <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl text-white leading-[1.06] tracking-tight drop-shadow-sm font-normal">
              {currentSlide.title}
            </h1>

            {/* Subtitle */}
            <p className="font-sans text-xs sm:text-base text-white/90 leading-relaxed max-w-md font-light">
              {currentSlide.subtitle}
            </p>

            {/* Peach CTA Button matching reference */}
            <div className="pt-2">
              <Link
                href={currentSlide.ctaLink}
                className="inline-flex items-center justify-center px-7 py-3.5 bg-[#F5C4BE] hover:bg-[#ebaea6] text-brand-black font-sans text-[10.5px] sm:text-xs font-bold uppercase tracking-[0.2em] transition-all duration-200 shadow-lg hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <span>{currentSlide.ctaText}</span>
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Controls Matching Reference */}
      {/* Bottom Left Chevron */}
      <button
        type="button"
        onClick={prevSlide}
        aria-label="Previous Slide"
        className="absolute left-4 sm:left-8 bottom-6 sm:bottom-10 z-30 p-2.5 sm:p-3 rounded-full bg-black/40 hover:bg-black/70 text-white/90 hover:text-white border border-white/20 backdrop-blur-xs transition-all cursor-pointer flex items-center justify-center shadow-md active:scale-95"
      >
        <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>

      {/* Bottom Right Chevron */}
      <button
        type="button"
        onClick={nextSlide}
        aria-label="Next Slide"
        className="absolute right-4 sm:right-8 bottom-6 sm:bottom-10 z-30 p-2.5 sm:p-3 rounded-full bg-black/40 hover:bg-black/70 text-white/90 hover:text-white border border-white/20 backdrop-blur-xs transition-all cursor-pointer flex items-center justify-center shadow-md active:scale-95"
      >
        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>

      {/* Bottom Centered Pagination Dots */}
      <div className="absolute bottom-7 sm:bottom-11 left-0 right-0 z-30 flex justify-center items-center gap-2 sm:gap-2.5 pointer-events-auto">
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
                    : "w-2 h-2 sm:w-2.5 sm:h-2.5 bg-white/50 border border-white/80"
                }`}
              />
            </button>
          );
        })}
      </div>
    </section>
  );
}
