import { db } from "@/db";
import { coupons, couponUsage, type Coupon } from "@/db/schema/coupon";
import { orders } from "@/db/schema/order";
import { eq, or, and, sql } from "drizzle-orm";
import { isDatabaseConfigured } from "@/lib/utils";
import { normalizeCouponLookup, computeCouponHash } from "./security";
import { checkRateLimit, resetRateLimit } from "@/lib/security/rate-limiter";
import { isNavratriPromotionActive } from "@/lib/promotions/navratri";

export interface CouponValidationContext {
  userId?: string | null;
  email?: string | null;
  phone?: string | null;
  ipAddress?: string | null;
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
    codeHash: computeCouponHash("WELCOME10"),
    codeMasked: "WELCOME10",
    codeSuffix: "ME10",
    description: "Official Welcome 10% First Order Offer",
    type: "PERCENTAGE",
    value: 10,
    minimumOrderPaise: 100000, // ₹1,000
    maximumDiscountPaise: 30000, // ₹300 cap
    usageLimit: 1000,
    usageCount: 5,
    perUserLimit: 1,
    isPrivate: false,
    isSingleUse: false,
    assignedUserId: null,
    assignedEmail: null,
    canStackWithCampaigns: true,
    internalReason: "Default system welcome coupon for first-time patrons",
    startsAt: null,
    expiresAt: null,
    isActive: true,
    revokedAt: null,
    revokedBy: null,
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
  if (!code || typeof code !== "string" || code.trim().length === 0) {
    return { success: false, error: "Please enter a valid coupon code." };
  }

  // 1. Abuse & Brute-force rate limiting protection
  const rateLimitIdentifier = context?.userId
    ? `user:${context.userId}`
    : `ip:${context?.ipAddress || "anonymous"}`;

  const rateLimitResult = await checkRateLimit(rateLimitIdentifier, "coupon_validate", {
    maxHits: 10, // 10 attempts
    windowSeconds: 300, // 5 minutes
    blockDurationSeconds: 900, // 15 minutes cooldown if abused
  });

  if (!rateLimitResult.allowed) {
    const minutesLeft = Math.ceil((rateLimitResult.retryAfterSeconds || 60) / 60);
    return {
      success: false,
      error: `Too many coupon attempts. Please try again in ${minutesLeft} minute${minutesLeft > 1 ? "s" : ""}.`,
    };
  }

  // 2. Normalize code and compute keyed HMAC hash
  const lookup = normalizeCouponLookup(code);
  let coupon: Coupon | undefined;

  if (hasDatabase()) {
    try {
      // Look up by HMAC-SHA256 digest if secure 16-character format
      if (lookup.codeHash) {
        const [byHash] = await db
          .select()
          .from(coupons)
          .where(eq(coupons.codeHash, lookup.codeHash))
          .limit(1);
        if (byHash) coupon = byHash;
      }

      // Fallback look up by code string (for legacy public coupons like WELCOME10)
      if (!coupon) {
        const [byCode] = await db
          .select()
          .from(coupons)
          .where(eq(coupons.code, lookup.legacyLookupCode))
          .limit(1);
        if (byCode) coupon = byCode;
      }
    } catch (e) {
      console.error("DB coupon query error, falling back:", e);
    }
  }

  // Fallback to offline mock coupons
  if (!coupon) {
    coupon = MOCK_COUPONS.find(
      (c) =>
        c.code === lookup.legacyLookupCode ||
        (lookup.codeHash && c.codeHash === lookup.codeHash)
    );
  }

  if (!coupon) {
    return { success: false, error: "Invalid coupon code." };
  }

  // 3. Status and revocation check
  if (!coupon.isActive || coupon.revokedAt) {
    return { success: false, error: "This coupon code is no longer valid." };
  }

  // 4. Expiration check
  if (coupon.expiresAt && new Date(coupon.expiresAt).getTime() < Date.now()) {
    return { success: false, error: "This coupon code has expired." };
  }

  // 5. Start date check
  if (coupon.startsAt && new Date(coupon.startsAt).getTime() > Date.now()) {
    return { success: false, error: "This promotion has not started yet." };
  }

  // 6. Campaign Stacking Rule Check
  if (!coupon.canStackWithCampaigns && isNavratriPromotionActive()) {
    return {
      success: false,
      error: "This exclusive coupon cannot be combined with active promotional campaigns.",
    };
  }

