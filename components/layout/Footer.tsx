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
      className="bg-brand-sage-section text-brand-offwhite border-t border-brand-offwhite/15 relative z-10 pt-12 sm:pt-16 pb-6 select-none"
    >
      <Container>
        {/* 01 — TOP FOOTER: 3-Column Editorial Grid (Newsletter Left, Navigation Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 pb-12">
          {/* Left Column: Brand Mark & Minimal Editorial Newsletter */}
          <div className="lg:col-span-5 space-y-5 text-left">
            <div className="flex items-center gap-4">
              <Image
                src="/images/logo.webp"
                alt="Resham Chikankari Brand Seal"
                width={72}
                height={72}
                className="w-14 h-14 object-contain filter brightness-125 shrink-0"
              />
              <div>
                <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-brand-pink block">
                  ATELIER GAZETTE
                </span>
                <h3 className="font-display text-xl sm:text-2xl font-semibold text-brand-offwhite leading-snug mt-0.5">
                  Stay in the know
                </h3>
              </div>
            </div>

            <p className="font-sans text-xs text-brand-offwhite/70 leading-relaxed max-w-sm">
              Subscribe for private previews, artisanal stories, and exclusive heritage collection drops.
            </p>

            {/* 02 — NEWSLETTER FORM */}
            <form onSubmit={handleSubmit} className="mt-4 space-y-2 max-w-sm">
              <div className="relative flex items-center w-full border-b border-brand-offwhite/25 focus-within:border-brand-pink transition-colors">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full py-2.5 bg-transparent text-xs text-brand-offwhite placeholder:text-brand-offwhite/40 focus:outline-none font-sans"
                />
                <button
                  type="submit"
                  aria-label="Subscribe to newsletter"
                  className="px-2 text-sm font-bold text-brand-pink hover:text-brand-offwhite transition-colors cursor-pointer"
                >
                  →
                </button>
              </div>

              {isSubmitted && (
                <p className="text-[11px] text-brand-pink font-medium animate-fadeIn">
                  ✦ Thank you for subscribing to our Atelier.
                </p>
              )}

              <p className="font-sans text-[9px] text-brand-offwhite/45 leading-normal pt-1">
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

          {/* Right Column: 3 Compact Link Groups (Shop, Explore, Support) */}
          <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-8 sm:gap-10 text-left pt-2">
            {/* Group 1: SHOP */}
            <div className="space-y-3">
              <h4 className="font-sans text-[10px] uppercase font-bold tracking-[0.25em] text-brand-pink">
                Shop
              </h4>
              <ul className="space-y-2 font-sans text-xs text-brand-offwhite/70">
                <li>
                  <Link href="/shop" className="hover:text-brand-pink transition-colors">
                    All Kurtis
                  </Link>
                </li>
                <li>
                  <Link href="/shop/kurtis-kurtas" className="hover:text-brand-pink transition-colors">
                    Kurtis & Kurtas
                  </Link>
                </li>
                <li>
                  <Link href="/shop/coord-sets" className="hover:text-brand-pink transition-colors">
                    Co-ord Sets
                  </Link>
                </li>
                <li>
                  <Link href="/shop/bottom-wear" className="hover:text-brand-pink transition-colors">
                    Bottom Wear
                  </Link>
                </li>
                <li>
                  <Link href="/collections" className="hover:text-brand-pink transition-colors">
                    Festive Edit
                  </Link>
                </li>
              </ul>
            </div>

            {/* Group 2: EXPLORE */}
            <div className="space-y-3">
              <h4 className="font-sans text-[10px] uppercase font-bold tracking-[0.25em] text-brand-pink">
                Explore
              </h4>
              <ul className="space-y-2 font-sans text-xs text-brand-offwhite/70">
                <li>
                  <Link href="/about" className="hover:text-brand-pink transition-colors">
                    Our Story
                  </Link>
                </li>
                <li>
                  <Link href="/#craft" className="hover:text-brand-pink transition-colors">
                    The Craft
                  </Link>
                </li>
                <li>
                  <Link href="/patron-voices" className="hover:text-brand-pink transition-colors">
                    Patron Voices
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-brand-pink transition-colors">
                    Store Locator
                  </Link>
                </li>
              </ul>
            </div>

            {/* Group 3: SUPPORT */}
            <div className="space-y-3 col-span-2 md:col-span-1">
              <h4 className="font-sans text-[10px] uppercase font-bold tracking-[0.25em] text-brand-pink">
                Support
              </h4>
              <ul className="space-y-2 font-sans text-xs text-brand-offwhite/70">
                <li>
                  <Link href="/shipping" className="hover:text-brand-pink transition-colors">
                    Shipping & Returns
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-brand-pink transition-colors">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="hover:text-brand-pink transition-colors">
                    FAQs
                  </Link>
                </li>
                <li>
                  <Link href="/care" className="hover:text-brand-pink transition-colors">
                    Garment Care
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* 03 — BRAND SIGNATURE (Single-line Restrained Wordmark Signature) */}
        <div className="border-t border-brand-offwhite/10 py-6 sm:py-8 text-center overflow-hidden">
          <h2 className="font-display font-semibold uppercase tracking-[0.22em] text-[clamp(1.5rem,4.2vw,4rem)] text-brand-offwhite/80 leading-none select-none">
            RESHAM CHIKANKARI
          </h2>
        </div>

        {/* 05 — BOTTOM BAR: Muted Legal & Copyright */}
        <div className="border-t border-brand-offwhite/10 pt-4 flex flex-col sm:flex-row justify-between items-center text-[10px] font-sans text-brand-offwhite/45 gap-3">
          <p>© {year} Resham Chikankari. All Rights Reserved. Lucknow, India.</p>
          <div className="flex gap-5">
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
