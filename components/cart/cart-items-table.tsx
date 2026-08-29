'use client';

import React, { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { updateCartItemQtyAction, removeFromCartAction, clearCartAction } from "@/actions/cart";
import CouponInput from "@/components/cart/coupon-input";
import EditorialOrderSummary from "@/components/checkout/editorial-order-summary";
import { Minus, Plus, Trash2 } from "lucide-react";

import { useCart } from "@/context/cart-context";

interface CartItem {
  id: string;
  productId: string;
  variantId: string | null;
  quantity: number;
  name: string;
  slug: string;
  sku: string;
  pricePaise: number;
  image: string;
  sizeName?: string;
  stock: number;
}

interface CartItemsTableProps {
  items: CartItem[];
  subtotalPaise: number;
  appliedCouponCode?: string;
  discountPaise?: number;
}

export default function CartItemsTable({
  items: initialItems,
  subtotalPaise: initialSubtotal,
  appliedCouponCode: initialCoupon,
  discountPaise: initialDiscount = 0,
}: CartItemsTableProps) {
  const router = useRouter();
  const {
    cart,
    updateQtyOptimistic,
    removeItemOptimistic,
    clearCartOptimistic,
  } = useCart();
  const [isPending, startTransition] = useTransition();
  const [removedItems, setRemovedItems] = useState<string[]>([]);

  const { items, subtotalPaise, appliedCouponCode, discountPaise } = cart;

  const handleQtyChange = (itemId: string, currentQty: number, delta: number) => {
    startTransition(async () => {
      const res = await updateQtyOptimistic(itemId, currentQty, delta);
      if (!res.success) {
        alert(res.error || "Failed to update quantity");
      }
    });
  };

  const handleRemove = (itemId: string) => {
    setRemovedItems((prev) => [...prev, itemId]);
    setTimeout(() => {
      startTransition(async () => {
        const res = await removeItemOptimistic(itemId);
        if (!res.success) {
          setRemovedItems((prev) => prev.filter((id) => id !== itemId));
          alert(res.error || "Failed to remove item");
        }
      });
    }, 300);
  };

  const handleClear = () => {
    if (confirm("Are you sure you want to empty your shopping bag?")) {
      startTransition(async () => {
        const res = await clearCartOptimistic();
        if (!res.success) {
          alert(res.error || "Failed to clear bag");
        }
      });
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20 px-6 bg-[#fff9f4] border border-brand-black/5 rounded-[32px] shadow-xs relative overflow-hidden font-sans">
        <span className="text-[10px] sm:text-xs tracking-widest font-sans uppercase font-bold text-neutral-400 mb-4 block">
          Your Bag
        </span>
        <h2 className="font-display text-3xl sm:text-4xl text-brand-black mb-4">
          Your cart is waiting.
        </h2>
        <p className="text-sm text-[#6f6f68] max-w-sm mx-auto mb-10 leading-relaxed font-normal">
          Discover handcrafted pieces made to become part of your everyday.
        </p>
        <Link href="/shop">
          <button className="h-12 px-9 bg-brand-black text-brand-offwhite font-sans text-[11px] font-semibold uppercase tracking-[0.12em] border-none rounded-full cursor-pointer hover:bg-brand-sage transition-all duration-300 ease-in-out">
            Explore Collection
          </button>
        </Link>

        {/* Subtle background embroidery ornament SVG */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden opacity-[0.04] select-none">
          <svg className="w-[400px] h-[400px] text-brand-black" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.5">
            <circle cx="50" cy="50" r="40" strokeDasharray="1 3" />
            <path d="M50 10 C50 10, 30 35, 50 50 C70 35, 50 10, 50 10 Z" />
            <path d="M10 50 C10 50, 35 30, 50 50 C35 70, 10 50, 10 50 Z" />
          </svg>
        </div>
      </div>
    );
  }

  // Calculate order totals
  const shippingCostPaise = subtotalPaise >= 400000 ? 0 : 15000;
  const totalCostPaise = subtotalPaise - discountPaise + shippingCostPaise;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start font-sans">
      {/* LEFT COLUMN: Shopping bag items */}
      <div className="lg:col-span-8 w-full">
        {/* Main Cart Surface card container */}
        <div className="bg-[#fff9f4] border border-brand-black/5 p-6 sm:p-10 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.04)]">
          <div className="flex justify-between items-baseline mb-8 border-b border-brand-black/5 pb-4">
            <h2 className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#6f6f68]">
              Shopping Bag Items ({items.length})
            </h2>
            <button
              onClick={handleClear}
              disabled={isPending}
              className="text-[9px] uppercase font-bold tracking-widest text-neutral-400 hover:text-[#E694AA] transition-colors cursor-pointer border-none bg-transparent"
            >
              Clear Bag
            </button>
          </div>

          {/* Cart items list */}
          <div className="divide-y divide-brand-black/5">
            {items.map((item) => {
              const isRemoving = removedItems.includes(item.id);
              const fabricName = item.name.toLowerCase().includes("georgette") ? "Georgette" : "Pure Cotton";
              const productNo = item.sku || `RC-${item.productId.slice(-4).toUpperCase()}`;

              return (
                <div
                  key={item.id}
                  className={`transition-all duration-300 ${
                    isRemoving
                      ? "opacity-0 max-h-0 py-0 overflow-hidden border-none"
                      : "max-h-[300px] py-6 sm:py-8"
                  } first:pt-0 last:pb-0`}
                >
                  {/* Desktop Layout (hidden on mobile) */}
                  <div className="hidden sm:flex items-center gap-6">
                    {/* Product Image Frame */}
                    <div className="relative w-[120px] h-[155px] bg-[#f7f0e9] rounded-[20px] overflow-hidden flex-shrink-0 border border-brand-black/5">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-contain p-2"
                        sizes="120px"
                        priority={false}
                      />
                    </div>

                    {/* Right Columns aligned horizontally */}
                    <div className="flex-1 grid grid-cols-12 gap-4 items-center">
                      {/* Details */}
                      <div className="col-span-5 flex flex-col justify-center">
                        <Link
                          href={`/product/${item.slug}`}
                          className="hover:text-brand-pink transition-colors inline-block"
                        >
                          <h3 className="font-display text-[15px] text-brand-black leading-snug">
                            {item.name}
                          </h3>
                        </Link>
                        <div className="text-[11px] text-[#6f6f68] mt-1 space-y-0.5 font-sans font-normal">
                          <p>Product No. {productNo}</p>
                          <p>Size: {item.sizeName || "One Size"} | Fabric: {fabricName}</p>
                        </div>
                      </div>

                      {/* Unit Price */}
                      <div className="col-span-2 text-center text-sm font-sans font-medium text-brand-black">
                        ₹{(item.pricePaise / 100).toLocaleString("en-IN")}
                      </div>

                      {/* Quantity Controls Outlined Pill */}
                      <div className="col-span-3 flex justify-center">
                        <div className="flex items-center border border-brand-black/15 rounded-full px-1.5 h-8 bg-transparent">
                          <button
                            onClick={() => handleQtyChange(item.id, item.quantity, -1)}
                            disabled={item.quantity <= 1 || isPending}
                            className="w-7 h-7 flex items-center justify-center text-[#6f6f68] hover:text-brand-black hover:bg-brand-sage/10 active:bg-brand-pink/15 rounded-full disabled:opacity-30 cursor-pointer border-none bg-transparent transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center text-xs font-semibold select-none text-brand-black">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQtyChange(item.id, item.quantity, 1)}
                            disabled={item.quantity >= Math.min(item.stock, 10) || isPending}
                            className="w-7 h-7 flex items-center justify-center text-[#6f6f68] hover:text-brand-black hover:bg-brand-sage/10 active:bg-brand-pink/15 rounded-full disabled:opacity-30 cursor-pointer border-none bg-transparent transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Line Total */}
                      <div className="col-span-2 text-right text-sm font-sans font-bold text-brand-black">
                        ₹{((item.pricePaise * item.quantity) / 100).toLocaleString("en-IN")}
                      </div>
                    </div>

                    {/* Delete Action button */}
                    <button
                      onClick={() => handleRemove(item.id)}
                      disabled={isPending}
                      className="text-[#6f6f68] hover:text-[#E694AA] transition-colors p-2 cursor-pointer border-none bg-transparent flex items-center justify-center"
                      aria-label={`Remove ${item.name} from cart`}
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>
                  </div>

                  {/* Mobile Layout (hidden on desktop/tablet) */}
                  <div className="flex sm:hidden gap-4">
                    {/* Image */}
                    <div className="relative w-[95px] h-[125px] bg-[#f7f0e9] rounded-[16px] overflow-hidden flex-shrink-0 border border-brand-black/5">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-contain p-1.5"
                        sizes="95px"
                      />
                    </div>

                    {/* Details Column */}
                    <div className="flex-1 flex flex-col justify-between py-0.5">
                      <div>
                        <h3 className="font-display text-sm text-brand-black leading-tight line-clamp-1">
                          {item.name}
                        </h3>
                        <p className="text-[10px] text-[#6f6f68] mt-1">
                          Size: {item.sizeName || "One Size"} | Fabric: {fabricName}
                        </p>
                        <p className="text-[10px] text-[#6f6f68] mt-0.5">No. {productNo}</p>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        {/* Quantity Pill */}
                        <div className="flex items-center border border-brand-black/15 rounded-full px-1 h-7">
                          <button
                            onClick={() => handleQtyChange(item.id, item.quantity, -1)}
                            disabled={item.quantity <= 1 || isPending}
                            className="w-6 h-6 flex items-center justify-center text-[#6f6f68] hover:text-brand-black rounded-full disabled:opacity-30 cursor-pointer border-none bg-transparent"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-2.5 h-2.5" />
                          </button>
                          <span className="w-6 text-center text-[11px] font-semibold text-brand-black">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQtyChange(item.id, item.quantity, 1)}
                            disabled={item.quantity >= Math.min(item.stock, 10) || isPending}
                            className="w-6 h-6 flex items-center justify-center text-[#6f6f68] hover:text-brand-black rounded-full disabled:opacity-30 cursor-pointer border-none bg-transparent"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-2.5 h-2.5" />
                          </button>
                        </div>

                        {/* Price & Delete */}
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-sans font-bold text-brand-black">
                            ₹{((item.pricePaise * item.quantity) / 100).toLocaleString("en-IN")}
                          </span>
                          <button
                            onClick={() => handleRemove(item.id)}
                            disabled={isPending}
                            className="text-[#6f6f68] hover:text-[#e694aa] transition-colors p-1 cursor-pointer border-none bg-transparent"
                            aria-label={`Remove ${item.name} from cart`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Continue Shopping Under Link */}
        <div className="mt-8 text-center sm:text-left">
          <Link
            href="/shop"
            className="group inline-flex items-center gap-2 text-xs text-[#6f6f68] hover:text-brand-black transition-colors font-sans uppercase font-bold tracking-widest"
          >
            Discover More Pieces
            <span className="text-sm transition-transform duration-300 group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </div>

      {/* RIGHT COLUMN: Order Summary card */}
      <div className="lg:col-span-4 w-full">
        <EditorialOrderSummary
          subtotalPaise={subtotalPaise}
          shippingPaise={shippingCostPaise}
          initialCouponCode={appliedCouponCode}
          initialDiscountPaise={discountPaise}
          showCheckoutButton={true}
          ctaText="PROCEED TO SECURE CHECKOUT"
          onSubmitOrder={() => {
            if (items.length > 0) {
              router.push("/checkout");
            }
          }}
        />
      </div>
    </div>
  );
}
