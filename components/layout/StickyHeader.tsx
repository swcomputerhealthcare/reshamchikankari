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
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const headerClass = variant === "dark"
    ? cn(
        "sticky top-0 left-0 right-0 z-[100] transition-colors duration-300 h-[72px] min-h-[72px] flex items-center border-b border-white/15 bg-brand-black text-[#FFF9F4]"
      )
    : cn(
        "sticky top-0 left-0 right-0 z-[100] transition-colors duration-300 h-[72px] min-h-[72px] flex items-center border-b border-brand-black/10 bg-[#FFF9F4] text-brand-black"
      );

  return (
    <header className={headerClass}>
      {children}
    </header>
  );
}
