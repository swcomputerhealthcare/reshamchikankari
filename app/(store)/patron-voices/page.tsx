import React from "react";
import Link from "next/link";
import Container from "@/components/ui/container";
import { Star, CheckCircle2 } from "lucide-react";
import { db } from "@/db";
import { reviews } from "@/db/schema/review";
import { profiles } from "@/db/schema/auth";
import { eq, desc } from "drizzle-orm";
import PatronVoicesShowcase from "@/components/testimonials/PatronVoicesShowcase";

export const metadata = {
  title: "Patron Voices — Resham Chikankari",
  description: "Read reflections and testimonials from patrons and lovers of handcrafted Lucknowi Chikankari.",
};

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
        authorName: reviews.authorName,
        title: reviews.title,
      })
      .from(reviews)
      .leftJoin(profiles, eq(reviews.userId, profiles.id))
      .where(eq(reviews.isApproved, true))
      .orderBy(desc(reviews.createdAt))
      .limit(8);
  } catch (e) {
    console.error("Could not fetch DB reviews:", e);
  }

  return (
    <div className="bg-[#FFF9F4] text-[#1b1c19] min-h-screen font-sans selection:bg-[#7C7A5A] selection:text-[#FFF9F4] py-12 sm:py-20">
      <Container className="max-w-7xl">
        {/* Editorial Hero Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E694AA]/15 border border-[#E694AA]/40 text-[#B66F79] text-[10.5px] sm:text-xs font-bold uppercase tracking-[0.24em]">
            <span>✦ TESTIMONIALS & CRAFT REFLECTIONS ✦</span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-[#7C7A5A] tracking-tight">
            PATRON VOICES
          </h1>

          <p className="font-sans text-sm sm:text-base text-[#69727D] max-w-xl mx-auto leading-relaxed">
            Reflections from connoisseurs and patrons across India and the globe who cherish the authentic art of Lucknowi Chikankari.
          </p>
          <div className="h-px w-20 bg-[#7C7A5A]/30 mx-auto pt-2" />
        </div>

        {/* 3-Column Animated Testimonials Showcase */}
        <PatronVoicesShowcase />

        {/* Database Community Reviews Grid (if available) */}
        {dbReviews.length > 0 && (
          <div className="mt-16 pt-16 border-t border-[#ECE9E2] text-left">
            <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.22em] text-[#E694AA]">
                ATELIER DIALOGUES
              </span>
              <h2 className="font-display text-2xl sm:text-4xl text-[#7C7A5A]">
                Recent Reviews from Our Community
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {dbReviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-6 bg-[#F8F2EC] rounded-2xl border border-[#ECE9E2] space-y-3 flex flex-col justify-between shadow-xs"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-[#E2D89B]">
                        {Array.from({ length: rev.rating || 5 }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-current stroke-none" />
                        ))}
                      </div>
                      {rev.isVerified && (
                        <span className="text-[9px] uppercase tracking-wider font-semibold text-[#7C7A5A] flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-[#7C7A5A]" /> Verified
                        </span>
                      )}
                    </div>
                    <p className="font-sans text-xs text-[#2c3028] leading-relaxed italic">
                      &ldquo;{rev.body}&rdquo;
                    </p>
                  </div>
                  <p className="text-xs font-bold text-[#161616] pt-3 border-t border-[#ECE9E2]">
                    — {rev.userName || rev.authorName || rev.title || "Valued Patron"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Call to Action Footer */}
        <div className="mt-16 sm:mt-24 p-8 sm:p-12 bg-[#7C7A5A] text-[#FFF9F4] rounded-3xl text-center space-y-5 shadow-xl">
          <span className="text-[10.5px] uppercase font-bold tracking-[0.24em] text-[#E694AA]">
            EXPERIENCE THE HERITAGE
          </span>
          <h3 className="font-display text-2xl sm:text-4xl text-[#FFF9F4]">
            Are you a Resham Chikankari Patron?
          </h3>
          <p className="text-xs sm:text-sm text-[#FFF9F4]/85 max-w-lg mx-auto leading-relaxed">
            We welcome your craft reflections and stories. Explore our collection of hand-embroidered Lucknowi treasures and share your experience.
          </p>
          <div className="pt-3">
            <Link
              href="/shop"
              className="inline-flex items-center justify-center h-12 px-9 rounded-full bg-[#FFF9F4] text-[#7C7A5A] hover:bg-[#E694AA] hover:text-[#FFF9F4] font-sans text-xs font-bold uppercase tracking-[0.2em] transition-all shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
            >
              Explore the Collection
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
