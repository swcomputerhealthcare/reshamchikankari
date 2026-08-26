'use client';

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

export default function HeaderNavigation() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex items-center gap-8 text-[11px] uppercase tracking-widest font-medium font-sans relative">
      <Link href="/" className="hover:text-brand-pink transition-colors duration-200">
        Home
      </Link>

      <div
        className="relative py-2"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        <button
          className="hover:text-brand-pink transition-colors duration-200 flex items-center gap-1 uppercase tracking-widest cursor-pointer font-medium"
        >
          Shop <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute left-0 mt-2 w-52 bg-brand-offwhite border border-brand-black/10 shadow-sm py-3 rounded-none z-50 normal-case"
            >
              <div className="flex flex-col text-[11px] uppercase tracking-wider font-medium font-sans">
                <Link
                  href="/shop/kurtis-kurtas"
                  onClick={() => setIsOpen(false)}
                  className="px-5 py-2.5 hover:bg-brand-black/5 hover:text-brand-pink transition-colors text-left"
                >
                  Kurtis & Kurtas
                </Link>
                <Link
                  href="/shop/coord-sets"
                  onClick={() => setIsOpen(false)}
                  className="px-5 py-2.5 hover:bg-brand-black/5 hover:text-brand-pink transition-colors text-left"
                >
                  Co-ord Sets
                </Link>
                <Link
                  href="/shop/bottom-wear"
                  onClick={() => setIsOpen(false)}
                  className="px-5 py-2.5 hover:bg-brand-black/5 hover:text-brand-pink transition-colors text-left"
                >
                  Bottom Wear
                </Link>
                <div className="border-t border-brand-black/5 my-1"></div>
                <Link
                  href="/shop"
                  onClick={() => setIsOpen(false)}
                  className="px-5 py-2.5 hover:bg-brand-black/5 hover:text-brand-pink transition-colors text-left text-neutral-400 font-semibold"
                >
                  All Products
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Link href="/about" className="hover:text-brand-pink transition-colors duration-200">
        Our Story
      </Link>
    </div>
  );
}
