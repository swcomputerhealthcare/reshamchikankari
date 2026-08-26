'use client';

import React, { useState } from "react";
import Link from "next/link";
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
      className="bg-brand-sage-section text-brand-offwhite border-t border-brand-offwhite/10 relative z-10 pt-16 sm:pt-24 pb-8"
    >
      <Container>
        {/* 1. TOP ZONE: Newsletter ("Stay in the know") + Navigation Columns (Shop, Explore, Support) */}
        <div className="flex flex-col lg:flex-row justify-between items-start gap-12 lg:gap-20 pb-16 border-b border-brand-offwhite/10">
          {/* Left Column: Stay in the Know Newsletter Form */}
          <div className="w-full lg:w-[36%] space-y-4">
            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-brand-offwhite">
              Stay in the know
            </h2>
            <p className="font-sans text-xs text-brand-offwhite/70 leading-relaxed max-w-sm">
              Subscribe to receive private previews, artisanal craft stories, and exclusive heritage collection drops.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-3">
              <div className="relative flex items-center w-full border-b border-brand-offwhite/30 focus-within:border-brand-pink transition-colors">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full py-3 bg-transparent text-sm text-brand-offwhite placeholder:text-brand-offwhite/40 focus:outline-none font-sans"
                />
                <button
                  type="submit"
                  aria-label="Subscribe to newsletter"
                  className="px-3 text-lg text-brand-pink hover:text-brand-offwhite transition-colors cursor-pointer"
                >
                  →
                </button>
              </div>

              {isSubmitted && (
                <p className="text-xs text-brand-pink font-medium animate-fadeIn">
                  ✦ Thank you for subscribing to our Atelier.
                </p>
              )}

              <p className="font-sans text-[10px] text-brand-offwhite/50 leading-normal pt-1">
                By entering your email, you agree to receive email updates from Resham Chikankari at your email address and agree to the{" "}
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

          {/* Right Column: Multi-Column Navigation (Shop, Explore, Support) */}
          <div className="w-full lg:w-[58%] grid grid-cols-2 md:grid-cols-3 gap-8 sm:gap-12 text-left">
            {/* Column 1: Shop */}
            <div className="space-y-4">
              <h3 className="font-sans text-xs uppercase font-bold tracking-[0.2em] text-brand-pink">
                Shop
              </h3>
              <ul className="space-y-2.5 font-sans text-xs text-brand-offwhite/75">
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

            {/* Column 2: Explore */}
            <div className="space-y-4">
              <h3 className="font-sans text-xs uppercase font-bold tracking-[0.2em] text-brand-pink">
                Explore
              </h3>
              <ul className="space-y-2.5 font-sans text-xs text-brand-offwhite/75">
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

            {/* Column 3: Support */}
            <div className="space-y-4 col-span-2 md:col-span-1">
              <h3 className="font-sans text-xs uppercase font-bold tracking-[0.2em] text-brand-pink">
                Support
              </h3>
              <ul className="space-y-2.5 font-sans text-xs text-brand-offwhite/75">
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
                    Garment Care Guide
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </Container>

      {/* 2. BOTTOM ZONE: Jumbo Brand Typography Banner (Positioned BELOW links & form) */}
      <div className="w-full overflow-hidden pt-12 sm:pt-16 pb-6 text-center border-b border-brand-offwhite/10">
        <h1 className="font-display font-bold uppercase text-[10vw] sm:text-[13.5vw] lg:text-[15vw] leading-[0.82] tracking-tight text-brand-offwhite/95 select-none hover:text-white transition-colors duration-300">
          RESHAM CHIKANKARI
        </h1>
      </div>

      {/* 3. Bottom Legal / Copyright Row */}
      <Container className="pt-6">
        <div className="flex flex-col sm:flex-row justify-between items-center text-[11px] font-sans text-brand-offwhite/50 gap-4">
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
