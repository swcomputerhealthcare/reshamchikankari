import React from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
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

export async function generateMetadata(props: ProductPageProps): Promise<Metadata> {
  const params = await props.params;
  const slug = params.slug;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: "Product Not Found — Resham Chikankari",
      description: "Authentic Lucknowi Chikankari clothing handcrafted by master women artisans.",
    };
  }

  const primaryImage =
    product.images?.find((img) => img.isPrimary)?.imageUrl ||
    product.images?.[0]?.imageUrl ||
    "/images/about.png";

  const absoluteImageUrl = primaryImage.startsWith("http")
    ? primaryImage
    : `https://www.reshamchikankari.com${primaryImage}`;

  const cleanDescription = product.description
    ? product.description.replace(/\s+/g, " ").trim().slice(0, 160)
    : `Authentic ${product.name} hand-embroidered by Lucknow artisans on fine ${product.fabric || "fabric"}. Guaranteed authentic Chikankari with pan-India delivery.`;

  return {
    title: `${product.name} — Handcrafted Lucknowi Chikankari`,
    description: cleanDescription,
    keywords: [
      product.name,
      "Lucknowi Chikankari",
      product.fabric ? `${product.fabric} Chikankari` : "Chikankari Kurti",
      product.category?.name || "Kurtis & Kurtas",
      "Authentic Chikankari Online",
      "Handcrafted Indian Wear",
    ],
    alternates: {
      canonical: `https://www.reshamchikankari.com/product/${product.slug}`,
    },
    openGraph: {
      title: `${product.name} | Resham Chikankari`,
      description: cleanDescription,
      url: `https://www.reshamchikankari.com/product/${product.slug}`,
      siteName: "Resham Chikankari",
      type: "article",
      images: [
        {
          url: absoluteImageUrl,
          width: 800,
          height: 1000,
          alt: `${product.name} — Authentic Lucknowi Chikankari`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} | Resham Chikankari`,
      description: cleanDescription,
      images: [absoluteImageUrl],
    },
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

  const primaryImage =
    product.images?.find((img) => img.isPrimary)?.imageUrl ||
    product.images?.[0]?.imageUrl ||
    "/images/about.png";

  const allImages = product.images?.map((img) =>
    img.imageUrl?.startsWith("http")
      ? img.imageUrl
      : `https://www.reshamchikankari.com${img.imageUrl}`
  ) || [`https://www.reshamchikankari.com${primaryImage}`];

  const inStock = product.variants && product.variants.length > 0
    ? product.variants.some((v) => (v.inventoryQuantity ?? 0) > 0 || v.isAvailable)
    : true;

  // Schema.org Product JSON-LD
  const productSchema: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: allImages,
    description: product.description,
    sku: product.variants?.[0]?.sku || product.id,
    mpn: product.id,
    brand: {
      "@type": "Brand",
      name: "Resham Chikankari",
    },
    category: product.category?.name || "Kurtis & Kurtas",
    material: product.fabric || "Cotton / Georgette",
    countryOfOrigin: "IN",
    offers: {
      "@type": "Offer",
      url: `https://www.reshamchikankari.com/product/${product.slug}`,
      priceCurrency: "INR",
      price: (product.pricePaise / 100).toFixed(2),
      priceValidUntil: "2026-12-31",
      itemCondition: "https://schema.org/NewCondition",
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "Resham Chikankari",
      },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: {
          "@type": "MonetaryAmount",
          value: "0",
          currency: "INR",
        },
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "IN",
        },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: {
            "@type": "QuantitativeValue",
            minValue: 1,
            maxValue: 2,
            unitCode: "DAY",
          },
          transitTime: {
            "@type": "QuantitativeValue",
            minValue: 3,
            maxValue: 5,
            unitCode: "DAY",
          },
        },
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "IN",
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 5,
        returnMethod: "https://schema.org/ReturnByMail",
        returnFees: "https://schema.org/FreeReturn",
      },
    },
  };

  if (reviews.length > 0 && averageRating) {
    productSchema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: averageRating,
      reviewCount: reviews.length,
      bestRating: "5",
      worstRating: "1",
    };
    productSchema.review = reviews.slice(0, 5).map((r) => ({
      "@type": "Review",
      reviewRating: {
        "@type": "Rating",
        ratingValue: r.rating,
        bestRating: "5",
      },
      author: {
        "@type": "Person",
        name: r.authorName || "Valued Patron",
      },
      reviewBody: r.body,
    }));
  }

  // Schema.org BreadcrumbList JSON-LD
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://www.reshamchikankari.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Shop",
        item: "https://www.reshamchikankari.com/shop",
      },
      ...(product.category
        ? [
            {
              "@type": "ListItem",
              position: 3,
              name: product.category.name,
              item: `https://www.reshamchikankari.com/shop/${product.category.slug}`,
            },
            {
              "@type": "ListItem",
              position: 4,
              name: product.name,
              item: `https://www.reshamchikankari.com/product/${product.slug}`,
            },
          ]
        : [
            {
              "@type": "ListItem",
              position: 3,
              name: product.name,
              item: `https://www.reshamchikankari.com/product/${product.slug}`,
            },
          ]),
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

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
    </>
  );
}
