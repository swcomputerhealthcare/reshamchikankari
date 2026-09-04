import React from "react";
import Image from "next/image";
import Container from "@/components/ui/container";
import TransitionLink from "@/components/transitions/TransitionLink";

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
      {/* 1. DESKTOP HERO LAYOUT (LOCKED — ≥1024px / lg:)                          */}
      {/* ========================================================================= */}
      <div className="hidden lg:flex absolute inset-0 z-10 pointer-events-none items-center justify-center -top-16">
        <div className="relative w-[104vw] max-w-[2000px] h-[94vh] max-h-[1050px] mx-auto">
          <Image
            src="/images/herofinal.png"
            alt="Resham Chikankari 6-model ensemble"
            fill
            priority
            unoptimized
            sizes="100vw"
            className="object-contain object-center scale-110 xl:scale-118 transition-transform duration-500"
          />
        </div>
      </div>

      {/* DESKTOP CONTENT CONTAINER (LOCKED — ≥1024px) */}
      <div className="hidden lg:flex relative z-20 flex-1 flex-col justify-between min-h-[100svh] pt-12 pb-[8svh] max-w-[1280px] mx-auto px-8 w-full">
        {/* Desktop Central Typography Lockup */}
        <div className="flex-1 flex flex-col items-center justify-center text-center my-auto py-8 max-w-[700px] mx-auto z-20 relative">
          <div
            className="hero-rise font-sans text-[11px] tracking-[0.24em] uppercase text-brand-pink font-medium mb-4"
            style={{ animationDelay: "40ms" }}
          >
            <span>The art of Lucknow / Hand embroidery</span>
          </div>

          <div
            className="hero-rise w-full"
            style={{ animationDelay: "120ms" }}
          >
            <span className="block font-display uppercase text-3xl xl:text-4xl tracking-[0.22em] text-brand-pink font-semibold mb-3">
              The art of
            </span>
            <h1 className="font-devanagari text-[clamp(5.5rem,8vw,8.5rem)] leading-[1.05] tracking-normal text-brand-offwhite font-normal drop-shadow-md">
              चिकनकारी
            </h1>
          </div>

          <p
            className="hero-rise font-sans text-base leading-relaxed text-brand-offwhite/95 max-w-[440px] mt-6 mb-8 font-medium drop-shadow-xs"
            style={{ animationDelay: "280ms" }}
          >
            Hand-embroidered in Lucknow. Reimagined for the modern woman
            through centuries of Awadh artisan heritage.
          </p>

          <div
            className="hero-rise flex items-center justify-center gap-4 w-full"
            style={{ animationDelay: "360ms" }}
          >
            <TransitionLink
              href="/shop"
              className="inline-flex items-center justify-center h-12 px-9 rounded-[2px] bg-brand-pink hover:bg-brand-pink/85 text-brand-black font-sans text-[11px] uppercase font-medium tracking-[0.2em] transition-colors whitespace-nowrap shadow-lg"
            >
              Explore kurtis
            </TransitionLink>
            <TransitionLink
              href="/about"
              className="inline-flex items-center justify-center h-12 px-9 rounded-[2px] border border-brand-offwhite/50 hover:border-brand-offwhite bg-brand-sage-section/80 backdrop-blur-[2px] text-brand-offwhite font-sans text-[11px] uppercase font-medium tracking-[0.2em] transition-colors whitespace-nowrap shadow-lg"
            >
              Our story
            </TransitionLink>
          </div>
        </div>

        {/* Desktop Bottom Statistics Rail */}
        <div
          className="hero-rise mt-8 pt-6 border-t border-brand-offwhite/15 w-full grid grid-cols-3 gap-x-12 z-20 relative"
          style={{ animationDelay: "440ms" }}
        >
          {STATS.map((stat, i) => (
            <div
              key={stat.value + stat.line1}
              className={
                i === 0
                  ? "text-left"
                  : "border-l border-brand-offwhite/15 pl-10 text-left"
              }
            >
              <span className="block font-sans text-2xl xl:text-3xl font-medium leading-none text-brand-pink">
                {stat.value}
              </span>
              <span className="mt-2 block font-sans text-[11px] uppercase tracking-[0.18em] leading-snug text-brand-offwhite/70">
                <span className="block">{stat.line1}</span>
                <span className="block">{stat.line2}</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. MOBILE BESPOKE EDITORIAL HERO LAYOUT (< 1024px / lg:hidden)            */}
      {/* ========================================================================= */}
      <div className="lg:hidden relative z-20 flex-1 flex flex-col justify-between min-h-[100svh] pt-6 sm:pt-10 pb-8 sm:pb-12 px-5 sm:px-8">
        {/* Mobile Background Campaign Model Layer */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <Image
            src="/images/hero (1).webp"
            alt="Resham Chikankari Mobile Campaign Model"
            fill
            priority
            unoptimized
            className="object-cover object-top opacity-35 filter brightness-110 contrast-105"
          />
          {/* Subtle Sage Gradient Overlays for flawless text contrast */}
          <div className="absolute inset-0 bg-gradient-to-b from-brand-sage-section/90 via-brand-sage-section/60 to-brand-sage-section" />
        </div>

        {/* Mobile Central Negative Space Typography Lockup */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center my-auto py-6 max-w-[360px] sm:max-w-[480px] mx-auto">
          {/* Badge */}
          <div className="hero-rise inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full border border-brand-pink/40 bg-brand-sage-section/80 backdrop-blur-xs text-brand-pink text-[9.5px] sm:text-[11px] tracking-[0.22em] uppercase font-semibold mb-4 shadow-sm">
            <span>✦ Awadh Heritage Craft ✦</span>
          </div>

          {/* Eyebrow */}
          <div className="hero-rise font-sans text-[10px] sm:text-[11px] tracking-[0.24em] uppercase text-brand-pink/90 font-medium mb-3">
            The art of Lucknow / Hand embroidery
          </div>

          {/* Title Lockup */}
          <div className="hero-rise w-full mb-2">
            <span className="block font-display uppercase text-lg sm:text-2xl tracking-[0.22em] text-brand-pink font-semibold mb-1">
              The art of
            </span>
            <h1 className="font-devanagari text-[clamp(3.5rem,14vw,5rem)] leading-[1.02] tracking-normal text-brand-offwhite font-normal drop-shadow-lg">
              चिकनकारी
            </h1>
          </div>

          {/* Supporting Copy */}
          <p className="hero-rise font-sans text-xs sm:text-sm leading-relaxed text-brand-offwhite/95 max-w-[300px] sm:max-w-[380px] mt-4 mb-7 font-medium drop-shadow-xs">
            Hand-embroidered in Lucknow. Reimagined for the modern woman through centuries of Awadh artisan heritage.
          </p>

          {/* CTA Buttons */}
          <div className="hero-rise flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-[280px] sm:max-w-none">
            <TransitionLink
              href="/shop"
              className="w-full sm:w-auto inline-flex items-center justify-center h-12 px-8 rounded-[2px] bg-brand-pink hover:bg-brand-pink/85 text-brand-black font-sans text-[11px] uppercase font-bold tracking-[0.2em] transition-colors whitespace-nowrap shadow-xl"
            >
              Explore kurtis
            </TransitionLink>
            <TransitionLink
              href="/about"
              className="w-full sm:w-auto inline-flex items-center justify-center h-12 px-8 rounded-[2px] border border-brand-offwhite/50 hover:border-brand-offwhite bg-brand-sage-section/80 backdrop-blur-xs text-brand-offwhite font-sans text-[11px] uppercase font-medium tracking-[0.2em] transition-colors whitespace-nowrap shadow-lg"
            >
              Our story
            </TransitionLink>
          </div>
        </div>

        {/* Heritage Statistics Editorial Bottom Rail */}
        <div className="hero-rise relative z-10 pt-5 border-t border-brand-offwhite/15 w-full grid grid-cols-3 gap-x-2 sm:gap-x-6">
          {STATS.map((stat, i) => (
            <div
              key={stat.value + stat.line1}
              className={
                i === 0
                  ? "text-center sm:text-left"
                  : "border-l border-brand-offwhite/15 pl-2 sm:pl-6 text-center sm:text-left"
              }
            >
              <span className="block font-sans text-sm sm:text-xl font-medium leading-none text-brand-pink">
                {stat.value}
              </span>
              <span className="mt-1.5 block font-sans text-[8.5px] sm:text-[10px] uppercase tracking-[0.14em] leading-tight text-brand-offwhite/75">
                <span className="block">{stat.line1}</span>
                <span className="block">{stat.line2}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
