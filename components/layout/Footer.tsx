'use client';

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Container from "@/components/ui/container";

export default function Footer() {
  const year = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSubmitted(true);
    setEmail("");
  };

  return (
    <footer
      id="footer"
      className="bg-brand-sage-section text-brand-offwhite border-t border-brand-offwhite/15 relative z-10 pt-14 sm:pt-20 pb-8 select-none font-sans"
    >
      <Container>
        {/* 01 — TOP FOOTER: 3-Column Editorial Grid (Newsletter Left, Navigation Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 pb-14">
          {/* Left Column: Brand Mark & Minimal Editorial Newsletter */}
          <div className="lg:col-span-5 space-y-6 text-left">
            <div className="flex items-center gap-4 sm:gap-5">
              <Link href="/" className="shrink-0 hover:opacity-95 transition-opacity" aria-label="Resham Chikankari Home">
                <Image
                  src="/images/logo.webp"
                  alt="Resham Chikankari Brand Seal"
                  width={120}
                  height={120}
                  priority
                  className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-full shadow-lg border border-brand-offwhite/20"
                />
              </Link>
              <div>
                <span className="font-sans text-xs sm:text-[13px] uppercase font-bold tracking-[0.24em] text-brand-pink block">
                  ATELIER GAZETTE
                </span>
                <h3 className="font-display text-2xl sm:text-3xl font-semibold text-brand-offwhite leading-snug mt-1">
                  Stay in the know
                </h3>
              </div>
            </div>

            <p className="font-sans text-sm sm:text-base text-brand-offwhite/80 leading-relaxed max-w-sm">
              Subscribe for private previews, artisanal stories, and exclusive heritage collection drops.
            </p>

            {/* 02 — NEWSLETTER FORM */}
            <form onSubmit={handleSubmit} className="mt-5 space-y-2.5 max-w-sm">
              <div className="relative flex items-center w-full border-b border-brand-offwhite/30 focus-within:border-brand-pink transition-colors">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full py-3 bg-transparent text-sm sm:text-[15px] text-brand-offwhite placeholder:text-brand-offwhite/45 focus:outline-none font-sans"
                />
                <button
                  type="submit"
                  aria-label="Subscribe to newsletter"
                  className="px-2 text-base font-bold text-brand-pink hover:text-brand-offwhite transition-colors cursor-pointer"
                >
                  →
                </button>
              </div>

              {isSubmitted && (
                <p className="font-sans text-xs sm:text-sm text-brand-pink font-medium animate-fadeIn">
                  ✦ Thank you for subscribing to our Atelier.
                </p>
              )}

              <p className="font-sans text-[11px] sm:text-xs text-brand-offwhite/50 leading-normal pt-1">
                By subscribing, you agree to receive email updates and accept our{" "}
                <Link href="/terms" className="underline hover:text-brand-pink">
                  Terms
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="underline hover:text-brand-pink">
                  Privacy Policy
                </Link>
                .
              </p>
            </form>
          </div>

          {/* Right Column: 3 Link Groups (Shop, Explore, Support) — Inter Font & Bigger Size */}
          <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-8 sm:gap-12 text-left pt-2">
            {/* Group 1: SHOP */}
            <div className="space-y-4">
              <h4 className="font-sans text-xs sm:text-sm uppercase font-bold tracking-[0.24em] text-brand-pink">
                Shop
              </h4>
              <ul className="space-y-3 font-sans text-sm sm:text-[15px] text-brand-offwhite/85">
                <li>
                  <Link href="/shop" className="hover:text-brand-pink transition-colors block py-0.5">
                    All Kurtis
                  </Link>
                </li>
                <li>
                  <Link href="/shop/kurtis-kurtas" className="hover:text-brand-pink transition-colors block py-0.5">
                    Kurtis & Kurtas
                  </Link>
                </li>
                <li>
                  <Link href="/shop/coord-sets" className="hover:text-brand-pink transition-colors block py-0.5">
                    Co-ord Sets
                  </Link>
                </li>
                <li>
                  <Link href="/shop/bottom-wear" className="hover:text-brand-pink transition-colors block py-0.5">
                    Bottom Wear
                  </Link>
                </li>
                <li>
                  <Link href="/shop" className="hover:text-brand-pink transition-colors block py-0.5">
                    All Collections
                  </Link>
                </li>
              </ul>
            </div>

            {/* Group 2: EXPLORE */}
            <div className="space-y-4">
              <h4 className="font-sans text-xs sm:text-sm uppercase font-bold tracking-[0.24em] text-brand-pink">
                Explore
              </h4>
              <ul className="space-y-3 font-sans text-sm sm:text-[15px] text-brand-offwhite/85">
                <li>
                  <Link href="/about" className="hover:text-brand-pink transition-colors block py-0.5">
                    Our Story
                  </Link>
                </li>
                <li>
                  <Link href="/#craft" className="hover:text-brand-pink transition-colors block py-0.5">
                    The Craft
                  </Link>
                </li>
                <li>
                  <Link href="/patron-voices" className="hover:text-brand-pink transition-colors block py-0.5">
                    Patron Voices
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-brand-pink transition-colors block py-0.5">
                    Store Locator
                  </Link>
                </li>
              </ul>
            </div>

            {/* Group 3: SUPPORT */}
            <div className="space-y-4 col-span-2 md:col-span-1">
              <h4 className="font-sans text-xs sm:text-sm uppercase font-bold tracking-[0.24em] text-brand-pink">
                Support
              </h4>
              <ul className="space-y-3 font-sans text-sm sm:text-[15px] text-brand-offwhite/85">
                <li>
                  <Link href="/shipping" className="hover:text-brand-pink transition-colors block py-0.5">
                    Shipping & Returns
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-brand-pink transition-colors block py-0.5">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="hover:text-brand-pink transition-colors block py-0.5">
                    FAQs
                  </Link>
                </li>
                <li>
                  <Link href="/care" className="hover:text-brand-pink transition-colors block py-0.5">
                    Garment Care
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* 03 — BRAND SIGNATURE & LOTUS EMBLEM */}
        <div className="border-t border-brand-offwhite/10 pt-10 pb-8 sm:py-12 text-center flex flex-col items-center justify-center overflow-hidden relative">
          <div className="w-16 sm:w-20 lg:w-24 aspect-square mb-4 opacity-90 transition-transform duration-500 hover:scale-105 select-none pointer-events-none">
            <Image
              src="/images/lotus2.svg"
              alt="Resham Chikankari Lotus Emblem"
              width={120}
              height={120}
              unoptimized
              className="w-full h-full object-contain filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.25)] brightness-110"
            />
          </div>
          <h2 className="font-display font-semibold uppercase tracking-[0.22em] text-[clamp(1.75rem,4.5vw,4.2rem)] text-brand-offwhite/90 leading-none select-none">
            RESHAM CHIKANKARI
          </h2>
        </div>

        {/* 04 — BOTTOM BAR: Legal & Copyright */}
        <div className="border-t border-brand-offwhite/10 pt-5 flex flex-col sm:flex-row justify-between items-center text-xs sm:text-[13px] font-sans text-brand-offwhite/60 gap-3">
          <p>© {year} Resham Chikankari. All Rights Reserved. Lucknow, India.</p>
          <div className="flex gap-6">
            <Link href="/terms" className="hover:text-brand-pink transition-colors">
              Terms of Service
            </Link>
            <Link href="/privacy" className="hover:text-brand-pink transition-colors">
              Privacy Policy
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
