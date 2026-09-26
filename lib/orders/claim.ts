import { db } from "@/db";
import { orders } from "@/db/schema/order";
import { profiles } from "@/db/schema/auth";
import { eq, isNull, and, or, sql } from "drizzle-orm";
import { isDatabaseConfigured } from "@/lib/utils";

/**
 * Safely associates historical guest orders (userId IS NULL) with a verified user identity.
 * Strictly requires that the customer has verified their identity (via Supabase Auth OTP,
 * Google OAuth, or password login).
 *
 * Rules:
 * - Only orders where userId IS NULL can ever be claimed.
 * - Never reassigns an order that already belongs to another user.
 * - Matches on verified email and/or verified phone number from shipping/billing snapshots.
 */
export async function claimGuestOrdersForUser(
  userId: string,
  verifiedEmail?: string | null,
  verifiedPhone?: string | null
): Promise<{ success: boolean; claimedCount: number }> {
  if (!isDatabaseConfigured()) {
    return { success: true, claimedCount: 0 };
  }

  // Validate userId format (must be valid UUID)
  const isUuid = typeof userId === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
  if (!isUuid) {
    return { success: false, claimedCount: 0 };
  }

  const cleanEmail = verifiedEmail?.trim().toLowerCase() || null;
  const rawPhone = verifiedPhone?.trim().replace(/\D/g, "") || "";
  const cleanPhone = rawPhone.length >= 10 ? rawPhone.slice(-10) : (rawPhone.length > 0 ? rawPhone : null);

  if (!cleanEmail && !cleanPhone) {
    return { success: true, claimedCount: 0 };
  }

  try {
    const conditions = [];

    if (cleanEmail) {
      conditions.push(
        sql`LOWER(shipping_address_snapshot->>'email') = ${cleanEmail}`,
        sql`LOWER(billing_address_snapshot->>'email') = ${cleanEmail}`
      );
    }

    if (cleanPhone) {
      conditions.push(
        sql`RIGHT(REGEXP_REPLACE(shipping_address_snapshot->>'phone', '[^0-9]', '', 'g'), 10) = ${cleanPhone}`,
        sql`RIGHT(REGEXP_REPLACE(billing_address_snapshot->>'phone', '[^0-9]', '', 'g'), 10) = ${cleanPhone}`
      );
    }

    // Find all unassigned guest orders matching verified credentials
    const matchingGuestOrders = await db
      .select({
        id: orders.id,
        orderNumber: orders.orderNumber,
        shippingAddressSnapshot: orders.shippingAddressSnapshot,
      })
      .from(orders)
      .where(
        and(
          isNull(orders.userId),
          or(...conditions)
        )
      );

    if (matchingGuestOrders.length === 0) {
      return { success: true, claimedCount: 0 };
    }

    // Associate each eligible guest order with the verified user
    const orderIdsToClaim = matchingGuestOrders.map((o) => o.id);

    await db
      .update(orders)
      .set({
        userId,
        updatedAt: new Date(),
      })
      .where(
        and(
          isNull(orders.userId),
          sql`${orders.id} IN (${sql.join(orderIdsToClaim.map(id => sql`${id}`), sql`, `)})`
        )
      );

    // Sync phone number to profiles table if missing
    try {
      const existingProfile = await db.query.profiles.findFirst({
        where: eq(profiles.id, userId),
      });

      if (existingProfile && !existingProfile.phone) {
        // Find phone from parameter or from claimed orders
        let resolvedPhone = cleanPhone;
        if (!resolvedPhone) {
          for (const ord of matchingGuestOrders) {
            const snap = ord.shippingAddressSnapshot as any;
            if (snap?.phone) {
              resolvedPhone = snap.phone;
              break;
            }
          }
        }

        if (resolvedPhone) {
          await db
            .update(profiles)
            .set({
              phone: resolvedPhone,
              updatedAt: new Date(),
            })
            .where(eq(profiles.id, userId));
        }
      }
    } catch (pErr) {
      console.warn("Could not sync phone to profile during guest order claim:", pErr);
    }

    console.log(`Successfully claimed ${orderIdsToClaim.length} guest order(s) for user ${userId}`);
    return { success: true, claimedCount: orderIdsToClaim.length };
  } catch (err) {
    console.error("Error claiming guest orders for user:", err);
    return { success: false, claimedCount: 0 };
  }
}
