"use client";

import React, { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Star, ShoppingCart, Loader2, Check } from "lucide-react";
import WishlistButton from "@/components/product/wishlist-button";
import { addToCartAction } from "@/actions/cart";
import { useCart } from "@/context/cart-context";
import { type CatalogProduct } from "@/lib/catalog";

interface ProductCardProps {
  product: CatalogProduct;
  initialWishlisted: boolean;
}

export default function ProductCard({ product, initialWishlisted }: ProductCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { addItemOptimistic } = useCart();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Extract unique colors if product has multi-color variants
  const uniqueColors = React.useMemo(() => {
    const map = new Map<string, { name: string; code: string }>();
    product.variants.forEach((v) => {
      if (v.colorName) {
        if (!map.has(v.colorName)) {
          map.set(v.colorName, {
            name: v.colorName,
            code: v.colorCode || "#E98FA8",
          });
        }
      }
    });
    return Array.from(map.values());
  }, [product.variants]);

  const hasMultipleColors = uniqueColors.length > 1;

  const [activeColor, setActiveColor] = useState<string | null>(() => {
    return hasMultipleColors ? uniqueColors[0].name : null;
  });

  // Filter variants and images for active color if multi-color
  const displayedVariants = React.useMemo(() => {
    if (!hasMultipleColors || !activeColor) return product.variants;
    return product.variants.filter((v) => v.colorName === activeColor);
  }, [product.variants, hasMultipleColors, activeColor]);

  const [selectedVarId, setSelectedVarId] = useState(() => {
    return displayedVariants[0]?.id || product.variants[0]?.id || "";
  });

  const handleColorClick = (colorName: string) => {
    setActiveColor(colorName);
    setCurrentImageIndex(0);
    const matching = product.variants.find((v) => v.colorName === colorName && v.stock > 0)
      || product.variants.find((v) => v.colorName === colorName);
    if (matching) {
      setSelectedVarId(matching.id);
    }
  };

  const activeColorImages = React.useMemo(() => {
    if (!activeColor) return product.images;
    const filtered = product.images.filter((img) => img.colorName === activeColor);
    return filtered.length > 0 ? filtered : product.images;
  }, [product.images, activeColor]);

  // Map product images
  const images = activeColorImages && activeColorImages.length > 0
    ? activeColorImages.map((img) => img.url)
    : ["/images/chikankari_hero.png"];

  // Auto-switch product image every 6 seconds (6000ms) for performance & calm cadence
  useEffect(() => {
    if (images.length <= 1 || isHovered) return;

    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [images.length, isHovered]);

  // Deterministically mock reviews/ratings based on product ID for stable, authentic looking details
  const rating = (4.5 + (product.id.charCodeAt(product.id.length - 1) % 5) * 0.1).toFixed(1);
  const reviewCount = 8 + (product.id.charCodeAt(0) % 65);

  // Discount calculation
  const hasDiscount = product.compareAtPricePaise && product.compareAtPricePaise > product.pricePaise;
  const discountPercent = hasDiscount
    ? Math.round(((product.compareAtPricePaise! - product.pricePaise) / product.compareAtPricePaise!) * 100)
    : 0;

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!selectedVarId) {
      alert("Please select a size first.");
      return;
    }

    startTransition(async () => {
      const res = await addItemOptimistic(product, selectedVarId, 1);
      if (res.success) {
        setIsAddedToCart(true);
        setTimeout(() => setIsAddedToCart(false), 2000);
      } else {
        alert(res.error || "Failed to add to bag.");
      }
    });
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group flex flex-col bg-[#FFF9F4] border border-brand-black/5 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 relative text-left"
    >
      {/* Image Gallery Column / Aspect ratio 3:4 */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-white">
        <Link href={`/product/${product.slug}`} className="block w-full h-full relative bg-[#FFF9F4]">
          <Image
            key={images[currentImageIndex]}
            src={images[currentImageIndex]}
            alt={`${product.name} - View ${currentImageIndex + 1}`}
            fill
            className="object-contain transition-all duration-500 ease-in-out group-hover:scale-102 bg-[#FFF9F4]"
            sizes="(max-width: 768px) 50vw, 25vw"
            priority={false}
          />
        </Link>

        {/* Carousel overlay navigation arrows */}
        {images.length > 1 && (
          <div className="absolute inset-0 flex items-center justify-between p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
            <button
              onClick={prevImage}
              className="h-8 w-8 rounded-full bg-white/80 backdrop-blur-xs shadow-xs hover:bg-white flex items-center justify-center cursor-pointer border-none"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-4 w-4 text-brand-black" />
            </button>
            <button
              onClick={nextImage}
              className="h-8 w-8 rounded-full bg-white/80 backdrop-blur-xs shadow-xs hover:bg-white flex items-center justify-center cursor-pointer border-none"
              aria-label="Next image"
            >
              <ChevronRight className="h-4 w-4 text-brand-black" />
            </button>
          </div>
        )}

        {/* Slide Indicators dot bar */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrentImageIndex(index);
                }}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer border-none ${
                  index === currentImageIndex ? "bg-brand-sage w-4" : "bg-brand-sage/30 w-1.5"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Wishlist Button Overlay */}
        <div className="absolute top-3 right-3 z-10">
          <WishlistButton productId={product.id} initialWishlisted={initialWishlisted} />
        </div>

        {/* Top Badges (Sale / Discount / New) */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 text-[9px] uppercase tracking-widest font-bold font-sans">
          {hasDiscount && (
            <span className="bg-brand-pink text-brand-offwhite px-2 py-0.5 shadow-xs">
              -{discountPercent}% OFF
            </span>
          )}
          {product.id.includes("prod_kurt_004") && (
            <span className="bg-brand-sage text-brand-offwhite px-2 py-0.5 shadow-xs">
              New
            </span>
          )}
        </div>
      </div>

      {/* Content details sheet */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 bg-white space-y-3 font-sans">
        {/* Category & Title */}
        <div className="space-y-1">
          <span className="text-[9px] uppercase tracking-widest text-brand-sage font-bold block">
            {product.fabric || "Pure Cotton"} Chikankari
          </span>
          <Link href={`/product/${product.slug}`} className="hover:text-brand-pink transition-colors block">
            <h3 className="text-xs sm:text-sm text-brand-black font-semibold leading-snug line-clamp-1">
              {product.name}
            </h3>
          </Link>
        </div>

        {/* Rating and review info */}
        <div className="flex items-center gap-1.5 text-xs">
          <div className="flex items-center text-[#E2D89B]">
            <Star className="h-3.5 w-3.5 fill-[#E2D89B] text-[#E2D89B]" />
            <span className="ml-1 text-xs font-semibold text-brand-black">{rating}</span>
          </div>
          <span className="text-[10px] text-neutral-400 font-medium">
            ({reviewCount} reviews)
          </span>
        </div>

        {/* Price Tag info */}
        <div className="flex items-baseline gap-2 pt-0.5">
          <span className="text-sm sm:text-base font-bold text-brand-black">
            ₹{(product.pricePaise / 100).toLocaleString("en-IN")}
          </span>
          {hasDiscount && (
            <span className="text-xs text-neutral-400 line-through">
              ₹{(product.compareAtPricePaise! / 100).toLocaleString("en-IN")}
            </span>
          )}
        </div>

        {/* Color Swatches (Multi-Color Products Only) */}
        {hasMultipleColors && (
          <div className="flex items-center gap-1.5 pt-0.5">
            {uniqueColors.map((c) => {
              const isSelected = activeColor === c.name;
              return (
                <button
                  key={c.name}
                  type="button"
                  title={c.name}
                  aria-label={`Select color ${c.name}`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleColorClick(c.name);
                  }}
                  className={`w-3.5 h-3.5 rounded-full border border-black/15 transition-all cursor-pointer ${
                    isSelected ? "ring-2 ring-brand-black ring-offset-1 scale-110 shadow-xs" : "hover:scale-105 opacity-80"
                  }`}
                  style={{ backgroundColor: c.code }}
                />
              );
            })}
            <span className="text-[10px] text-neutral-500 uppercase tracking-wider ml-1 font-medium">
              {activeColor}
            </span>
          </div>
        )}

        {/* Size Variant Selector */}
        {displayedVariants.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <span className="text-[9px] uppercase tracking-widest text-neutral-400 font-bold block">
              Select Size
            </span>
            <div className="flex flex-wrap gap-1.5">
              {displayedVariants.map((v) => {
                const isSelected = selectedVarId === v.id;
                const isOutOfStock = v.stock === 0;
                const displaySize = v.size || (v.name.includes("/") ? v.name.split("/")[1].trim() : v.name);
                return (
                  <button
                    key={v.id}
                    disabled={isOutOfStock}
                    onClick={(e) => {
                      e.preventDefault();
                      setSelectedVarId(v.id);
                    }}
                    className={`h-7 px-2.5 min-w-[28px] text-[10px] font-bold uppercase transition-all duration-200 border cursor-pointer select-none rounded-md flex items-center justify-center ${
                      isSelected
                        ? "bg-brand-black text-brand-offwhite border-brand-black"
                        : isOutOfStock
                        ? "bg-neutral-50 text-neutral-300 border-neutral-100 line-through cursor-not-allowed"
                        : "bg-transparent text-neutral-600 border-brand-black/10 hover:border-brand-black"
                    }`}
                  >
                    {displaySize}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Add to Cart Drawer Trigger Action Button */}
        <div className="pt-2">
          <button
            onClick={handleAddToCart}
            disabled={isPending || isAddedToCart}
            className={`w-full py-3 text-[10px] uppercase tracking-widest font-bold transition-all duration-300 border flex items-center justify-center gap-2 cursor-pointer rounded-lg ${
              isAddedToCart
                ? "bg-brand-sage text-brand-offwhite border-brand-sage"
                : "bg-brand-black text-brand-offwhite border-brand-black hover:bg-neutral-800"
            } disabled:opacity-50`}
          >
            {isPending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Adding...
              </>
            ) : isAddedToCart ? (
              <>
                <Check className="h-3.5 w-3.5" />
                Added to Bag
              </>
            ) : (
              <>
                <ShoppingCart className="h-3.5 w-3.5" />
                Add to Bag
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