  // 7. Global & Single-Use usage limit check
  if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
    return {
      success: false,
      error: coupon.isSingleUse
        ? "This single-use coupon has already been redeemed."
        : "This coupon code has reached its maximum redemptions.",
    };
  }

  // 8. Account & Identity Binding Restrictions
  if (coupon.assignedUserId) {
    if (!context?.userId || context.userId !== coupon.assignedUserId) {
      return { success: false, error: "This coupon is not valid for your account." };
    }
  }

  if (coupon.assignedEmail) {
    const cleanContextEmail = context?.email?.trim().toLowerCase();
    const cleanAssignedEmail = coupon.assignedEmail.trim().toLowerCase();
    if (!cleanContextEmail || cleanContextEmail !== cleanAssignedEmail) {
      return { success: false, error: "This coupon is not valid for your account." };
    }
  }

  // 9. Per-user usage limits check (via orders history)
  if (context && hasDatabase()) {
    try {
      const userConditions = [];
      if (
        context.userId &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(context.userId)
      ) {
        userConditions.push(eq(orders.userId, context.userId));
      }

      const cleanEmail = context.email?.trim().toLowerCase();
      if (cleanEmail) {
        userConditions.push(sql`${orders.shippingAddressSnapshot}->>'email' = ${cleanEmail}`);
      }

      const cleanPhone = context.phone?.replace(/\D/g, "");
      if (cleanPhone && cleanPhone.length >= 10) {
        const last10 = cleanPhone.slice(-10);
        userConditions.push(
          sql`RIGHT(REGEXP_REPLACE(COALESCE(${orders.shippingAddressSnapshot}->>'phone', ''), '\\D', '', 'g'), 10) = ${last10}`
        );
      }

      if (userConditions.length > 0) {
        const pastOrders = await db
          .select({
            id: orders.id,
            couponCodeSnapshot: orders.couponCodeSnapshot,
            couponId: orders.couponId,
          })
          .from(orders)
          .where(or(...userConditions));

        const matchingUsage = pastOrders.filter(
          (o) =>
            o.couponCodeSnapshot === lookup.legacyLookupCode ||
            o.couponCodeSnapshot === coupon?.code ||
            (coupon && o.couponId === coupon.id)
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

  // 10. Minimum order check (in integer paise)
  if (subtotalPaise < coupon.minimumOrderPaise) {
    const minValRupees = coupon.minimumOrderPaise / 100;
    return {
      success: false,
      error: `Minimum order value of ₹${minValRupees.toLocaleString("en-IN")} required to apply this coupon.`,
    };
  }

  // 11. Calculate authoritative discount in integer paise
  let discountPaise = 0;
  if (coupon.type === "PERCENTAGE") {
    discountPaise = Math.round(subtotalPaise * (coupon.value / 100));
    if (coupon.maximumDiscountPaise && discountPaise > coupon.maximumDiscountPaise) {
      discountPaise = coupon.maximumDiscountPaise;
    }
  } else if (coupon.type === "FIXED" || coupon.type === "FIXED_AMOUNT") {
    discountPaise = coupon.value;
  }

  // Capped at subtotal to prevent negative payable totals
  if (discountPaise > subtotalPaise) {
    discountPaise = subtotalPaise;
  }

  // Reset rate limiter on valid redemption attempt
  await resetRateLimit(rateLimitIdentifier, "coupon_validate");

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
    return MOCK_COUPONS.find((c) => c.id === id) ?? null;
  }

  try {
    const result = await db.select().from(coupons).where(eq(coupons.id, id)).limit(1);
    return result[0] ?? null;
  } catch (err) {
    console.error("DB Query failed, falling back to mock coupon:", err);
    return MOCK_COUPONS.find((c) => c.id === id) ?? null;
  }
}

/**
 * Concurrency-safe atomic coupon redemption claim.
 * Executes a conditional database update that atomically verifies:
 * isActive = true AND revokedAt IS NULL AND (usageLimit IS NULL OR usageCount < usageLimit).
 * Prevents concurrent double-redemption of single-use coupons.
 */
export async function claimCouponRedemption(options: {
  couponId: string;
  orderId: string;
  userId?: string | null;
  discountPaise: number;
}): Promise<{ success: boolean; error?: string }> {
  if (!hasDatabase()) return { success: true };

  try {
    const updated = await db
      .update(coupons)
      .set({
        usageCount: sql`${coupons.usageCount} + 1`,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(coupons.id, options.couponId),
          eq(coupons.isActive, true),
          sql`${coupons.revokedAt} IS NULL`,
          or(
            sql`${coupons.usageLimit} IS NULL`,
            sql`${coupons.usageCount} < ${coupons.usageLimit}`
          )
        )
      )
      .returning({ id: coupons.id });

    if (!updated || updated.length === 0) {
      return {
        success: false,
        error: "This coupon has reached its maximum redemptions or is no longer available.",
      };
    }

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

    return { success: true };
  } catch (err: any) {
    console.error("Atomic coupon redemption failed:", err);
    return { success: false, error: "Failed to claim coupon redemption." };
  }
}

/**
 * Release / Rollback coupon usage if order processing fails prior to payment completion.
 */
export async function releaseCouponRedemption(couponId: string): Promise<void> {
  if (!hasDatabase() || !couponId) return;
  try {
    await db
      .update(coupons)
      .set({
        usageCount: sql`GREATEST(0, ${coupons.usageCount} - 1)`,
        updatedAt: new Date(),
      })
      .where(eq(coupons.id, couponId));
  } catch (e) {
    console.warn("Could not release coupon redemption:", e);
  }
}

export async function recordCouponUsage(options: {
  couponId: string;
  orderId: string;
  userId?: string | null;
  discountPaise: number;
}): Promise<void> {
  await claimCouponRedemption(options);
}
