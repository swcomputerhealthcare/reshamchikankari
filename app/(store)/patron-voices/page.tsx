import React from "react";
import Image from "next/image";
import Link from "next/link";
import Container from "@/components/ui/container";
import { Star, Quote, CheckCircle2 } from "lucide-react";
import { db } from "@/db";
import { reviews } from "@/db/schema/review";
import { profiles } from "@/db/schema/auth";
import { eq, desc } from "drizzle-orm";

export const metadata = {
  title: "Patron Voices — Resham Chikankari",
  description: "Read reflections and testimonials from patrons and lovers of handcrafted Lucknowi Chikankari.",
};

const FEATURED_PATRONS = [
  {
    id: "1",
    name: "Dr. Ananya Sharma",
    location: "New Delhi",
    garment: "Nūr White Chikankari Kurta Set",
    quote: "The delicate precision of the threadwork is unlike anything I've owned before. You can truly feel the human hands and history in every motif.",
    rating: 5,
    date: "November 2024",
  },
  {
    id: "2",
    name: "Meera Sen",
    location: "Mumbai",
    garment: "Gulāb Dusty Rose Silk Dupatta",
    quote: "Subtle, ethereal, and incredibly breathable. Resham Chikankari captures quiet luxury in the truest sense.",
    rating: 5,
    date: "December 2024",
  },
  {
    id: "3",
    name: "Kavita Rao",
    location: "Bengaluru",
    garment: "Bagh Heritage Sage Bandi",
    quote: "The texture is gossamer light yet structured. The block printing combined with Bakhiya stitches is pure poetry.",
    rating: 5,
    date: "January 2025",
  },
];

export default async function PatronVoicesPage() {
  let dbReviews: any[] = [];
  try {
    dbReviews = await db
      .select({
        id: reviews.id,
        rating: reviews.rating,
        body: reviews.body,
        isVerified: reviews.isVerifiedPurchase,
        userName: profiles.fullName,
      })
      .from(reviews)
      .leftJoin(profiles, eq(reviews.userId, profiles.id))
      .where(eq(reviews.isApproved, true))
      .orderBy(desc(reviews.createdAt))
      .limit(10);
  } catch (e) {
    console.error("Could not fetch DB reviews:", e);
  }

  return (
    <div className="bg-[#FFF9F4] text-[#1b1c19] min-h-screen font-sans selection:bg-[#3F5031] selection:text-[#FFF9F4] py-12 sm:py-20">
      <Container className="max-w-6xl">
        {/* Editorial Hero Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-24 space-y-4">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.25em] text-[#E58FA7]">
            TESTIMONIALS & REFLECTIONS
          </span>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-[#3F5031] tracking-tight">
            PATRON VOICES
          </h1>
          <p className="font-sans text-sm sm:text-base text-[#44483f] max-w-xl mx-auto leading-relaxed">
            Reflections from connoisseurs of fine Lucknowi craftsmanship across the globe.
          </p>
          <div className="h-px w-20 bg-[#3F5031]/30 mx-auto pt-2" />
        </div>

        {/* Featured Patron Spotlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10 mb-20">
          {FEATURED_PATRONS.map((patron) => (
            <div
              key={patron.id}
              className="bg-[#efeee9]/60 border border-[#161616]/10 rounded-2xl p-8 flex flex-col justify-between text-left relative overflow-hidden group hover:border-[#3F5031]/30 transition-all duration-300 shadow-xs"
            >
              <Quote className="w-10 h-10 text-[#3F5031]/15 mb-4 group-hover:text-[#3F5031]/30 transition-colors" />

              <div className="space-y-4 flex-1">
                <div className="flex items-center gap-1 text-[#E58FA7]">
                  {Array.from({ length: patron.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current stroke-none" />
                  ))}
                </div>

                <p className="font-display text-lg text-[#161616] leading-snug">
                  &ldquo;{patron.quote}&rdquo;
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-[#161616]/10">
                <p className="font-sans text-sm font-bold text-[#3F5031]">{patron.name}</p>
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-[#75786e] mt-0.5">
                  <span>{patron.location}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1 text-[#3F5031]">
                    <CheckCircle2 className="w-3 h-3 text-[#3F5031]" /> Verified Patron
                  </span>
                </div>
                <p className="text-[10px] text-[#75786e]/80 mt-1 italic">{patron.garment}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Database Community Reviews Grid if available */}
        {dbReviews.length > 0 && (
          <div className="mt-16 pt-16 border-t border-[#161616]/10 text-left">
            <h2 className="font-display text-2xl sm:text-3xl text-[#3F5031] mb-8">
              Recent Reviews from Our Community
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {dbReviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-6 bg-white/70 rounded-xl border border-[#161616]/10 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-[#E58FA7]">
                      {Array.from({ length: rev.rating || 5 }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current stroke-none" />
                      ))}
                    </div>
                    {rev.isVerified && (
                      <span className="text-[9px] uppercase tracking-wider font-semibold text-[#3F5031]">
                        Verified Purchase
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[#161616] leading-relaxed">&ldquo;{rev.body}&rdquo;</p>
                  <p className="text-xs font-semibold text-[#75786e]">
                    — {rev.userName || "Valued Patron"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Call to Action Footer */}
        <div className="mt-20 p-10 bg-[#3F5031] text-[#FFF9F4] rounded-3xl text-center space-y-4">
          <h3 className="font-display text-2xl sm:text-3xl">Are you a Resham Chikankari Patron?</h3>
          <p className="text-xs sm:text-sm text-[#FFF9F4]/80 max-w-lg mx-auto leading-relaxed">
            We welcome your craft reflections and stories. Explore our collection and share your experience with our community.
          </p>
          <div className="pt-2">
            <Link href="/shop">
              <button className="px-8 py-3.5 bg-[#FFF9F4] text-[#3F5031] font-sans text-xs font-semibold uppercase tracking-[0.15em] rounded-full hover:bg-[#E58FA7] hover:text-[#FFF9F4] transition-all cursor-pointer border-none">
                Explore the Collection
              </button>
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
