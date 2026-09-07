'use client';

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createProductAction } from "@/actions/catalog";
import Button from "@/components/ui/button";
import ImageManager, { ManagedImage } from "@/components/admin/image-manager";
import { Sparkles, Plus, Trash2, Layers } from "lucide-react";

interface CategoryOption {
  id: string;
  name: string;
}

interface ProductFormProps {
  categories: CategoryOption[];
}

interface SizeVariantItem {
  name: string;
  sku: string;
  stock: number;
  isAvailable: boolean;
}

type TabType = "general" | "details" | "variants" | "media";

export default function ProductForm({ categories }: ProductFormProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("general");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // 1. General & Pricing Fields
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [sku, setSku] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [price, setPrice] = useState("");
  const [comparePrice, setComparePrice] = useState("");
  const [productNumber, setProductNumber] = useState("");
  const [description, setDescription] = useState("");
  const [featured, setFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);

  // 2. Editorial & Fabric Fields
  const [fabric, setFabric] = useState("");
  const [color, setColor] = useState("");
  const [length, setLength] = useState("");
  const [neckline, setNeckline] = useState("");
  const [sleeves, setSleeves] = useState("");
  const [occasion, setOccasion] = useState("");
  const [washCare, setWashCare] = useState("");

  // 3. Size Variants
  const [variants, setVariants] = useState<SizeVariantItem[]>([
    { name: "M", sku: "", stock: 10, isAvailable: true },
  ]);
  const [newSizeName, setNewSizeName] = useState("");
  const [newSizeSku, setNewSizeSku] = useState("");
  const [newSizeStock, setNewSizeStock] = useState("10");

  // 4. Media Images
  const [images, setImages] = useState<ManagedImage[]>([]);

  // Auto-generate slug and pre-fill variant SKUs when product SKU changes
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    const autoSlug = val
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, "")
      .replace(/\s+/g, "-");
    setSlug(autoSlug);
  };

  const handleSkuChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase();
    setSku(val);
    if (val && variants.length > 0) {
      setVariants((prev) =>
        prev.map((v) => ({
          ...v,
          sku: v.sku ? v.sku : `${val}-${v.name.toUpperCase()}`,
        }))
      );
    }
  };

  // Quick Generate Standard Sizes (S, M, L, XL, XXL)
  const handleQuickAddStandardSizes = () => {
    const baseSku = sku || "SKU";
    const standardSizes = ["S", "M", "L", "XL", "XXL"];
    const generated = standardSizes.map((size) => ({
      name: size,
      sku: `${baseSku.toUpperCase()}-${size}`,
      stock: 10,
      isAvailable: true,
    }));
    setVariants(generated);
  };

  const handleAddCustomVariant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSizeName) return;
    const baseSku = sku || "SKU";
    const variantSku = newSizeSku ? newSizeSku.toUpperCase() : `${baseSku.toUpperCase()}-${newSizeName.toUpperCase()}`;
    const stockNum = parseInt(newSizeStock, 10) || 10;

    setVariants((prev) => [
      ...prev,
      {
        name: newSizeName.toUpperCase(),
        sku: variantSku,
        stock: stockNum,
        isAvailable: true,
      },
    ]);
    setNewSizeName("");
    setNewSizeSku("");
    setNewSizeStock("10");
  };

  const handleRemoveVariant = (index: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateVariantStock = (index: number, newStockStr: string) => {
    const stockVal = parseInt(newStockStr, 10);
    if (isNaN(stockVal)) return;
    setVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, stock: stockVal } : v))
    );
  };

  // Main Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Product Name is required");
      setActiveTab("general");
      return;
    }

    if (!sku.trim()) {
      setError("SKU code is required");
      setActiveTab("general");
      return;
    }

    if (!categoryId) {
      setError("Please select a category");
      setActiveTab("general");
      return;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      setError("Please enter a valid positive base price");
      setActiveTab("general");
      return;
    }

    setIsLoading(true);

    const pricePaise = Math.round(priceNum * 100);
    const compareAtPricePaise = comparePrice ? Math.round(parseFloat(comparePrice) * 100) : undefined;
    const prodNum = productNumber ? parseInt(productNumber, 10) : undefined;

    // Prepare variants payload
    const formattedVariants = variants.map((v) => ({
      name: v.name,
      sku: v.sku || `${sku.toUpperCase()}-${v.name.toUpperCase()}`,
      stock: v.stock,
      isAvailable: v.isAvailable,
      size: v.name,
      pricePaise,
    }));

    try {
      const res = await createProductAction({
        name,
        slug: slug.toLowerCase(),
        categoryId,
        description,
        sku: sku.toUpperCase(),
        pricePaise,
        compareAtPricePaise,
        fabric: fabric || undefined,
        color: color || undefined,
        length: length || undefined,
        neckline: neckline || undefined,
        sleeves: sleeves || undefined,
        occasion: occasion || undefined,
        washCare: washCare || undefined,
        productNumber: prodNum,
        featured,
        isActive,
        images,
        variants: formattedVariants,
      });

      if (!res.success) {
        setError(res.error || "Failed to create product in database.");
        setIsLoading(false);
      } else {
        router.push("/admin/products");
        router.refresh();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(msg);
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: "general", label: "General & Pricing" },
    { id: "details", label: "Fabric & Editorial" },
    { id: "variants", label: "Sizes & Stock" },
    { id: "media", label: "Images & Media" },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6 font-sans">
      {error && (
        <div className="bg-red-50 text-red-600 text-xs p-4 border border-red-200 rounded-xs font-bold uppercase tracking-wider">
          {error}
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-neutral-200 overflow-x-auto scrollbar-custom mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as TabType)}
            className={`px-5 py-3 text-xs uppercase font-bold tracking-widest border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === tab.id
                ? "border-brand-sage text-brand-sage"
                : "border-transparent text-neutral-400 hover:text-neutral-600"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: General & Pricing */}
      {activeTab === "general" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Name */}
            <div className="space-y-2">
              <label htmlFor="name" className="block text-xs uppercase tracking-wider text-neutral-600 font-bold">
                Product Name *
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
                Slug (URL Segment) *
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
                SKU Code *
              </label>
              <input
                id="sku"
                type="text"
                required
                value={sku}
                onChange={handleSkuChange}
                placeholder="e.g. RES-KURT-GULABO"
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 focus:border-brand-black focus:outline-none text-sm font-sans uppercase font-semibold"
              />
            </div>

            {/* Category Select */}
            <div className="space-y-2">
              <label htmlFor="category" className="block text-xs uppercase tracking-wider text-neutral-600 font-bold">
                Category *
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

            {/* Product Number */}
            <div className="space-y-2">
              <label htmlFor="productNumber" className="block text-xs uppercase tracking-wider text-neutral-600 font-bold">
                Product Number (ID #)
              </label>
              <input
                id="productNumber"
                type="number"
                value={productNumber}
                onChange={(e) => setProductNumber(e.target.value)}
                placeholder="e.g. 10023"
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 focus:border-brand-black focus:outline-none text-sm font-sans"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Base Price */}
            <div className="space-y-2">
              <label htmlFor="price" className="block text-xs uppercase tracking-wider text-neutral-600 font-bold">
                Base Price (₹) *
              </label>
              <input
                id="price"
                type="number"
                step="0.01"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. 1899.00"
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 focus:border-brand-black focus:outline-none text-sm font-sans font-semibold"
              />
            </div>

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
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label htmlFor="description" className="block text-xs uppercase tracking-wider text-neutral-600 font-bold">
              Product Description
            </label>
            <textarea
              id="description"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Handcrafted Chikankari embroidery details, fabric texture, and styling description..."
              className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 focus:border-brand-black focus:outline-none text-sm font-sans leading-relaxed"
            />
          </div>

          {/* Publishing & Feature Controls */}
          <div className="flex flex-wrap items-center gap-8 pt-2">
            <label className="flex items-center gap-3 cursor-pointer text-xs uppercase font-bold tracking-wider text-neutral-600">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="h-4.5 w-4.5 text-brand-sage border-brand-black/10 focus:ring-brand-sage"
              />
              <span>Mark as Featured Product</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer text-xs uppercase font-bold tracking-wider text-neutral-600">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4.5 w-4.5 text-brand-sage border-brand-black/10 focus:ring-brand-sage"
              />
              <span>Publish Immediately (Active)</span>
            </label>
          </div>
        </div>
      )}

      {/* TAB 2: Fabric & Editorial Details */}
      {activeTab === "details" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Fabric */}
            <div className="space-y-2">
              <label htmlFor="fabric" className="block text-xs uppercase tracking-wider text-neutral-600 font-bold">
                Fabric Material
              </label>
              <input
                id="fabric"
                type="text"
                value={fabric}
                onChange={(e) => setFabric(e.target.value)}
                placeholder="e.g. Chanderi Silk, Organic Cotton, Georgette"
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 focus:border-brand-black focus:outline-none text-sm font-sans"
              />
            </div>

            {/* Colorway */}
            <div className="space-y-2">
              <label htmlFor="color" className="block text-xs uppercase tracking-wider text-neutral-600 font-bold">
                Color Name / Colorway
              </label>
              <input
                id="color"
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="e.g. Mint Green, Ivory White, Pastel Peach"
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 focus:border-brand-black focus:outline-none text-sm font-sans"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Length */}
            <div className="space-y-2">
              <label htmlFor="length" className="block text-xs uppercase tracking-wider text-neutral-600 font-bold">
                Length
              </label>
              <input
                id="length"
                type="text"
                value={length}
                onChange={(e) => setLength(e.target.value)}
                placeholder="e.g. 44 inches / Below Knee"
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 focus:border-brand-black focus:outline-none text-sm font-sans"
              />
            </div>

            {/* Neckline */}
            <div className="space-y-2">
              <label htmlFor="neckline" className="block text-xs uppercase tracking-wider text-neutral-600 font-bold">
                Neckline
              </label>
              <input
                id="neckline"
                type="text"
                value={neckline}
                onChange={(e) => setNeckline(e.target.value)}
                placeholder="e.g. Round V-Neck, Mandarain Collar"
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 focus:border-brand-black focus:outline-none text-sm font-sans"
              />
            </div>

            {/* Sleeves */}
            <div className="space-y-2">
              <label htmlFor="sleeves" className="block text-xs uppercase tracking-wider text-neutral-600 font-bold">
                Sleeves
              </label>
              <input
                id="sleeves"
                type="text"
                value={sleeves}
                onChange={(e) => setSleeves(e.target.value)}
                placeholder="e.g. 3/4 Sleeves, Full Sleeves"
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 focus:border-brand-black focus:outline-none text-sm font-sans"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Occasion */}
            <div className="space-y-2">
              <label htmlFor="occasion" className="block text-xs uppercase tracking-wider text-neutral-600 font-bold">
                Occasion Type
              </label>
              <input
                id="occasion"
                type="text"
                value={occasion}
                onChange={(e) => setOccasion(e.target.value)}
                placeholder="e.g. Festive Wear, Wedding, Casual"
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 focus:border-brand-black focus:outline-none text-sm font-sans"
              />
            </div>

            {/* Wash Care */}
            <div className="space-y-2">
              <label htmlFor="washCare" className="block text-xs uppercase tracking-wider text-neutral-600 font-bold">
                Wash & Care Instructions
              </label>
              <input
                id="washCare"
                type="text"
                value={washCare}
                onChange={(e) => setWashCare(e.target.value)}
                placeholder="e.g. Dry Clean Only, Gentle Hand Wash"
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 focus:border-brand-black focus:outline-none text-sm font-sans"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Size Variants & Stock Matrix */}
      {activeTab === "variants" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xs uppercase font-bold tracking-widest text-neutral-500">
              Product Size Variants ({variants.length})
            </h3>
            <button
              type="button"
              onClick={handleQuickAddStandardSizes}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-sage/10 hover:bg-brand-sage/20 text-brand-sage text-[10px] font-bold uppercase tracking-widest rounded-xs transition-colors cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Quick-Add Standard Sizes (S, M, L, XL, XXL)</span>
            </button>
          </div>

          {/* Current Variants List */}
          {variants.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-neutral-200 text-neutral-400 text-xs rounded-xs">
              No size variants configured. Add custom sizes below or click Quick-Add.
            </div>
          ) : (
            <div className="border border-neutral-200 divide-y divide-neutral-100 rounded-xs bg-white">
              {variants.map((v, idx) => (
                <div key={idx} className="p-4 flex items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-4">
                    <span className="h-8 w-8 bg-neutral-100 flex items-center justify-center font-bold text-brand-black rounded-xs">
                      {v.name}
                    </span>
                    <div>
                      <div className="font-semibold text-brand-black">{v.sku || `${sku || 'SKU'}-${v.name}`}</div>
                      <div className="text-[10px] text-neutral-400">Size Variant SKU</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-neutral-500 uppercase font-bold tracking-widest">
                        Stock
                      </span>
                      <input
                        type="number"
                        min="0"
                        value={v.stock}
                        onChange={(e) => handleUpdateVariantStock(idx, e.target.value)}
                        className="w-20 px-2.5 py-1.5 bg-neutral-50 border border-neutral-200 text-center font-bold rounded-xs focus:outline-none focus:border-brand-black text-xs"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveVariant(idx)}
                      className="p-1.5 text-neutral-400 hover:text-red-600 transition-colors cursor-pointer"
                      title="Remove variant"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Custom Size Variant Adder */}
          <div className="bg-neutral-50 p-5 border border-neutral-200 rounded-xs">
            <h4 className="text-[10px] uppercase font-bold tracking-widest text-neutral-500 mb-3 flex items-center gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              <span>Add Custom Size Variant</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-500">Size Name</span>
                <input
                  type="text"
                  placeholder="e.g. 3XL, Free Size"
                  value={newSizeName}
                  onChange={(e) => setNewSizeName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-neutral-200 text-xs rounded-xs font-semibold uppercase"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-500">Custom SKU (Optional)</span>
                <input
                  type="text"
                  placeholder={`${sku || 'SKU'}-3XL`}
                  value={newSizeSku}
                  onChange={(e) => setNewSizeSku(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-neutral-200 text-xs rounded-xs font-semibold uppercase"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-500">Initial Stock</span>
                <input
                  type="number"
                  value={newSizeStock}
                  onChange={(e) => setNewSizeStock(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-neutral-200 text-xs rounded-xs text-center font-semibold"
                />
              </div>
              <button
                type="button"
                onClick={handleAddCustomVariant}
                className="py-2 px-4 bg-brand-black text-white text-[10px] uppercase font-bold tracking-widest rounded-xs hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                Add Variant
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Images & Media */}
      {activeTab === "media" && (
        <div className="space-y-6">
          <div className="bg-neutral-50/50 p-6 border border-neutral-200 rounded-xs">
            <ImageManager images={images} onChange={setImages} />
          </div>
        </div>
      )}

      {/* Action Footer Controls */}
      <div className="flex items-center justify-between border-t border-neutral-200 pt-6">
        <div className="flex items-center gap-2">
          {activeTab !== "general" && (
            <button
              type="button"
              onClick={() => {
                const idx = tabs.findIndex((t) => t.id === activeTab);
                if (idx > 0) setActiveTab(tabs[idx - 1].id as TabType);
              }}
              className="px-4 py-2 border border-neutral-200 text-xs uppercase font-bold tracking-wider text-neutral-600 hover:bg-neutral-50 transition-colors rounded-xs cursor-pointer"
            >
              Previous Tab
            </button>
          )}
          {activeTab !== "media" && (
            <button
              type="button"
              onClick={() => {
                const idx = tabs.findIndex((t) => t.id === activeTab);
                if (idx < tabs.length - 1) setActiveTab(tabs[idx + 1].id as TabType);
              }}
              className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-xs uppercase font-bold tracking-wider text-brand-black transition-colors rounded-xs cursor-pointer"
            >
              Next Tab
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Link href="/admin/products">
            <Button variant="outline" type="button" className="py-2.5">
              Cancel
            </Button>
          </Link>
          <Button variant="primary" type="submit" className="py-2.5 px-8" isLoading={isLoading}>
            Create Product
          </Button>
        </div>
      </div>
    </form>
  );
}
