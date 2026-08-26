"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCartDetails, addToCart, updateCartItemQuantity, removeCartItem, clearCart } from "@/lib/cart";
import { MOCK_PRODUCTS } from "@/lib/catalog";
import { db } from "@/db";
import { products, productVariants } from "@/db/schema/catalog";
import { eq } from "drizzle-orm";

const quantitySchema = z.number()
  .int("Quantity must be a whole number")
  .min(1, "Quantity must be at least 1")
  .max(10, "Quantity cannot exceed 10 items per order");

const hasDatabase = () => {
  return !!process.env.DATABASE_URL && process.env.DATABASE_URL.indexOf("[YOUR-PASSWORD]") === -1;
};

export async function addToCartAction(productId: string, variantId: string | null, quantity: number) {
  // 1. Validate quantity using Zod (catches NaN, Infinity, decimals, negatives, limits)
  const qtyParsed = quantitySchema.safeParse(quantity);
  if (!qtyParsed.success) {
    return { success: false, error: qtyParsed.error.issues[0].message };
  }

  const validatedQty = qtyParsed.data;

  // 2. Validate product & stock
  let stockAvailable = 10;
  let isActive = true;

  if (hasDatabase()) {
    try {
      const prodResult = await db.select().from(products).where(eq(products.id, productId)).limit(1);
      const prod = prodResult[0];
      if (!prod) return { success: false, error: "Product not found" };
      isActive = prod.isActive;

      if (variantId) {
        const varResult = await db.select().from(productVariants).where(eq(productVariants.id, variantId)).limit(1);
        const variant = varResult[0];
        if (!variant) return { success: false, error: "Size variant not found" };
        isActive = isActive && variant.isActive;
        stockAvailable = variant.stock;
      }
    } catch (e) {
      console.error("DB check failed during add to cart:", e);
    }
  } else {
    // Offline Mock lookup
    const prod = MOCK_PRODUCTS.find(p => p.id === productId);
    if (!prod) return { success: false, error: "Product not found" };
    isActive = prod.isActive;

    if (variantId) {
      const variant = prod.variants.find(v => v.id === variantId);
      if (!variant) return { success: false, error: "Variant not found" };
      isActive = isActive && variant.isActive;
      stockAvailable = variant.stock;
    }
  }

  if (!isActive) {
    return { success: false, error: "This item is currently unavailable" };
  }

  if (stockAvailable < validatedQty) {
    return { success: false, error: `Only ${stockAvailable} items available in stock` };
  }

  // 3. Perform addition
  await addToCart(productId, variantId, validatedQty);

  return { success: true };
}

export async function updateCartItemQtyAction(itemId: string, quantity: number) {
  const qtyParsed = quantitySchema.safeParse(quantity);
  if (!qtyParsed.success) {
    return { success: false, error: qtyParsed.error.issues[0].message };
  }

  const validatedQty = qtyParsed.data;

  // Check stock of this cart item
  const { items } = await getCartDetails();
  const cartItem = items.find(item => item.id === itemId);
  if (!cartItem) {
    return { success: false, error: "Item not found in cart" };
  }

  if (cartItem.stock < validatedQty) {
    return { success: false, error: `Only ${cartItem.stock} items available in stock` };
  }

  const success = await updateCartItemQuantity(itemId, validatedQty);

  if (success) {
    return { success: true };
  }
  return { success: false, error: "Failed to update quantity" };
}

export async function removeFromCartAction(itemId: string) {
  const success = await removeCartItem(itemId);
  if (success) {
    return { success: true };
  }
  return { success: false, error: "Failed to remove item" };
}

export async function clearCartAction() {
  await clearCart();
  return { success: true };
}
