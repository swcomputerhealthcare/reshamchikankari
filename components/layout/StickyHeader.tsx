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
        "fixed top-0 left-0 right-0 z-40 transition-all duration-350 h-20 flex items-center border-b border-white/15 text-[#FFF9F4]",
        isScrolled ? "bg-brand-black/90 backdrop-blur-md shadow-sm border-brand-black/10" : "bg-transparent"
      )
    : cn(
        "sticky top-0 left-0 right-0 z-40 transition-all duration-350 h-20 flex items-center border-b border-brand-black/5 text-brand-black",
        isScrolled ? "bg-[#FFF9F4]/95 backdrop-blur-md shadow-xs" : "bg-[#FFF9F4] bg-opacity-100"
      );

  return (
    <header className={headerClass}>
      {children}
    </header>
  );
}
