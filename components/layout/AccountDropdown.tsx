"use client";

import React, { useState, useEffect, useRef, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  image?: string | null;
  createdAt?: string | Date;
}

interface AccountDropdownProps {
  user: User | null;
  variant?: "default" | "dark";
}

export default function AccountDropdown({ user, variant = "default" }: AccountDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  // Close dropdown on click outside or Escape key
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

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

  if (!user) {
    return (
      <Link
        href="/login"
        className={`hover:text-brand-pink transition-colors duration-200 text-[11px] uppercase tracking-widest font-medium font-sans ${
          pathname === "/login" ? "text-brand-pink font-bold" : (variant === "dark" ? "text-[#FFF9F4]" : "text-brand-black")
        }`}
      >
        Account
      </Link>
    );
  }

  const displayName = user.name || user.email;
  const initial = (user.name || user.email || "U").charAt(0).toUpperCase();
  const isActive = pathname.startsWith("/account");

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="User Account Menu"
        className={`hover:opacity-85 transition-all duration-200 flex items-center gap-1.5 cursor-pointer select-none border-none bg-transparent p-0.5 rounded-full ${
          isActive ? "ring-2 ring-brand-pink/50" : ""
        }`}
      >
        {user.image ? (
          <div className="relative w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-full overflow-hidden border border-brand-black/15 shadow-2xs">
            <Image
              src={user.image}
              alt={displayName}
              fill
              sizes="30px"
              className="object-cover"
            />
          </div>
        ) : (
          <div className="w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-full bg-brand-black text-brand-offwhite flex items-center justify-center font-bold text-xs border border-brand-black/15 shadow-2xs font-display">
            {initial}
          </div>
        )}
        <span className={`text-[8px] transition-transform duration-200 select-none ${variant === "dark" ? "text-brand-offwhite/60" : "text-neutral-400"}`}>
          {isOpen ? "▲" : "▼"}
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute right-0 mt-3.5 w-60 bg-[#FFF9F4] border border-brand-black/10 shadow-lg rounded-xl py-4 z-50 focus:outline-none origin-top-right"
          >
          {/* Header */}
          <div className="px-5 pb-3 border-b border-brand-black/5 flex items-center gap-3">
            {user.image ? (
              <div className="relative w-9 h-9 rounded-full overflow-hidden border border-brand-black/15 shrink-0">
                <Image
                  src={user.image}
                  alt={displayName}
                  fill
                  sizes="36px"
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-9 h-9 rounded-full bg-brand-black text-brand-offwhite flex items-center justify-center font-bold text-sm shrink-0 font-display">
                {initial}
              </div>
            )}
            <div className="overflow-hidden">
              <h4 className="font-display text-sm text-brand-black truncate">
                {displayName}
              </h4>
              <p className="font-sans text-[10px] text-neutral-400 truncate mt-0.5">
                {user.email}
              </p>
            </div>
          </div>

          {/* Menu Items */}
          <div className="px-2 pt-2 space-y-0.5 font-sans text-xs tracking-wider uppercase font-medium">
            <Link
              href="/account"
              className="block px-3 py-2.5 text-neutral-600 hover:text-brand-pink hover:bg-brand-black/5 transition-colors"
            >
              My Account
            </Link>
            <Link
              href="/account/orders"
              className="block px-3 py-2.5 text-neutral-600 hover:text-brand-pink hover:bg-brand-black/5 transition-colors"
            >
              My Orders
            </Link>
            <Link
              href="/account/wishlist"
              className="block px-3 py-2.5 text-neutral-600 hover:text-brand-pink hover:bg-brand-black/5 transition-colors"
            >
              My Wishlist
            </Link>
            <Link
              href="/account/wallet"
              className="block px-3 py-2.5 text-neutral-600 hover:text-brand-pink hover:bg-brand-black/5 transition-colors"
            >
              My Wallet
            </Link>
          </div>

          {/* Footer / Logout */}
          <div className="px-2 mt-2 pt-2 border-t border-brand-black/5">
            <button
              onClick={handleLogout}
              disabled={isPending}
              className="w-full text-left block px-3 py-2.5 font-sans text-xs tracking-wider uppercase font-bold text-red-600 hover:bg-red-50 transition-colors border-none bg-transparent cursor-pointer disabled:opacity-50"
            >
              {isPending ? "Logging out..." : "Log out"}
            </button>
          </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
