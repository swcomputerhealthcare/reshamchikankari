import React from "react";
import Image from "next/image";
import Link from "next/link";
import Container from "@/components/ui/container";
import { getWishlistItems } from "@/lib/wishlist";
import { getProducts } from "@/lib/catalog";
import ProductCard from "@/components/product/ProductCard";
import ScrollReveal from "@/components/performance/ScrollReveal";
import HeroSection from "@/components/home/HeroSection";
import ShopByFabric from "@/components/home/ShopByFabric";
import ReviewsSection from "@/components/home/ReviewsSection";
import ContactCTA from "@/components/home/ContactCTA";
import { db } from "@/db";
import { reviews } from "@/db/schema/review";
import { profiles } from "@/db/schema/auth";
import { eq } from "drizzle-orm";

export default async function StorefrontHome() {
  let dbReviewsList: any[] = [];

  const isDbAvailable = !!process.env.DATABASE_URL && process.env.DATABASE_URL.indexOf("[YOUR-PASSWORD]") === -1;

  if (isDbAvailable) {
    try {
      dbReviewsList = await db
        .select({
          id: reviews.id,
          userFullName: profiles.fullName,
          authorName: reviews.authorName,
          title: reviews.title,
          rating: reviews.rating,
          body: reviews.body,
          isVerified: reviews.isVerifiedPurchase,
        })
        .from(reviews)
        .leftJoin(profiles, eq(reviews.userId, profiles.id))
        .where(eq(reviews.isApproved, true))
        .limit(6);
    } catch (e) {
      console.error("Failed to query approved reviews:", e);
    }
  }

  const initialReviews = dbReviewsList.map((r) => ({
    id: r.id,
    authorName: r.userFullName || r.authorName || r.title || "Valued Patron",
    rating: r.rating,
    body: r.body,
    isVerified: r.isVerified ?? true,
  }));

  const [wishlistIds, { products }] = await Promise.all([
    getWishlistItems(),
    getProducts({ limit: 4 }),
  ]);

  return (
    <>
      {/* Section 1: Full-Height Editorial Hero Section */}
      <HeroSection />

      {/* Section 2: New Arrivals Section — Fresh From Lucknow (Directly After Hero) */}
      <section id="products" className="relative z-10 w-full flex flex-col justify-center py-16 sm:py-24 lg:py-28 bg-brand-sage-section text-brand-offwhite border-t border-brand-offwhite/15 overflow-visible">
        <Container>
          {/* Editorial Left-Aligned Heading */}
          <ScrollReveal direction="up">
            <div className="mb-8 sm:mb-12 lg:mb-16 text-brand-offwhite max-w-2xl">
              <span className="text-[10px] sm:text-xs tracking-[0.2em] font-sans uppercase font-bold text-brand-pink mb-2 sm:mb-3 block">
                NEW ARRIVALS
              </span>
              <h2 className="font-display text-3xl sm:text-5xl lg:text-6xl text-brand-offwhite leading-tight">
                Fresh From Lucknow
              </h2>
              <p className="font-sans text-xs sm:text-sm text-brand-offwhite/70 mt-2 sm:mt-3 max-w-md leading-relaxed">
                Discover the latest expressions of our craft. Hand-embroidered shadow-work reimagined for the modern wardrobe.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={0.15}>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
              {products.slice(0, 4).map((product, idx) => (
                <div
                  key={product.id}
                  className={idx % 2 === 1 ? "lg:translate-y-8 transition-transform duration-300" : ""}
                >
                  <ProductCard
                    product={product}
                    initialWishlisted={wishlistIds.includes(product.id)}
                  />
                </div>
              ))}
            </div>
          </ScrollReveal>

          {/* Right Aligned Editorial CTA */}
          <ScrollReveal direction="up" delay={0.2}>
            <div className="mt-8 sm:mt-12 lg:mt-16 flex justify-end">
              <Link href="/shop" className="group text-xs font-bold uppercase tracking-widest text-brand-pink hover:text-brand-offwhite transition-colors flex items-center gap-1">
                View All New Arrivals <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </Link>
            </div>
          </ScrollReveal>
        </Container>
      </section>

      {/* Section 3: Shop by Fabric (Editorial Textile Archive Spec) */}
      <ShopByFabric />

      {/* Section 4: Patron Voices & Customer Reviews Arc */}
      <ReviewsSection initialReviews={initialReviews} />

      {/* Section 6: Quiet Editorial Contact CTA */}
      <ContactCTA />
    </>
  );
}

