'use client';

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createProductAction } from "@/actions/catalog";
import Button from "@/components/ui/button";

interface CategoryOption {
  id: string;
  name: string;
}

interface ProductFormProps {
  categories: CategoryOption[];
}

export default function ProductForm({ categories }: ProductFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [sku, setSku] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [price, setPrice] = useState("");
  const [comparePrice, setComparePrice] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    // Auto-generate slug from name
    setSlug(
      val
        .toLowerCase()
        .replace(/[^a-z0-9 ]/g, "")
        .replace(/\s+/g, "-")
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      setError("Please enter a valid positive price");
      setIsLoading(false);
      return;
    }

    const pricePaise = Math.round(priceNum * 100);
    const compareAtPricePaise = comparePrice ? Math.round(parseFloat(comparePrice) * 100) : undefined;

    try {
      const res = await createProductAction({
        name,
        slug,
        categoryId,
        description,
        sku,
        pricePaise,
        compareAtPricePaise,
        isActive: true,
        image: image || undefined,
      });

      if (!res.success) {
        setError(res.error || "Failed to create product.");
      } else {
        router.push("/admin/products");
        router.refresh();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 font-sans">
      {error && (
        <div className="bg-red-50 text-red-600 text-xs p-3 border border-red-100 font-sans">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Name */}
        <div className="space-y-2">
          <label htmlFor="name" className="block text-xs uppercase tracking-wider text-neutral-600 font-bold">
            Product Name
          </label>
          <input
            id="name"
            type="text"
            required
            value={name}
            onChange={handleNameChange}
            placeholder="e.g. Gulabo Cotton Kurti"
            className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 focus:border-brand-black focus:outline-none text-sm font-sans"
          />
        </div>

        {/* Slug */}
        <div className="space-y-2">
          <label htmlFor="slug" className="block text-xs uppercase tracking-wider text-neutral-600 font-bold">
            Slug (URL Segment)
          </label>
          <input
            id="slug"
            type="text"
            required
            value={slug}
            onChange={(e) => setSlug(e.target.value.toLowerCase())}
            placeholder="e.g. gulabo-cotton-kurti"
            className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 focus:border-brand-black focus:outline-none text-sm font-sans"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* SKU */}
        <div className="space-y-2">
          <label htmlFor="sku" className="block text-xs uppercase tracking-wider text-neutral-600 font-bold">
            SKU Code
          </label>
          <input
            id="sku"
            type="text"
            required
            value={sku}
            onChange={(e) => setSku(e.target.value.toUpperCase())}
            placeholder="e.g. RES-KURT-GULABO"
            className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 focus:border-brand-black focus:outline-none text-sm font-sans"
          />
        </div>

        {/* Category Select */}
        <div className="space-y-2">
          <label htmlFor="category" className="block text-xs uppercase tracking-wider text-neutral-600 font-bold">
            Category
          </label>
          <select
            id="category"
            required
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 focus:border-brand-black focus:outline-none text-sm font-sans"
          >
            <option value="">Select a category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Price */}
        <div className="space-y-2">
          <label htmlFor="price" className="block text-xs uppercase tracking-wider text-neutral-600 font-bold">
            Base Price (₹)
          </label>
          <input
            id="price"
            type="number"
            step="0.01"
            required
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="e.g. 1899.00"
            className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 focus:border-brand-black focus:outline-none text-sm font-sans"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Compare-at Price */}
        <div className="space-y-2">
          <label htmlFor="comparePrice" className="block text-xs uppercase tracking-wider text-neutral-600 font-bold">
            Compare At Price (₹ - Optional)
          </label>
          <input
            id="comparePrice"
            type="number"
            step="0.01"
            value={comparePrice}
            onChange={(e) => setComparePrice(e.target.value)}
            placeholder="e.g. 2499.00"
            className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 focus:border-brand-black focus:outline-none text-sm font-sans"
          />
        </div>

        {/* Image URL */}
        <div className="space-y-2">
          <label htmlFor="image" className="block text-xs uppercase tracking-wider text-neutral-600 font-bold">
            Product Image URL (Optional)
          </label>
          <input
            id="image"
            type="url"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 focus:border-brand-black focus:outline-none text-sm font-sans"
          />
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label htmlFor="description" className="block text-xs uppercase tracking-wider text-neutral-600 font-bold">
          Description
        </label>
        <textarea
          id="description"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter product description details here..."
          className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 focus:border-brand-black focus:outline-none text-sm font-sans"
        />
      </div>

      <div className="flex justify-end gap-4 border-t border-neutral-100 pt-6">
        <Link href="/admin/products">
          <Button variant="outline" type="button" className="py-2.5">
            Cancel
          </Button>
        </Link>
        <Button variant="primary" type="submit" className="py-2.5 px-8" isLoading={isLoading}>
          Create Product
        </Button>
      </div>
    </form>
  );
}
