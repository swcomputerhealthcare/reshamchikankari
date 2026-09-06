import React from "react";
import { notFound } from "next/navigation";
import Container from "@/components/ui/container";
import ProductDetailClient from "@/components/product/product-detail-client";
import { getProductBySlug } from "@/lib/catalog";
import { getWishlistItems } from "@/lib/wishlist";

import ProductReviews from "@/components/product/product-reviews";
import { getProductReviewsAction } from "@/actions/review";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata(props: ProductPageProps) {
  const params = await props.params;
  const slug = params.slug;
  const product = await getProductBySlug(slug);

  return {
    title: product ? `${product.name} — Resham` : "Product Not Found",
    description: product ? product.description : " लखनऊ हस्तशिल्प चिकनकारी कुर्ता",
  };
}

export default async function ProductDetailPage(props: ProductPageProps) {
  const params = await props.params;
  const slug = params.slug;

  const [product, wishlistIds] = await Promise.all([
    getProductBySlug(slug),
    getWishlistItems(),
  ]);

  if (!product) {
    notFound();
  }

  const reviews = await getProductReviewsAction(product.id);
  const isWishlisted = wishlistIds.includes(product.id);

  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : null;

  return (
    <div className="py-12 sm:py-20">
      <Container>
        <ProductDetailClient
          product={product}
          initialWishlisted={isWishlisted}
          reviewsCount={reviews.length}
          averageRating={averageRating}
        />

        <ProductReviews
          productId={product.id}
          productName={product.name}
          initialReviews={reviews}
        />
      </Container>
    </div>
  );
}
