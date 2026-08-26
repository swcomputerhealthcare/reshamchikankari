import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import Container from "@/components/ui/container";
import { getProducts, getCategories } from "@/lib/catalog";
import { getWishlistItems } from "@/lib/wishlist";
import ProductCard from "@/components/product/ProductCard";

interface CategoryPageProps {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata(props: CategoryPageProps) {
  const params = await props.params;
  const categorySlug = params.category;
  const categoriesList = await getCategories();
  const category = categoriesList.find((c) => c.slug === categorySlug);

  return {
    title: category ? `${category.name} Collection — Resham` : "Category Not Found",
    description: category ? category.description : "Lucknowi Chikankari Catalog",
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

  return (
    <>

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
              <Link href="/shop" className="text-xs uppercase tracking-widest font-semibold border-b border-brand-black pb-0.5">
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
