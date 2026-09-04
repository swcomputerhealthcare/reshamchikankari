'use client';

import React, { useState, useTransition, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useWishlist } from "@/context/wishlist-context";
import { useCart } from "@/context/cart-context";
import { Heart, Check, Loader2, Share2, ArrowRight, ShoppingBag } from "lucide-react";

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
  const [isMovingAll, setIsMovingAll] = useState(false);

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

  const handleMoveToBag = (productId: string, productName: string) => {
    const variantId = selectedSizes[productId];
    if (!variantId) {
      setNotification("Please select a size first.");
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
        setNotification(`Moved "${productName}" to shopping bag.`);
        
        // Remove item from wishlist ONLY after bag addition succeeds
        await toggleWishlist(productId);
        setProducts((prev) => prev.filter((p) => p.id !== productId));

        setTimeout(() => {
          setAddingBag((prev) => ({ ...prev, [productId]: "idle" }));
        }, 2000);
      } else {
        setAddingBag((prev) => ({ ...prev, [productId]: "idle" }));
        setNotification(res.error || "Failed to add item to bag");
      }
    });
  };

  const handleMoveAllToBag = () => {
    if (products.length === 0 || isMovingAll) return;
    setIsMovingAll(true);

    startTransition(async () => {
      let movedCount = 0;
      const productsToRemove: string[] = [];

      for (const product of products) {
        const variantId = selectedSizes[product.id] || product.variants.find((v) => v.stock > 0 && v.isActive)?.id || product.variants[0]?.id;
        if (!variantId) continue;

        const mappedProduct = {
          ...product,
          variants: product.variants.map((v) => ({ id: v.id, name: v.name, stock: v.stock })),
        };

        const res = await addItemOptimistic(mappedProduct, variantId, 1);
        if (res.success) {
          movedCount++;
          productsToRemove.push(product.id);
          await toggleWishlist(product.id);
        }
      }

      if (movedCount > 0) {
        setProducts((prev) => prev.filter((p) => !productsToRemove.includes(p.id)));
        setNotification(`Moved ${movedCount} ${movedCount === 1 ? "item" : "items"} to your shopping bag.`);
      } else {
        setNotification("Could not add items to bag. Please check size availability.");
      }

      setIsMovingAll(false);
    });
  };

  const handleShare = (productName: string, productSlug: string) => {
    const url = `${window.location.origin}/product/${productSlug}`;
    navigator.clipboard.writeText(url);
    setNotification(`Link to "${productName}" copied to clipboard.`);
  };

  // Editorial Empty State
  if (products.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20 px-6 bg-[#FFF9F4] border border-[#161616]/10 rounded-3xl relative overflow-hidden font-sans shadow-xs">
        <span className="text-xs tracking-[0.25em] font-sans uppercase font-bold text-[#E694AA] mb-3 block">
          YOUR EDIT
        </span>
        <h2 className="font-display text-3xl sm:text-4xl text-[#7C7A5A] mb-3 flex items-center justify-center gap-2">
          Nothing Saved Yet
        </h2>
        <div className="w-12 h-[1px] bg-[#7C7A5A]/20 mx-auto mb-4" />
        <p className="text-xs sm:text-sm text-neutral-600 max-w-sm mx-auto mb-8 leading-relaxed">
          Discover pieces handcrafted by Lucknow artisans and curate your personal heritage wardrobe.
        </p>
        <Link href="/shop">
          <button className="px-8 py-4 bg-[#7C7A5A] text-[#FFF9F4] font-sans text-xs font-semibold uppercase tracking-[0.18em] rounded-full hover:bg-black transition-all cursor-pointer border-none inline-flex items-center gap-2">
            Explore Collection <ArrowRight className="w-4 h-4" />
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="font-sans relative text-left">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#7C7A5A] text-[#FFF9F4] text-xs font-semibold px-6 py-3 rounded-full shadow-lg z-50 animate-in fade-in slide-in-from-bottom-2">
          {notification}
        </div>
      )}

      {/* Header bar */}
      <div className="mb-10 border-b border-[#161616]/15 pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-[#E694AA] block mb-1">
            CURATED COUTURE
          </span>
          <h1 className="font-display text-3xl sm:text-4xl uppercase text-[#7C7A5A] tracking-wide">
            Your Wishlist Edit
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-sans text-xs font-semibold tracking-widest text-neutral-500 uppercase">
            {products.length} {products.length === 1 ? "PIECE" : "PIECES"}
          </span>
          <button
            onClick={handleMoveAllToBag}
            disabled={isMovingAll || isPending}
            className="px-5 py-2.5 bg-[#7C7A5A] hover:bg-[#656346] text-[#FFF9F4] font-sans text-xs font-bold uppercase tracking-[0.15em] rounded-full shadow-xs transition-all flex items-center gap-2 cursor-pointer border-none disabled:opacity-50"
          >
            {isMovingAll ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Moving All...
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" /> Move All to Bag
              </>
            )}
          </button>
        </div>
      </div>

      {/* Product Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
        {products.map((product) => (
          <WishlistProductItem
            key={product.id}
            product={product}
            selectedVarId={selectedSizes[product.id]}
            addState={addingBag[product.id] || "idle"}
            isPending={isPending}
            onSelectSize={(varId) => setSelectedSizes((prev) => ({ ...prev, [product.id]: varId }))}
            onRemove={() => handleRemove(product.id, product.name)}
            onMoveToBag={() => handleMoveToBag(product.id, product.name)}
            onShare={() => handleShare(product.name, product.slug)}
          />
        ))}
      </div>
    </div>
  );
}

function WishlistProductItem({
  product,
  selectedVarId,
  addState,
  isPending,
  onSelectSize,
  onRemove,
  onMoveToBag,
  onShare,
}: {
  product: CatalogProduct;
  selectedVarId?: string;
  addState: "idle" | "loading" | "success";
  isPending: boolean;
  onSelectSize: (varId: string) => void;
  onRemove: () => void;
  onMoveToBag: () => void;
  onShare: () => void;
}) {
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const images = product.images && product.images.length > 0 ? product.images.map((img) => img.url) : ["/images/chikankari_hero.png"];

  useEffect(() => {
    if (images.length <= 1 || isHovered) return;

    const timer = setInterval(() => {
      setCurrentImgIndex((prev) => (prev + 1) % images.length);
    }, 3000);

    return () => clearInterval(timer);
  }, [images.length, isHovered]);

  const selectedVariant = product.variants.find((v) => v.id === selectedVarId);
  const isOutOfStock = !selectedVariant || selectedVariant.stock === 0 || !selectedVariant.isActive;

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group flex flex-col items-start w-full text-left bg-[#F8F2EC] p-3 sm:p-4 rounded-2xl border border-[#ECE9E2] shadow-xs"
    >
      {/* Product Image Container (3:4 aspect ratio) */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#FFF9F4] rounded-xl mb-4 border border-[#ECE9E2]">
        <Link href={`/product/${product.slug}`} className="block w-full h-full">
          <Image
            key={images[currentImgIndex]}
            src={images[currentImgIndex]}
            alt={product.name}
            fill
            className="object-cover object-center group-hover:scale-105 transition-all duration-500 ease-in-out"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </Link>

        {/* Remove Action Button */}
        <button
          onClick={onRemove}
          disabled={isPending}
          className="absolute top-3 right-3 text-[#E694AA] bg-[#FFF9F4]/90 backdrop-blur-xs p-2.5 rounded-full hover:bg-[#E694AA] hover:text-[#FFF9F4] transition-colors z-20 cursor-pointer border-none shadow-xs"
          aria-label={`Remove ${product.name}`}
          title="Remove from wishlist"
        >
          <Heart className="w-4 h-4 fill-current stroke-current" />
        </button>

        {/* Fabric / Craft Badge */}
        <div className="absolute bottom-3 left-3 bg-[#7C7A5A] text-[#FFF9F4] px-2.5 py-1 text-[9px] uppercase tracking-widest font-semibold rounded-md shadow-xs z-20">
          {product.fabric || "Handcrafted"}
        </div>
      </div>

      {/* Product Info & Actions */}
      <div className="flex flex-col items-start w-full space-y-2.5">
        <div className="flex justify-between items-baseline w-full">
          <Link href={`/product/${product.slug}`}>
            <h3 className="font-display text-xl text-[#161616] group-hover:text-[#7C7A5A] transition-colors">
              {product.name}
            </h3>
          </Link>
          <p className="font-sans text-sm font-semibold text-[#7C7A5A]">
            ₹{(product.pricePaise / 100).toLocaleString("en-IN")}
          </p>
        </div>

        {/* Size Selector */}
        {product.variants.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-neutral-600 w-full pt-1">
            <span className="font-bold text-[10px] uppercase tracking-wider">Select Size:</span>
            <select
              value={selectedVarId || ""}
              onChange={(e) => onSelectSize(e.target.value)}
              className="bg-[#FFF9F4] border border-[#ECE9E2] rounded-lg px-2.5 py-1.5 text-xs text-[#161616] focus:outline-none focus:ring-1 focus:ring-[#7C7A5A] cursor-pointer"
            >
              {product.variants.map((v) => (
                <option key={v.id} value={v.id} disabled={v.stock === 0 || !v.isActive}>
                  {v.name} {v.stock === 0 ? "(Sold Out)" : ""}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Move to Bag CTA & Share Button */}
        <div className="flex items-center justify-between w-full pt-2">
          <button
            disabled={isOutOfStock || addState === "loading" || isPending}
            onClick={onMoveToBag}
            className="font-sans text-xs font-bold uppercase tracking-[0.15em] text-[#7C7A5A] hover:text-[#E694AA] transition-colors cursor-pointer border-none bg-transparent flex items-center gap-1.5 disabled:opacity-50"
          >
            {addState === "loading" ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Moving...
              </>
            ) : addState === "success" ? (
              <>
                <Check className="w-3.5 h-3.5" /> Moved to Bag
              </>
            ) : isOutOfStock ? (
              "Sold Out"
            ) : (
              "MOVE TO BAG →"
            )}
          </button>

          <button
            onClick={onShare}
            className="p-1.5 text-neutral-400 hover:text-[#7C7A5A] transition-colors border-none bg-transparent cursor-pointer"
            title="Share piece"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
