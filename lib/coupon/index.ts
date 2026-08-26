import { db } from "@/db";
import { coupons, type Coupon } from "@/db/schema/coupon";
import { eq } from "drizzle-orm";

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
    usageLimit: 100,
    usageCount: 5,
    perUserLimit: 1,
    startsAt: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "coup_002",
    code: "FESTIVE500",
    type: "FIXED",
    value: 50000, // ₹500
    minimumOrderPaise: 300000, // ₹3,000
    maximumDiscountPaise: null,
    expiresAt: null,
    usageLimit: 50,
    usageCount: 12,
    perUserLimit: 1,
    startsAt: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const hasDatabase = () => {
  return !!process.env.DATABASE_URL && process.env.DATABASE_URL.indexOf("[YOUR-PASSWORD]") === -1;
};

export async function validateCouponCode(code: string, subtotalPaise: number): Promise<CouponValidationResult> {
  const normalizedCode = code.trim().toUpperCase();

  let coupon: Coupon | undefined;

  if (hasDatabase()) {
    try {
      const result = await db.select().from(coupons).where(eq(coupons.code, normalizedCode)).limit(1);
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
    return { success: false, error: "Invalid coupon code" };
  }

  if (!coupon.isActive) {
    return { success: false, error: "This coupon code is inactive" };
  }

  // Expiration check
  if (coupon.expiresAt && new Date(coupon.expiresAt).getTime() < Date.now()) {
    return { success: false, error: "This coupon code has expired" };
  }

  // Usage limit check
  if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
    return { success: false, error: "This coupon code has reached its usage limit" };
  }

  // Minimum order check
  if (subtotalPaise < coupon.minimumOrderPaise) {
    const minValRupees = coupon.minimumOrderPaise / 100;
    return {
      success: false,
      error: `Minimum order value of ₹${minValRupees.toLocaleString("en-IN")} required to apply this coupon`,
    };
  }

  // Calculate discount
  let discountPaise = 0;
  if (coupon.type === "PERCENTAGE") {
    discountPaise = Math.round(subtotalPaise * (coupon.value / 100));
    if (coupon.maximumDiscountPaise && discountPaise > coupon.maximumDiscountPaise) {
      discountPaise = coupon.maximumDiscountPaise;
    }
  } else if (coupon.type === "FIXED") {
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
    return await db.select().from(coupons);
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
