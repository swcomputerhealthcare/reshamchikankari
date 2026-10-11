import { db } from "@/db";
import { coupons, couponUsage, type Coupon } from "@/db/schema/coupon";
import { orders } from "@/db/schema/order";
import { eq, or, sql } from "drizzle-orm";
import { isDatabaseConfigured } from "@/lib/utils";

export interface CouponValidationContext {
  userId?: string | null;
  email?: string | null;
  phone?: string | null;
}

export interface CouponValidationResult {
  success: boolean;
  error?: string;
  coupon?: Coupon;
  discountPaise?: number;
}

// Fallback Mock Coupons using exact Drizzle schema property names
export const MOCK_COUPONS: Coupon[] = [
  {
    id: "coup_001",
    code: "WELCOME10",
    type: "PERCENTAGE",
    value: 10,
    minimumOrderPaise: 100000, // ₹1,000
    maximumDiscountPaise: 30000, // ₹300 cap
    expiresAt: null,
    usageLimit: 1000,
    usageCount: 5,
    perUserLimit: 1,
    startsAt: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const hasDatabase = () => {
  return isDatabaseConfigured();
};

export async function validateCouponCode(
  code: string,
  subtotalPaise: number,
  context?: CouponValidationContext
): Promise<CouponValidationResult> {
  if (!code || typeof code !== "string") {
    return { success: false, error: "Please enter a valid coupon code." };
  }

  let normalizedCode = code.trim().toUpperCase();
  if (normalizedCode === "WELCOME") {
    normalizedCode = "WELCOME10";
  }

  let coupon: Coupon | undefined;

  if (hasDatabase()) {
    try {
      const result = await db
        .select()
        .from(coupons)
        .where(eq(coupons.code, normalizedCode))
        .limit(1);
      coupon = result[0];
    } catch (e) {
      console.error("DB coupon query failed, falling back to mock:", e);
    }
  }

  // Fallback to offline mock coupons
  if (!coupon) {
    coupon = MOCK_COUPONS.find(c => c.code === normalizedCode);
  }

  if (!coupon) {
    return { success: false, error: "Invalid coupon code." };
  }

  if (!coupon.isActive) {
    return { success: false, error: "This coupon code is inactive." };
  }

  // Expiration check
  if (coupon.expiresAt && new Date(coupon.expiresAt).getTime() < Date.now()) {
    return { success: false, error: "This coupon code has expired." };
  }

  // Start date check
  if (coupon.startsAt && new Date(coupon.startsAt).getTime() > Date.now()) {
    return { success: false, error: "This promotion has not started yet." };
  }

  // Global usage limit check
  if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
    return { success: false, error: "This coupon code has reached its usage limit." };
  }

  // Customer eligibility & per-user usage limits
  if (context && hasDatabase()) {
    try {
      const userConditions = [];
      if (context.userId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(context.userId)) {
        userConditions.push(eq(orders.userId, context.userId));
      }

      const cleanEmail = context.email?.trim().toLowerCase();
      if (cleanEmail) {
        userConditions.push(sql`${orders.shippingAddressSnapshot}->>'email' = ${cleanEmail}`);
      }

      const cleanPhone = context.phone?.replace(/\D/g, "");
      if (cleanPhone && cleanPhone.length >= 10) {
        const last10 = cleanPhone.slice(-10);
        userConditions.push(sql`RIGHT(REGEXP_REPLACE(COALESCE(${orders.shippingAddressSnapshot}->>'phone', ''), '\\D', '', 'g'), 10) = ${last10}`);
      }

      if (userConditions.length > 0) {
        const pastOrders = await db
          .select({
            id: orders.id,
            couponCodeSnapshot: orders.couponCodeSnapshot,
            couponId: orders.couponId,
          })
          .from(orders)
          .where(
            or(...userConditions)
          );

        const matchingUsage = pastOrders.filter(
          o => o.couponCodeSnapshot === normalizedCode || (coupon && o.couponId === coupon.id)
        );

        if (coupon.perUserLimit && matchingUsage.length >= coupon.perUserLimit) {
          return {
            success: false,
            error: "You have already redeemed this offer on a previous order.",
          };
        }
      }
    } catch (eligibilityErr) {
      console.warn("Coupon customer eligibility check warning:", eligibilityErr);
    }
  }

  // Minimum order check
  if (subtotalPaise < coupon.minimumOrderPaise) {
    const minValRupees = coupon.minimumOrderPaise / 100;
    return {
      success: false,
      error: `Minimum order value of ₹${minValRupees.toLocaleString("en-IN")} required to apply this coupon.`,
    };
  }

  // Calculate discount from the discounted product subtotal
  let discountPaise = 0;
  if (coupon.type === "PERCENTAGE") {
    discountPaise = Math.round(subtotalPaise * (coupon.value / 100));
    if (coupon.maximumDiscountPaise && discountPaise > coupon.maximumDiscountPaise) {
      discountPaise = coupon.maximumDiscountPaise;
    }
  } else if (coupon.type === "FIXED" || coupon.type === "FIXED_AMOUNT") {
    discountPaise = coupon.value;
  }

  // Capped at subtotal to prevent negative totals
  if (discountPaise > subtotalPaise) {
    discountPaise = subtotalPaise;
  }

  return {
    success: true,
    coupon,
    discountPaise,
  };
}

export async function getAllCoupons(): Promise<Coupon[]> {
  if (!hasDatabase()) return MOCK_COUPONS;

  try {
    const all = await db.select().from(coupons);
    return all.length > 0 ? all : MOCK_COUPONS;
  } catch (err) {
    console.error("DB Query failed, falling back to mock coupons:", err);
    return MOCK_COUPONS;
  }
}

export async function getCouponById(id: string): Promise<Coupon | null> {
  if (!hasDatabase()) {
    return MOCK_COUPONS.find(c => c.id === id) ?? null;
  }

  try {
    const result = await db.select().from(coupons).where(eq(coupons.id, id)).limit(1);
    return result[0] ?? null;
  } catch (err) {
    console.error("DB Query failed, falling back to mock coupon:", err);
    return MOCK_COUPONS.find(c => c.id === id) ?? null;
  }
}

export async function recordCouponUsage(options: {
  couponId: string;
  orderId: string;
  userId?: string | null;
  discountPaise: number;
}): Promise<void> {
  if (!hasDatabase()) return;

  try {
    await db
      .update(coupons)
      .set({
        usageCount: sql`${coupons.usageCount} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(coupons.id, options.couponId));

    if (
      options.userId &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(options.userId)
    ) {
      await db.insert(couponUsage).values({
        id: `cpu_${Math.random().toString(36).substring(2, 11)}`,
        couponId: options.couponId,
        userId: options.userId,
        orderId: options.orderId,
        discountPaise: options.discountPaise,
      });
    }
  } catch (err) {
    console.warn("Could not record coupon usage:", err);
  }
}
