import React from "react";
import { requireAdmin } from "@/lib/auth/helpers";
import Container from "@/components/ui/container";
import { db } from "@/db";
import { reviews } from "@/db/schema/review";
import { products } from "@/db/schema/catalog";
import { profiles } from "@/db/schema/auth";
import { desc, eq } from "drizzle-orm";
import ReviewListController from "@/components/admin/review-list-controller";

export const metadata = {
  title: "Admin Reviews Queue — Resham",
};

export default async function AdminReviewsPage() {
  // Enforce ADMIN role check
  await requireAdmin();

  let reviewsList: any[] = [];
  let productsList: any[] = [];

  const isDbAvailable = !!process.env.DATABASE_URL && process.env.DATABASE_URL.indexOf("[YOUR-PASSWORD]") === -1;

  if (isDbAvailable) {
    try {
      // 1. Fetch reviews
      reviewsList = await db.query.reviews.findMany({
        orderBy: desc(reviews.createdAt),
        with: {
          user: true,
          product: true,
        },
      });

      // 2. Fetch products for dropdown selector
      productsList = await db
        .select({
          id: products.id,
          name: products.name,
        })
        .from(products)
        .where(eq(products.isActive, true));
    } catch (e) {
      console.error("Failed to query reviews moderation data:", e);
    }
  }

  return (
    <div className="pb-24 selection:bg-brand-pink/20">
      {/* Header section */}
      <div className="bg-brand-black text-brand-offwhite py-8 mb-12">
        <Container>
          <span className="text-[10px] tracking-widest uppercase text-neutral-400 font-semibold mb-1 block">
            Management Portal
          </span>
          <h1 className="font-display text-3xl tracking-wide">
            Product Reviews
          </h1>
        </Container>
      </div>

      {/* Main reviews moderator table and importer */}
      <Container>
        <ReviewListController
          initialReviews={reviewsList}
          products={productsList}
        />
      </Container>
    </div>
  );
}
