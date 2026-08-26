import React from "react";
import Container from "@/components/ui/container";
import { getWishlistItems } from "@/lib/wishlist";
import { getProducts } from "@/lib/catalog";
import WishlistClient from "@/components/wishlist/wishlist-client";

export const metadata = {
  title: "My Wishlist — Resham Chikankari",
  description: "Your curated selection of hand-embroidered Lucknowi garments saved for later.",
};

export default async function WishlistPage() {
  const wishlistIds = await getWishlistItems();

  // Load ONLY products matching wishlisted IDs
  const wishlistedProducts = wishlistIds.length > 0
    ? (await getProducts({ productIds: wishlistIds, limit: wishlistIds.length })).products
    : [];

  return (
    <div className="py-16 sm:py-24">
      <Container className="max-w-5xl">
        <WishlistClient products={wishlistedProducts} />
      </Container>
    </div>
  );
}
