"use server";

import { revalidatePath } from "next/cache";
import { cookies, headers } from "next/headers";
import { requireAdmin, getCurrentUser } from "@/lib/auth/helpers";
import { validateCouponCode } from "@/lib/coupon";
import { db } from "@/db";
import { coupons } from "@/db/schema/coupon";
import { eq, and, ne, or, sql } from "drizzle-orm";
import { z } from "zod";
import { logAdminActivity } from "@/lib/audit";
import { isDatabaseConfigured } from "@/lib/utils";
import {
  generateSecureCouponCode,
  computeCouponHash,
  isPredictablePattern,
} from "@/lib/coupon/security";

const publicCouponInputSchema = z.object({
  code: z.string().min(1, "Coupon code is required").toUpperCase(),
  description: z.string().optional().nullable(),
  discountType: z.enum(["PERCENTAGE", "FIXED"]),
  discountValue: z.number().positive("Discount value must be a positive number"),
  minOrderValuePaise: z.number().int().min(0, "Minimum order cannot be negative").default(0),
  maxDiscountValuePaise: z.number().int().positive().optional().nullable(),
  startDate: z.string().optional().nullable(),
  expirationDate: z.string().optional().nullable(),
  usageLimit: z.number().int().positive().optional().nullable(),
  perUserLimit: z.number().int().positive().default(1),
  canStackWithCampaigns: z.boolean().default(true),
  isActive: z.boolean().default(true),
});

const privateCouponInputSchema = z.object({
  description: z.string().min(2, "Internal name or recipient description is required"),
  discountType: z.enum(["PERCENTAGE", "FIXED"]),
  discountValue: z.number().positive("Discount value must be a positive number"),
  minOrderValuePaise: z.number().int().min(0, "Minimum order cannot be negative").default(0),
  maxDiscountValuePaise: z.number().int().positive().optional().nullable(),
  isSingleUse: z.boolean().default(true),
  usageLimit: z.number().int().positive().default(1),
  perUserLimit: z.number().int().positive().default(1),
  assignedEmail: z.string().email("Invalid email format").optional().nullable().or(z.literal("")),
  canStackWithCampaigns: z.boolean().default(false),
  internalReason: z.string().min(3, "Audit reason is required for private coupon generation"),
  startDate: z.string().optional().nullable(),
  expirationDate: z.string().optional().nullable(),
});

function safeRevalidateCouponPaths() {
  try {
    revalidatePath("/admin/coupons");
    revalidatePath("/admin");
    revalidatePath("/checkout");
  } catch {}
}

const COOKIE_NAME = "applied_coupon";

/**
 * Client-facing apply coupon action.
 * Incorporates caller IP and user context for rate limiting and abuse defense.
 */
export async function applyCouponAction(code: string, subtotalPaise: number) {
  let user = null;
  try {
    user = await getCurrentUser();
  } catch {}

  let ipAddress = "127.0.0.1";
  try {
    const headerList = await headers();
    const rawIp =
      headerList.get("x-forwarded-for") ||
      headerList.get("x-real-ip") ||
      headerList.get("cf-connecting-ip") ||
      "127.0.0.1";
    ipAddress = rawIp.split(",")[0].trim();
  } catch {}

  const result = await validateCouponCode(code, subtotalPaise, {
    userId: user?.id,
    email: user?.email,
    ipAddress,
  });

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
    code: result.coupon?.codeMasked || result.coupon?.code || code,
  };
}

export async function removeCouponAction() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  return { success: true };
}

/**
 * Generate a private, special-use coupon using cryptographically secure randomness (80-bit entropy).
 * The full plaintext code is returned ONLY ONCE in the response for admin distribution.
 */
