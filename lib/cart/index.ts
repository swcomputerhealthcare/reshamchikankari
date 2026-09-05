import { cookies } from "next/headers";
import { db } from "@/db";
import { products, productVariants, productImages } from "@/db/schema/catalog";
import { inArray } from "drizzle-orm";
import { MOCK_PRODUCTS } from "@/lib/catalog";
import { validateCouponCode } from "@/lib/coupon";

export interface CartItemDetail {
  id: string;
  productId: string;
  variantId: string | null;
  quantity: number;
  name: string;
  slug: string;
  sku: string;
  pricePaise: number;
  image: string;
  sizeName?: string;
  colorName?: string;
  colorCode?: string;
  variantLabel?: string;
  stock: number;
}

export interface CartDetails {
  items: CartItemDetail[];
  subtotalPaise: number;
  appliedCouponCode?: string;
  discountPaise: number;
}

const COOKIE_NAME = "resham_cart";

const hasDatabase = () => {
  return !!process.env.DATABASE_URL && process.env.DATABASE_URL.indexOf("[YOUR-PASSWORD]") === -1;
};

// Local Cookie Parsing Helpers
async function getCookieCartItems(): Promise<{ id: string; productId: string; variantId: string | null; quantity: number }[]> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(COOKIE_NAME)?.value;
  if (!raw) return [];
  try {
    let decoded = raw;
    while (typeof decoded === "string" && decoded.includes("%")) {
      try {
        const next = decodeURIComponent(decoded);
        if (next === decoded) break;
        decoded = next;
      } catch {
        break;
      }
    }
    const parsed = JSON.parse(decoded);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn("Failed to parse cart cookie:", err);
    return [];
  }
}

async function saveCookieCartItems(items: { id: string; productId: string; variantId: string | null; quantity: number }[]) {
  try {
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, JSON.stringify(items), {
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      httpOnly: true,
      sameSite: "lax",
    });
  } catch {
    // Ignore error if invoked during Server Component rendering (where cookie modification is disallowed)
  }
}

// Main Service Functions
export async function getCartDetails(): Promise<CartDetails> {
  const localItems = await getCookieCartItems();
  let resolvedItems: CartItemDetail[] = [];
  let subtotal = 0;

  if (!hasDatabase()) {
    // Resolve products from offline mock catalog
    for (const item of localItems) {
      const prod = MOCK_PRODUCTS.find(p => p.id === item.productId);
      if (!prod) continue;

      const variant = prod.variants.find(v => v.id === item.variantId);
      const price = variant ? (variant.pricePaise ?? 0) : (prod.pricePaise ?? 0);
      const stock = variant ? variant.stock : 10;
      const sizeName = variant ? (variant.size || variant.name) : undefined;
      const colorName = variant ? (variant.colorName || undefined) : undefined;
      const colorCode = variant ? (variant.colorCode || undefined) : undefined;
      const image = prod.images[0]?.url || "/images/chikankari_hero.png";

      const variantLabel = [colorName, sizeName].filter(Boolean).join(" · ") || variant?.name;

      resolvedItems.push({
        id: item.id,
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        name: prod.name,
        slug: prod.slug,
        sku: variant?.sku || prod.sku,
        pricePaise: price,
        image,
        sizeName,
        colorName,
        colorCode,
        variantLabel,
        stock,
      });

      subtotal += price * item.quantity;
    }
  } else {
    try {
      if (localItems.length > 0) {
        const productIds = Array.from(new Set(localItems.map(item => item.productId)));
        const variantIds = Array.from(new Set(localItems.map(item => item.variantId).filter(Boolean))) as string[];

        // Fetch all required products, variants, and images in parallel batches (max 3 database hits total)
        const [dbProducts, dbVariants, dbImages] = await Promise.all([
          db.select().from(products).where(inArray(products.id, productIds)),
          variantIds.length > 0 ? db.select().from(productVariants).where(inArray(productVariants.id, variantIds)) : Promise.resolve([]),
          db.select().from(productImages).where(inArray(productImages.productId, productIds)),
        ]);

        for (const item of localItems) {
          const prod = dbProducts.find(p => p.id === item.productId);
          if (!prod || !prod.isActive) continue;

          let variantName = "";
          let colorName: string | undefined = undefined;
          let colorCode: string | undefined = undefined;
          let sizeName: string | undefined = undefined;
          let price = prod.pricePaise ?? 0;
          let stock = 10;
          let sku = prod.sku;

          if (item.variantId) {
            const variant = dbVariants.find(v => v.id === item.variantId);
            if (variant && variant.isActive) {
              variantName = variant.name;
              colorName = variant.colorName || undefined;
              colorCode = variant.colorCode || undefined;
              sizeName = variant.size || variant.name || undefined;
              price = variant.pricePaise ?? 0;
              stock = variant.stock;
              sku = variant.sku;
            }
          }

          // Find first product image
          const image = dbImages.find(img => img.productId === prod.id)?.url || "/images/chikankari_hero.png";
          const variantLabel = [colorName, sizeName].filter(Boolean).join(" · ") || variantName;

          resolvedItems.push({
            id: item.id,
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            name: prod.name,
            slug: prod.slug,
            sku,
            pricePaise: price,
            image,
            sizeName: sizeName || variantName || undefined,
            colorName,
            colorCode,
            variantLabel,
            stock,
          });

          subtotal += price * item.quantity;
        }
      }
    } catch (error) {
      console.error("DB cart lookup failed, falling back to mock details:", error);
      const offline = getCartDetailsOffline(localItems);
      resolvedItems = offline.items;
      subtotal = offline.subtotalPaise;
    }
  }

  // Calculate Coupon Discount
  const cookieStore = await cookies();
  const couponCode = cookieStore.get("applied_coupon")?.value;
  let discountPaise = 0;
  let appliedCouponCode: string | undefined = undefined;

  if (couponCode) {
    let decodedCode = couponCode;
    while (typeof decodedCode === "string" && decodedCode.includes("%")) {
      try {
        const next = decodeURIComponent(decodedCode);
        if (next === decodedCode) break;
        decodedCode = next;
      } catch {
        break;
      }
    }
    const validation = await validateCouponCode(decodedCode, subtotal);
    if (validation.success) {
      discountPaise = validation.discountPaise || 0;
      appliedCouponCode = validation.coupon?.code || decodedCode;
    }
  }

  return {
    items: resolvedItems,
    subtotalPaise: subtotal,
    appliedCouponCode,
    discountPaise,
  };
}

