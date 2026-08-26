'use client';

import React, { useState } from "react";
import Container from "@/components/ui/container";
import ReviewArc from "@/components/reviews/ReviewArc";
import ReviewFormModal from "@/components/reviews/ReviewFormModal";
import { ReviewItemData } from "@/components/reviews/ReviewCard";

interface ReviewsSectionProps {
  initialReviews?: ReviewItemData[];
}

export default function ReviewsSection({ initialReviews = [] }: ReviewsSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Initial fallback reviews with luxury Chikankari garment imagery
  const displayReviews: ReviewItemData[] =
    initialReviews.length > 0
      ? initialReviews
      : [
          {
            id: "rev-1",
            authorName: "ANANYA R.",
            rating: 5,
            body: "The shadow work on the georgette kurti is exquisite. Feels so light, comfortable, and beautifully finished.",
            photoUrl: "/images/reshamchikankari/New%20folder%203/IMG_3001.JPG",
            isVerified: true,
          },
          {
            id: "rev-2",
            authorName: "MEERA KAPOOR",
            rating: 5,
            body: "Pure Lucknow craftsmanship. The fabric quality and intricate threadwork exceeded my expectations.",
            photoUrl: "/images/reshamchikankari/New%20folder/IMG_2685.JPG",
            isVerified: true,
          },
          {
            id: "rev-3",
            authorName: "KAVITA SETHI",
            rating: 5,
            body: "Wore this to a festive lunch and received so many compliments. True luxury Chikankari!",
            photoUrl: "/images/reshamchikankari/New%20folder%2021/IMG_3192.JPG",
            isVerified: true,
          },
          {
            id: "rev-4",
            authorName: "RITU VERMA",
            rating: 5,
            body: "Extremely fine stitching and elegant silhouette. Loved the packaging and care instructions.",
            photoUrl: "/images/reshamchikankari/New%20folder%2013/IMG_2756.JPG",
            isVerified: true,
          },
          {
            id: "rev-5",
            authorName: "SNEHA NAIR",
            rating: 5,
            body: "Resham Chikankari has brought authentic Lucknawi heritage straight to my wardrobe. Highly recommended!",
            photoUrl: "/images/reshamchikankari/New%20folder%205/IMG_3230.JPG",
            isVerified: true,
          },
        ];

  return (
    <section
      id="reviews"
      className="sticky top-0 z-40 w-full min-h-[100svh] flex flex-col justify-center items-center py-24 sm:py-32 bg-[#3F5031] text-[#FAF7F2] relative text-center rounded-t-3xl sm:rounded-t-[36px] shadow-2xl overflow-hidden"
    >
      <Container className="w-full relative z-20 flex flex-col items-center">
        {/* 1. Header & Eyebrow */}
        <div className="max-w-2xl mx-auto mb-6 sm:mb-8">
          <span className="text-[10px] sm:text-xs tracking-[0.25em] font-sans uppercase font-bold text-brand-pink mb-3 block">
            PATRON VOICES & REVIEWS
          </span>

          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl text-brand-offwhite leading-[1.15] max-w-xl mx-auto">
            The Stories Behind <br />
            The Stitch
          </h2>

          <p className="font-sans text-xs sm:text-sm text-brand-offwhite/70 mt-3 max-w-md mx-auto leading-relaxed">
            Reflections from women who cherish authentic hand-embroidered Lucknowi Chikankari.
          </p>
        </div>

        {/* 2. Clean Editorial Horizontal Swipe Carousel */}
        <div className="w-full mb-8 sm:mb-12">
          <ReviewArc reviews={displayReviews} />
        </div>

        {/* 3. Share Your Experience CTA Button */}
        <div className="flex justify-center">
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-brand-pink hover:bg-[#d6859b] text-white w-[260px] h-[50px] flex items-center justify-center font-bold text-xs uppercase tracking-[0.2em] transition-all rounded-none cursor-pointer shadow-md hover:scale-102"
          >
            SHARE YOUR EXPERIENCE →
          </button>
        </div>

        {/* Review Form Modal Drawer */}
        <ReviewFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </Container>
    </section>
  );
}
