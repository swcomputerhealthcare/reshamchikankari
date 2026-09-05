import React from "react";
import Image from "next/image";
import TransitionLink from "@/components/transitions/TransitionLink";
import HeroLotus from "@/components/home/HeroLotus";

const STATS = [
  { value: "32+", line1: "Hand", line2: "stitches" },
  { value: "500+", line1: "Women", line2: "artisans" },
  { value: "100%", line1: "Authentic", line2: "Awadh" },
];

export default function HeroSection() {
  return (
    <section
      id="home"
      className="hero-frame relative z-30 w-full min-h-[100svh] flex flex-col justify-between bg-brand-sage-section border-b border-brand-offwhite/15 select-none overflow-hidden"
    >
      {/* ========================================================================= */}
      {/* 1. DESKTOP HERO BACKGROUND (≥1024px / lg:)                                */}
      {/* ========================================================================= */}
      <div className="hidden lg:block absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <Image
          src="/images/hero.png"
          alt="Resham Chikankari 8-Model Awadh Heritage Ensemble"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[center_32%] scale-100 transition-transform duration-700"
        />
        {/* Top Vignette Scrim — keeps palace stone arches & foliage textured while giving typography 100% contrast */}
        <div className="absolute inset-x-0 top-0 h-[38%] bg-gradient-to-b from-brand-sage-section/90 via-brand-sage-section/35 to-transparent pointer-events-none" />

        {/* Bottom Vignette Scrim — smoothly transitions into the sage section, keeping CTA and stats crisp */}
        <div className="absolute inset-x-0 bottom-0 h-[42%] bg-gradient-to-t from-brand-sage-section via-brand-sage-section/80 to-transparent pointer-events-none" />
      </div>

      {/* DESKTOP CONTENT CONTAINER (≥1024px) */}
      <div className="hidden lg:flex relative z-10 flex-1 flex-col justify-between min-h-[100svh] pt-10 pb-8 max-w-[1360px] mx-auto px-8 w-full">
        {/* Desktop Top Typography Masthead */}
        <div className="flex flex-col items-center text-center pt-2 max-w-[760px] mx-auto z-10">
          <div
            className="hero-rise inline-flex items-center gap-2 px-4 py-1 rounded-full border border-brand-pink/35 bg-brand-sage-section/70 backdrop-blur-xs font-sans text-[11px] tracking-[0.24em] uppercase text-brand-pink font-medium mb-3 shadow-xs"
            style={{ animationDelay: "40ms" }}
          >
            <span>✦ Awadh Heritage Craft ✦ The art of Lucknow</span>
          </div>

          <div
            className="hero-rise w-full"
            style={{ animationDelay: "120ms" }}
          >
            <span className="block font-display uppercase text-xl xl:text-2xl tracking-[0.24em] text-brand-pink font-semibold mb-1">
              The art of
            </span>
            <h1 className="font-devanagari text-[clamp(4.8rem,7vw,7.2rem)] leading-[1.02] tracking-normal text-brand-offwhite font-normal drop-shadow-md">
              चिकनकारी
            </h1>
          </div>
        </div>

        {/* Middle Clear Window — lets the full 8-model ensemble shine unobstructed */}
        <div className="flex-1 min-h-[180px] pointer-events-none" aria-hidden="true" />

        {/* Desktop Bottom Action & Metrics Zone */}
        <div className="flex flex-col items-center text-center pb-2 max-w-[680px] mx-auto z-10 w-full">
          <p
            className="hero-rise font-sans text-sm xl:text-base leading-relaxed text-brand-offwhite/95 max-w-[480px] mb-6 font-medium drop-shadow-xs"
            style={{ animationDelay: "240ms" }}
          >
            Hand-embroidered in Lucknow. Reimagined for the modern woman
            through centuries of Awadh artisan heritage.
          </p>

          <div
            className="hero-rise flex items-center justify-center gap-4 w-full mb-8"
            style={{ animationDelay: "320ms" }}
          >
            <TransitionLink
              href="/shop"
              className="inline-flex items-center justify-center h-12 px-9 rounded-[2px] bg-brand-pink hover:bg-brand-pink/85 text-brand-black font-sans text-[11px] uppercase font-semibold tracking-[0.2em] transition-all whitespace-nowrap shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
            >
              Explore kurtis
            </TransitionLink>
            <TransitionLink
              href="/about"
              className="inline-flex items-center justify-center h-12 px-9 rounded-[2px] border border-brand-offwhite/50 hover:border-brand-offwhite bg-brand-sage-section/80 hover:bg-brand-sage-section/95 backdrop-blur-[2px] text-brand-offwhite font-sans text-[11px] uppercase font-medium tracking-[0.2em] transition-all whitespace-nowrap shadow-lg hover:scale-[1.02] active:scale-[0.98]"
            >
              Our story
            </TransitionLink>
          </div>

          {/* Desktop Bottom Statistics Rail */}
          <div
            className="hero-rise pt-5 border-t border-brand-offwhite/15 w-full grid grid-cols-3 gap-x-12 z-20 relative"
            style={{ animationDelay: "400ms" }}
          >
            {STATS.map((stat, i) => (
              <div
                key={stat.value + stat.line1}
                className={
                  i === 0
                    ? "text-center"
                    : "border-l border-brand-offwhite/15 pl-6 text-center"
                }
              >
                <span className="block font-sans text-2xl xl:text-3xl font-medium leading-none text-brand-pink">
                  {stat.value}
                </span>
                <span className="mt-2 block font-sans text-[11px] uppercase tracking-[0.18em] leading-snug text-brand-offwhite/75">
                  <span className="block">{stat.line1}</span>
                  <span className="block">{stat.line2}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. MOBILE EDITORIAL HERO LAYOUT (< 1024px / lg:hidden)                    */}
      {/* ========================================================================= */}
      <div className="lg:hidden relative z-20 flex-1 flex flex-col justify-between min-h-[100svh] pt-6 sm:pt-8 pb-8 sm:pb-10 px-5 sm:px-8">
        {/* Mobile Background Campaign Layer */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <Image
            src="/images/hero-mobile.png"
            alt="Resham Chikankari Mobile Artisanal Collection"
            fill
            priority
            sizes="100vw"
            className="object-cover object-[center_top]"
          />
          {/* Top Scrim for Mobile Masthead Legibility */}
          <div className="absolute inset-x-0 top-0 h-[36%] bg-gradient-to-b from-brand-sage-section/95 via-brand-sage-section/40 to-transparent pointer-events-none" />

          {/* Bottom Scrim for Mobile CTA and Statistics */}
          <div className="absolute inset-x-0 bottom-0 h-[48%] bg-gradient-to-t from-brand-sage-section via-brand-sage-section/85 to-transparent pointer-events-none" />
        </div>

        {/* Mobile Top Typography Masthead */}
        <div className="relative z-10 flex flex-col items-center text-center pt-2 max-w-[360px] sm:max-w-[480px] mx-auto">
          <div className="hero-rise inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full border border-brand-pink/40 bg-brand-sage-section/85 backdrop-blur-xs text-brand-pink text-[9.5px] sm:text-[11px] tracking-[0.22em] uppercase font-semibold mb-3 shadow-xs">
            <span>✦ Awadh Heritage Craft ✦</span>
          </div>

          <div className="hero-rise font-sans text-[10px] sm:text-[11px] tracking-[0.24em] uppercase text-brand-pink/90 font-medium mb-1">
            The art of Lucknow / Hand embroidery
          </div>

          <div className="hero-rise w-full mb-1">
            <span className="block font-display uppercase text-base sm:text-xl tracking-[0.22em] text-brand-pink font-semibold mb-0.5">
              The art of
            </span>
            <h1 className="font-devanagari text-[clamp(3.4rem,13vw,4.8rem)] leading-[1.02] tracking-normal text-brand-offwhite font-normal drop-shadow-md">
              चिकनकारी
            </h1>
          </div>
        </div>

        {/* Mobile Middle Clear Window — keeps models' expressions and hand embroidery clearly visible */}
        <div className="flex-1 min-h-[140px] pointer-events-none" aria-hidden="true" />

        {/* Mobile Bottom Action & Metrics Zone */}
        <div className="relative z-10 flex flex-col items-center text-center max-w-[360px] sm:max-w-[480px] mx-auto w-full">
          <p className="hero-rise font-sans text-xs sm:text-sm leading-relaxed text-brand-offwhite/95 max-w-[300px] sm:max-w-[380px] mb-5 font-medium drop-shadow-xs">
            Hand-embroidered in Lucknow. Reimagined for the modern woman through centuries of Awadh artisan heritage.
          </p>

          <div className="hero-rise flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-[280px] sm:max-w-none mb-6">
            <TransitionLink
              href="/shop"
              className="w-full sm:w-auto inline-flex items-center justify-center h-12 px-8 rounded-[2px] bg-brand-pink hover:bg-brand-pink/85 text-brand-black font-sans text-[11px] uppercase font-bold tracking-[0.2em] transition-all whitespace-nowrap shadow-xl active:scale-[0.98]"
            >
              Explore kurtis
            </TransitionLink>
            <TransitionLink
              href="/about"
              className="w-full sm:w-auto inline-flex items-center justify-center h-12 px-8 rounded-[2px] border border-brand-offwhite/50 hover:border-brand-offwhite bg-brand-sage-section/80 backdrop-blur-xs text-brand-offwhite font-sans text-[11px] uppercase font-medium tracking-[0.2em] transition-all whitespace-nowrap shadow-lg active:scale-[0.98]"
            >
              Our story
            </TransitionLink>
          </div>

          {/* Mobile Heritage Statistics Bottom Rail */}
          <div className="hero-rise pt-4 border-t border-brand-offwhite/15 w-full grid grid-cols-3 gap-x-2 sm:gap-x-6">
            {STATS.map((stat, i) => (
              <div
                key={stat.value + stat.line1}
                className={
                  i === 0
                    ? "text-center"
                    : "border-l border-brand-offwhite/15 pl-2 sm:pl-4 text-center"
                }
              >
                <span className="block font-sans text-sm sm:text-xl font-medium leading-none text-brand-pink">
                  {stat.value}
                </span>
                <span className="mt-1 block font-sans text-[8.5px] sm:text-[10px] uppercase tracking-[0.14em] leading-tight text-brand-offwhite/75">
                  <span className="block">{stat.line1}</span>
                  <span className="block">{stat.line2}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Rotating Heritage Lotus Seal at the Section Bottom Border */}
      <HeroLotus />
    </section>
  );
}
