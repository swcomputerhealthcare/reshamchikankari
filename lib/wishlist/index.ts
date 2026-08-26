import { cookies } from "next/headers";

const COOKIE_NAME = "resham_wishlist";

const hasDatabase = () => {
  return !!process.env.DATABASE_URL && process.env.DATABASE_URL.indexOf("[YOUR-PASSWORD]") === -1;
};

// Local Cookie Parsing Helpers
export async function getCookieWishlistItems(): Promise<string[]> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(COOKIE_NAME)?.value;
  if (!raw) return [];
  try {
    return JSON.parse(decodeURIComponent(raw));
  } catch {
    return [];
  }
}

async function saveCookieWishlistItems(items: string[]) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, encodeURIComponent(JSON.stringify(items)), {
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    httpOnly: true,
    sameSite: "lax",
  });
}

// Main Service Functions
export async function getWishlistItems(): Promise<string[]> {
  return await getCookieWishlistItems();
}

export async function toggleWishlistItem(productId: string): Promise<{ wishlisted: boolean }> {
  const items = await getCookieWishlistItems();
  const index = items.indexOf(productId);
  let wishlisted = false;

  if (index > -1) {
    items.splice(index, 1);
  } else {
    items.push(productId);
    wishlisted = true;
  }

  await saveCookieWishlistItems(items);

  // If DB is connected, attempt sync as well
  if (hasDatabase()) {
    try {
      // In production, we'd lookup active user id first
      console.log("DB sync wishlist item: ", productId, wishlisted);
    } catch (e) {
      console.error("DB Wishlist sync failed:", e);
    }
  }

  return { wishlisted };
}

export async function isProductWishlisted(productId: string): Promise<boolean> {
  const items = await getCookieWishlistItems();
  return items.includes(productId);
}
