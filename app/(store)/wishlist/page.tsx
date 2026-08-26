import React from "react";
import Container from "@/components/ui/container";
import { getWishlistItems } from "@/lib/wishlist";
import { getProducts } from "@/lib/catalog";
import WishlistClient from "@/components/wishlist/wishlist-client";

export const metadata = {
  title: "Wishlist — Resham Chikankari",
  description: "Your curated selection of hand-embroidered Lucknowi garments saved for later.",
};

export default async function DirectWishlistPage() {
  const wishlistIds = await getWishlistItems();

  const wishlistedProducts = wishlistIds.length > 0
    ? (await getProducts({ productIds: wishlistIds, limit: wishlistIds.length })).products
    : [];

  return (
    <div className="py-12 sm:py-20 min-h-[70vh]">
      <Container className="max-w-6xl">
        <WishlistClient products={wishlistedProducts} />
      </Container>
    </div>
  );
}
