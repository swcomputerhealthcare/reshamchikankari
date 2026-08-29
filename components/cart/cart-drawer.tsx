'use client';

import React, { useEffect, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/cart-context";
import { Minus, Plus, Trash2, X, ShoppingBag } from "lucide-react";

interface CartDrawerProps {
  variant?: "default" | "dark";
}

export default function CartDrawer({ variant = "default" }: CartDrawerProps) {
  const {
    cart,
    isOpen,
    setIsOpen,
    updateQtyOptimistic,
    removeItemOptimistic,
  } = useCart();
  const [isPending, startTransition] = useTransition();
  const [mounted, setMounted] = useState(false);

  // Set mounted state for portal execution
  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll and touchpad/trackpad gestures when cart is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
    } else {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    };
  }, [isOpen]);

  const { items, subtotalPaise } = cart;
  const totalQuantity = items.reduce((acc, curr) => acc + curr.quantity, 0);

  // Render trigger button (always in place in layout header)
  const triggerButton = (
    <button
      onClick={() => setIsOpen(true)}
      className={`relative hover:text-brand-pink transition-colors font-semibold flex items-center gap-1.5 font-sans text-xs tracking-wider cursor-pointer border-none bg-transparent p-0 ${
        variant === "dark" ? "text-[#FFF9F4]" : "text-brand-black"
      }`}
      aria-label="Open shopping bag drawer"
    >
      <ShoppingBag className="w-4.5 h-4.5" />
      <span className="font-medium">Bag</span>
      {totalQuantity > 0 && (
        <span
          className={`rounded-full w-4.5 h-4.5 inline-flex items-center justify-center text-[9px] font-mono font-bold leading-none select-none text-center shrink-0 ${
            variant === "dark" ? "bg-[#FFF9F4] text-[#3F5031]" : "bg-[#161616] text-[#FFF9F4]"
          }`}
        >
          {totalQuantity}
        </span>
      )}
    </button>
  );

  // Render Portal Overlay if mounted
  if (!mounted) {
    return triggerButton;
  }

  const drawerElement = (
    <>
      {/* 1. Viewport-level Backdrop Overlay */}
      <div
        className={`fixed inset-0 bg-brand-black/35 backdrop-blur-[4px] z-[9990] transition-opacity duration-350 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsOpen(false)}
        style={{ touchAction: "none" }}
      />

      {/* 2. Slide-out Drawer Panel (Fully Opaque Ivory Background, No transparency) */}
      <aside
        className={`fixed right-0 top-0 bottom-0 w-full max-w-[460px] h-full bg-[#FFF9F4] z-[10000] shadow-[-20px_0_60px_rgba(0,0,0,0.12)] flex flex-col transition-transform duration-[350ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isOpen ? "translate-x-0 visible" : "translate-x-full invisible"
        }`}
        style={{ overflow: "hidden" }}
      >
        {/* HEADER: Flex Fixed */}
        <div className="flex: 0 0 auto flex items-center justify-between p-6 sm:p-8 bg-[#FFF9F4] border-b border-[rgba(23,23,23,0.12)]">
          <div>
            <span className="text-[9px] tracking-widest font-sans uppercase font-bold text-neutral-400 block mb-1">
              YOUR SELECTION
            </span>
            <h2 className="font-display text-2xl text-brand-black">Shopping Bag</h2>
            <p className="font-sans text-[10px] text-brand-sage font-bold tracking-widest uppercase mt-1">
              {totalQuantity} {totalQuantity === 1 ? "piece" : "pieces"} selected
            </p>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-[#6f6f68] hover:text-brand-black cursor-pointer flex items-center justify-center p-1.5 hover:bg-neutral-100/50 rounded-full transition-colors border-none bg-transparent"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PRODUCT LIST CONTENT: Flex Scrollable, custom scrollbar */}
        <div className="flex: 1 1 auto min-height-0 overflow-y-auto p-6 sm:p-8 space-y-6 scrollbar-custom bg-[#FFF9F4]">
          {items.length === 0 ? (
            <div className="text-center py-20 flex flex-col items-center justify-center h-full space-y-4 bg-[#FFF9F4]">
              <span className="text-[10px] sm:text-xs tracking-widest font-sans uppercase font-bold text-neutral-400 mb-2 block">
                Your Bag
              </span>
              <h3 className="font-display text-2xl text-brand-black">Your bag is waiting.</h3>
              <p className="text-xs text-[#6f6f68] max-w-xs mx-auto leading-relaxed font-normal">
                Discover handcrafted chikankari pieces made for every moment.
              </p>
              <div className="pt-4 w-full">
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-8 h-11 bg-brand-black text-brand-offwhite text-[10px] font-bold uppercase tracking-widest rounded-full transition-all duration-300 hover:bg-brand-sage cursor-pointer border-none"
                >
                  Explore Collection
                </button>
              </div>
            </div>
          ) : (
            items.map((item) => {
              const fabricName = item.name.toLowerCase().includes("georgette") ? "Georgette" : "Pure Cotton";
              const productNo = item.sku || `RC-${item.productId.slice(-4).toUpperCase()}`;

              return (
                <div key={item.id} className="flex gap-4 border-b border-brand-black/5 pb-6 last:border-0 last:pb-0 bg-[#FFF9F4]">
                  {/* Aspect Ratio Image Container */}
                  <div className="relative h-[120px] w-[95px] bg-[#f7f0e9] border border-brand-black/5 flex-shrink-0 rounded-[16px] overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-contain p-2"
                      sizes="95px"
                    />
                  </div>

                  <div className="flex-1 flex flex-col justify-between py-0.5 bg-[#FFF9F4]">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-display text-sm text-brand-black leading-tight line-clamp-1">
                          {item.name}
                        </h4>
                        <button
                          onClick={() => removeItemOptimistic(item.id)}
                          disabled={isPending}
                          className="text-[#6f6f68] hover:text-[#E694AA] transition-colors p-1 cursor-pointer border-none bg-transparent flex items-center justify-center"
                          aria-label={`Remove ${item.name}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="text-[10px] text-[#6f6f68] mt-1 space-y-0.5">
                        <p>Size: {item.sizeName || "One Size"} | Fabric: {fabricName}</p>
                        <p className="font-sans text-[9px] text-neutral-400">No. {productNo}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3 bg-[#FFF9F4]">
                      {/* Outlined Quantity Pill Control */}
                      <div className="flex items-center border border-brand-black/15 rounded-full px-1 h-7">
                        <button
                          onClick={() => updateQtyOptimistic(item.id, item.quantity, -1)}
                          disabled={item.quantity <= 1 || isPending}
                          className="w-6 h-6 flex items-center justify-center text-[#6f6f68] hover:text-brand-black rounded-full disabled:opacity-30 cursor-pointer border-none bg-transparent hover:bg-brand-sage/10 transition-colors"
                        >
                          <Minus className="w-2.5 h-2.5" />
                        </button>
                        <span className="w-6 text-center text-[11px] font-semibold text-brand-black select-none">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQtyOptimistic(item.id, item.quantity, 1)}
                          disabled={item.quantity >= Math.min(item.stock, 10) || isPending}
                          className="w-6 h-6 flex items-center justify-center text-[#6f6f68] hover:text-brand-black rounded-full disabled:opacity-30 cursor-pointer border-none bg-transparent hover:bg-brand-sage/10 transition-colors"
                        >
                          <Plus className="w-2.5 h-2.5" />
                        </button>
                      </div>

                      <span className="text-xs font-sans font-bold text-brand-black">
                        ₹{((item.pricePaise * item.quantity) / 100).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* SUMMARY FIXED FOOTER: Flex Fixed */}
        {items.length > 0 && (
          <div className="flex: 0 0 auto p-6 sm:p-8 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] bg-[#FFF9F4] border-t border-[rgba(23,23,23,0.12)] space-y-4">
            <div className="flex items-baseline justify-between">
              <span className="text-xs uppercase tracking-widest text-[#6f6f68] font-bold">
                Subtotal
              </span>
              <span className="text-lg font-bold text-brand-black">
                ₹{(subtotalPaise / 100).toLocaleString("en-IN")}
              </span>
            </div>

            <p className="text-[10px] text-neutral-400 leading-normal font-sans">
              Shipping & taxes calculated at checkout. Lucknowi handcraft authentic guarantee included.
            </p>

            <div className="flex flex-col gap-2 pt-2">
              <Link href="/checkout" onClick={() => setIsOpen(false)} className="w-full">
                <button className="w-full h-12 bg-[#3F5031] hover:bg-brand-black text-brand-offwhite text-[10px] font-bold uppercase tracking-widest rounded-full transition-all duration-300 cursor-pointer border-none flex items-center justify-center">
                  Proceed to Secure Checkout
                </button>
              </Link>
              <Link href="/cart" onClick={() => setIsOpen(false)} className="w-full">
                <button className="w-full h-12 bg-transparent text-brand-black hover:bg-brand-black hover:text-brand-offwhite text-[10px] font-bold uppercase tracking-widest rounded-full transition-all duration-300 cursor-pointer border border-[rgba(23,23,23,0.18)]">
                  View Shopping Bag
                </button>
              </Link>
            </div>
          </div>
        )}
      </aside>
    </>
  );

  return (
    <>
      {triggerButton}
      {createPortal(drawerElement, document.body)}
    </>
  );
}
