'use client';

import React from "react";
import Image from "next/image";
import { Star, ShieldCheck } from "lucide-react";

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
  const photo = review.photoUrl || "/images/reshamchikankari/New%20folder%203/IMG_3001.JPG";
  const product = review.productName || "HAND-EMBROIDERED CHIKANKARI";

  return (
    <div
      style={style}
      className={`bg-[#FAF7F2] text-[#161616] border border-[#161616]/12 rounded-[14px] p-4 sm:p-5 shadow-xl font-sans text-left w-full flex flex-col justify-between select-none ${className}`}
    >
      {/* Top 50% — Fashion Editorial Photography */}
      <div className="relative aspect-[4/3] w-full rounded-[10px] overflow-hidden bg-[#EAE5DC] border border-[#161616]/8 mb-3 shrink-0">
        <Image
          src={photo}
          alt={review.authorName}
          fill
          priority
          unoptimized
          sizes="(max-width: 640px) 280px, 340px"
          className="object-cover object-top filter brightness-102"
        />
      </div>

      {/* Bottom 50% — Rating Stars, Verified Badge, Review Quote & Author Details */}
      <div className="flex flex-col justify-between flex-1 pt-1">
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-1 text-[#E694AA]">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-3.5 w-3.5 ${
                    i < review.rating
                      ? "fill-[#E694AA] text-[#E694AA]"
                      : "text-[#E694AA]/20 fill-[#E694AA]/10"
                  }`}
                />
              ))}
            </div>

            {review.isVerified && (
              <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-[#3F5031]">
                <ShieldCheck className="h-3 w-3 text-[#3F5031]" />
                VERIFIED PURCHASE
              </span>
            )}
          </div>

          <p className="text-xs sm:text-[13px] text-[#161616]/90 font-sans leading-relaxed italic line-clamp-3 mb-3">
            "{review.body}"
          </p>
        </div>

        <div className="pt-2.5 border-t border-[#161616]/10 flex flex-col gap-0.5">
          <span className="text-[10.5px] font-bold uppercase tracking-widest text-[#161616]/85 font-sans truncate">
            — {review.authorName}
          </span>
          <span className="text-[9.5px] font-semibold text-[#3F5031] uppercase tracking-wider font-sans truncate">
            {product}
          </span>
        </div>
      </div>
    </div>
  );
}
