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

  const [wishlistIds, { products: newArrivals }, { products: premiumProducts }] = await Promise.all([
    getWishlistItems(),
    getProducts({ limit: 4 }),
    getProducts({ categorySlug: "premium", limit: 4 }),
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
              {newArrivals.slice(0, 4).map((product, idx) => (
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

      {/* Section 3: The Premium Collection (Haute Couture Archive > ₹4,000) */}
      {premiumProducts.length > 0 && (
        <section className="relative z-10 w-full py-16 sm:py-24 lg:py-28 bg-[#FFF9F4] text-[#161616] border-t border-[#ECE9E2]">
          <Container>
            <ScrollReveal direction="up">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 sm:mb-14 gap-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#E694AA]/15 border border-[#E694AA]/25 rounded-full mb-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E694AA]"></span>
                    <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-[0.25em] text-[#7C7A5A]">
                      HAUTE COUTURE ARCHIVE
                    </span>
                  </div>
                  <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-[#161616] tracking-tight">
                    The Premium Collection
                  </h2>
                  <p className="font-sans text-xs sm:text-sm text-neutral-600 mt-2 max-w-lg leading-relaxed">
                    Exquisite bridal, Mukaish, and intricate royal shadow-work ensembles priced above ₹4,000. Handcrafted for discerning patrons who revere heritage authenticity.
                  </p>
                </div>
                <Link
                  href="/shop/premium"
                  className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#7C7A5A] hover:text-[#E694AA] transition-colors group self-start md:self-end"
                >
                  <span>Explore Premium Archive</span>
                  <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
                </Link>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={0.15}>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
                {premiumProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    initialWishlisted={wishlistIds.includes(product.id)}
                  />
                ))}
              </div>
            </ScrollReveal>
          </Container>
        </section>
      )}

      {/* Section 4: Shop by Fabric (Editorial Textile Archive Spec) */}
      <ShopByFabric />

      {/* Section 5: What People Say & Customer Reviews Arc */}
      <ReviewsSection initialReviews={initialReviews} />

      {/* Section 6: Quiet Editorial Contact CTA */}
      <ContactCTA />
    </>
  );
}

