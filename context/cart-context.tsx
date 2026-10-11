'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, useTransition } from "react";
import { addToCartAction, removeFromCartAction, updateCartItemQtyAction, clearCartAction } from "@/actions/cart";
import { applyCouponAction, removeCouponAction } from "@/actions/coupon";
import { calculateProductPrice } from "@/lib/promotions";

export interface CartItem {
  id: string;
  productId: string;
  variantId: string | null;
  quantity: number;
  name: string;
  slug: string;
  sku: string;
  pricePaise: number; // Current selling price (Navratri price if active, canonical otherwise)
  canonicalPricePaise?: number; // Pre-campaign canonical price
  navratriDiscountPaise?: number; // Navratri discount per unit
  image: string;
  sizeName?: string;
  colorName?: string;
  colorCode?: string;
  variantLabel?: string;
  stock: number;
}

export interface Cart {
  items: CartItem[];
  canonicalSubtotalPaise?: number;
  navratriDiscountPaise?: number;
  subtotalPaise: number; // Discounted product subtotal after Navratri
  appliedCouponCode?: string;
  discountPaise: number;
  finalSubtotalPaise?: number;
  isNavratriActive?: boolean;
}

interface CartContextType {
  cart: Cart;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isUpdating: boolean;
  addItemOptimistic: (product: any, variantId: string | null, quantity: number) => Promise<{ success: boolean; error?: string }>;
  updateQtyOptimistic: (itemId: string, currentQty: number, delta: number) => Promise<{ success: boolean; error?: string }>;
  removeItemOptimistic: (itemId: string) => Promise<{ success: boolean; error?: string }>;
  clearCartOptimistic: () => Promise<{ success: boolean; error?: string }>;
  applyCouponOptimistic: (code: string) => Promise<{ success: boolean; error?: string }>;
  removeCouponOptimistic: () => Promise<{ success: boolean; error?: string }>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const calculateSubtotal = (items: CartItem[]) => {
  return items.reduce((sum, item) => sum + item.pricePaise * item.quantity, 0);
};

export function CartProvider({
  children,
  initialCart,
}: {
  children: React.ReactNode;
  initialCart: {
    items: CartItem[];
    canonicalSubtotalPaise?: number;
    navratriDiscountPaise?: number;
    subtotalPaise: number;
    appliedCouponCode?: string;
    discountPaise?: number;
    finalSubtotalPaise?: number;
    isNavratriActive?: boolean;
  };
}) {
  const [cart, setCart] = useState<Cart>(() => ({
    items: initialCart.items || [],
    canonicalSubtotalPaise: initialCart.canonicalSubtotalPaise,
    navratriDiscountPaise: initialCart.navratriDiscountPaise,
    subtotalPaise: initialCart.subtotalPaise || 0,
    appliedCouponCode: initialCart.appliedCouponCode,
    discountPaise: initialCart.discountPaise || 0,
    finalSubtotalPaise: initialCart.finalSubtotalPaise,
    isNavratriActive: initialCart.isNavratriActive,
  }));
  const [isOpen, setIsOpen] = useState(false);
  const [, startTransition] = useTransition();
  const [isUpdating] = useState(false);

  // Sync state if initialCart changes on hard reload or navigate
  useEffect(() => {
    setCart({
      items: initialCart.items || [],
      canonicalSubtotalPaise: initialCart.canonicalSubtotalPaise,
      navratriDiscountPaise: initialCart.navratriDiscountPaise,
      subtotalPaise: initialCart.subtotalPaise || 0,
      appliedCouponCode: initialCart.appliedCouponCode,
      discountPaise: initialCart.discountPaise || 0,
      finalSubtotalPaise: initialCart.finalSubtotalPaise,
      isNavratriActive: initialCart.isNavratriActive,
    });
  }, [initialCart]);

  // Silently sync the client state with the server DB
  const syncWithServer = useCallback(async () => {
    try {
      const res = await fetch("/api/cart");
      if (res.ok) {
        const freshCart = await res.json();
        setCart(freshCart);
      }
    } catch (err) {
      console.error("Failed to sync cart with server:", err);
    }
  }, []);

  const addItemOptimistic = useCallback(async (
    product: any,
    variantId: string | null,
    quantity: number
  ) => {
    const previousCart = { ...cart };

    // Find size and stock details
    const variant = product.variants?.find((v: any) => v.id === variantId);
    const sizeName = variant?.size || variant?.name;
    const colorName = variant?.colorName;
    const colorCode = variant?.colorCode;
    const variantLabel = [colorName, sizeName].filter(Boolean).join(" · ") || variant?.name;
    const stock = variant?.stock ?? 10;

    // Use authoritative pricing calculation
    const rawCanonicalPrice = variant?.pricePaise ?? product.pricePaise ?? 0;
    const priceBreakdown = calculateProductPrice(rawCanonicalPrice);

    const updatedItems = [...cart.items];
    const existingIndex = updatedItems.findIndex(
      (item) => item.productId === product.id && item.variantId === variantId
    );

    if (existingIndex > -1) {
      updatedItems[existingIndex] = {
        ...updatedItems[existingIndex],
        quantity: Math.min(updatedItems[existingIndex].quantity + quantity, stock),
        pricePaise: priceBreakdown.sellingPricePaise,
        canonicalPricePaise: priceBreakdown.canonicalPricePaise,
        navratriDiscountPaise: priceBreakdown.navratriDiscountPaise,
      };
    } else {
      updatedItems.push({
        id: `temp_${Date.now()}`,
        productId: product.id,
        variantId: variantId,
        quantity,
        name: product.name,
        slug: product.slug,
        sku: variant?.sku || product.sku || `RC-${product.id.slice(-4).toUpperCase()}`,
        pricePaise: priceBreakdown.sellingPricePaise,
        canonicalPricePaise: priceBreakdown.canonicalPricePaise,
        navratriDiscountPaise: priceBreakdown.navratriDiscountPaise,
        image: product.images?.[0]?.url || "/images/chikankari_hero.png",
        sizeName,
        colorName,
        colorCode,
        variantLabel,
        stock,
      });
    }

    const nextSubtotal = calculateSubtotal(updatedItems);
    const nextCanonicalSubtotal = updatedItems.reduce(
      (sum, item) => sum + (item.canonicalPricePaise || item.pricePaise) * item.quantity,
      0
    );
    const nextNavratriDiscount = updatedItems.reduce(
      (sum, item) => sum + (item.navratriDiscountPaise || 0) * item.quantity,
      0
    );

    const nextCart: Cart = {
      ...cart,
      items: updatedItems,
      canonicalSubtotalPaise: nextCanonicalSubtotal,
      navratriDiscountPaise: nextNavratriDiscount,
      subtotalPaise: nextSubtotal,
      finalSubtotalPaise: Math.max(0, nextSubtotal - (cart.discountPaise || 0)),
    };

    // Optimistic Update
    setCart(nextCart);
    setIsOpen(true); // Open drawer instantly on add!

    try {
      const res = await addToCartAction(product.id, variantId, quantity);
      if (!res.success) {
        throw new Error(res.error || "Failed to add product");
      }
      // Silently sync correct DB IDs in background
      await syncWithServer();
      return { success: true };
    } catch (err: any) {
      // Rollback
      setCart(previousCart);
      return { success: false, error: err.message || "Failed to add to bag" };
    }
  }, [cart, syncWithServer]);

  const updateQtyOptimistic = useCallback(async (
    itemId: string,
    currentQty: number,
    delta: number
  ) => {
    const previousCart = { ...cart };

    const updatedItems = cart.items.map((item) => {
      if (item.id === itemId) {
        const nextQty = Math.max(1, Math.min(item.quantity + delta, item.stock));
        return { ...item, quantity: nextQty };
      }
      return item;
    });

    const nextSubtotal = calculateSubtotal(updatedItems);
    const nextCanonicalSubtotal = updatedItems.reduce(
      (sum, item) => sum + (item.canonicalPricePaise || item.pricePaise) * item.quantity,
      0
    );
    const nextNavratriDiscount = updatedItems.reduce(
      (sum, item) => sum + (item.navratriDiscountPaise || 0) * item.quantity,
      0
    );

    const nextCart: Cart = {
      ...cart,
      items: updatedItems,
      canonicalSubtotalPaise: nextCanonicalSubtotal,
      navratriDiscountPaise: nextNavratriDiscount,
      subtotalPaise: nextSubtotal,
      finalSubtotalPaise: Math.max(0, nextSubtotal - (cart.discountPaise || 0)),
    };

    // Optimistic Update
    setCart(nextCart);

    try {
      const targetItem = updatedItems.find((item) => item.id === itemId);
      if (!targetItem) throw new Error("Item not found");
      
      const res = await updateCartItemQtyAction(itemId, targetItem.quantity);
      if (!res.success) {
        throw new Error(res.error || "Failed to update quantity");
      }
      await syncWithServer();
      return { success: true };
    } catch (err: any) {
      // Rollback
      setCart(previousCart);
      return { success: false, error: err.message || "Failed to update quantity" };
    }
  }, [cart, syncWithServer]);

  const removeItemOptimistic = useCallback(async (itemId: string) => {
    const previousCart = { ...cart };

    const updatedItems = cart.items.filter((item) => item.id !== itemId);
    const nextSubtotal = calculateSubtotal(updatedItems);
    const nextCanonicalSubtotal = updatedItems.reduce(
      (sum, item) => sum + (item.canonicalPricePaise || item.pricePaise) * item.quantity,
      0
    );
    const nextNavratriDiscount = updatedItems.reduce(
      (sum, item) => sum + (item.navratriDiscountPaise || 0) * item.quantity,
      0
    );

    const nextCart: Cart = {
      ...cart,
      items: updatedItems,
      canonicalSubtotalPaise: nextCanonicalSubtotal,
      navratriDiscountPaise: nextNavratriDiscount,
      subtotalPaise: nextSubtotal,
      finalSubtotalPaise: Math.max(0, nextSubtotal - (cart.discountPaise || 0)),
    };

    // Optimistic Update
    setCart(nextCart);

    try {
      const res = await removeFromCartAction(itemId);
      if (!res.success) {
        throw new Error(res.error || "Failed to remove item");
      }
      await syncWithServer();
      return { success: true };
    } catch (err: any) {
      // Rollback
      setCart(previousCart);
      return { success: false, error: err.message || "Failed to remove item" };
    }
  }, [cart, syncWithServer]);

  const clearCartOptimistic = useCallback(async () => {
    const previousCart = { ...cart };

    setCart({
      items: [],
      canonicalSubtotalPaise: 0,
      navratriDiscountPaise: 0,
      subtotalPaise: 0,
      appliedCouponCode: undefined,
      discountPaise: 0,
      finalSubtotalPaise: 0,
    });

    try {
      const res = await clearCartAction();
      if (!res.success) {
        throw new Error("Failed to clear cart");
      }
      return { success: true };
    } catch (err: any) {
      // Rollback
      setCart(previousCart);
      return { success: false, error: err.message || "Failed to clear bag" };
    }
  }, [cart]);

  const applyCouponOptimistic = useCallback(async (code: string) => {
    const previousCart = { ...cart };

    try {
      const res = await applyCouponAction(code, cart.subtotalPaise);
      if (res.success) {
        setCart((prev) => ({
          ...prev,
          appliedCouponCode: res.code || code.toUpperCase(),
          discountPaise: res.discountPaise || 0,
          finalSubtotalPaise: Math.max(0, prev.subtotalPaise - (res.discountPaise || 0)),
        }));
        return { success: true };
      } else {
        throw new Error(res.error || "Failed to apply coupon");
      }
    } catch (err: any) {
      setCart(previousCart);
      return { success: false, error: err.message };
    }
  }, [cart]);

  const removeCouponOptimistic = useCallback(async () => {
    const previousCart = { ...cart };

    setCart((prev) => ({
      ...prev,
      appliedCouponCode: undefined,
      discountPaise: 0,
      finalSubtotalPaise: prev.subtotalPaise,
    }));

    try {
      const res = await removeCouponAction();
      if (!res.success) {
        throw new Error("Failed to remove coupon");
      }
      return { success: true };
    } catch (err: any) {
      // Rollback
      setCart(previousCart);
      return { success: false, error: err.message || "Failed to remove coupon" };
    }
  }, [cart]);

  return (
    <CartContext.Provider
      value={{
        cart,
        isOpen,
        setIsOpen,
        isUpdating,
        addItemOptimistic,
        updateQtyOptimistic,
        removeItemOptimistic,
        clearCartOptimistic,
        applyCouponOptimistic,
        removeCouponOptimistic,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
