'use server';

import { db } from "@/db";
import { refunds } from "@/db/schema/refund";
import { orders } from "@/db/schema/order";
import { getCurrentUser } from "@/lib/auth/helpers";
import { getOrCreateWallet, creditWallet } from "@/lib/wallet";
import { eq, and } from "drizzle-orm";

export async function createRefundAction(
  orderId: string,
  orderItemId: string | null,
  amountPaise: number,
  reason: string,
  refundMethod: "original_payment_method" | "rc_wallet"
) {
  const adminUser = await getCurrentUser();
  if (!adminUser || adminUser.role !== "ADMIN") {
    return { success: false, error: "Unauthorized access. Admins only." };
  }

  if (amountPaise <= 0) {
    return { success: false, error: "Refund amount must be greater than zero." };
  }

  const isDbAvailable = !!process.env.DATABASE_URL && process.env.DATABASE_URL.indexOf("[YOUR-PASSWORD]") === -1;

  if (isDbAvailable) {
    try {
      // 1. Get the order
      const order = await db.query.orders.findFirst({
        where: eq(orders.id, orderId),
        with: {
          items: true
        }
      });

      if (!order) {
        return { success: false, error: "Order not found." };
      }

      // Check if order belongs to a user (uuid)
      if (!order.userId) {
        return { success: false, error: "Cannot process refund: Order is not linked to a user profile." };
      }

      // Validate amount does not exceed total order value
      if (amountPaise > order.totalPaise) {
        return { success: false, error: "Refund amount cannot exceed the order total." };
      }

      // 2. Idempotency Check: check if this order/item has already been refunded
      const existingRefunds = await db
        .select()
        .from(refunds)
        .where(
          and(
            eq(refunds.orderId, orderId),
            orderItemId ? eq(refunds.orderItemId, orderItemId) : eq(refunds.status, "COMPLETED")
          )
        );

      const totalAlreadyRefunded = existingRefunds.reduce((sum, r) => sum + r.amountPaise, 0);
      if (totalAlreadyRefunded + amountPaise > order.totalPaise) {
        return { success: false, error: "Total refunded amount would exceed the order total." };
      }

      // 3. Process Refund
      const refundId = `ref_${Math.random().toString(36).substring(2, 11)}`;

      if (refundMethod === "rc_wallet") {
        // Get customer wallet
        const wallet = await getOrCreateWallet(order.userId!);

        // Credit the wallet (this runs its own transaction internally)
        await creditWallet(
          wallet.id,
          amountPaise,
          "REFUND",
          orderId,
          `Refund for order ${order.orderNumber}. Reason: ${reason}`,
          "order"
        );

        // Find the transaction record that was just created to get its ID
        let walletTransactionId: string | null = null;
        try {
          const walletTransactionsSchema = (await import("@/db/schema/wallet")).walletTransactions;
          const txRecord = await db
            .select()
            .from(walletTransactionsSchema)
            .where(
              and(
                eq(walletTransactionsSchema.walletId, wallet.id),
                eq(walletTransactionsSchema.referenceId, orderId),
                eq(walletTransactionsSchema.referenceType, "order"),
                eq(walletTransactionsSchema.type, "REFUND")
              )
            )
            .limit(1);
          
          if (txRecord.length > 0) {
            walletTransactionId = txRecord[0].id;
          }
        } catch (txErr) {
          console.error("Failed to find refund transaction ID:", txErr);
        }

        // Insert refund record
        await db.insert(refunds).values({
          id: refundId,
          orderId,
          orderItemId,
          userId: order.userId!,
          amountPaise,
          reason,
          status: "COMPLETED",
          refundMethod,
          walletTransactionId,
          processedAt: new Date(),
        });

        return { success: true, message: `Successfully refunded ₹${(amountPaise / 100).toFixed(2)} to customer wallet.` };
      } else {
        // Original payment method (Gateway/Manual process)
        await db.insert(refunds).values({
          id: refundId,
          orderId,
          orderItemId,
          userId: order.userId!,
          amountPaise,
          reason,
          status: "PENDING", // Stays pending until payment gateway webhook confirms it
          refundMethod,
        });

        return { success: true, message: `Refund of ₹${(amountPaise / 100).toFixed(2)} initiated to original payment method (pending gateway processing).` };
      }
    } catch (e: any) {
      console.error("Refund processing failed:", e);
      return { success: false, error: e.message || "Failed to process refund." };
    }
  } else {
    console.log("Offline Mode: Created refund", { orderId, orderItemId, amountPaise, reason, refundMethod });
    return { success: true, message: "Mock Mode: Refund completed successfully!" };
  }
}
