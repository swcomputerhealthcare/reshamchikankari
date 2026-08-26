'use client';

import React, { useState, useTransition, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useWishlist } from "@/context/wishlist-context";
import { useCart } from "@/context/cart-context";
import { Heart, Trash2, Check, Loader2, Share2, ArrowRight } from "lucide-react";

interface CatalogProduct {
  id: string;
  name: string;
  pricePaise: number;
  compareAtPricePaise: number | null;
  slug: string;
  fabric?: string | null;
  sku: string;
  images: { url: string }[];
  variants: { id: string; name: string; stock: number; isActive: boolean }[];
}

interface WishlistClientProps {
  products: CatalogProduct[];
}

export default function WishlistClient({ products: initialProducts }: WishlistClientProps) {
  const [isPending, startTransition] = useTransition();
  const { addItemOptimistic } = useCart();
  const { toggleWishlist } = useWishlist();
  const [products, setProducts] = useState(initialProducts);

  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

  // Selected sizes mapping
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>(() => {
    const defaults: Record<string, string> = {};
    initialProducts.forEach((p) => {
      const inStockVar = p.variants.find((v) => v.stock > 0 && v.isActive);
      if (inStockVar) {
        defaults[p.id] = inStockVar.id;
      } else if (p.variants.length > 0) {
        defaults[p.id] = p.variants[0].id;
      }
    });
    return defaults;
  });

  const [addingBag, setAddingBag] = useState<Record<string, "idle" | "loading" | "success">>({});
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleRemove = (productId: string, productName: string) => {
    startTransition(async () => {
      const res = await toggleWishlist(productId);
      if (res.success) {
        setProducts((prev) => prev.filter((p) => p.id !== productId));
        setNotification(`Removed "${productName}" from wishlist.`);
      }
    });
  };

  const handleAddToBag = (productId: string, productName: string) => {
    const variantId = selectedSizes[productId];
    if (!variantId) {
      alert("Please select a size first.");
      return;
    }

    const product = products.find((p) => p.id === productId);
    if (!product) return;

    setAddingBag((prev) => ({ ...prev, [productId]: "loading" }));

    startTransition(async () => {
      const mappedProduct = {
        ...product,
        variants: product.variants.map((v) => ({ id: v.id, name: v.name, stock: v.stock })),
      };

      const res = await addItemOptimistic(mappedProduct, variantId, 1);
      if (res.success) {
        setAddingBag((prev) => ({ ...prev, [productId]: "success" }));
        setNotification(`Added "${productName}" to shopping bag.`);
        setTimeout(() => {
          setAddingBag((prev) => ({ ...prev, [productId]: "idle" }));
        }, 2500);
      } else {
        setAddingBag((prev) => ({ ...prev, [productId]: "idle" }));
        alert(res.error || "Failed to add item to bag");
      }
    });
  };

  const handleShare = (productName: string, productSlug: string) => {
    const url = `${window.location.origin}/product/${productSlug}`;
    navigator.clipboard.writeText(url);
    setNotification(`Link to "${productName}" copied to clipboard.`);
  };

  if (products.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20 px-6 bg-[#FFF9F4] border border-[#161616]/10 rounded-3xl relative overflow-hidden font-sans">
        <span className="text-xs tracking-[0.2em] font-sans uppercase font-bold text-[#75786e] mb-3 block">
          YOUR SELECTION
        </span>
        <h2 className="font-display text-3xl sm:text-4xl text-[#3F5031] mb-3 flex items-center justify-center gap-2">
          <Heart className="w-6 h-6 stroke-[1.4] text-[#E58FA7] fill-[#E58FA7]" />
          Nothing Saved Yet
        </h2>
        <p className="text-sm text-[#44483f] max-w-sm mx-auto mb-8 leading-relaxed">
          Your carefully chosen treasures will appear here. Save pieces to curate your Lucknowi wardrobe.
        </p>
        <Link href="/shop">
          <button className="px-8 py-3.5 bg-[#3F5031] text-[#FFF9F4] font-sans text-xs font-semibold uppercase tracking-[0.15em] rounded-full hover:bg-black transition-all cursor-pointer border-none inline-flex items-center gap-2">
            Explore Collection <ArrowRight className="w-4 h-4" />
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="font-sans relative">
      {/* Toast notification overlay */}
      {notification && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#3F5031] text-[#FFF9F4] text-xs font-semibold px-6 py-3 rounded-full shadow-lg z-50 animate-in fade-in slide-in-from-bottom-2">
          {notification}
        </div>
      )}

      {/* Header bar */}
      <div className="mb-10 border-b border-[#161616]/15 pb-4 flex justify-between items-end">
        <h1 className="font-display text-3xl sm:text-4xl uppercase text-[#3F5031] tracking-wide">
          YOUR SELECTION
        </h1>
        <span className="font-sans text-xs font-semibold tracking-widest text-[#75786e] uppercase">
          {products.length} {products.length === 1 ? "ITEM" : "ITEMS"}
        </span>
      </div>

      {/* Product Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
        {products.map((product) => {
          const selectedVarId = selectedSizes[product.id];
          const selectedVariant = product.variants.find((v) => v.id === selectedVarId);
          const isOutOfStock = !selectedVariant || selectedVariant.stock === 0 || !selectedVariant.isActive;
          const addState = addingBag[product.id] || "idle";

          return (
            <div key={product.id} className="group flex flex-col items-start w-full text-left">
              {/* Product Photography Container (3:4 ratio) */}
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#efeee9] rounded-2xl mb-4 border border-[#161616]/10">
                <Link href={`/product/${product.slug}`} className="block w-full h-full">
                  <Image
                    src={product.images[0]?.url || "/images/chikankari_hero.png"}
                    alt={product.name}
                    fill
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </Link>

                {/* Heart / Remove Action Button */}
                <button
                  onClick={() => handleRemove(product.id, product.name)}
                  disabled={isPending}
                  className="absolute top-4 right-4 text-[#3F5031] bg-[#FFF9F4]/90 backdrop-blur-xs p-2.5 rounded-full hover:bg-[#3F5031] hover:text-[#FFF9F4] transition-colors z-20 cursor-pointer border-none shadow-xs"
                  aria-label={`Remove ${product.name}`}
                  title="Remove from wishlist"
                >
                  <Heart className="w-4 h-4 fill-current stroke-current" />
                </button>

                {/* Optional Craft Badge */}
                <div className="absolute bottom-4 left-4 bg-[#E58FA7] text-[#FFF9F4] px-3 py-1 text-[9px] uppercase tracking-widest font-semibold rounded-xs shadow-xs z-20">
                  Handcrafted
                </div>
              </div>

              {/* Product Info & CTA */}
              <div className="flex flex-col items-start w-full space-y-2">
                <div className="flex justify-between items-baseline w-full">
                  <Link href={`/product/${product.slug}`}>
                    <h3 className="font-display text-xl sm:text-2xl text-[#161616] group-hover:text-[#3F5031] transition-colors">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="font-sans text-sm font-semibold text-[#526443]">
                    ₹{(product.pricePaise / 100).toLocaleString("en-IN")}
                  </p>
                </div>

                {/* Variant Size selector dropdown */}
                {product.variants.length > 1 && (
                  <div className="flex items-center gap-2 pt-1 text-xs text-[#75786e]">
                    <span className="font-bold text-[10px] uppercase tracking-wider">Size:</span>
                    <select
                      value={selectedVarId || ""}
                      onChange={(e) => setSelectedSizes((prev) => ({ ...prev, [product.id]: e.target.value }))}
                      className="bg-transparent border border-[#161616]/15 rounded-md px-2 py-1 text-xs text-[#161616] focus:outline-none focus:ring-1 focus:ring-[#3F5031]"
                    >
                      {product.variants.map((v) => (
                        <option key={v.id} value={v.id} disabled={v.stock === 0 || !v.isActive}>
                          {v.name} {v.stock === 0 ? "(Out of Stock)" : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Add to Bag CTA & Share Button */}
                <div className="flex items-center justify-between w-full pt-2">
                  <button
                    disabled={isOutOfStock || addState === "loading" || isPending}
                    onClick={() => handleAddToBag(product.id, product.name)}
                    className="font-sans text-xs font-bold uppercase tracking-[0.12em] text-[#3F5031] border-b border-[#3F5031] pb-0.5 hover:text-[#E58FA7] hover:border-[#E58FA7] transition-colors cursor-pointer border-x-0 border-t-0 bg-transparent flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {addState === "loading" ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Adding...
                      </>
                    ) : addState === "success" ? (
                      <>
                        <Check className="w-3.5 h-3.5" /> Added to Bag
                      </>
                    ) : isOutOfStock ? (
                      "Unavailable"
                    ) : (
                      "ADD TO BAG"
                    )}
                  </button>

                  <button
                    onClick={() => handleShare(product.name, product.slug)}
                    className="p-1.5 text-[#75786e] hover:text-[#3F5031] transition-colors border-none bg-transparent cursor-pointer"
                    title="Share item"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