function getCartDetailsOffline(items: { id: string; productId: string; variantId: string | null; quantity: number }[]): { items: CartItemDetail[]; subtotalPaise: number } {
  const resolvedItems: CartItemDetail[] = [];
  let subtotal = 0;

  for (const item of items) {
    const prod = MOCK_PRODUCTS.find(p => p.id === item.productId);
    if (!prod) continue;
    const variant = prod.variants.find(v => v.id === item.variantId);
    const price = variant ? (variant.pricePaise ?? 0) : (prod.pricePaise ?? 0);
    resolvedItems.push({
      id: item.id,
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity,
      name: prod.name,
      slug: prod.slug,
      sku: variant?.sku || prod.sku,
      pricePaise: price,
      image: prod.images[0]?.url || "/images/chikankari_hero.png",
      sizeName: variant?.name,
      stock: variant ? variant.stock : 10,
    });
    subtotal += price * item.quantity;
  }
  return { items: resolvedItems, subtotalPaise: subtotal };
}

export async function addToCart(productId: string, variantId: string | null, qty: number): Promise<boolean> {
  const items = await getCookieCartItems();

  const existingIdx = items.findIndex(
    item => item.productId === productId && item.variantId === variantId
  );

  if (existingIdx > -1) {
    items[existingIdx].quantity += qty;
  } else {
    items.push({
      id: `item_${Math.random().toString(36).substring(2, 11)}`,
      productId,
      variantId,
      quantity: qty,
    });
  }

  await saveCookieCartItems(items);
  return true;
}

export async function updateCartItemQuantity(itemId: string, qty: number): Promise<boolean> {
  const items = await getCookieCartItems();
  const itemIdx = items.findIndex(item => item.id === itemId);

  if (itemIdx > -1) {
    items[itemIdx].quantity = qty;
    await saveCookieCartItems(items);
    return true;
  }
  return false;
}

export async function removeCartItem(itemId: string): Promise<boolean> {
  let items = await getCookieCartItems();
  const initialLen = items.length;
  items = items.filter(item => item.id !== itemId);

  if (items.length !== initialLen) {
    await saveCookieCartItems(items);
    return true;
  }
  return false;
}

export async function clearCart(): Promise<void> {
  await saveCookieCartItems([]);
}
