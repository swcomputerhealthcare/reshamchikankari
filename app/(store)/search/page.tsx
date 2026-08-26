import React from "react";
import Link from "next/link";
import Container from "@/components/ui/container";
import { getProducts } from "@/lib/catalog";
import { getWishlistItems } from "@/lib/wishlist";
import ProductCard from "@/components/product/ProductCard";

interface SearchPageProps {
  params: Promise<{ [key: string]: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export const metadata = {
  title: "Search Catalog — Resham Chikankari",
  description: "Search Lucknowi hand-embroidered Kurtis.",
};

export default async function SearchPage(props: SearchPageProps) {
  const searchParams = await props.searchParams;
  const q = (searchParams.q as string | undefined) || "";

  const [{ products }, wishlistIds] = await Promise.all([
    getProducts({ query: q, limit: 20 }),
    getWishlistItems(),
  ]);

  return (
    <>

      {/* Search Content */}
      <div className="py-12 sm:py-16">
        <Container>
          <div className="max-w-xl mx-auto mb-16 text-center">
            <h1 className="font-display text-3xl sm:text-4xl mb-6">Search products</h1>
            <form action="/search" method="GET" className="flex items-center border border-brand-black/10 bg-white">
              <input
                type="text"
                name="q"
                defaultValue={q}
                placeholder="Search by name, category, or SKU..."
                className="flex-1 px-4 py-3 bg-white text-sm focus:outline-none"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-brand-black text-brand-offwhite text-xs uppercase tracking-widest font-semibold hover:bg-neutral-800 transition-colors"
              >
                Search
              </button>
            </form>
            {q && (
              <p className="mt-4 text-xs font-sans text-neutral-500 uppercase tracking-wider">
                Showing results for &ldquo;{q}&rdquo; &bull; {products.length} items found
              </p>
            )}
          </div>

          {q && products.length === 0 ? (
            <div className="text-center py-20 bg-white border border-brand-black/5 font-sans">
              <h3 className="font-display text-2xl text-neutral-700 mb-2">No results found</h3>
              <p className="text-sm text-neutral-500 max-w-xs mx-auto">
                We couldn&apos;t find any products matching your search term. Please try checking spelling or try other keywords.
              </p>
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  initialWishlisted={wishlistIds.includes(product.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-neutral-500 font-sans text-sm">
              Enter a search keyword above to browse the collections.
            </div>
          )}
        </Container>
      </div>
    </>
  );
}
