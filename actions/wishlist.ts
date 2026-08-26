"use server";

import { revalidatePath } from "next/cache";
import { toggleWishlistItem } from "@/lib/wishlist";

export async function toggleWishlistAction(productId: string) {
  const result = await toggleWishlistItem(productId);
  return { success: true, wishlisted: result.wishlisted };
}
