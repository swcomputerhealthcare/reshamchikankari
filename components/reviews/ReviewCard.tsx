'use client';

import React from "react";
import Image from "next/image";
import { Star } from "lucide-react";

export interface ReviewItemData {
  id: string;
  authorName: string;
  rating: number;
  body: string;
  productName?: string;
  photoUrl?: string | null;
  isVerified?: boolean;
}

interface ReviewCardProps {
  review: ReviewItemData;
  className?: string;
  style?: React.CSSProperties;
}

export default function ReviewCard({ review, className = "", style }: ReviewCardProps) {
  return (
    <div
      style={style}
      className={`bg-[#FFF9F4] border border-brand-black/8 rounded-[10px] p-5 sm:p-6 shadow-xs hover:shadow-sm hover:-translate-y-1 transition-all duration-300 font-sans text-left w-full flex flex-col justify-between select-none ${className}`}
    >
      <div>
        {/* Optional Photo Attachment */}
        {review.photoUrl && (
          <div className="relative aspect-[4/3] w-full mb-3 rounded-2xs overflow-hidden bg-neutral-100 border border-brand-black/5">
            <Image
              src={review.photoUrl}
              alt={review.authorName}
              fill
              className="object-cover"
              sizes="300px"
            />
          </div>
        )}

        {/* Brand Pink Rating Stars (NO YELLOW STARS) */}
        <div className="flex items-center gap-1 mb-3 text-brand-pink">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-3.5 w-3.5 ${
                i < review.rating ? "fill-brand-pink text-brand-pink" : "text-brand-pink/20 fill-brand-pink/10"
              }`}
            />
          ))}
        </div>

        {/* Review Quote Body */}
        <p className="text-xs sm:text-[13px] text-neutral-700 font-sans leading-relaxed italic mb-4">
          "{review.body}"
        </p>
      </div>

      {/* Author & Verification Footer */}
      <div className="pt-3 border-t border-brand-black/5 flex items-center justify-between text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-neutral-500">
        <span className="truncate max-w-[140px]">— {review.authorName}</span>
        {review.isVerified && (
          <span className="text-brand-sage flex items-center gap-1 flex-shrink-0">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-sage" />
            VERIFIED
          </span>
        )}
      </div>
    </div>
  );
}
