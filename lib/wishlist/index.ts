import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/auth/helpers";
import { db } from "@/db";
import { wishlists, wishlistItems } from "@/db/schema/wishlist";
import { eq, and } from "drizzle-orm";

const COOKIE_NAME = "resham_wishlist";

const hasDatabase = () => {
  return !!process.env.DATABASE_URL && process.env.DATABASE_URL.indexOf("[YOUR-PASSWORD]") === -1;
};

// Local Cookie Helpers
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
  try {
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, encodeURIComponent(JSON.stringify(items)), {
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      httpOnly: true,
      sameSite: "lax",
    });
  } catch {
    // Ignore error if invoked during Server Component rendering (where cookie modification is disallowed)
  }
}

// Database Wishlist Helpers
async function getDbWishlistItems(userId: string): Promise<string[]> {
  if (!hasDatabase()) return [];
  try {
    const userWishlist = await db
      .select({ id: wishlists.id })
      .from(wishlists)
      .where(eq(wishlists.userId, userId))
      .limit(1);

    if (userWishlist.length === 0) return [];

    const items = await db
      .select({ productId: wishlistItems.productId })
      .from(wishlistItems)
      .where(eq(wishlistItems.wishlistId, userWishlist[0].id));

    return items.map((i) => i.productId);
  } catch (e) {
    console.error("Failed to fetch DB wishlist:", e);
    return [];
  }
}

// Main Public Service Functions
export async function getWishlistItems(): Promise<string[]> {
  const user = await getCurrentUser();
  if (user && hasDatabase()) {
    const dbItems = await getDbWishlistItems(user.id);
    const cookieItems = await getCookieWishlistItems();
    
    // Merge cookie items if any exist
    if (cookieItems.length > 0) {
      const merged = Array.from(new Set([...dbItems, ...cookieItems]));
      await syncWishlistToDb(user.id, merged);
      await saveCookieWishlistItems([]); // clear cookie after merging to DB
      return merged;
    }
    return dbItems;
  }
  return await getCookieWishlistItems();
}

async function syncWishlistToDb(userId: string, productIds: string[]) {
  if (!hasDatabase()) return;
  try {
    let [userWishlist] = await db
      .select({ id: wishlists.id })
      .from(wishlists)
      .where(eq(wishlists.userId, userId))
      .limit(1);

    if (!userWishlist) {
      // Ensure profiles record exists first to satisfy foreign key wishlists_user_id_profiles_id_fk
      try {
        const { profiles } = await import("@/db/schema/auth");
        await db.insert(profiles).values({
          id: userId,
          fullName: "Valued Customer",
          email: `${userId}@user.com`,
          role: "CUSTOMER",
        }).onConflictDoNothing();
      } catch (profileErr) {
        console.warn("Profile auto-insert warning:", profileErr);
      }

      const wishlistId = `wsh_${Math.random().toString(36).substring(2, 11)}`;
      await db.insert(wishlists).values({
        id: wishlistId,
        userId,
      });
      userWishlist = { id: wishlistId };
    }

    for (const productId of productIds) {
      await db
        .insert(wishlistItems)
        .values({
          id: `wi_${Math.random().toString(36).substring(2, 11)}`,
          wishlistId: userWishlist.id,
          productId,
        })
        .onConflictDoNothing();
    }
  } catch (e) {
    console.error("Failed to sync wishlist to DB:", e);
  }
}

export async function toggleWishlistItem(productId: string): Promise<{ wishlisted: boolean }> {
  const user = await getCurrentUser();
  const cookieItems = await getCookieWishlistItems();
  const index = cookieItems.indexOf(productId);
  let wishlisted = false;

  if (index > -1) {
    cookieItems.splice(index, 1);
  } else {
    cookieItems.push(productId);
    wishlisted = true;
  }

  await saveCookieWishlistItems(cookieItems);

  if (user && hasDatabase()) {
    try {
      let [userWishlist] = await db
        .select({ id: wishlists.id })
        .from(wishlists)
        .where(eq(wishlists.userId, user.id))
        .limit(1);

      if (!userWishlist) {
        // Ensure profiles record exists first to satisfy foreign key wishlists_user_id_profiles_id_fk
        try {
          const { profiles } = await import("@/db/schema/auth");
          await db.insert(profiles).values({
            id: user.id,
            fullName: user.name || "Valued Customer",
            email: user.email || `${user.id}@user.com`,
            role: user.role || "CUSTOMER",
          }).onConflictDoNothing();
        } catch (profileErr) {
          console.warn("Profile auto-insert warning:", profileErr);
        }

        const wishlistId = `wsh_${Math.random().toString(36).substring(2, 11)}`;
        await db.insert(wishlists).values({
          id: wishlistId,
          userId: user.id,
        });
        userWishlist = { id: wishlistId };
      }

      if (wishlisted) {
        await db
          .insert(wishlistItems)
          .values({
            id: `wi_${Math.random().toString(36).substring(2, 11)}`,
            wishlistId: userWishlist.id,
            productId,
          })
          .onConflictDoNothing();
      } else {
        await db
          .delete(wishlistItems)
          .where(
            and(
              eq(wishlistItems.wishlistId, userWishlist.id),
              eq(wishlistItems.productId, productId)
            )
          );
      }
    } catch (e) {
      console.error("DB Wishlist toggle error:", e);
    }
  }

  return { wishlisted };
}

export async function isProductWishlisted(productId: string): Promise<boolean> {
  const items = await getWishlistItems();
  return items.includes(productId);
}
