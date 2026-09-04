'use client';

import React, { useState } from "react";
import Container from "@/components/ui/container";
import ReviewArc from "@/components/reviews/ReviewArc";
import ReviewFormModal from "@/components/reviews/ReviewFormModal";
import { ReviewItemData } from "@/components/reviews/ReviewCard";
import ScrollReveal from "@/components/performance/ScrollReveal";

interface ReviewsSectionProps {
  initialReviews?: ReviewItemData[];
}

export default function ReviewsSection({ initialReviews = [] }: ReviewsSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Initial fallback reviews with luxury Chikankari garment imagery & product titles
  const displayReviews: ReviewItemData[] =
    initialReviews.length > 0
      ? initialReviews
      : [
          {
            id: "rev-1",
            authorName: "ANANYA R.",
            rating: 5,
            body: "The shadow work on the georgette kurti is exquisite. Feels so light, comfortable, and beautifully finished.",
            productName: "Georgette Chikankari Kurta",
            photoUrl: "/images/reshamchikankari/New%20folder%203/IMG_3001.JPG",
            isVerified: true,
          },
          {
            id: "rev-2",
            authorName: "MEERA KAPOOR",
            rating: 5,
            body: "Pure Lucknow craftsmanship. The fabric quality and intricate threadwork exceeded my expectations.",
            productName: "Lucknowi Muslin Co-ord Set",
            photoUrl: "/images/reshamchikankari/New%20folder/IMG_2685.JPG",
            isVerified: true,
          },
          {
            id: "rev-3",
            authorName: "KAVITA SETHI",
            rating: 5,
            body: "Wore this to a festive lunch and received so many compliments. True luxury Chikankari!",
            productName: "Viscose Chanderi Anarkali",
            photoUrl: "/images/reshamchikankari/New%20folder%2021/IMG_3192.JPG",
            isVerified: true,
          },
          {
            id: "rev-4",
            authorName: "RITU VERMA",
            rating: 5,
            body: "Extremely fine stitching and elegant silhouette. Loved the packaging and care instructions.",
            productName: "Modal Shadow-Work Tunic",
            photoUrl: "/images/reshamchikankari/New%20folder%205/IMG_3230.JPG",
            isVerified: true,
          },
          {
            id: "rev-5",
            authorName: "SNEHA NAIR",
            rating: 5,
            body: "Resham Chikankari has brought authentic Lucknawi heritage straight to my wardrobe. Highly recommended!",
            productName: "Structured Cotton Kurti",
            photoUrl: "/images/reshamchikankari/New%20folder%202/IMG_3250.JPG",
            isVerified: true,
          },
        ];

  return (
    <section
      id="reviews"
      className="relative z-10 w-full flex flex-col justify-center py-20 sm:py-28 bg-brand-sage-section text-brand-offwhite border-t border-brand-offwhite/15 text-center overflow-hidden select-none"
    >
      <Container className="w-full relative z-20 flex flex-col items-center">
        <ScrollReveal direction="up" className="w-full flex flex-col items-center">
          {/* 1. Header & Eyebrow (Normal Document Flow Above Carousel) */}
          <div className="max-w-2xl mx-auto mb-4 sm:mb-6">
            <span className="text-[10px] sm:text-xs tracking-[0.25em] font-sans uppercase font-bold text-brand-pink mb-2 block">
              PATRON VOICES & REVIEWS
            </span>

            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-brand-offwhite leading-[1.15] max-w-xl mx-auto">
              The Stories Behind <br />
              The Stitch
            </h2>

            <p className="font-sans text-xs sm:text-sm text-brand-offwhite/70 mt-2 max-w-md mx-auto leading-relaxed">
              Reflections from women who cherish authentic hand-embroidered Lucknowi Chikankari.
            </p>
          </div>

          {/* 2. Bounded Radial Semicircular Carousel Stage */}
          <div className="w-full">
            <ReviewArc reviews={displayReviews} />
          </div>

          {/* 3. Editorial Navigation Drag Hint & CTA Button (Normal Document Flow Below Carousel) */}
          <div className="flex flex-col items-center mt-3 sm:mt-5 space-y-4">
            <p className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#FFF9F4]/70 font-sans">
              ← Drag to explore patron stories →
            </p>

            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-[#E694AA] hover:bg-[#d8849c] text-white w-[260px] h-[48px] flex items-center justify-center font-bold text-xs uppercase tracking-[0.2em] transition-all rounded-[2px] cursor-pointer shadow-md hover:scale-102"
            >
              SHARE YOUR EXPERIENCE →
            </button>
          </div>
        </ScrollReveal>

        {/* Review Form Modal Drawer */}
        <ReviewFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </Container>
    </section>
  );
}
