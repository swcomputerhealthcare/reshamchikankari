import React from "react";
import Image from "next/image";
import Container from "@/components/ui/container";
import TransitionLink from "@/components/transitions/TransitionLink";
import HeroLotus from "@/components/home/HeroLotus";

const STATS = [
  { value: "32+", label: "Hand stitches" },
  { value: "500+", label: "Women artisans" },
  { value: "100%", label: "Authentic Awadh" },
];

export default function HeroSection() {
  return (
    <section
      id="home"
      className="hero-frame relative z-30 w-full min-h-[100svh] flex flex-col justify-start lg:justify-center bg-brand-sage-section border-b border-brand-offwhite/15 select-none pt-6 sm:pt-10 pb-12 sm:pb-16 lg:pb-[12svh] overflow-visible"
    >
      <HeroLotus />
      <Container>
        {/* Editorial slug line */}
        <div
          className="hero-rise flex items-center font-sans text-[10px] sm:text-[11px] tracking-[0.24em] uppercase text-brand-pink"
          style={{ animationDelay: "40ms" }}
        >
          <span>The art of Lucknow / Hand embroidery</span>
        </div>

        <div className="mt-7 sm:mt-9 grid grid-cols-1 gap-y-9 sm:gap-y-11 lg:grid-cols-12 lg:gap-x-12 lg:gap-y-10">
          {/* Title lockup — Devanagari is the largest element on the page */}
          <div
            className="hero-rise lg:col-span-7 lg:col-start-1 lg:row-start-1 lg:self-center"
            style={{ animationDelay: "120ms" }}
          >
            <span className="block font-display uppercase text-lg sm:text-2xl lg:text-[32px] leading-none tracking-[0.16em] text-brand-pink">
              The art of
            </span>
            {/* No negative tracking: it would break the shirorekha and the
                conjuncts. Leading is generous for the same reason. */}
            <h1 className="mt-3 sm:mt-4 font-devanagari text-[clamp(3rem,9vw,7.5rem)] leading-[1.15] tracking-normal text-brand-offwhite">
              चिकनकारी
            </h1>
          </div>

          {/* Editorial portrait. A printed photograph placed on the page: square
              corners, hairline rule, no shadow, no scrim, no badge. */}
          <div
            className="hero-rise lg:col-span-4 lg:col-start-9 lg:row-start-1"
            style={{ animationDelay: "200ms" }}
          >
            <div className="relative w-full max-w-[280px] sm:max-w-[320px] lg:max-w-none mx-auto lg:mx-0 aspect-[3/4] max-h-[42svh] lg:max-h-[46svh] xl:max-h-[52svh] border border-brand-offwhite/20">
              <Image
                src="/images/Hero Image 1 - ChatGPT.png"
                alt="Hand-embroidered Lucknowi Chikankari kurta photographed for the Resham campaign"
                fill
                priority
                sizes="(max-width: 1024px) 320px, 33vw"
                className="object-cover object-top"
              />
            </div>
          </div>

          {/* Supporting copy and calls to action */}
          <div className="lg:col-span-7 lg:col-start-1 lg:row-start-2">
            <p
              className="hero-rise font-sans text-sm sm:text-base leading-relaxed text-brand-offwhite/80 max-w-md"
              style={{ animationDelay: "280ms" }}
            >
              Hand-embroidered in Lucknow. Reimagined for the modern woman
              through centuries of Awadh artisan heritage.
            </p>

            {/* The link itself is the button. A <button> nested inside an <a> is
                invalid HTML and gives screen readers two overlapping controls. */}
            <div
              className="hero-rise mt-7 sm:mt-8 flex flex-wrap items-center gap-3 sm:gap-4"
              style={{ animationDelay: "360ms" }}
            >
              <TransitionLink
                href="/shop"
                className="inline-flex items-center justify-center h-11 px-7 sm:px-8 rounded-[2px] bg-brand-pink hover:bg-brand-pink/85 text-brand-black font-sans text-[11px] uppercase font-medium tracking-[0.2em] transition-colors"
              >
                Explore kurtis
              </TransitionLink>
              <TransitionLink
                href="/about"
                className="inline-flex items-center justify-center h-11 px-7 sm:px-8 rounded-[2px] border border-brand-offwhite/40 hover:border-brand-offwhite text-brand-offwhite font-sans text-[11px] uppercase font-medium tracking-[0.2em] transition-colors"
              >
                Our story
              </TransitionLink>
            </div>
          </div>
        </div>

        {/* Museum-label metadata. A 3-track grid rather than a flex row, so the
            labels wrap inside their own column instead of overflowing at 320px. */}
        <div
          className="hero-rise mt-10 sm:mt-12 pt-5 border-t border-brand-offwhite/15 grid grid-cols-3 gap-x-4 sm:gap-x-8"
          style={{ animationDelay: "440ms" }}
        >
          {STATS.map((stat, i) => (
            <div
              key={stat.label}
              className={
                i === 0
                  ? ""
                  : "border-l border-brand-offwhite/15 pl-4 sm:pl-8"
              }
            >
              <span className="block font-sans text-base sm:text-xl font-medium leading-none text-brand-pink">
                {stat.value}
              </span>
              <span className="mt-2 block font-sans text-[9px] sm:text-[10px] uppercase tracking-[0.16em] leading-snug text-brand-offwhite/65">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
