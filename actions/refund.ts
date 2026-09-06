'use server';

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { refunds } from "@/db/schema/refund";
import { orders } from "@/db/schema/order";
import { payments } from "@/db/schema/payment";
import { requireAdmin } from "@/lib/auth/helpers";
import { getOrCreateWallet, creditWallet } from "@/lib/wallet";
import { executeRazorpayRefund } from "@/lib/razorpay-services";
import { eq, and, ne } from "drizzle-orm";

export async function createRefundAction(
  orderId: string,
  orderItemId: string | null,
  amountPaise: number,
  reason: string,
  refundMethod: "original_payment_method" | "rc_wallet"
) {
  // 1. Authorize Admin
  await requireAdmin();

  if (amountPaise <= 0) {
    return { success: false, error: "Refund amount must be greater than zero." };
  }

  const isDbAvailable = !!process.env.DATABASE_URL && process.env.DATABASE_URL.indexOf("[YOUR-PASSWORD]") === -1;

  if (!isDbAvailable) {
    console.log("Offline Mode: Created refund", { orderId, orderItemId, amountPaise, reason, refundMethod });
    return { success: true, message: "Mock Mode: Simulated refund created successfully!" };
  }

  try {
    // 2. Fetch Order and items from DB
    const order = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
      with: {
        items: true,
      },
    });

    if (!order) {
      return { success: false, error: "Order not found in database." };
    }

    if (!order.userId) {
      return { success: false, error: "Cannot process refund: Order is not associated with a registered user account." };
    }

    // 3. Calculate remaining refundable balance to prevent over-refunding
    const existingRefunds = await db
      .select()
      .from(refunds)
      .where(and(eq(refunds.orderId, orderId), ne(refunds.status, "FAILED")));

    const totalAlreadyRefunded = existingRefunds.reduce((sum, r) => sum + r.amountPaise, 0);
    const remainingRefundable = order.totalPaise - totalAlreadyRefunded;

    if (amountPaise > remainingRefundable) {
      return {
        success: false,
        error: `Refund amount (₹${(amountPaise / 100).toFixed(2)}) exceeds remaining refundable balance (₹${(remainingRefundable / 100).toFixed(2)}).`,
      };
    }

    // 4. Find payment record
    const paymentRecord = await db.select().from(payments).where(eq(payments.orderId, orderId)).limit(1);
    const providerPaymentId = paymentRecord[0]?.providerPaymentId || order.paymentId || "mock_payment";

    const refundId = `ref_${Math.random().toString(36).substring(2, 11)}`;
    const idempotencyKey = `refund_${orderId}_${Date.now()}`;

    // 5. Create initial pending refund record
    await db.insert(refunds).values({
      id: refundId,
      orderId,
      orderItemId,
      userId: order.userId,
      amountPaise,
      reason,
      status: "PROCESSING",
      refundMethod,
      idempotencyKey,
    });

    let rzpRefundId: string | null = null;
    let walletTxId: string | null = null;

    if (refundMethod === "original_payment_method") {
      // 6a. Direct Bank/UPI/Card Refund via Razorpay API
      const rzpResult = await executeRazorpayRefund(providerPaymentId, amountPaise, idempotencyKey, {
        orderId,
        refundId,
        refundMethod,
        reason,
      });

      if (!rzpResult.success) {
        await db.update(refunds).set({ status: "FAILED" }).where(eq(refunds.id, refundId));
        return { success: false, error: rzpResult.error || "Razorpay refund execution failed." };
      }

      rzpRefundId = rzpResult.refundId || `rfnd_${Date.now()}`;
    } else {
      // 6b. In-Store Credit to customer's Resham Chikankari (RC) Wallet
      const userWallet = await getOrCreateWallet(order.userId);
      await creditWallet(
        userWallet.id,
        amountPaise,
        "REFUND",
        orderId,
        `Refund for Order #${order.orderNumber}. Reason: ${reason}`,
        "order"
      );

      // Extract transaction ID from user wallet transactions
      const txs = (await import("@/db/schema/wallet")).walletTransactions;
      const latestTx = await db
        .select()
        .from(txs)
        .where(and(eq(txs.walletId, userWallet.id), eq(txs.referenceId, orderId)))
        .orderBy(eq(txs.createdAt, txs.createdAt))
        .limit(1);

      if (latestTx[0]) walletTxId = latestTx[0].id;
    }

    // 7. Update refund record status to COMPLETED
    await db
      .update(refunds)
      .set({
        status: "COMPLETED",
        razorpayRefundId: rzpRefundId,
        walletTransactionId: walletTxId,
        processedAt: new Date(),
      })
      .where(eq(refunds.id, refundId));

    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath("/admin/orders");
    revalidatePath("/account/wallet");

    const destMsg =
      refundMethod === "rc_wallet"
        ? "credited to customer's RC Wallet."
        : "processed to customer's original payment method via Razorpay.";

    return {
      success: true,
      message: `Successfully processed refund of ₹${(amountPaise / 100).toFixed(2)} (${destMsg}).`,
    };
  } catch (err: any) {
    console.error("Refund processing failed:", err);
    return { success: false, error: err.message || "An error occurred while executing refund." };
  }
}
