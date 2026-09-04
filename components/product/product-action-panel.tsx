'use client';

import React, { useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/cart-context";
import Button from "@/components/ui/button";
import WishlistButton from "@/components/product/wishlist-button";
import SizeGuideModal from "@/components/product/size-guide-modal";

export interface Variant {
  id: string;
  name: string;
  sku: string;
  stock: number;
  pricePaise?: number | null;
  colorName?: string | null;
  colorCode?: string | null;
  size?: string | null;
  imageId?: string | null;
}

interface ProductActionPanelProps {
  product: {
    id: string;
    name: string;
    pricePaise: number;
    images?: { url: string; colorName?: string | null }[];
  };
  variants: Variant[];
  initialWishlisted?: boolean;
  selectedColor?: string | null;
  onColorChange?: (color: string) => void;
}

export default function ProductActionPanel({
  product,
  variants,
  initialWishlisted = false,
  selectedColor: propSelectedColor,
  onColorChange,
}: ProductActionPanelProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const { addItemOptimistic } = useCart();

  // Extract unique available colors & sizes
  const uniqueColorsMap = useMemo(() => {
    const map = new Map<string, { colorName: string; colorCode: string }>();
    variants.forEach((v) => {
      if (v.colorName) {
        if (!map.has(v.colorName)) {
          map.set(v.colorName, {
            colorName: v.colorName,
            colorCode: v.colorCode || "#E98FA8", // default blush accent
          });
        }
      }
    });
    return map;
  }, [variants]);

  const availableColors = useMemo(() => Array.from(uniqueColorsMap.values()), [uniqueColorsMap]);
  // Only display color selector if product has 2 or more distinct colors
  const hasColors = availableColors.length > 1;

  // Extract all unique sizes across product
  const availableSizes = useMemo(() => {
    const set = new Set<string>();
    variants.forEach((v) => {
      const s = v.size || (v.name && !v.name.includes("/") ? v.name : v.name?.split("/")[1]?.trim());
      if (s) set.add(s);
    });
    return Array.from(set);
  }, [variants]);

  const hasSizes = availableSizes.length > 0;

  // Selection states
  const [internalSelectedColor, setInternalSelectedColor] = useState<string | null>(() => {
    if (!hasColors) return null;
    return availableColors[0]?.colorName || null;
  });

  const activeColor = propSelectedColor !== undefined ? propSelectedColor : internalSelectedColor;

  const [selectedSize, setSelectedSize] = useState<string | null>(() => {
    if (!hasSizes) return null;
    return availableSizes.length === 1 ? availableSizes[0] : null;
  });

  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  // Derive active variant matching activeColor + selectedSize
  const activeVariant = useMemo(() => {
    if (!hasColors && !hasSizes) {
      return variants[0] || null;
    }

    return (
      variants.find((v) => {
        const matchesColor = !hasColors || v.colorName === activeColor;
        const vSize = v.size || (v.name && !v.name.includes("/") ? v.name : v.name?.split("/")[1]?.trim());
        const matchesSize = !hasSizes || vSize === selectedSize;
        return matchesColor && matchesSize;
      }) || null
    );
  }, [variants, hasColors, hasSizes, activeColor, selectedSize]);

  // Derived stock & price
  const stock = activeVariant ? activeVariant.stock : 0;
  const currentPrice = ((activeVariant?.pricePaise ?? product.pricePaise) || product.pricePaise) / 100;

  // Handle color change
  const handleColorSelect = (colorName: string) => {
    if (onColorChange) {
      onColorChange(colorName);
    }
    setInternalSelectedColor(colorName);
    setValidationError(null);

    // Filter variants for new color
    const colorVariants = variants.filter((v) => v.colorName === colorName);
    const availableSizesForColor = colorVariants
      .filter((v) => v.stock > 0)
      .map((v) => v.size || (v.name.includes("/") ? v.name.split("/")[1].trim() : v.name));

    // If current selectedSize is available in stock for new color, keep it
    if (selectedSize && availableSizesForColor.includes(selectedSize)) {
      return;
    }

    // Auto-select first in-stock size for new color if available
    if (availableSizesForColor.length > 0) {
      setSelectedSize(availableSizesForColor[0]);
    } else if (colorVariants.length > 0) {
      setSelectedSize(colorVariants[0].size || (colorVariants[0].name.includes("/") ? colorVariants[0].name.split("/")[1].trim() : colorVariants[0].name) || null);
    }
  };

  // Handle size change
  const handleSizeSelect = (size: string) => {
    setSelectedSize(size);
    setValidationError(null);
  };

  const handleQuantityChange = (delta: number) => {
    const next = quantity + delta;
    if (next >= 1 && next <= Math.min(stock || 10, 10)) {
      setQuantity(next);
    }
  };

  const handleAddToBag = () => {
    if (hasColors && !activeColor) {
      setValidationError("Please select a colour");
      return;
    }
    if (hasSizes && !selectedSize) {
      setValidationError("Please select a size");
      return;
    }
    if (!activeVariant) {
      setValidationError("Selected combination is unavailable");
      return;
    }
    if (activeVariant.stock === 0) {
      setValidationError("Selected item is out of stock");
      return;
    }

    setValidationError(null);
    setIsAdding(true);

    startTransition(async () => {
      const mappedProduct = {
        ...product,
        variants: variants.map((v) => ({
          id: v.id,
          name: v.name,
          stock: v.stock,
          colorName: v.colorName,
          colorCode: v.colorCode,
          size: v.size,
        })),
      };

      const res = await addItemOptimistic(mappedProduct, activeVariant.id, quantity);
      setIsAdding(false);
      if (res.success) {
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2500);
      } else {
        setValidationError(res.error || "Failed to add item to bag");
      }
    });
  };

  return (
    <div className="space-y-7 font-sans">
      {/* Price Details */}
      <div className="flex items-baseline gap-3 border-b border-brand-black/5 pb-5">
        <span className="font-sans text-2xl font-semibold text-brand-black">
          ₹{currentPrice.toLocaleString("en-IN")}
        </span>
        <span className="text-xs text-neutral-400 font-sans tracking-wide">
          Inclusive of all taxes
        </span>
        {activeVariant?.sku && (
          <span className="ml-auto text-[10px] uppercase font-mono tracking-wider text-neutral-400">
            SKU: {activeVariant.sku}
          </span>
        )}
      </div>

      {/* Validation Error Banner */}
      {validationError && (
        <div className="p-3 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-lg animate-fadeIn">
          ✦ {validationError}
        </div>
      )}

      {/* COLOUR SWATCH SELECTOR */}
      {hasColors && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="block text-xs uppercase tracking-widest text-neutral-600 font-bold">
              Colour:{" "}
              <span className="text-brand-black font-semibold uppercase tracking-wider">
                {activeColor || "Select Colour"}
              </span>
            </label>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {availableColors.map((c) => {
              const isSelected = activeColor === c.colorName;
              const isColorOutOfStock = variants
                .filter((v) => v.colorName === c.colorName)
                .every((v) => v.stock === 0);

              return (
                <button
                  key={c.colorName}
                  type="button"
                  aria-label={`Select colour ${c.colorName}`}
                  aria-pressed={isSelected}
                  onClick={() => handleColorSelect(c.colorName)}
                  className={`group relative flex items-center gap-2.5 px-3.5 py-2 rounded-full border text-xs tracking-wider transition-all cursor-pointer select-none ${
                    isSelected
                      ? "border-brand-black bg-brand-black/5 text-brand-black font-bold shadow-xs"
                      : isColorOutOfStock
                      ? "border-neutral-200 opacity-40 cursor-not-allowed"
                      : "border-brand-black/15 hover:border-brand-black text-neutral-700"
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full border border-black/15 shadow-inner shrink-0 ${
                      isSelected ? "ring-2 ring-brand-black ring-offset-1" : ""
                    }`}
                    style={{ backgroundColor: c.colorCode }}
                  />
                  <span className="uppercase font-medium text-[11px]">{c.colorName}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* SIZE SELECTOR DEPENDENT ON SELECTED COLOUR */}
      {hasSizes && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="block text-xs uppercase tracking-widest text-neutral-600 font-bold">
              Size:{" "}
              <span className="text-brand-black font-semibold uppercase tracking-wider">
                {selectedSize || "Select Size"}
              </span>
            </label>
            <button
              type="button"
              onClick={() => setIsSizeGuideOpen(true)}
              className="text-[10px] uppercase font-bold tracking-widest text-brand-pink hover:text-neutral-800 transition-colors cursor-pointer flex items-center gap-1 select-none"
            >
              Size Chart 📐
            </button>
          </div>
          <div className="flex items-center gap-2.5 flex-wrap">
            {availableSizes.map((size) => {
              // Find variant matching activeColor + size
              const matchingVar = variants.find((v) => {
                const matchesColor = !hasColors || v.colorName === activeColor;
                const vSize = v.size || (v.name && !v.name.includes("/") ? v.name : v.name?.split("/")[1]?.trim());
                return matchesColor && vSize === size;
              });

              const isOutOfStock = !matchingVar || matchingVar.stock === 0;
              const isSelected = selectedSize === size;

              return (
                <button
                  key={size}
                  type="button"
                  disabled={isOutOfStock}
                  aria-label={`Select size ${size}${isOutOfStock ? ", out of stock" : ""}`}
                  aria-pressed={isSelected}
                  onClick={() => handleSizeSelect(size)}
                  className={`w-12 h-12 flex items-center justify-center border text-xs tracking-wider transition-all rounded-lg select-none cursor-pointer ${
                    isSelected
                      ? "border-brand-black bg-brand-black text-brand-offwhite font-bold shadow-xs"
                      : isOutOfStock
                      ? "border-neutral-100 text-neutral-300 line-through cursor-not-allowed opacity-50"
                      : "border-brand-black/15 hover:border-brand-black text-neutral-700 font-medium"
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Stock Information */}
      <div className="text-xs font-medium pt-1">
        {activeVariant && stock === 0 ? (
          <span className="text-red-500 uppercase tracking-widest font-bold">Sold Out</span>
        ) : activeVariant && stock <= 3 ? (
          <span className="text-brand-pink uppercase tracking-widest font-bold">
            Only {stock} item{stock > 1 ? "s" : ""} left in stock!
          </span>
        ) : activeVariant ? (
          <span className="text-brand-sage uppercase tracking-widest font-bold">In Stock</span>
        ) : (
          <span className="text-neutral-400 uppercase tracking-widest">Select options to check stock</span>
        )}
      </div>

      {/* Quantity Selector & Add Button */}
      <div className="space-y-4 pt-1">
        {stock > 0 && (
          <div className="flex items-center gap-6">
            <span className="text-xs uppercase tracking-widest text-neutral-600 font-bold">
              Quantity
            </span>
            <div className="flex items-center border border-brand-black/10 rounded-lg">
              <button
                type="button"
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
                className="w-10 h-10 flex items-center justify-center text-neutral-500 hover:text-brand-black disabled:opacity-30 text-sm cursor-pointer"
              >
                &minus;
              </button>
              <span className="w-10 text-center text-xs font-semibold select-none">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => handleQuantityChange(1)}
                disabled={quantity >= Math.min(stock, 10)}
                className="w-10 h-10 flex items-center justify-center text-neutral-500 hover:text-brand-black disabled:opacity-30 text-sm cursor-pointer"
              >
                &#43;
              </button>
            </div>
          </div>
        )}

        <div className="flex gap-4 pt-2">
          <Button
            variant="primary"
            size="lg"
            className="flex-1 py-4"
            onClick={handleAddToBag}
            isLoading={isAdding}
            disabled={activeVariant ? stock === 0 : false}
          >
            {isAdded ? "Added to Bag ✓" : stock === 0 && activeVariant ? "Sold Out" : "Add to Bag"}
          </Button>
          <WishlistButton
            productId={product.id}
            initialWishlisted={initialWishlisted}
            className="!h-14 !w-14 !rounded-lg !border-brand-black/10 hover:!border-brand-black !bg-white hover:!bg-neutral-50 !shadow-none hover:scale-100 active:scale-100 flex items-center justify-center"
          />
        </div>
      </div>

      <SizeGuideModal
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
        product={{
          name: product.name,
          pricePaise: product.pricePaise,
          image: product.images?.[0]?.url || "/images/chikankari_hero.png",
        }}
      />
    </div>
  );
}
