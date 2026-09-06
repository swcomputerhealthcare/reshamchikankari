'use client';

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface StickyHeaderProps {
  children: React.ReactNode;
  variant?: "default" | "dark";
}

export default function StickyHeader({ children, variant = "default" }: StickyHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const shouldScroll = window.scrollY > 20;
      setIsScrolled((prev) => (shouldScroll !== prev ? shouldScroll : prev));
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const headerClass = variant === "dark"
    ? cn(
        "w-full transition-colors duration-300 h-[72px] min-h-[72px] flex items-center border-b border-white/15 bg-brand-black text-[#FFF9F4]",
        isScrolled && "shadow-sm"
      )
    : cn(
        "w-full transition-colors duration-300 h-[72px] min-h-[72px] flex items-center border-b border-brand-black/10 bg-[#FFF9F4] text-brand-black",
        isScrolled && "shadow-sm"
      );

  return (
    <header className={headerClass}>
      {children}
    </header>
  );
}
