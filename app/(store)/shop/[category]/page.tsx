import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Container from "@/components/ui/container";
import { getProducts, getCategories } from "@/lib/catalog";
import { getWishlistItems } from "@/lib/wishlist";
import ProductCard from "@/components/product/ProductCard";

interface CategoryPageProps {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata(props: CategoryPageProps): Promise<Metadata> {
  const params = await props.params;
  const categorySlug = params.category;
  const categoriesList = await getCategories();
  const category = categoriesList.find((c) => c.slug === categorySlug);

  if (!category) {
    return {
      title: "Category Not Found — Resham Chikankari",
      description: "Explore authentic handcrafted Lucknowi Chikankari collections.",
    };
  }

  const categoryImageUrl = category.imageUrl?.startsWith("http")
    ? category.imageUrl
    : `https://www.reshamchikankari.com${category.imageUrl || "/images/about.png"}`;

  return {
    title: `${category.name} — Handcrafted Lucknowi Chikankari`,
    description: `Shop authentic handcrafted ${category.name} from Lucknow. ${category.description} Intricate shadow-work, delicate needlecraft, and all-India express delivery.`,
    keywords: [
      category.name,
      `${category.name} Lucknow`,
      "Chikankari Kurtis Online",
      "Authentic Lucknow Chikankari",
      "Handcrafted Indian Ethnic Wear",
      categorySlug,
    ],
    alternates: {
      canonical: `https://www.reshamchikankari.com/shop/${category.slug}`,
    },
    openGraph: {
      title: `${category.name} Collection | Resham Chikankari`,
      description: category.description || "Authentic handcrafted Lucknowi Chikankari garments.",
      url: `https://www.reshamchikankari.com/shop/${category.slug}`,
      siteName: "Resham Chikankari",
      type: "website",
      images: [
        {
          url: categoryImageUrl,
          width: 1200,
          height: 630,
          alt: `${category.name} — Resham Chikankari`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${category.name} | Resham Chikankari`,
      description: category.description || "Authentic handcrafted Lucknowi Chikankari garments.",
      images: [categoryImageUrl],
    },
  };
}

export default async function CategoryPage(props: CategoryPageProps) {
  const params = await props.params;
  const categorySlug = params.category;

  const categoriesList = await getCategories();
  const activeCategory = categoriesList.find((c) => c.slug === categorySlug);

  if (!activeCategory) {
    notFound();
  }

  const wishlistIds = await getWishlistItems();
  const { products } = await getProducts({ categorySlug });

  // Schema.org CollectionPage & BreadcrumbList
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${activeCategory.name} Collection`,
    description: activeCategory.description,
    url: `https://www.reshamchikankari.com/shop/${activeCategory.slug}`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: products.map((prod, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `https://www.reshamchikankari.com/product/${prod.slug}`,
        name: prod.name,
      })),
    },
  };

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
      {
        "@type": "ListItem",
        position: 3,
        name: activeCategory.name,
        item: `https://www.reshamchikankari.com/shop/${activeCategory.slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Main Grid */}
      <div className="py-12 sm:py-16">
        <Container>
          <div className="text-center max-w-xl mx-auto mb-16">
            <span className="text-[10px] sm:text-xs tracking-widest font-sans uppercase font-medium text-brand-sage mb-2 block">
              Lucknowi Curated Category
            </span>
            <h1 className="font-display text-4xl sm:text-5xl text-brand-black mb-4">
              {activeCategory.name}
            </h1>
            <p className="font-sans text-sm text-neutral-500 leading-relaxed">
              {activeCategory.description}
            </p>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-20 bg-white border border-brand-black/5 font-sans">
              <h3 className="font-display text-2xl text-neutral-700 mb-2">No products in category</h3>
              <p className="text-sm text-neutral-500 mb-6">
                New arrivals are being added to this collection. Check back shortly.
              </p>
              <Link
                href="/shop"
                className="text-xs uppercase tracking-widest font-semibold border-b border-brand-black pb-0.5"
              >
                Browse all products
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  initialWishlisted={wishlistIds.includes(product.id)}
                />
              ))}
            </div>
          )}
        </Container>
      </div>
    </>
  );
}
