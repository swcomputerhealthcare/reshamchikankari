'use client';

import React, { useState } from "react";
import { Heart } from "lucide-react";
import { useWishlist } from "@/context/wishlist-context";
import { cn } from "@/lib/utils";

interface WishlistButtonProps {
  productId: string;
  initialWishlisted?: boolean;
  className?: string;
}

export default function WishlistButton({ productId, className = "" }: WishlistButtonProps) {
  const { wishlistIds, toggleWishlist } = useWishlist();
  const [isPending, setIsPending] = useState(false);
  
  const wishlisted = wishlistIds.includes(productId);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsPending(true);
    toggleWishlist(productId).finally(() => {
      setIsPending(false);
    });
  };

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={cn(
        "p-2 rounded-full bg-white/70 backdrop-blur-xs hover:bg-white border border-brand-black/5 hover:border-brand-black/25 hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center cursor-pointer",
        className
      )}
      aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart
        className={cn(
          "size-4 transition-all duration-300",
          wishlisted
            ? "fill-brand-pink text-brand-pink scale-110"
            : "text-brand-black/50 hover:text-brand-black"
        )}
        strokeWidth={1.5}
      />
    </button>
  );
}
