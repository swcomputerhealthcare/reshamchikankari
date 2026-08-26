'use client';

import React from "react";
import CraftStory from "@/components/home/CraftStory";
import ReviewsSection from "@/components/home/ReviewsSection";
import ContactCTA from "@/components/home/ContactCTA";
import { ReviewItemData } from "@/components/reviews/ReviewCard";

interface EditorialHomeClientProps {
  children?: React.ReactNode;
  initialReviews?: ReviewItemData[];
}

export default function EditorialHomeClient({ initialReviews = [] }: EditorialHomeClientProps) {
  return (
    <>
      {/* Craftsmanship & Brand Story Section */}
      <CraftStory />

      {/* Radial Customer Reviews Arc & Share Experience Modal Drawer */}
      <ReviewsSection initialReviews={initialReviews} />

      {/* Quiet Editorial Contact CTA */}
      <ContactCTA />
    </>
  );
}
