/* eslint-disable @typescript-eslint/no-explicit-any, @next/next/no-img-element */
'use client';

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  updateProductAction,
  updateProductVariantAction,
  createProductVariantAction,
  deleteProductVariantAction,
  createProductImageAction,
  deleteProductImageAction,
  reorderProductImagesAction
} from "@/actions/catalog";
import { Save, Plus, Trash2, Check, ShieldAlert, Sparkles, Image as ImageIcon } from "lucide-react";

interface CategoryOption {
  id: string;
  name: string;
}

interface ImageDetail {
  id: string;
  url: string;
  isPrimary: boolean;
  sortOrder: number;
  altText?: string | null;
}

interface VariantDetail {
  id: string;
  name: string;
  sku: string;
  stock: number;
  inventoryQuantity: number;
  isAvailable: boolean;
}

interface ProductDetail {
  id: string;
  name: string;
  slug: string;
  sku: string;
  categoryId: string;
  pricePaise: number;
  compareAtPricePaise?: number | null;
  description?: string | null;
  productNumber?: number | null;
  fabric?: string | null;
  color?: string | null;
  length?: string | null;
  neckline?: string | null;
  sleeves?: string | null;
  occasion?: string | null;
  washCare?: string | null;
  featured?: boolean;
  isActive?: boolean;
  images: ImageDetail[];
  variants: VariantDetail[];
}

interface ProductEditFormProps {
  product: ProductDetail;
  categories: CategoryOption[];
}

type TabType = "general" | "details" | "variants" | "media" | "seo";

