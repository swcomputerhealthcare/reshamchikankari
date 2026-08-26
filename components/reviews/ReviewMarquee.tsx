'use client';

import React from "react";
import Image from "next/image";
import { Star, ShieldCheck, Quote } from "lucide-react";
import { ReviewItemData } from "./ReviewCard";

interface ReviewMarqueeProps {
  reviews: ReviewItemData[];
}

export default function ReviewMarquee({ reviews }: ReviewMarqueeProps) {
  // Duplicate array three times to guarantee a smooth continuous marquee loop
  const marqueeReviews = [...reviews, ...reviews, ...reviews];

  return (
    <div className="w-full overflow-hidden py-6 select-none group relative">
      {/* Edge Vignette Fades */}
      <div className="absolute top-0 left-0 bottom-0 w-12 sm:w-28 bg-gradient-to-r from-brand-sage-section to-transparent z-20 pointer-events-none" />
      <div className="absolute top-0 right-0 bottom-0 w-12 sm:w-28 bg-gradient-to-l from-brand-sage-section to-transparent z-20 pointer-events-none" />

      {/* Infinite Auto-Scrolling Track */}
      <div className="flex gap-6 sm:gap-8 w-max animate-marquee group-hover:[animation-play-state:paused]">
        {marqueeReviews.map((review, idx) => {
          const initials = review.authorName
            .split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2);

          return (
            <div
              key={`${review.id}-${idx}`}
              className="w-[310px] sm:w-[440px] lg:w-[500px] min-h-[200px] sm:min-h-[230px] bg-[#FFF9F4] text-brand-black border border-brand-black/10 rounded-[20px] p-6 sm:p-7 shadow-sm hover:shadow-md hover:border-brand-pink/50 transition-all duration-300 flex flex-col justify-between shrink-0 text-left cursor-pointer relative overflow-hidden"
            >
              {/* Decorative Watermark Quote Icon */}
              <Quote className="absolute right-4 top-4 h-16 w-16 text-brand-pink/10 pointer-events-none" />

              {/* 1. Header: Stars & Verified Badge */}
              <div className="flex items-center justify-between gap-2 relative z-10 mb-4">
                <div className="flex items-center gap-1 text-brand-pink">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < review.rating
                          ? "fill-brand-pink text-brand-pink"
                          : "text-brand-pink/20 fill-brand-pink/10"
                      }`}
                    />
                  ))}
                </div>

                {review.isVerified && (
                  <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-brand-sage bg-brand-sage/10 px-2.5 py-1 rounded-full border border-brand-sage/20">
                    <ShieldCheck className="h-3 w-3 text-brand-sage" />
                    Verified Purchase
                  </span>
                )}
              </div>

              {/* 2. Review Body Quote */}
              <p className="text-xs sm:text-sm text-neutral-800 font-sans leading-relaxed italic relative z-10 mb-6 line-clamp-3">
                "{review.body}"
              </p>

              {/* 3. Footer: Patron Avatar & Name */}
              <div className="pt-4 border-t border-brand-black/8 flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3">
                  {/* Photo or Initials Avatar */}
                  {review.photoUrl ? (
                    <div className="relative w-9 h-9 rounded-full overflow-hidden border border-brand-pink/30 shrink-0">
                      <Image
                        src={review.photoUrl}
                        alt={review.authorName}
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    </div>
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-brand-pink/15 text-brand-pink font-bold text-xs flex items-center justify-center border border-brand-pink/30 shrink-0">
                      {initials}
                    </div>
                  )}

                  <div>
                    <span className="font-display font-semibold text-sm text-brand-black block leading-tight">
                      {review.authorName}
                    </span>
                    <span className="font-sans text-[10px] text-neutral-500 block">
                      Lucknow Chikankari Patron
                    </span>
                  </div>
                </div>

                <span className="font-sans text-[9px] uppercase font-bold tracking-widest text-brand-pink/80 bg-brand-pink/10 px-2 py-0.5 rounded-xs">
                  Authentic Handwork
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
