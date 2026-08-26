import React from "react";
import { requireAdmin } from "@/lib/auth/helpers";
import Container from "@/components/ui/container";
import { db } from "@/db";
import { productImages, products } from "@/db/schema/catalog";
import { eq, desc } from "drizzle-orm";
import MediaListController from "@/components/admin/media-list-controller";

export const metadata = {
  title: "Admin Media Assets — Resham",
};

export default async function AdminMediaPage() {
  // Enforce ADMIN role check
  await requireAdmin();

  let mediaList: any[] = [];
  let productsList: any[] = [];

  const isDbAvailable = !!process.env.DATABASE_URL && process.env.DATABASE_URL.indexOf("[YOUR-PASSWORD]") === -1;

  if (isDbAvailable) {
    try {
      // 1. Fetch linked product images
      mediaList = await db
        .select({
          id: productImages.id,
          url: productImages.url,
          imageUrl: productImages.imageUrl,
          alt: productImages.alt,
          altText: productImages.altText,
          productId: productImages.productId,
          productName: products.name,
          createdAt: productImages.createdAt,
        })
        .from(productImages)
        .innerJoin(products, eq(productImages.productId, products.id))
        .orderBy(desc(productImages.createdAt));

      // 2. Fetch active products for drop-down selection
      productsList = await db
        .select({
          id: products.id,
          name: products.name,
        })
        .from(products)
        .where(eq(products.isActive, true));
    } catch (e) {
      console.error("Failed to query database media assets:", e);
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
            Media Asset Library
          </h1>
        </Container>
      </div>

      {/* Main media manager controller */}
      <Container>
        <MediaListController initialMedia={mediaList} products={productsList} />
      </Container>
    </div>
  );
}
