"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { requireAdmin } from "@/lib/auth/helpers";
import { validateCouponCode } from "@/lib/coupon";
import { db } from "@/db";
import { coupons } from "@/db/schema/coupon";
import { eq } from "drizzle-orm";
import { z } from "zod";

const couponInputSchema = z.object({
  code: z.string().min(1, "Coupon code is required").toUpperCase(),
  discountType: z.enum(["PERCENTAGE", "FIXED"]),
  discountValue: z.number().positive("Value must be positive"),
  minOrderValuePaise: z.number().int().min(0, "Minimum order cannot be negative"),
  maxDiscountValuePaise: z.number().int().positive().optional(),
  expirationDate: z.string().optional(),
  usageLimit: z.number().int().positive().optional(),
  isActive: z.boolean().default(true),
});

const COOKIE_NAME = "applied_coupon";

const hasDatabase = () => {
  return !!process.env.DATABASE_URL && process.env.DATABASE_URL.indexOf("[YOUR-PASSWORD]") === -1;
};

export async function applyCouponAction(code: string, subtotalPaise: number) {
  const result = await validateCouponCode(code, subtotalPaise);

  if (!result.success) {
    return { success: false, error: result.error };
  }

  // Set coupon cookie on success
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, encodeURIComponent(code.trim().toUpperCase()), {
    path: "/",
    maxAge: 60 * 60 * 24, // 24 hours
    httpOnly: true,
    sameSite: "lax",
  });

  return {
    success: true,
    discountPaise: result.discountPaise,
    code: result.coupon?.code,
  };
}

export async function removeCouponAction() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  return { success: true };
}

export async function createCouponAction(formData: z.infer<typeof couponInputSchema>) {
  // Authorize admin
  await requireAdmin();

  // Validate parameters
  const parsed = couponInputSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const data = parsed.data;

  if (!hasDatabase()) {
    console.log("Offline simulation: Coupon created", data);
    return { success: true, message: "Database offline. Simulated coupon creation." };
  }

  try {
    const id = `coup_${Math.random().toString(36).substring(2, 11)}`;
    await db.insert(coupons).values({
      id,
      code: data.code,
      type: data.discountType,
      value: data.discountValue,
      minimumOrderPaise: data.minOrderValuePaise,
      maximumDiscountPaise: data.maxDiscountValuePaise || null,
      expiresAt: data.expirationDate ? new Date(data.expirationDate) : null,
      usageLimit: data.usageLimit || null,
      usageCount: 0,
      perUserLimit: 1,
      isActive: data.isActive,
    });

    revalidatePath("/admin/coupons");
    return { success: true, id };
  } catch (error) {
    console.error("DB Create Coupon failed:", error);
    return { success: false, error: "Failed to create coupon in database." };
  }
}

export async function toggleCouponStatusAction(id: string, active: boolean) {
  await requireAdmin();

  if (!hasDatabase()) {
    console.log("Offline simulation: Coupon status changed", id, active);
    return { success: true };
  }

  try {
    await db.update(coupons).set({ isActive: active }).where(eq(coupons.id, id));
    revalidatePath("/admin/coupons");
    return { success: true };
  } catch (error) {
    console.error("DB Toggle Coupon status failed:", error);
    return { success: false, error: "Failed to update coupon status." };
  }
}

export async function deleteCouponAction(id: string) {
  await requireAdmin();

  if (!hasDatabase()) {
    return { success: true };
  }

  try {
    await db.delete(coupons).where(eq(coupons.id, id));
    revalidatePath("/admin/coupons");
    return { success: true };
  } catch (error: any) {
    console.error("DB Delete Coupon failed:", error);
    return { success: false, error: "Failed to delete coupon." };
  }
}