export default function ProductEditForm({ product, categories }: ProductEditFormProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("general");
  const [isPending, startTransition] = useTransition();

  // 1. General Fields
  const [name, setName] = useState(product.name);
  const [slug, setSlug] = useState(product.slug);
  const [sku, setSku] = useState(product.sku);
  const [categoryId, setCategoryId] = useState(product.categoryId);
  const [price, setPrice] = useState((product.pricePaise / 100).toString());
  const [comparePrice, setComparePrice] = useState(
    product.compareAtPricePaise ? (product.compareAtPricePaise / 100).toString() : ""
  );
  const [description, setDescription] = useState(product.description || "");
  const [productNumber, setProductNumber] = useState(product.productNumber?.toString() || "");
  const [featured, setFeatured] = useState(product.featured || false);
  const [isActive, setIsActive] = useState(product.isActive || false);

  // 2. Editorial Details
  const [fabric, setFabric] = useState(product.fabric || "");
  const [color, setColor] = useState(product.color || "");
  const [length, setLength] = useState(product.length || "");
  const [neckline, setNeckline] = useState(product.neckline || "");
  const [sleeves, setSleeves] = useState(product.sleeves || "");
  const [occasion, setOccasion] = useState(product.occasion || "");
  const [washCare, setWashCare] = useState(product.washCare || "");

  // 3. Variant Lists
  const [variantsList, setVariantsList] = useState<VariantDetail[]>(product.variants);
  const [newVarName, setNewVarName] = useState("");
  const [newVarSku, setNewVarSku] = useState("");
  const [newVarStock, setNewVarStock] = useState("10");

  // 4. Media Lists
  const [imagesList, setImagesList] = useState<ImageDetail[]>(product.images);
  const [newImgUrl, setNewImgUrl] = useState("");
  const [newImgAlt, setNewImgAlt] = useState("");

  // Feedback status
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Tabs navigation list
  const tabs = [
    { id: "general", label: "General & Pricing" },
    { id: "details", label: "Fabric & Details" },
    { id: "variants", label: "Variants & Stock" },
    { id: "media", label: "Images & Media" },
    { id: "seo", label: "SEO Config" },
  ];

  const triggerToast = (msg: string, isError = false) => {
    if (isError) {
      setError(msg);
      setSuccess("");
    } else {
      setSuccess(msg);
      setError("");
    }
    setTimeout(() => {
      setError("");
      setSuccess("");
    }, 4000);
  };

  // Main Submit handler (saves General + Details + SEO)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      triggerToast("Please enter a valid base price.", true);
      return;
    }

    const pricePaise = Math.round(priceNum * 100);
    const compareAtPricePaise = comparePrice ? Math.round(parseFloat(comparePrice) * 100) : null;

    startTransition(async () => {
      try {
        const res = await updateProductAction(product.id, {
          name,
          slug,
          sku,
          categoryId,
          pricePaise,
          compareAtPricePaise,
          description,
          productNumber: productNumber ? parseInt(productNumber, 10) : null,
          fabric: fabric || null,
          color: color || null,
          length: length || null,
          neckline: neckline || null,
          sleeves: sleeves || null,
          occasion: occasion || null,
          washCare: washCare || null,
          featured,
          isActive,
        });

        if (!res.success) {
          triggerToast(res.error || "Failed to update product details.", true);
        } else {
          triggerToast("Product details updated successfully.");
          router.refresh();
        }
      } catch (err: any) {
        triggerToast(err.message || "An unexpected error occurred.", true);
      }
    });
  };

  // Variant operations
  const handleToggleVariantAvailability = (varId: string, currentAvailable: boolean) => {
    const nextAvailable = !currentAvailable;
    // Optimistic update
    setVariantsList(
      variantsList.map((v) => (v.id === varId ? { ...v, isAvailable: nextAvailable } : v))
    );

    startTransition(async () => {
      const v = variantsList.find((v) => v.id === varId);
      if (!v) return;

      const res = await updateProductVariantAction(varId, {
        stock: v.stock,
        inventoryQuantity: v.stock,
        isAvailable: nextAvailable,
        sku: v.sku,
      });

      if (!res.success) {
        triggerToast("Failed to toggle variant availability.", true);
        // Rollback
        setVariantsList(
          variantsList.map((v) => (v.id === varId ? { ...v, isAvailable: currentAvailable } : v))
        );
      } else {
        router.refresh();
      }
    });
  };

  const handleUpdateVariantStock = (varId: string, nextStockStr: string) => {
    const nextStock = parseInt(nextStockStr, 10);
    if (isNaN(nextStock) || nextStock < 0) return;

    // Optimistic update
    setVariantsList(
      variantsList.map((v) => (v.id === varId ? { ...v, stock: nextStock, inventoryQuantity: nextStock } : v))
    );

    startTransition(async () => {
      const v = variantsList.find((v) => v.id === varId);
      if (!v) return;

      const res = await updateProductVariantAction(varId, {
        stock: nextStock,
        inventoryQuantity: nextStock,
        isAvailable: v.isAvailable,
        sku: v.sku,
      });

      if (!res.success) {
        triggerToast("Failed to update variant stock.", true);
        router.refresh();
      }
    });
  };

  const handleAddVariant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVarName || !newVarSku) {
      triggerToast("Variant size and SKU code are required.", true);
      return;
    }

    const stockVal = parseInt(newVarStock, 10) || 0;

    startTransition(async () => {
      const res = await createProductVariantAction(product.id, {
        name: newVarName.toUpperCase(),
        sku: newVarSku.toUpperCase(),
        stock: stockVal,
        inventoryQuantity: stockVal,
        isAvailable: true,
      });

      if (res.success) {
        triggerToast("Product variant added.");
        setVariantsList([
          ...variantsList,
          {
            id: res.id || `var_${Date.now()}`,
            name: newVarName.toUpperCase(),
            sku: newVarSku.toUpperCase(),
            stock: stockVal,
            inventoryQuantity: stockVal,
            isAvailable: true,
          },
        ]);
        setNewVarName("");
        setNewVarSku("");
        setNewVarStock("10");
        router.refresh();
      } else {
        triggerToast(res.error || "Failed to add variant.", true);
      }
    });
  };

  const handleDeleteVariant = (varId: string) => {
    startTransition(async () => {
      const res = await deleteProductVariantAction(varId);
      if (res.success) {
        triggerToast("Variant deleted.");
        setVariantsList(variantsList.filter((v) => v.id !== varId));
        router.refresh();
      } else {
        triggerToast(res.error || "Failed to delete variant.", true);
      }
    });
  };

  // Media operations
  const handleAddImage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newImgUrl) return;

    startTransition(async () => {
      const sortVal = imagesList.length;
      const primaryFlag = imagesList.length === 0;

      const res = await createProductImageAction(product.id, {
        url: newImgUrl,
        altText: newImgAlt || name,
        isPrimary: primaryFlag,
        sortOrder: sortVal,
      });

      if (res.success) {
        triggerToast("Product image added.");
        setImagesList([
          ...imagesList,
          {
            id: res.id || `img_${Date.now()}`,
            url: newImgUrl,
            isPrimary: primaryFlag,
            sortOrder: sortVal,
            altText: newImgAlt || name,
          },
        ]);
        setNewImgUrl("");
        setNewImgAlt("");
        router.refresh();
      } else {
        triggerToast(res.error || "Failed to add product image.", true);
      }
    });
  };

  const handleDeleteImage = (imgId: string) => {
    startTransition(async () => {
      const res = await deleteProductImageAction(imgId);
      if (res.success) {
        triggerToast("Image deleted.");
        setImagesList(imagesList.filter((img) => img.id !== imgId));
        router.refresh();
      } else {
        triggerToast(res.error || "Failed to delete image.", true);
      }
    });
  };

  const handleSetPrimaryImage = (imgId: string) => {
    const updatedImages = imagesList.map((img) => ({
      ...img,
      isPrimary: img.id === imgId,
    }));
    setImagesList(updatedImages);

    startTransition(async () => {
      const res = await reorderProductImagesAction(
        updatedImages.map((img) => ({
          id: img.id,
          sortOrder: img.sortOrder,
          isPrimary: img.isPrimary,
        }))
      );
      if (res.success) {
        triggerToast("Primary image updated.");
        router.refresh();
      } else {
        triggerToast("Failed to update primary image status.", true);
      }
    });
  };

  return (
    <div className="font-sans relative">
      {/* Toast Alert */}
      {error && (
        <div className="fixed bottom-6 right-6 z-50 p-4 bg-red-50 border border-red-200 text-red-700 text-xs font-bold uppercase tracking-widest rounded-xs shadow-md">
          {error}
        </div>
      )}
      {success && (
        <div className="fixed bottom-6 right-6 z-50 p-4 bg-brand-black border border-white/10 text-brand-offwhite text-xs font-bold uppercase tracking-widest rounded-xs shadow-md">
          {success}
        </div>
      )}

      {/* Tabs navigation */}
      <div className="flex border-b border-neutral-200 overflow-x-auto mb-8 scrollbar-custom">
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

      {/* FORM CORE */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Tab 1: General & Pricing */}
        {activeTab === "general" && (
          <div className="space-y-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-500 pb-2 border-b border-neutral-100">
              General Catalog Fields
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Name */}
              <div className="space-y-2">
                <label className="block text-xs uppercase tracking-wider text-neutral-500 font-bold">
                  Product Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-brand-black/10 focus:border-brand-sage focus:outline-none text-sm font-sans"
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label className="block text-xs uppercase tracking-wider text-neutral-500 font-bold">
                  Category
                </label>
                <select
                  required
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-brand-black/10 focus:border-brand-sage focus:outline-none text-sm font-sans font-semibold uppercase tracking-wider text-neutral-700"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Product Number */}
              <div className="space-y-2">
                <label className="block text-xs uppercase tracking-wider text-neutral-500 font-bold">
                  Product Number (Numeric ID)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 10024"
                  value={productNumber}
                  onChange={(e) => setProductNumber(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-brand-black/10 focus:border-brand-sage focus:outline-none text-sm font-sans"
                />
              </div>

              {/* SKU */}
              <div className="space-y-2">
                <label className="block text-xs uppercase tracking-wider text-neutral-500 font-bold">
                  SKU Code
                </label>
                <input
                  type="text"
                  required
                  value={sku}
                  onChange={(e) => setSku(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 bg-white border border-brand-black/10 focus:border-brand-sage focus:outline-none text-sm font-sans font-semibold uppercase tracking-widest"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="block text-xs uppercase tracking-wider text-neutral-500 font-bold">
                Product Description
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-brand-black/10 focus:border-brand-sage focus:outline-none text-sm font-sans leading-relaxed"
              />
            </div>

            <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-500 pb-2 border-b border-neutral-100 pt-6">
              Pricing details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Price */}
              <div className="space-y-2">
                <label className="block text-xs uppercase tracking-wider text-neutral-500 font-bold">
                  Base Price (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-brand-black/10 focus:border-brand-sage focus:outline-none text-sm font-sans font-semibold text-brand-black"
                />
              </div>

              {/* Compare-at Price */}
              <div className="space-y-2">
                <label className="block text-xs uppercase tracking-wider text-neutral-500 font-bold">
                  Compare At Price (₹ - Optional)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={comparePrice}
                  onChange={(e) => setComparePrice(e.target.value)}
                  placeholder="e.g. 2499.00"
                  className="w-full px-4 py-3 bg-white border border-brand-black/10 focus:border-brand-sage focus:outline-none text-sm font-sans"
                />
              </div>
            </div>

            <div className="flex items-center gap-8 pt-4">
              <label className="flex items-center gap-3 cursor-pointer text-xs uppercase font-bold tracking-wider text-neutral-600">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="h-4.5 w-4.5 text-brand-sage border-brand-black/10 focus:ring-brand-sage"
                />
                <span>Featured product</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer text-xs uppercase font-bold tracking-wider text-neutral-600">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-4.5 w-4.5 text-brand-sage border-brand-black/10 focus:ring-brand-sage"
                />
                <span>Publish to storefront (Active)</span>
              </label>
            </div>
          </div>
        )}

        {/* Tab 2: Fabric & Editorial Details */}
        {activeTab === "details" && (
          <div className="space-y-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-500 pb-2 border-b border-neutral-100">
              Luxury Fabric & Style Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Fabric */}
              <div className="space-y-2">
                <label className="block text-xs uppercase tracking-wider text-neutral-500 font-bold">
                  Fabric Type
                </label>
                <input
                  type="text"
                  placeholder="e.g. Georgette, Chanderi Silk"
                  value={fabric}
                  onChange={(e) => setFabric(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-brand-black/10 focus:border-brand-sage focus:outline-none text-sm font-sans"
                />
              </div>

              {/* Color */}
              <div className="space-y-2">
                <label className="block text-xs uppercase tracking-wider text-neutral-500 font-bold">
                  Colorway
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mint Green, Ivory"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-brand-black/10 focus:border-brand-sage focus:outline-none text-sm font-sans"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Length */}
              <div className="space-y-2">
                <label className="block text-xs uppercase tracking-wider text-neutral-500 font-bold">
                  Length
                </label>
                <input
                  type="text"
                  placeholder="e.g. 44 inches"
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-brand-black/10 focus:border-brand-sage focus:outline-none text-sm font-sans"
                />
              </div>

              {/* Neckline */}
              <div className="space-y-2">
                <label className="block text-xs uppercase tracking-wider text-neutral-500 font-bold">
                  Neckline
                </label>
                <input
                  type="text"
                  placeholder="e.g. Round Neck"
                  value={neckline}
                  onChange={(e) => setNeckline(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-brand-black/10 focus:border-brand-sage focus:outline-none text-sm font-sans"
                />
              </div>

              {/* Sleeves */}
              <div className="space-y-2">
                <label className="block text-xs uppercase tracking-wider text-neutral-500 font-bold">
                  Sleeves
                </label>
                <input
                  type="text"
                  placeholder="e.g. 3/4 Sleeves"
                  value={sleeves}
                  onChange={(e) => setSleeves(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-brand-black/10 focus:border-brand-sage focus:outline-none text-sm font-sans"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Occasion */}
              <div className="space-y-2">
                <label className="block text-xs uppercase tracking-wider text-neutral-500 font-bold">
                  Occasion Type
                </label>
                <input
                  type="text"
                  placeholder="e.g. Festive, Wedding Wear"
                  value={occasion}
                  onChange={(e) => setOccasion(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-brand-black/10 focus:border-brand-sage focus:outline-none text-sm font-sans"
                />
              </div>

              {/* Wash Care */}
              <div className="space-y-2">
                <label className="block text-xs uppercase tracking-wider text-neutral-500 font-bold">
                  Wash & Care instructions
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dry Clean Only"
                  value={washCare}
                  onChange={(e) => setWashCare(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-brand-black/10 focus:border-brand-sage focus:outline-none text-sm font-sans"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Variants & Stock Toggling */}
        {activeTab === "variants" && (
          <div className="space-y-8">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-500 pb-2 border-b border-neutral-100 mb-6">
                Active Product Variants
              </h3>

              {variantsList.length === 0 ? (
                <div className="text-center py-10 text-neutral-500 text-xs">
                  No size variants added. Set one below.
                </div>
              ) : (
                <div className="border border-neutral-100 rounded-xs divide-y divide-neutral-100 overflow-hidden bg-white">
                  {variantsList.map((v) => (
                    <div
                      key={v.id}
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                    >
                      <div className="flex items-center gap-4">
                        <span className="h-8 w-8 bg-neutral-100 flex items-center justify-center font-bold text-brand-black rounded-xs">
                          {v.name}
                        </span>
                        <div>
                          <div className="font-semibold text-brand-black">{v.sku}</div>
                          <div className="text-[10px] text-neutral-400">Variant SKU</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        {/* Stock Input */}
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-widest">
                            Stock
                          </span>
                          <input
                            type="number"
                            value={v.stock}
                            onChange={(e) => handleUpdateVariantStock(v.id, e.target.value)}
                            className="w-16 px-2 py-1.5 bg-neutral-50 border border-neutral-200 focus:outline-none text-center font-semibold rounded-xs"
                          />
                        </div>

                        {/* Availability Toggle */}
                        <button
                          type="button"
                          onClick={() => handleToggleVariantAvailability(v.id, v.isAvailable)}
                          className={`px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest rounded-xs border cursor-pointer transition-colors ${
                            v.isAvailable
                              ? "bg-brand-sage/10 border-brand-sage/20 text-brand-sage"
                              : "bg-red-50 border-red-200/50 text-red-600"
                          }`}
                        >
                          {v.isAvailable ? "Available" : "Unavailable"}
                        </button>

                        {/* Delete Variant */}
                        <button
                          type="button"
                          onClick={() => handleDeleteVariant(v.id)}
                          className="p-2 text-neutral-400 hover:text-red-600 transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add Variant Form */}
            <div className="bg-[#FFFDF9] border border-brand-black/5 p-6 rounded-xs">
              <h4 className="text-xs uppercase font-bold tracking-widest text-brand-sage flex items-center gap-2 mb-4">
                <Sparkles className="h-4 w-4 text-brand-pink" />
                <span>Create Size Variant</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-500">
                    Size Name (e.g. M, XL)
                  </span>
                  <input
                    type="text"
                    placeholder="XXL"
                    value={newVarName}
                    onChange={(e) => setNewVarName(e.target.value)}
                    className="w-full px-3 py-2 border border-brand-black/10 focus:outline-none text-xs rounded-xs font-semibold uppercase"
                  />
                </div>
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-500">
                    Variant SKU Code
                  </span>
                  <input
                    type="text"
                    placeholder={`${sku}-XXL`}
                    value={newVarSku}
                    onChange={(e) => setNewVarSku(e.target.value)}
                    className="w-full px-3 py-2 border border-brand-black/10 focus:outline-none text-xs rounded-xs font-semibold uppercase"
                  />
                </div>
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-500">
                    Initial stock
                  </span>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={newVarStock}
                      onChange={(e) => setNewVarStock(e.target.value)}
                      className="w-20 px-3 py-2 border border-brand-black/10 focus:outline-none text-xs rounded-xs text-center"
                    />
                    <button
                      type="button"
                      onClick={handleAddVariant}
                      className="flex-1 py-2 px-4 bg-brand-sage hover:bg-[#324027] text-white text-[10px] uppercase tracking-widest font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer rounded-xs"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Images & Media */}
        {activeTab === "media" && (
          <div className="space-y-8">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-500 pb-2 border-b border-neutral-100 mb-6">
                Product Image assets
              </h3>

              {imagesList.length === 0 ? (
                <div className="text-center py-12 text-neutral-400 text-xs">
                  No images uploaded yet. Add one below.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                  {imagesList
                    .sort((a, b) => a.sortOrder - b.sortOrder)
                    .map((img) => (
                      <div
                        key={img.id}
                        className={`group relative border rounded-xs overflow-hidden flex flex-col justify-between bg-white ${
                          img.isPrimary ? "border-brand-sage ring-1 ring-brand-sage" : "border-neutral-100"
                        }`}
                      >
                        {/* Image Box */}
                        <div className="aspect-[3/4] w-full bg-neutral-50 relative overflow-hidden flex items-center justify-center">
                          <img
                            src={img.url}
                            alt={img.altText || name}
                            className="h-full w-full object-contain p-1"
                          />
                          {img.isPrimary && (
                            <span className="absolute top-2 left-2 px-2 py-0.5 bg-brand-sage text-white text-[8px] uppercase tracking-widest font-bold rounded-xs">
                              Primary
                            </span>
                          )}

                          {/* Delete Trigger Overlay */}
                          <button
                            type="button"
                            onClick={() => handleDeleteImage(img.id)}
                            className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-red-50 text-neutral-600 hover:text-red-700 rounded-xs shadow-xs opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        {/* Controls Panel */}
                        <div className="p-2 border-t border-neutral-50 flex items-center justify-between text-[9px] font-bold uppercase tracking-widest">
                          <button
                            type="button"
                            onClick={() => handleSetPrimaryImage(img.id)}
                            disabled={img.isPrimary}
                            className={`flex items-center gap-1 px-1.5 py-1 rounded-xs transition-colors cursor-pointer ${
                              img.isPrimary
                                ? "text-brand-sage"
                                : "text-neutral-400 hover:text-brand-sage hover:bg-brand-sage/5"
                            }`}
                          >
                            <Check className="h-3 w-3" />
                            <span>Primary</span>
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Add Image Link Form */}
            <div className="bg-[#FFFDF9] border border-brand-black/5 p-6 rounded-xs">
              <h4 className="text-xs uppercase font-bold tracking-widest text-brand-sage flex items-center gap-2 mb-4">
                <ImageIcon className="h-4 w-4 text-brand-pink" />
                <span>Add Image URL</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
                <div className="sm:col-span-6 space-y-1.5">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-500">
                    Public Asset URL (Cloudinary / CDN Link)
                  </span>
                  <input
                    type="url"
                    placeholder="https://res.cloudinary.com/..."
                    value={newImgUrl}
                    onChange={(e) => setNewImgUrl(e.target.value)}
                    className="w-full px-3 py-2 border border-brand-black/10 focus:outline-none text-xs rounded-xs font-sans"
                  />
                </div>
                <div className="sm:col-span-4 space-y-1.5">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-500">
                    Image Alt Description
                  </span>
                  <input
                    type="text"
                    placeholder="Front details closeup"
                    value={newImgAlt}
                    onChange={(e) => setNewImgAlt(e.target.value)}
                    className="w-full px-3 py-2 border border-brand-black/10 focus:outline-none text-xs rounded-xs font-sans"
                  />
                </div>
                <div className="sm:col-span-2">
                  <button
                    type="button"
                    onClick={handleAddImage}
                    className="w-full py-2 bg-brand-sage hover:bg-[#324027] text-white text-[10px] uppercase tracking-widest font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer rounded-xs"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Upload</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: SEO Config */}
        {activeTab === "seo" && (
          <div className="space-y-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-500 pb-2 border-b border-neutral-100">
              SEO Parameters & URL Pathing
            </h3>

            {/* Slug modification warning */}
            {slug !== product.slug && (
              <div className="bg-amber-50 border border-amber-200/60 p-4 rounded-xs flex gap-3 text-xs text-amber-800 leading-relaxed font-sans">
                <ShieldAlert className="h-5 w-5 text-amber-600 flex-shrink-0" />
                <div>
                  <span className="font-bold block uppercase tracking-wide mb-0.5">Warning: Slug Modified</span>
                  Changing the slug will change the product page URL storefront-wide. Any old bookmarks or index references to `/product/{product.slug}` will return a 404 error page.
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Slug Path */}
              <div className="space-y-2">
                <label className="block text-xs uppercase tracking-wider text-neutral-500 font-bold">
                  Canonical URL Slug
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
                  className="w-full px-4 py-3 bg-white border border-brand-black/10 focus:border-brand-sage focus:outline-none text-sm font-sans"
                />
                <span className="text-[9px] text-neutral-400 block pt-0.5">
                  Storefront Link: /product/<span className="font-semibold">{slug || "slug-code"}</span>
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Save Bar Footer */}
        <div className="flex items-center justify-between border-t border-neutral-200 pt-8 mt-12">
          <Link href="/admin/products">
            <button
              type="button"
              className="px-5 py-3 border border-brand-black/10 hover:bg-neutral-50 text-[10px] uppercase tracking-widest font-bold text-neutral-500 hover:text-brand-black transition-colors cursor-pointer rounded-xs"
            >
              Back to Catalog
            </button>
          </Link>
          <button
            type="submit"
            disabled={isPending}
            className="px-8 py-3 bg-brand-sage hover:bg-[#324027] text-white text-[10px] uppercase tracking-widest font-bold transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer rounded-xs shadow-xs"
          >
            <Save className="h-4 w-4" />
            <span>{isPending ? "Saving..." : "Save Product Details"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
