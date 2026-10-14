"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { requireAdmin, getCurrentUser } from "@/lib/auth/helpers";
import { validateCouponCode } from "@/lib/coupon";
import { db } from "@/db";
import { coupons } from "@/db/schema/coupon";
import { eq, and, ne } from "drizzle-orm";
import { z } from "zod";
import { logAdminActivity } from "@/lib/audit";
import { isDatabaseConfigured } from "@/lib/utils";

const couponInputSchema = z.object({
  code: z.string().min(1, "Coupon code is required").toUpperCase(),
  discountType: z.enum(["PERCENTAGE", "FIXED"]),
  discountValue: z.number().positive("Discount value must be a positive number"),
  minOrderValuePaise: z.number().int().min(0, "Minimum order cannot be negative").default(0),
  maxDiscountValuePaise: z.number().int().positive().optional().nullable(),
  startDate: z.string().optional().nullable(),
  expirationDate: z.string().optional().nullable(),
  usageLimit: z.number().int().positive().optional().nullable(),
  perUserLimit: z.number().int().positive().default(1),
  isActive: z.boolean().default(true),
});

function safeRevalidateCouponPaths() {
  try {
    revalidatePath("/admin/coupons");
    revalidatePath("/admin");
    revalidatePath("/checkout");
  } catch {}
}

const COOKIE_NAME = "applied_coupon";

export async function applyCouponAction(code: string, subtotalPaise: number) {
  let user = null;
  try {
    user = await getCurrentUser();
  } catch {}

  const result = await validateCouponCode(
    code,
    subtotalPaise,
    user?.id ? { userId: user.id, email: user.email } : undefined
  );

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

export async function createCouponAction(formData: z.input<typeof couponInputSchema>) {
  const admin = await requireAdmin();

  const parsed = couponInputSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const data = parsed.data;

  if (!isDatabaseConfigured()) {
    return { success: true, message: "Database offline. Simulated coupon creation." };
  }

  try {
    // Check for duplicate code
    const existing = await db
      .select({ id: coupons.id })
      .from(coupons)
      .where(eq(coupons.code, data.code))
      .limit(1);

    if (existing.length > 0) {
      return { success: false, error: `Coupon code '${data.code}' already exists.` };
    }

    const id = `coup_${Math.random().toString(36).substring(2, 11)}`;
    await db.insert(coupons).values({
      id,
      code: data.code,
      type: data.discountType,
      value: data.discountValue,
      minimumOrderPaise: data.minOrderValuePaise,
      maximumDiscountPaise: data.maxDiscountValuePaise || null,
      startsAt: data.startDate ? new Date(data.startDate) : null,
      expiresAt: data.expirationDate ? new Date(data.expirationDate) : null,
      usageLimit: data.usageLimit || null,
      usageCount: 0,
      perUserLimit: data.perUserLimit || 1,
      isActive: data.isActive,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await logAdminActivity(
      "COUPON_CREATED",
      "coupon",
      id,
      { code: data.code, type: data.discountType, value: data.discountValue },
      admin.id
    );

    safeRevalidateCouponPaths();
    return { success: true, id };
  } catch (error: any) {
    console.error("DB Create Coupon failed:", error);
    return { success: false, error: error?.message || "Failed to create coupon in database." };
  }
}

export async function updateCouponAction(id: string, formData: Partial<z.input<typeof couponInputSchema>>) {
  const admin = await requireAdmin();

  if (!isDatabaseConfigured()) return { success: true };

  try {
    const existing = await db.query.coupons.findFirst({
      where: eq(coupons.id, id),
    });

    if (!existing) {
      return { success: false, error: "Coupon not found." };
    }

    // Check code uniqueness if changing code
    if (formData.code && formData.code !== existing.code) {
      const duplicate = await db
        .select({ id: coupons.id })
        .from(coupons)
        .where(and(eq(coupons.code, formData.code), ne(coupons.id, id)))
        .limit(1);

      if (duplicate.length > 0) {
        return { success: false, error: `Coupon code '${formData.code}' is already used by another coupon.` };
      }
    }

    const updateData: Record<string, any> = {
      updatedAt: new Date(),
    };

    if (formData.code) updateData.code = formData.code.toUpperCase();
    if (formData.discountType) updateData.type = formData.discountType;
    if (formData.discountValue !== undefined) updateData.value = formData.discountValue;
    if (formData.minOrderValuePaise !== undefined) updateData.minimumOrderPaise = formData.minOrderValuePaise;
    if (formData.maxDiscountValuePaise !== undefined) updateData.maximumDiscountPaise = formData.maxDiscountValuePaise;
    if (formData.startDate !== undefined) updateData.startsAt = formData.startDate ? new Date(formData.startDate) : null;
    if (formData.expirationDate !== undefined) updateData.expiresAt = formData.expirationDate ? new Date(formData.expirationDate) : null;
    if (formData.usageLimit !== undefined) updateData.usageLimit = formData.usageLimit;
    if (formData.perUserLimit !== undefined) updateData.perUserLimit = formData.perUserLimit;
    if (formData.isActive !== undefined) updateData.isActive = formData.isActive;

    await db.update(coupons).set(updateData).where(eq(coupons.id, id));

    await logAdminActivity(
      "COUPON_UPDATED",
      "coupon",
      id,
      { code: existing.code, changes: updateData },
      admin.id
    );

    safeRevalidateCouponPaths();
    return { success: true };
  } catch (error: any) {
    console.error("DB Update Coupon failed:", error);
    return { success: false, error: error?.message || "Failed to update coupon." };
  }
}

export async function toggleCouponStatusAction(id: string, active: boolean) {
  const admin = await requireAdmin();

  if (!isDatabaseConfigured()) return { success: true };

  try {
    const coupon = await db.query.coupons.findFirst({
      where: eq(coupons.id, id),
    });

    await db.update(coupons).set({ isActive: active, updatedAt: new Date() }).where(eq(coupons.id, id));

    await logAdminActivity(
      active ? "COUPON_ACTIVATED" : "COUPON_DEACTIVATED",
      "coupon",
      id,
      { code: coupon?.code, isActive: active },
      admin.id
    );

    safeRevalidateCouponPaths();
    return { success: true };
  } catch (error) {
    console.error("DB Toggle Coupon status failed:", error);
    return { success: false, error: "Failed to update coupon status." };
  }
}

export async function deleteCouponAction(id: string) {
  const admin = await requireAdmin();

  if (!isDatabaseConfigured()) return { success: true };

  try {
    const coupon = await db.query.coupons.findFirst({
      where: eq(coupons.id, id),
    });

    // Check if WELCOME10 - do not delete the core welcome coupon
    if (coupon?.code === "WELCOME10") {
      return {
        success: false,
        error: "WELCOME10 is a core system coupon required for promotional flow. Disable it instead of deleting.",
      };
    }

    await db.delete(coupons).where(eq(coupons.id, id));

    await logAdminActivity(
      "COUPON_DELETED",
      "coupon",
      id,
      { code: coupon?.code },
      admin.id
    );

    safeRevalidateCouponPaths();
    return { success: true };
  } catch (error: any) {
    console.error("DB Delete Coupon failed:", error);
    return { success: false, error: "Failed to delete coupon." };
  }
}
