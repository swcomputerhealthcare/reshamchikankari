import React, { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import Container from "@/components/ui/container";
import Button from "@/components/ui/button";
import { getProducts, getCategories } from "@/lib/catalog";
import ShopFilters from "@/components/product/shop-filters";
import { getWishlistItems } from "@/lib/wishlist";
import ProductCard from "@/components/product/ProductCard";

export const metadata = {
  title: "Shop All Kurtis — Resham Chikankari",
  description: "Browse our collection of hand-embroidered Lucknowi Chikankari Kurtis. Premium fabrics and intricate artisanal thread-work.",
};

interface ShopPageProps {
  params: Promise<{ [key: string]: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ShopPage(props: ShopPageProps) {
  const searchParams = await props.searchParams;

  const category = searchParams.category as string | undefined;
  const fabric = searchParams.fabric as string | undefined;
  const q = searchParams.q as string | undefined;
  const sort = searchParams.sort as string | undefined;
  const minPrice = searchParams.minPrice ? Number(searchParams.minPrice) * 100 : undefined;
  const maxPrice = searchParams.maxPrice ? Number(searchParams.maxPrice) * 100 : undefined;
  const page = searchParams.page ? Number(searchParams.page) : 1;
  const limit = 12;

  const [categoriesData, wishlistIds, { products, total }] = await Promise.all([
    getCategories(),
    getWishlistItems(),
    getProducts({
      categorySlug: category,
      query: q,
      fabric,
      priceMin: minPrice,
      priceMax: maxPrice,
      sort,
      page,
      limit,
    }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <>

      {/* Shop Layout */}
      <div className="py-12 sm:py-16">
        <Container>
          {/* Shop Heading */}
          <div className="text-center mb-12 sm:mb-16">
            <h1 className="font-display text-4xl sm:text-5xl text-brand-black mb-4">
              {fabric
                ? `${fabric.charAt(0).toUpperCase() + fabric.slice(1)} Collection`
                : category
                ? categoriesData.find((c) => c.slug === category)?.name
                : "The Catalogue"}
            </h1>
            <p className="font-sans text-xs tracking-widest text-neutral-500 uppercase">
              {total} Hand-Embroidered Treasures Found
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Filters Sidebar */}
            <aside className="lg:col-span-3 space-y-8 bg-brand-offwhite/40 border border-brand-black/5 p-6 rounded-none h-fit">
              <Suspense fallback={<div className="text-xs text-neutral-500 font-sans">Loading filters...</div>}>
                <ShopFilters categories={categoriesData} />
              </Suspense>
            </aside>

            {/* Product Grid & List */}
            <main className="lg:col-span-9 space-y-12">
              {products.length === 0 ? (
                <div className="text-center py-20 bg-brand-offwhite/40 border border-brand-black/5 rounded-none font-sans">
                  <h3 className="font-display text-2xl text-neutral-700 mb-2">No items found</h3>
                  <p className="text-sm text-neutral-500 mb-6 max-w-xs mx-auto">
                    We couldn&apos;t find any products matching the active filters. Try refining your selections.
                  </p>
                  <Link href="/shop">
                    <Button variant="outline" size="sm">
                      Clear Filters
                    </Button>
                  </Link>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
                    {products.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        initialWishlisted={wishlistIds.includes(product.id)}
                      />
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 border-t border-brand-black/5 pt-8 font-sans">
                      {Array.from({ length: totalPages }).map((_, idx) => {
                        const pageNum = idx + 1;
                        const isCurrent = page === pageNum;
                        return (
                          <Link
                            key={pageNum}
                            href={`/shop?page=${pageNum}${category ? `&category=${category}` : ""}${sort ? `&sort=${sort}` : ""}`}
                            className={`w-10 h-10 flex items-center justify-center text-xs border rounded-none transition-all duration-300 ${
                              isCurrent
                                ? "bg-brand-black text-brand-offwhite border-brand-black font-semibold"
                                : "bg-brand-offwhite/50 border-brand-black/10 hover:border-brand-black/30 hover:bg-brand-black/5 text-neutral-600"
                            }`}
                          >
                            {pageNum}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </main>
          </div>
        </Container>
      </div>
    </>
  );
}
