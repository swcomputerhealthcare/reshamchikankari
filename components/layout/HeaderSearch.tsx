"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";

export default function HeaderSearch({ variant = "default" }: { variant?: "default" | "dark" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Debounce the query state to prevent excessive route prefetching
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  // Prefetch search page with query parameters on debounced changes
  useEffect(() => {
    if (debouncedQuery.trim()) {
      router.prefetch(`/search?q=${encodeURIComponent(debouncedQuery.trim())}`);
    }
  }, [debouncedQuery, router]);

  // Handle keyboard events (Escape to close)
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsOpen(false);
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <>
      {/* Search trigger icon */}
      <button
        onClick={() => setIsOpen(true)}
        className={`hover:text-brand-pink transition-colors text-[11px] uppercase tracking-widest font-medium font-sans flex items-center gap-1.5 cursor-pointer border-none bg-transparent p-0 ${
          variant === "dark" ? "text-[#FFF9F4]" : "text-brand-black"
        }`}
        aria-label="Open Search"
      >
        <Search className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Search</span>
      </button>

      {/* Slide-down Search Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed inset-0 bg-brand-black/20 backdrop-blur-xs z-55 flex flex-col justify-start"
          >
            <motion.div
              ref={overlayRef}
              initial={{ y: -15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -15, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="w-full bg-[#FFF9F4] border-b border-brand-black/5 px-6 py-8 sm:py-12 shadow-md"
            >
            <div className="max-w-3xl mx-auto flex items-center justify-between gap-6">
              {/* Form */}
              <form onSubmit={handleSubmit} className="flex-1 flex items-center border-b border-brand-black/20 py-2">
                <Search className="w-5 h-5 text-neutral-400 mr-3 flex-shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by product, category, or fabric..."
                  className="w-full bg-transparent border-none focus:outline-none font-sans text-base text-brand-black placeholder-neutral-400"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="p-1 text-neutral-400 hover:text-brand-black cursor-pointer bg-transparent border-none"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </form>

              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="text-neutral-400 hover:text-brand-black transition-colors cursor-pointer p-2 border-none bg-transparent"
                aria-label="Close Search"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="max-w-3xl mx-auto mt-4 px-8 text-left">
              <span className="text-[9px] uppercase tracking-widest text-[#3F5031] font-bold block mb-1">
                Popular Searches
              </span>
              <div className="flex flex-wrap gap-2 pt-1 font-sans text-[10px] uppercase tracking-wider font-semibold">
                <button
                  onClick={() => {
                    setQuery("Cotton");
                    inputRef.current?.focus();
                  }}
                  className="px-3 py-1 bg-brand-black/5 hover:bg-[#3F5031]/10 text-neutral-600 hover:text-[#3F5031] transition-colors cursor-pointer border-none rounded-none"
                >
                  Cotton
                </button>
                <button
                  onClick={() => {
                    setQuery("Georgette");
                    inputRef.current?.focus();
                  }}
                  className="px-3 py-1 bg-brand-black/5 hover:bg-[#3F5031]/10 text-neutral-600 hover:text-[#3F5031] transition-colors cursor-pointer border-none rounded-none"
                >
                  Georgette
                </button>
                <button
                  onClick={() => {
                    setQuery("Pastel");
                    inputRef.current?.focus();
                  }}
                  className="px-3 py-1 bg-brand-black/5 hover:bg-[#3F5031]/10 text-neutral-600 hover:text-[#3F5031] transition-colors cursor-pointer border-none rounded-none"
                >
                  Pastel
                </button>
              </div>
            </div>
            </motion.div>

            {/* Click outside to close area */}
            <div className="flex-1 w-full cursor-pointer" onClick={() => setIsOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
