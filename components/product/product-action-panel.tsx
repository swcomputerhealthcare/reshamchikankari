'use client';

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/cart-context";
import Button from "@/components/ui/button";
import WishlistButton from "@/components/product/wishlist-button";
import SizeGuideModal from "@/components/product/size-guide-modal";

interface Variant {
  id: string;
  name: string;
  stock: number;
  pricePaise?: number | null;
}

interface ProductActionPanelProps {
  product: {
    id: string;
    name: string;
    pricePaise: number;
    images?: { url: string }[];
  };
  variants: Variant[];
  initialWishlisted?: boolean;
}

export default function ProductActionPanel({ product, variants, initialWishlisted = false }: ProductActionPanelProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const { addItemOptimistic } = useCart();
  const [selectedVarId, setSelectedVarId] = useState(variants[0]?.id || "");
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  const activeVariant = variants.find((v) => v.id === selectedVarId);
  const stock = activeVariant ? activeVariant.stock : 0;
  const currentPrice = (activeVariant?.pricePaise || product.pricePaise) / 100;

  const handleQuantityChange = (delta: number) => {
    const next = quantity + delta;
    if (next >= 1 && next <= Math.min(stock, 10)) {
      setQuantity(next);
    }
  };

  const handleAddToBag = () => {
    setIsAdding(true);
    startTransition(async () => {
      // Map variants to fit addItemOptimistic signature expectations
      const mappedProduct = {
        ...product,
        variants: variants.map(v => ({ id: v.id, name: v.name, stock: v.stock })),
      };
      
      const res = await addItemOptimistic(mappedProduct, selectedVarId || null, quantity);
      setIsAdding(false);
      if (res.success) {
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2500);
      } else {
        alert(res.error || "Failed to add to bag");
      }
    });
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Price Details */}
      <div className="flex items-baseline gap-3 border-b border-brand-black/5 pb-6">
        <span className="font-sans text-2xl font-semibold text-brand-black">
          ₹{currentPrice.toLocaleString("en-IN")}
        </span>
        <span className="text-xs text-neutral-400 font-sans tracking-wide">
          Inclusive of all taxes
        </span>
      </div>

      {/* Variant Size Selector */}
      {variants.length > 0 && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="block text-xs uppercase tracking-widest text-neutral-600 font-bold">
              Select Size
            </label>
            <button
              type="button"
              onClick={() => setIsSizeGuideOpen(true)}
              className="text-[10px] uppercase font-bold tracking-widest text-brand-pink hover:text-neutral-800 transition-colors cursor-pointer flex items-center gap-1 select-none"
            >
              Size Chart 📐
            </button>
          </div>
          <div className="flex items-center gap-2">
            {variants.map((v) => {
              const isOutOfStock = v.stock === 0;
              const isSelected = selectedVarId === v.id;
              return (
                <button
                  key={v.id}
                  disabled={isOutOfStock}
                  onClick={() => {
                    setSelectedVarId(v.id);
                    setQuantity(1);
                  }}
                  className={`w-12 h-12 flex items-center justify-center border text-xs tracking-wider transition-all ${
                    isSelected
                      ? "border-brand-black bg-brand-black text-brand-offwhite font-bold"
                      : isOutOfStock
                      ? "border-neutral-100 text-neutral-300 line-through cursor-not-allowed"
                      : "border-brand-black/10 hover:border-brand-black text-neutral-700"
                  }`}
                >
                  {v.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Stock Information */}
      <div className="text-xs font-medium">
        {stock === 0 ? (
          <span className="text-red-500 uppercase tracking-widest font-bold">Sold Out</span>
        ) : stock <= 3 ? (
          <span className="text-brand-pink uppercase tracking-widest font-bold">Only {stock} items left!</span>
        ) : (
          <span className="text-brand-sage uppercase tracking-widest font-bold">In Stock</span>
        )}
      </div>

      {/* Quantity Selector & Add Button */}
      {stock > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-6">
            <span className="text-xs uppercase tracking-widest text-neutral-600 font-bold">
              Quantity
            </span>
            <div className="flex items-center border border-brand-black/10">
              <button
                type="button"
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
                className="w-10 h-10 flex items-center justify-center text-neutral-500 hover:text-brand-black disabled:opacity-30 text-sm"
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
                className="w-10 h-10 flex items-center justify-center text-neutral-500 hover:text-brand-black disabled:opacity-30 text-sm"
              >
                &#43;
              </button>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              variant="primary"
              size="lg"
              className="flex-1 py-4"
              onClick={handleAddToBag}
              isLoading={isAdding}
            >
              {isAdded ? "Added to Bag ✓" : "Add to Bag"}
            </Button>
            <WishlistButton
              productId={product.id}
              initialWishlisted={initialWishlisted}
              className="!h-14 !w-14 !rounded-lg !border-brand-black/10 hover:!border-brand-black !bg-white hover:!bg-neutral-50 !shadow-none hover:scale-100 active:scale-100 flex items-center justify-center"
            />
          </div>
        </div>
      )}
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
