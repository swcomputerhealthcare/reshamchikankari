'use client';

import React, { useState, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Button from "@/components/ui/button";

interface ShopFiltersProps {
  categories: { id: string; name: string; slug: string }[];
}

export default function ShopFilters({ categories }: ShopFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [activeCategory, setActiveCategory] = useState(searchParams.get("category") || "");
  const [sort, setSort] = useState(searchParams.get("sort") || "newest");

  const applyFilters = (newCategory = activeCategory, newSort = sort) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      
      if (newCategory) {
        params.set("category", newCategory);
      } else {
        params.delete("category");
      }

      if (minPrice) {
        params.set("minPrice", minPrice);
      } else {
        params.delete("minPrice");
      }

      if (maxPrice) {
        params.set("maxPrice", maxPrice);
      } else {
        params.delete("maxPrice");
      }

      if (newSort) {
        params.set("sort", newSort);
      } else {
        params.delete("sort");
      }

      // Reset page when filters change
      params.delete("page");

      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleCategoryClick = (slug: string) => {
    const nextCategory = activeCategory === slug ? "" : slug;
    setActiveCategory(nextCategory);
    applyFilters(nextCategory);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextSort = e.target.value;
    setSort(nextSort);
    applyFilters(activeCategory, nextSort);
  };

  const handleClearAll = () => {
    setMinPrice("");
    setMaxPrice("");
    setActiveCategory("");
    setSort("newest");
    router.push(pathname);
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Sort Section */}
      <div className="space-y-3">
        <label className="block text-xs uppercase tracking-widest text-neutral-600 font-bold">
          Sort By
        </label>
        <select
          value={sort}
          onChange={handleSortChange}
          className="w-full px-3 py-2 border border-brand-black/10 bg-white text-sm focus:border-brand-black focus:outline-none rounded-lg"
        >
          <option value="newest">Newest Arrivals</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </div>
 
      {/* Categories Filter */}
      <div className="space-y-3">
        <h4 className="text-xs uppercase tracking-widest text-neutral-600 font-bold">
          Categories
        </h4>
        <div className="space-y-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat.slug)}
              className={`flex items-center w-full text-left text-sm py-1.5 transition-colors duration-150 ${
                activeCategory === cat.slug
                  ? "text-brand-pink font-semibold"
                  : "text-neutral-600 hover:text-brand-black"
              }`}
            >
              <span className={`w-2 h-2 rounded-full mr-2.5 transition-transform ${
                activeCategory === cat.slug ? "bg-brand-pink scale-110" : "bg-neutral-200"
              }`} />
              {cat.name}
            </button>
          ))}
        </div>
      </div>
 
      {/* Price Range Filter */}
      <div className="space-y-3">
        <h4 className="text-xs uppercase tracking-widest text-neutral-600 font-bold">
          Price Range (₹)
        </h4>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-full px-3 py-2 border border-brand-black/10 bg-white text-xs focus:border-brand-black focus:outline-none rounded-lg"
          />
          <input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-full px-3 py-2 border border-brand-black/10 bg-white text-xs focus:border-brand-black focus:outline-none rounded-lg"
          />
        </div>
        <Button
          variant="secondary"
          size="sm"
          className="w-full"
          onClick={() => applyFilters()}
          disabled={isPending}
        >
          {isPending ? "Applying..." : "Apply Price"}
        </Button>
      </div>

      {/* Clear Filters Button */}
      {(activeCategory || minPrice || maxPrice || sort !== "newest") && (
        <button
          onClick={handleClearAll}
          className="w-full text-center text-xs uppercase tracking-widest text-neutral-500 hover:text-brand-black transition-colors py-2 border-t border-brand-black/5"
        >
          Clear All Filters
        </button>
      )}
    </div>
  );
}
