import React from "react";
import { notFound } from "next/navigation";
import Container from "@/components/ui/container";
import ProductDetailClient from "@/components/product/product-detail-client";
import { getProductBySlug } from "@/lib/catalog";
import { getWishlistItems } from "@/lib/wishlist";

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

  const isWishlisted = wishlistIds.includes(product.id);

  return (
    <div className="py-12 sm:py-20">
      <Container>
        <ProductDetailClient
          product={product}
          initialWishlisted={isWishlisted}
        />
      </Container>
    </div>
  );
}
