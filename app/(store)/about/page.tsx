import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Target, Compass } from "lucide-react";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Story & Artisan Vision — Handcrafted Chikankari | Resham",
  description:
    "Every thread has a story, and ours began with a vision. Resham Chikankari was born from the vision of Founder & Owner Pankaj Bhasin to celebrate the timeless art of Chikankari and support local women artisans in Lucknow.",
  alternates: {
    canonical: "https://www.reshamchikankari.com/about",
  },
  openGraph: {
    title: "Our Story & Artisan Heritage | Resham Chikankari",
    description:
      "Every thread has a story, and ours began with a vision. Resham Chikankari — Modernity of Handcraft by Founder & Owner Pankaj Bhasin.",
    url: "https://www.reshamchikankari.com/about",
    siteName: "Resham Chikankari",
    type: "website",
    images: [
      {
        url: "https://www.reshamchikankari.com/images/about.png",
        width: 1200,
        height: 630,
        alt: "Resham Chikankari — Our Story & Heritage",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Our Story & Artisan Heritage | Resham Chikankari",
    description: "Every thread has a story, and ours began with a vision. Resham Chikankari — Modernity of Handcraft.",
    images: ["https://www.reshamchikankari.com/images/about.png"],
  },
};

export default function AboutPage() {
  const aboutSchema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "Our Story — Resham Chikankari",
    url: "https://www.reshamchikankari.com/about",
    description:
      "The founding story, artisan empowerment mission, and Lucknow heritage of Resham Chikankari.",
    mainEntity: {
      "@type": "Organization",
      name: "Resham Chikankari",
      url: "https://www.reshamchikankari.com",
      founder: {
        "@type": "Person",
        name: "Pankaj Bhasin",
        jobTitle: "Founder & Owner",
      },
      slogan: "Modernity of Handcraft",
      foundingLocation: {
        "@type": "Place",
        name: "Lucknow, Uttar Pradesh, India",
      },
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://www.reshamchikankari.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Our Story",
        item: "https://www.reshamchikankari.com/about",
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <div className="bg-[#FFF9F4] text-[#1b1c19] min-h-screen font-sans selection:bg-[#7C7A5A] selection:text-[#FFF9F4]">
      <main className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-16 pt-8 pb-20 sm:pb-32 space-y-16 sm:space-y-24">
        {/* Header Hero Section */}
        <section className="text-center max-w-4xl mx-auto pt-6 sm:pt-10 space-y-4">
          <span className="text-xs sm:text-sm font-bold uppercase tracking-[0.25em] text-[#E694AA] block">
            OUR HERITAGE & JOURNEY
          </span>
          <h1 className="font-display text-5xl sm:text-7xl text-[#7C7A5A] leading-tight">
            OUR STORY
          </h1>
          <div className="w-20 h-[1.5px] bg-[#7C7A5A]/30 mx-auto my-4" />
          <p className="font-sans text-base sm:text-lg md:text-xl text-[#69727D] max-w-2xl mx-auto leading-relaxed">
            Every thread has a story, and ours began with a vision to celebrate the timeless craft of Chikankari.
          </p>
        </section>

        {/* Section 1: Founder's Story & Vision (Elevated Editorial Letter) */}
        <section className="max-w-5xl mx-auto w-full pt-2">
          <div className="relative rounded-3xl sm:rounded-4xl bg-gradient-to-b from-[#FFFDF9] via-[#FAF5EE] to-[#F5ECE3] border border-[#E2D89B]/60 p-8 sm:p-14 lg:p-20 shadow-[0_12px_40px_-15px_rgba(124,122,90,0.12)] ring-1 ring-[#7C7A5A]/10 overflow-hidden">
            {/* Subtle ornamental corner accents */}
            <div className="absolute top-4 left-4 w-7 h-7 border-t-2 border-l-2 border-[#E2D89B]/70 rounded-tl-sm pointer-events-none" />
            <div className="absolute top-4 right-4 w-7 h-7 border-t-2 border-r-2 border-[#E2D89B]/70 rounded-tr-sm pointer-events-none" />
            <div className="absolute bottom-4 left-4 w-7 h-7 border-b-2 border-l-2 border-[#E2D89B]/70 rounded-bl-sm pointer-events-none" />
            <div className="absolute bottom-4 right-4 w-7 h-7 border-b-2 border-r-2 border-[#E2D89B]/70 rounded-br-sm pointer-events-none" />

            {/* Subtle background watermark floral motif */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
              <svg viewBox="0 0 200 200" className="w-[500px] h-[500px] text-[#7C7A5A]" fill="currentColor">
                <path d="M100 0 C105 50 150 95 200 100 C150 105 105 150 100 200 C95 150 50 105 0 100 C50 95 95 50 100 0 Z" />
              </svg>
            </div>

            <div className="relative z-10 flex flex-col items-center text-center space-y-7 sm:space-y-10">
              {/* Brand Logo Seal Header */}
              <div className="flex flex-col items-center space-y-3">
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#FFF9F4] border-2 border-[#E2D89B] shadow-md p-1 overflow-hidden transition-transform duration-300 hover:scale-105">
                  <div className="relative w-full h-full rounded-full overflow-hidden">
                    <Image
                      src="/images/logo.webp"
                      alt="Resham Chikankari Logo"
                      fill
                      sizes="96px"
                      className="object-cover"
                      priority
                    />
                  </div>
                </div>
                <span className="text-xs sm:text-sm font-bold uppercase tracking-[0.3em] text-[#E694AA] pt-1">
                  A LETTER FROM THE FOUNDER
                </span>
              </div>

              {/* Opening Core Quote */}
              <blockquote className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] text-[#7C7A5A] italic leading-[1.25] sm:leading-[1.2] max-w-3xl px-2">
                “Every thread has a story, and ours began with a vision.”
              </blockquote>

              {/* Delicate Editorial Gold Divider */}
              <div className="flex items-center justify-center gap-4 w-full py-1">
                <div className="h-[1px] w-16 sm:w-24 bg-[#E2D89B]" />
                <span className="text-[#E694AA] text-sm">✦</span>
                <div className="h-[1px] w-16 sm:w-24 bg-[#E2D89B]" />
              </div>

              {/* Narrative Paragraphs */}
              <div className="space-y-6 text-[#2C3028] font-sans text-base sm:text-lg md:text-xl lg:text-[1.3rem] leading-relaxed sm:leading-[1.8] max-w-3xl px-2">
                <p>
                  Resham Chikankari was born from my vision to celebrate the timeless art of Chikankari and support the skilled local artisans, especially women, who bring this beautiful craft to life.
                </p>
                <p>
                  Blending the richness of Indian handcraft with the elegance of modern fashion, we believe that true craftsmanship is never just a trend — it’s a legacy worth preserving.
                </p>
              </div>

              {/* Tagline Badge */}
              <div className="pt-3 sm:pt-5">
                <div className="inline-flex items-center gap-3 px-6 sm:px-8 py-3 sm:py-3.5 rounded-full bg-[#FFF9F4] border border-[#E2D89B] shadow-xs hover:border-[#7C7A5A]/40 transition-colors">
                  <span className="w-2 h-2 rounded-full bg-[#E694AA] animate-pulse" />
                  <span className="font-display text-base sm:text-lg md:text-xl text-[#7C7A5A] tracking-wider uppercase font-semibold">
                    Resham Chikankari — Modernity of Handcraft.
                  </span>
                </div>
              </div>

              {/* Sign-off & Founder Attribution */}
              <div className="pt-8 sm:pt-12 border-t border-[#ECE9E2] w-full max-w-lg flex flex-col items-center">
                <span className="font-sans text-xs sm:text-sm uppercase tracking-[0.25em] text-[#69727D] font-bold mb-2">
                  FOUNDER &amp; OWNER
                </span>
                <p className="font-display text-3xl sm:text-4xl md:text-5xl text-[#161616] tracking-wide font-normal">
                  Pankaj Bhasin
                </p>
                <div className="w-12 h-[1.5px] bg-[#E694AA] my-3" />
                <p className="font-sans text-sm sm:text-base text-[#7C7A5A] italic">
                  Resham Chikankari • Lucknow Heritage
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Mission & Vision Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10 pt-6">
          {/* Our Mission */}
          <div className="p-8 sm:p-12 bg-[#F8F2EC] rounded-3xl border border-[#ECE9E2] flex flex-col justify-between space-y-6 text-left shadow-xs">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#7C7A5A]/10 text-[#7C7A5A] text-xs font-bold uppercase tracking-widest">
                <Target className="w-4 h-4 text-[#E694AA]" />
                <span>Our Mission</span>
              </div>
              <h2 className="font-display text-2xl sm:text-4xl text-[#7C7A5A] leading-snug">
                Preserving Craft & Empowering Artisans
              </h2>
              <p className="font-sans text-base sm:text-lg text-[#69727D] leading-relaxed">
                At Resham Chikankari, our mission is to keep the timeless art of Chikankari alive by giving it the respect, recognition, and love it deserves. We are committed to supporting local artisans, especially talented women whose hands carry generations of skill and tradition.
              </p>
              <p className="font-sans text-base sm:text-lg text-[#69727D] leading-relaxed">
                With every piece we create, we hope to provide meaningful opportunities, celebrate their craftsmanship, and ensure that their beautiful art continues to be valued and passed on to future generations.
              </p>
            </div>
          </div>

          {/* Our Vision */}
          <div className="p-8 sm:p-12 bg-[#F8F2EC] rounded-3xl border border-[#ECE9E2] flex flex-col justify-between space-y-6 text-left shadow-xs">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#7C7A5A]/10 text-[#7C7A5A] text-xs font-bold uppercase tracking-widest">
                <Compass className="w-4 h-4 text-[#E694AA]" />
                <span>Our Vision</span>
              </div>
              <h2 className="font-display text-2xl sm:text-4xl text-[#7C7A5A] leading-snug">
                Creating a Legacy Rooted in Purpose
              </h2>
              <p className="font-sans text-base sm:text-lg text-[#69727D] leading-relaxed">
                Our vision is to build more than just a clothing brand — we aspire to create a legacy rooted in tradition, empowerment, and purpose.
              </p>
              <p className="font-sans text-base sm:text-lg text-[#69727D] leading-relaxed">
                We dream of seeing Chikankari flourish for generations to come, while creating a platform where local artisans, especially women, can grow, thrive, and take pride in their craft.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: Artisan & Craft Banner with CTA */}
        <section className="flex flex-col md:flex-row items-center gap-10 lg:gap-16 p-8 sm:p-14 bg-[#7C7A5A] text-[#FFF9F4] rounded-3xl shadow-xl text-left">
          {/* Left Text */}
          <div className="w-full md:w-1/2 flex flex-col items-start gap-6 md:pr-6">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#E694AA]">
              WEAR THE LEGACY
            </span>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-[#FFF9F4] leading-tight">
              Thoughtfully Chosen. Authentically Crafted.
            </h2>
            <p className="font-sans text-sm sm:text-base text-[#FFF9F4]/85 max-w-lg leading-relaxed">
              Explore our hand-embroidered Lucknowi Chikankari collection designed with quiet elegance and comfort for every occasion.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 mt-2 font-sans text-xs font-bold uppercase tracking-[0.2em] text-[#FFF9F4] pb-1 border-b border-[#E694AA] hover:text-[#E694AA] transition-colors group"
            >
              Explore Our Collection <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Right Image */}
          <div className="w-full md:w-1/2 aspect-[4/5] sm:aspect-[3/4] md:aspect-[4/5] max-h-[500px] relative overflow-hidden rounded-2xl border border-[#FFF9F4]/20 shadow-md">
            <Image
              src="/images/reshamchikankari/New%20folder/IMG_2685.JPG"
              alt="Resham Chikankari Artisan Craft Collection"
              fill
              className="object-cover object-top"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </section>
      </main>
    </div>
    </>
  );
}
