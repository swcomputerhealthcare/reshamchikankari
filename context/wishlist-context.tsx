'use client';

import React, { createContext, useContext, useState } from "react";
import { toggleWishlistAction } from "@/actions/wishlist";

interface WishlistContextType {
  wishlistIds: string[];
  toggleWishlist: (productId: string) => Promise<{ success: boolean; wishlisted: boolean }>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({
  children,
  initialWishlistIds,
}: {
  children: React.ReactNode;
  initialWishlistIds: string[];
}) {
  const [wishlistIds, setWishlistIds] = useState<string[]>(initialWishlistIds);

  const toggleWishlist = async (productId: string) => {
    const isCurrentlyWishlisted = wishlistIds.includes(productId);
    
    // Optimistic toggle
    setWishlistIds((prev) =>
      isCurrentlyWishlisted
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );

    try {
      const res = await toggleWishlistAction(productId);
      if (res.success) {
        // Ensure client is in sync with server response
        setWishlistIds((prev) => {
          const exists = prev.includes(productId);
          if (res.wishlisted && !exists) return [...prev, productId];
          if (!res.wishlisted && exists) return prev.filter((id) => id !== productId);
          return prev;
        });
        return res;
      } else {
        // Revert on failure
        setWishlistIds((prev) =>
          isCurrentlyWishlisted ? [...prev, productId] : prev.filter((id) => id !== productId)
        );
        return { success: false, wishlisted: isCurrentlyWishlisted };
      }
    } catch (err) {
      // Revert on error
      setWishlistIds((prev) =>
        isCurrentlyWishlisted ? [...prev, productId] : prev.filter((id) => id !== productId)
      );
      return { success: false, wishlisted: isCurrentlyWishlisted };
    }
  };

  return (
    <WishlistContext.Provider value={{ wishlistIds, toggleWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
