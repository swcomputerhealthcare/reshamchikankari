'use client';

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Container from "@/components/ui/container";

function InstagramIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function FacebookIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
    </svg>
  );
}

function YoutubeIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function PinterestIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345-.09.375-.291 1.199-.334 1.357-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.546.535 6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
    </svg>
  );
}

const SOCIAL_LINKS = [
  {
    name: "Instagram",
    href: "https://www.instagram.com/resham.chikankari/",
    icon: InstagramIcon,
  },
  {
    name: "Facebook",
    href: "https://www.facebook.com/share/1F8Y9yZGKj/",
    icon: FacebookIcon,
  },
  {
    name: "YouTube",
    href: "https://youtube.com/@resham.chikankari?si=cRie0apvIBywHExy",
    icon: YoutubeIcon,
  },
  {
    name: "Pinterest",
    href: "https://pin.it/5U0Fk9f0e",
    icon: PinterestIcon,
  },
];

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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 pb-8 sm:pb-10">
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
                  <Link href="/shop/premium" className="hover:text-brand-pink text-[#E694AA] font-bold transition-colors block py-0.5">
                    Premium Collection ✨
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
                    What People Say
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
            <div className="space-y-4 col-span-2 md:col-span-1 flex flex-col justify-between">
              <div>
                <h4 className="font-sans text-xs sm:text-sm uppercase font-bold tracking-[0.24em] text-brand-pink">
                  Support
                </h4>
                <ul className="space-y-3 font-sans text-sm sm:text-[15px] text-brand-offwhite/85 mt-4">
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

              {/* Social Links — shifted down directly above the divider line */}
              <div className="pt-6 sm:pt-10">
                <div className="flex items-center gap-3">
                  {SOCIAL_LINKS.map((social) => {
                    const Icon = social.icon;
                    return (
                      <a
                        key={social.name}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Visit Resham Chikankari on ${social.name}`}
                        title={social.name}
                        className="w-10 h-10 rounded-full border border-brand-offwhite/30 bg-brand-offwhite/5 flex items-center justify-center text-brand-offwhite hover:text-brand-pink hover:border-brand-pink hover:bg-brand-pink/15 transition-all duration-300 hover:scale-110 active:scale-95 shadow-xs"
                      >
                        <Icon className="w-5 h-5" />
                      </a>
                    );
                  })}
                </div>
              </div>
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
