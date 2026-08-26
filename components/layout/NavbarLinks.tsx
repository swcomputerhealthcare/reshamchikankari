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
    return pathname.startsWith(route);
  };

  return (
    <div className="flex items-center gap-8 text-[11px] uppercase tracking-widest font-medium font-sans relative">
      {/* HOME */}
      <TransitionLink
        href="/"
        className={`hover:text-brand-pink transition-colors duration-200 ${
          isActive("/") 
            ? "text-brand-pink font-bold border-b border-brand-pink/30 pb-1" 
            : `nav-link-underline ${variant === "dark" ? "text-[#FFF9F4]" : "text-brand-black"}`
        }`}
      >
        Home
      </TransitionLink>

      {/* SHOP WITH DROPDOWN */}
      <div
        className="relative py-2"
        onMouseEnter={() => setIsShopOpen(true)}
        onMouseLeave={() => setIsShopOpen(false)}
      >
        <button
          className={`hover:text-brand-pink transition-colors duration-200 flex items-center gap-1 uppercase tracking-widest cursor-pointer font-medium border-none bg-transparent p-0 ${
            isActive("/shop") 
              ? "text-brand-pink font-bold" 
              : `nav-link-underline ${variant === "dark" ? "text-[#FFF9F4]" : "text-brand-black"}`
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
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute left-0 mt-2 w-56 bg-[#FFF9F4] border border-brand-black/10 shadow-md py-4 z-50 normal-case rounded-xl"
            >
              {/* Dropdown Layout */}
              <div className="flex flex-col text-[10px] uppercase tracking-wider font-semibold font-sans">
                <span className="px-5 py-1 text-[9px] text-[#3F5031] tracking-widest font-bold block mb-1">
                  Collections
                </span>
                
                <TransitionLink
                  href="/shop/everyday-cotton"
                  onClick={() => setIsShopOpen(false)}
                  className="px-5 py-2.5 hover:bg-brand-black/5 hover:text-brand-pink transition-colors text-left text-neutral-600"
                >
                  Everyday Cotton
                </TransitionLink>
                <TransitionLink
                  href="/shop/festive-georgette"
                  onClick={() => setIsShopOpen(false)}
                  className="px-5 py-2.5 hover:bg-brand-black/5 hover:text-brand-pink transition-colors text-left text-neutral-600"
                >
                  Festive Georgette
                </TransitionLink>
                <TransitionLink
                  href="/shop/the-pastel-edit"
                  onClick={() => setIsShopOpen(false)}
                  className="px-5 py-2.5 hover:bg-brand-black/5 hover:text-brand-pink transition-colors text-left text-neutral-600"
                >
                  The Pastel Edit
                </TransitionLink>

                <div className="border-t border-brand-black/5 my-2"></div>
                
                <TransitionLink
                  href="/shop"
                  onClick={() => setIsShopOpen(false)}
                  className="px-5 py-2 hover:text-brand-pink transition-colors text-left text-brand-black font-bold"
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
        className={`hover:text-brand-pink transition-colors duration-200 ${
          isActive("/about") 
            ? "text-brand-pink font-bold border-b border-brand-pink/30 pb-1" 
            : `nav-link-underline ${variant === "dark" ? "text-[#FFF9F4]" : "text-brand-black"}`
        }`}
      >
        Our Story
      </TransitionLink>

      {/* PATRON VOICES */}
      <TransitionLink
        href="/patron-voices"
        className={`hover:text-brand-pink transition-colors duration-200 ${
          isActive("/patron-voices") 
            ? "text-brand-pink font-bold border-b border-brand-pink/30 pb-1" 
            : `nav-link-underline ${variant === "dark" ? "text-[#FFF9F4]" : "text-brand-black"}`
        }`}
      >
        Patron Voices
      </TransitionLink>

      {/* CONTACT */}
      <TransitionLink
        href="/contact"
        className={`hover:text-brand-pink transition-colors duration-200 ${
          isActive("/contact") 
            ? "text-brand-pink font-bold border-b border-brand-pink/30 pb-1" 
            : `nav-link-underline ${variant === "dark" ? "text-[#FFF9F4]" : "text-brand-black"}`
        }`}
      >
        Contact
      </TransitionLink>
    </div>
  );
}
