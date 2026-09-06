"use client";

import React, { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Menu, X, ChevronDown, Heart, ShoppingBag, User as UserIcon, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import HeaderSearch from "@/components/layout/HeaderSearch";
import { useCart } from "@/context/cart-context";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  image?: string | null;
  createdAt?: string | Date;
}

interface MobileNavProps {
  user: User | null;
  variant?: "default" | "dark";
}

export default function MobileNav({ user, variant = "default" }: MobileNavProps) {
  const { cart } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [isShopExpanded, setIsShopExpanded] = useState(false);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Lock body scroll when mobile menu is open to prevent page bleed
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleLogout = () => {
    startTransition(async () => {
      try {
        const supabase = createClient();
        await supabase.auth.signOut();
        setIsOpen(false);
        router.push("/login");
        router.refresh();
      } catch (err) {
        console.error("Signout failed:", err);
      }
    });
  };

  const cartCount = cart.items.reduce((acc, curr) => acc + curr.quantity, 0);

  return (
    <div className="flex items-center justify-between w-full h-16 font-sans relative">
      {/* Left burger menu trigger */}
      <button
        onClick={() => setIsOpen(true)}
        className={`relative z-10 p-2 -ml-2 hover:text-brand-pink transition-colors cursor-pointer border-none bg-transparent ${
          variant === "dark" ? "text-[#FFF9F4]" : "text-brand-black"
        }`}
        aria-label="Open mobile menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Center Brand Text: Resham Chikankari (Mathematically centered with balanced side spaces) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none px-12 sm:px-16">
        <Link 
          href="/" 
          className="pointer-events-auto select-none py-1 transition-opacity hover:opacity-85"
          aria-label="Resham Chikankari Home"
        >
          <span
            className={`font-display text-[17px] min-[375px]:text-[19px] sm:text-[21px] tracking-[0.03em] font-normal whitespace-nowrap ${
              variant === "dark" ? "text-[#FFF9F4]" : "text-brand-black"
            }`}
          >
            Resham Chikankari
          </span>
        </Link>
      </div>

      {/* Right Search & Cart triggers */}
      <div className="relative z-10 flex items-center gap-2">
        <HeaderSearch variant={variant} />
        
        <Link
          href="/cart"
          className={`relative p-2 hover:text-brand-pink transition-colors ${
            variant === "dark" ? "text-[#FFF9F4]" : "text-brand-black"
          }`}
          aria-label="View shopping bag"
        >
          <ShoppingBag className="w-5 h-5" />
          {cartCount > 0 && (
            <span
              className={`absolute -top-1 -right-1 rounded-full w-4.5 h-4.5 inline-flex items-center justify-center text-[9px] font-mono font-bold leading-none select-none text-center ${
                variant === "dark" ? "bg-[#FFF9F4] text-brand-sage" : "bg-[#161616] text-[#FFF9F4]"
              }`}
            >
              {cartCount}
            </span>
          )}
        </Link>
      </div>

      {/* Mobile Drawer (High Z-index, Solid Opaque Canvas) */}
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex">
          {/* Backdrop overlay */}
          <div 
            className="fixed inset-0 bg-brand-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setIsOpen(false)}
          />

          {/* Drawer Content Panel (Solid Opaque Off-White) */}
          <div className="relative z-[10000] w-[85%] max-w-sm h-full bg-[#FFF9F4] text-brand-black flex flex-col p-6 shadow-2xl overflow-y-auto animate-in slide-in-from-left duration-250 select-none">
            
            {/* Drawer Top Header */}
            <div className="flex justify-between items-center pb-6 border-b border-brand-black/10 mb-6">
              <Link
                href="/"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 group"
              >
                <Image
                  src="/images/logo.webp"
                  alt="Resham Chikankari"
                  width={36}
                  height={36}
                  className="w-9 h-9 object-cover rounded-full border border-brand-black/10 shadow-2xs group-hover:scale-105 transition-transform"
                />
                <span className="font-display text-xl tracking-wide text-brand-black">
                  Resham Chikankari
                </span>
              </Link>
              <button
                onClick={() => setIsOpen(false)}
                className="text-neutral-500 hover:text-brand-black cursor-pointer p-2 border-none bg-transparent rounded-full hover:bg-black/5 transition-colors"
                aria-label="Close menu"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Menu Links */}
            <nav className="flex-1 space-y-2 text-xs uppercase tracking-[0.15em] font-semibold text-brand-black">
              {/* Home */}
              <Link
                href="/"
                onClick={() => setIsOpen(false)}
                className="block hover:text-brand-pink transition-colors py-3.5 border-b border-brand-black/5"
              >
                Home
              </Link>

              {/* Shop Collapsible */}
              <div className="border-b border-brand-black/5 pb-2">
                <button
                  onClick={() => setIsShopExpanded(!isShopExpanded)}
                  className="w-full flex justify-between items-center py-3.5 text-left uppercase tracking-[0.15em] font-semibold text-brand-black border-none bg-transparent cursor-pointer"
                >
                  <span>Shop Collection</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 text-neutral-500 ${isShopExpanded ? "rotate-180" : ""}`}
                  />
                </button>

                {isShopExpanded && (
                  <div className="pl-4 pb-2 space-y-3 normal-case text-xs text-neutral-600 font-medium tracking-wide border-l-2 border-brand-pink/30 ml-2">
                    <Link
                      href="/shop/kurtis-kurtas"
                      onClick={() => setIsOpen(false)}
                      className="block hover:text-brand-pink transition-colors uppercase text-[10px] tracking-wider"
                    >
                      Kurtis & Kurtas
                    </Link>
                    <Link
                      href="/shop/coord-sets"
                      onClick={() => setIsOpen(false)}
                      className="block hover:text-brand-pink transition-colors uppercase text-[10px] tracking-wider"
                    >
                      Co-ord Sets
                    </Link>
                    <Link
                      href="/shop/bottom-wear"
                      onClick={() => setIsOpen(false)}
                      className="block hover:text-brand-pink transition-colors uppercase text-[10px] tracking-wider"
                    >
                      Bottom Wear
                    </Link>
                    <Link
                      href="/shop"
                      onClick={() => setIsOpen(false)}
                      className="block hover:text-brand-pink transition-colors uppercase font-bold text-brand-black text-[10px] tracking-wider"
                    >
                      All Kurtis →
                    </Link>
                  </div>
                )}
              </div>

              {/* Our Story */}
              <Link
                href="/about"
                onClick={() => setIsOpen(false)}
                className="block hover:text-brand-pink transition-colors py-3.5 border-b border-brand-black/5"
              >
                Our Story
              </Link>

              {/* Reviews */}
              <Link
                href="/patron-voices"
                onClick={() => setIsOpen(false)}
                className="block hover:text-brand-pink transition-colors py-3.5 border-b border-brand-black/5"
              >
                Reviews
              </Link>

              {/* Wishlist */}
              <Link
                href="/wishlist"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 hover:text-brand-pink transition-colors py-3.5 border-b border-brand-black/5"
              >
                <Heart className="w-4 h-4 text-brand-pink fill-brand-pink/20" />
                <span>Wishlist</span>
              </Link>

              {/* Garment Care */}
              <Link
                href="/care"
                onClick={() => setIsOpen(false)}
                className="block hover:text-brand-pink transition-colors py-3.5 border-b border-brand-black/5"
              >
                Garment Care
              </Link>

              {/* Contact Us */}
              <Link
                href="/contact"
                onClick={() => setIsOpen(false)}
                className="block hover:text-brand-pink transition-colors py-3.5 border-b border-brand-black/5"
              >
                Contact Us
              </Link>
            </nav>

            {/* Footer / Account Section */}
            <div className="border-t border-brand-black/10 pt-6 mt-8 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))]">
              {user ? (
                <div className="space-y-4 text-left">
                  <div className="flex items-center gap-3">
                    {user.image ? (
                      <div className="relative w-10 h-10 rounded-full overflow-hidden border border-brand-black/15 shrink-0 shadow-2xs">
                        <Image
                          src={user.image}
                          alt={user.name || user.email}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-brand-black text-brand-offwhite flex items-center justify-center font-bold text-xs shrink-0 font-display">
                        {user.name ? user.name[0].toUpperCase() : (user.email ? user.email[0].toUpperCase() : "U")}
                      </div>
                    )}
                    <div className="overflow-hidden">
                      <h4 className="font-display text-base text-brand-black truncate">
                        {user.name || user.email}
                      </h4>
                      <p className="font-sans text-[10px] text-neutral-500 truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 pt-2">
                    <Link
                      href="/account"
                      onClick={() => setIsOpen(false)}
                      className="py-3 bg-brand-black text-brand-offwhite hover:bg-neutral-800 transition-colors text-center uppercase tracking-widest text-[10px] font-bold rounded-lg flex items-center justify-center gap-1.5"
                    >
                      <UserIcon className="w-3.5 h-3.5" />
                      Account
                    </Link>
                    <button
                      onClick={handleLogout}
                      disabled={isPending}
                      className="py-3 border border-red-200 text-red-600 hover:bg-red-50 transition-colors cursor-pointer font-bold uppercase tracking-widest text-[10px] rounded-lg flex items-center justify-center gap-1.5"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      {isPending ? "..." : "Log out"}
                    </button>
                  </div>
                </div>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="block w-full py-3.5 text-center bg-brand-black text-brand-offwhite hover:bg-neutral-800 transition-colors uppercase tracking-widest text-xs font-bold font-sans rounded-full shadow-xs"
                >
                  Sign In
                </Link>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