export async function generatePrivateCouponAction(formData: z.input<typeof privateCouponInputSchema>) {
  const admin = await requireAdmin();

  const parsed = privateCouponInputSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const data = parsed.data;

  if (!isDatabaseConfigured()) {
    const mockCode = generateSecureCouponCode();
    return {
      success: true,
      id: "mock_priv_001",
      generatedCode: mockCode.formattedCode,
      codeMasked: mockCode.codeMasked,
      message: "Database offline. Simulated secure coupon generation.",
    };
  }

  try {
    // Generate secure code with collision retry loop
    let codeDetails = generateSecureCouponCode();
    for (let attempt = 0; attempt < 5; attempt++) {
      const existing = await db
        .select({ id: coupons.id })
        .from(coupons)
        .where(
          or(
            eq(coupons.code, codeDetails.formattedCode),
            eq(coupons.codeHash, codeDetails.codeHash)
          )
        )
        .limit(1);

      if (existing.length === 0) break;
      codeDetails = generateSecureCouponCode();
    }

    const id = `coup_priv_${Math.random().toString(36).substring(2, 11)}`;
    const effectiveUsageLimit = data.isSingleUse ? 1 : (data.usageLimit || 1);
    const assignedEmailClean = data.assignedEmail ? data.assignedEmail.trim().toLowerCase() : null;

    await db.insert(coupons).values({
      id,
      code: codeDetails.formattedCode,
      codeHash: codeDetails.codeHash,
      codeMasked: codeDetails.codeMasked,
      codeSuffix: codeDetails.codeSuffix,
      description: data.description,
      type: data.discountType,
      value: data.discountValue,
      minimumOrderPaise: data.minOrderValuePaise,
      maximumDiscountPaise: data.maxDiscountValuePaise || null,
      usageLimit: effectiveUsageLimit,
      usageCount: 0,
      perUserLimit: data.perUserLimit || 1,
      isPrivate: true,
      isSingleUse: data.isSingleUse,
      assignedUserId: null,
      assignedEmail: assignedEmailClean,
      canStackWithCampaigns: data.canStackWithCampaigns,
      internalReason: data.internalReason,
      startsAt: data.startDate ? new Date(data.startDate) : null,
      expiresAt: data.expirationDate ? new Date(data.expirationDate) : null,
      isActive: true,
      revokedAt: null,
      revokedBy: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Record audit log with MASKED code only (never store raw code in audit logs)
    await logAdminActivity(
      "PRIVATE_COUPON_GENERATED",
      "coupon",
      id,
      {
        masked: codeDetails.codeMasked,
        suffix: codeDetails.codeSuffix,
        type: data.discountType,
        value: data.discountValue,
        isSingleUse: data.isSingleUse,
        assignedEmail: assignedEmailClean,
        reason: data.internalReason,
      },
      admin.id
    );

    safeRevalidateCouponPaths();

    return {
      success: true,
      id,
      generatedCode: codeDetails.formattedCode,
      codeMasked: codeDetails.codeMasked,
      codeSuffix: codeDetails.codeSuffix,
    };
  } catch (error: any) {
    console.error("DB Generate Private Coupon failed:", error);
    return { success: false, error: error?.message || "Failed to generate private coupon." };
  }
}

/**
 * Revoke an active coupon immediately.
 * Blocks all future redemption attempts while preserving historical order totals.
 */
export async function revokeCouponAction(id: string, reason?: string) {
  const admin = await requireAdmin();

  if (!isDatabaseConfigured()) return { success: true };

  try {
    const coupon = await db.query.coupons.findFirst({
      where: eq(coupons.id, id),
    });

    if (!coupon) {
      return { success: false, error: "Coupon not found." };
    }

    if (coupon.code === "WELCOME10") {
      return {
        success: false,
        error: "WELCOME10 is a core system coupon required for promotional flow. Disable it instead of revoking.",
      };
    }

    const revokeReason = reason || "Administrative revocation";

    await db
      .update(coupons)
      .set({
        isActive: false,
        revokedAt: new Date(),
        revokedBy: admin.id || "admin",
        internalReason: sql`COALESCE(${coupons.internalReason}, '') || ' [REVOKED: ' || ${revokeReason} || ']'`,
        updatedAt: new Date(),
      })
      .where(eq(coupons.id, id));

    await logAdminActivity(
      "COUPON_REVOKED",
      "coupon",
      id,
      {
        codeMasked: coupon.codeMasked || coupon.code,
        reason: revokeReason,
      },
      admin.id
    );

    safeRevalidateCouponPaths();
    return { success: true };
  } catch (error: any) {
    console.error("DB Revoke Coupon failed:", error);
    return { success: false, error: error?.message || "Failed to revoke coupon." };
  }
}

/**
 * Create public/campaign coupon (rejects predictable private codes like DIWALI15).
 */
export async function createCouponAction(formData: z.input<typeof publicCouponInputSchema>) {
  const admin = await requireAdmin();

  const parsed = publicCouponInputSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const data = parsed.data;

  // Security check: Reject predictable codes for private use
  if (data.code !== "WELCOME10" && isPredictablePattern(data.code)) {
    return {
      success: false,
      error: `Creating guessable promotional codes like '${data.code}' is disabled. Please use 'Generate Private Coupon' to issue a cryptographically secure random code.`,
    };
  }

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
    const codeHash = computeCouponHash(data.code);

    await db.insert(coupons).values({
      id,
      code: data.code,
      codeHash,
      codeMasked: data.code,
      codeSuffix: data.code.slice(-4),
      description: data.description || data.code,
      type: data.discountType,
      value: data.discountValue,
      minimumOrderPaise: data.minOrderValuePaise,
      maximumDiscountPaise: data.maxDiscountValuePaise || null,
      usageLimit: data.usageLimit || null,
      usageCount: 0,
      perUserLimit: data.perUserLimit || 1,
      isPrivate: false,
      isSingleUse: false,
      canStackWithCampaigns: data.canStackWithCampaigns,
      startsAt: data.startDate ? new Date(data.startDate) : null,
      expiresAt: data.expirationDate ? new Date(data.expirationDate) : null,
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

export async function updateCouponAction(id: string, formData: Partial<z.input<typeof publicCouponInputSchema>>) {
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
      if (formData.code !== "WELCOME10" && isPredictablePattern(formData.code)) {
        return {
          success: false,
          error: `Changing code to predictable string '${formData.code}' is rejected for security.`,
        };
      }

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

    if (formData.code) {
      updateData.code = formData.code.toUpperCase();
      updateData.codeHash = computeCouponHash(formData.code.toUpperCase());
      updateData.codeMasked = formData.code.toUpperCase();
      updateData.codeSuffix = formData.code.slice(-4);
    }
    if (formData.description !== undefined) updateData.description = formData.description;
    if (formData.discountType) updateData.type = formData.discountType;
    if (formData.discountValue !== undefined) updateData.value = formData.discountValue;
    if (formData.minOrderValuePaise !== undefined) updateData.minimumOrderPaise = formData.minOrderValuePaise;
    if (formData.maxDiscountValuePaise !== undefined) updateData.maximumDiscountPaise = formData.maxDiscountValuePaise;
    if (formData.startDate !== undefined) updateData.startsAt = formData.startDate ? new Date(formData.startDate) : null;
    if (formData.expirationDate !== undefined) updateData.expiresAt = formData.expirationDate ? new Date(formData.expirationDate) : null;
    if (formData.usageLimit !== undefined) updateData.usageLimit = formData.usageLimit;
    if (formData.perUserLimit !== undefined) updateData.perUserLimit = formData.perUserLimit;
    if (formData.canStackWithCampaigns !== undefined) updateData.canStackWithCampaigns = formData.canStackWithCampaigns;
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
      { code: coupon?.codeMasked || coupon?.code, isActive: active },
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
      { code: coupon?.codeMasked || coupon?.code },
      admin.id
    );

    safeRevalidateCouponPaths();
    return { success: true };
  } catch (error: any) {
    console.error("DB Delete Coupon failed:", error);
    return { success: false, error: error?.message || "Failed to delete coupon." };
  }
}
