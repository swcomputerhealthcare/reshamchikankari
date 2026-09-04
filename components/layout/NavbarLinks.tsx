"use client";

import React, { useState } from "react";
import TransitionLink from "@/components/transitions/TransitionLink";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function NavbarLinks({ variant = "default" }: { variant?: "default" | "dark" }) {
  const pathname = usePathname();
  const [isShopOpen, setIsShopOpen] = useState(false);

  const isActive = (route: string) => {
    if (route === "/") return pathname === "/";
    if (route === "/shop") return pathname.startsWith("/shop") || pathname.startsWith("/product");
    if (route === "/patron-voices" || route === "/reviews") return pathname.startsWith("/patron-voices") || pathname.startsWith("/reviews");
    return pathname.startsWith(route);
  };

  const activeClass = variant === "dark"
    ? "text-[#FFF9F4] font-semibold border-b-2 border-brand-pink pb-0.5 whitespace-nowrap"
    : "text-brand-black font-semibold border-b-2 border-brand-sage pb-0.5 whitespace-nowrap";

  const inactiveClass = variant === "dark"
    ? "text-[#FFF9F4]/80 hover:text-[#FFF9F4] transition-colors duration-200 whitespace-nowrap"
    : "text-brand-black/80 hover:text-brand-black transition-colors duration-200 whitespace-nowrap";

  return (
    <div className="flex items-center gap-4 lg:gap-5 xl:gap-7 text-[11px] uppercase tracking-[0.16em] font-medium font-sans relative whitespace-nowrap">
      {/* HOME */}
      <TransitionLink
        href="/"
        className={isActive("/") ? activeClass : inactiveClass}
      >
        Home
      </TransitionLink>

      {/* SHOP WITH DROPDOWN */}
      <div
        className="relative py-1 whitespace-nowrap"
        onMouseEnter={() => setIsShopOpen(true)}
        onMouseLeave={() => setIsShopOpen(false)}
      >
        <button
          className={`flex items-center gap-1 uppercase tracking-[0.16em] cursor-pointer font-medium border-none bg-transparent p-0 whitespace-nowrap ${
            isActive("/shop") ? activeClass : inactiveClass
          }`}
        >
          Shop{" "}
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform duration-200 ${isShopOpen ? "rotate-180" : ""}`}
          />
        </button>

        <AnimatePresence>
          {isShopOpen && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute left-0 mt-2 w-56 bg-[#FFF9F4] border border-brand-black/10 shadow-md py-3 z-50 normal-case rounded-xl"
            >
              {/* Dropdown Layout */}
              <div className="flex flex-col text-[10px] uppercase tracking-wider font-semibold font-sans">
                <span className="px-5 py-1 text-[9px] text-brand-sage tracking-widest font-bold block mb-1">
                  Categories
                </span>
                
                <TransitionLink
                  href="/shop/kurtis-kurtas"
                  onClick={() => setIsShopOpen(false)}
                  className="px-5 py-2.5 hover:bg-brand-black/5 hover:text-brand-sage transition-colors text-left text-neutral-700"
                >
                  Kurtis & Kurtas
                </TransitionLink>
                <TransitionLink
                  href="/shop/coord-sets"
                  onClick={() => setIsShopOpen(false)}
                  className="px-5 py-2.5 hover:bg-brand-black/5 hover:text-brand-sage transition-colors text-left text-neutral-700"
                >
                  Co-ord Sets
                </TransitionLink>
                <TransitionLink
                  href="/shop/bottom-wear"
                  onClick={() => setIsShopOpen(false)}
                  className="px-5 py-2.5 hover:bg-brand-black/5 hover:text-brand-sage transition-colors text-left text-neutral-700"
                >
                  Bottom Wear
                </TransitionLink>

                <div className="border-t border-brand-black/5 my-1.5"></div>
                
                <TransitionLink
                  href="/shop"
                  onClick={() => setIsShopOpen(false)}
                  className="px-5 py-2 hover:text-brand-sage transition-colors text-left text-brand-black font-bold"
                >
                  All Products
                </TransitionLink>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* OUR STORY */}
      <TransitionLink
        href="/about"
        className={isActive("/about") ? activeClass : inactiveClass}
      >
        Our Story
      </TransitionLink>

      {/* REVIEWS */}
      <TransitionLink
        href="/patron-voices"
        className={isActive("/patron-voices") ? activeClass : inactiveClass}
      >
        Reviews
      </TransitionLink>

      {/* CONTACT */}
      <TransitionLink
        href="/contact"
        className={isActive("/contact") ? activeClass : inactiveClass}
      >
        Contact
      </TransitionLink>
    </div>
  );
}
