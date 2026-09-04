import { NextResponse } from "next/server";
import crypto from "crypto";
import { env } from "@/lib/validation/env";
import { db } from "@/db";
import { orders, orderTimeline } from "@/db/schema/order";
import { payments } from "@/db/schema/payment";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

function verifySignature(payload: string, signature: string, secret: string) {
  if (!signature) return false;
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(payload);
  const digest = hmac.digest("hex");
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
}

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature") || "";
    const secret = env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_WEBHOOK_SECRET || env.RAZORPAY_KEY_SECRET || "rzp_webhook_secret_reshamk_test";

    if (!verifySignature(rawBody, signature, secret)) {
      console.warn("Razorpay payment webhook invalid signature");
      return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;
    const webhookId = req.headers.get("x-razorpay-event-id") || payload.event_id || `${event}_${payload.created_at}`;

    const isDbAvailable = !!process.env.DATABASE_URL && process.env.DATABASE_URL.indexOf("[YOUR-PASSWORD]") === -1;

    if (webhookId && isDbAvailable) {
      const { processedWebhooks } = await import("@/db/schema/payment");
      const [existingEvent] = await db
        .select()
        .from(processedWebhooks)
        .where(eq(processedWebhooks.id, String(webhookId)))
        .limit(1);

      if (existingEvent) {
        return NextResponse.json({ success: true, message: "Webhook event already processed." });
      }

      try {
        await db.insert(processedWebhooks).values({
          id: String(webhookId),
          provider: "RAZORPAY",
          eventType: event || "unknown",
        }).onConflictDoNothing();
      } catch (idempotencyErr) {
        console.warn("Webhook idempotency insert warning:", idempotencyErr);
      }
    }

    const paymentEntity = payload.payload?.payment?.entity;
    const orderEntity = payload.payload?.order?.entity;

    const rzpOrderId = paymentEntity?.order_id || orderEntity?.id;
    const rzpPaymentId = paymentEntity?.id;

    if (!rzpOrderId) {
      return NextResponse.json({ message: "No order identifier found in webhook payload" }, { status: 200 });
    }

    if (isDbAvailable) {
      if (event === "payment.captured" || event === "order.paid") {
        const [existingPayment] = await db
          .select()
          .from(payments)
          .where(eq(payments.providerOrderId, rzpOrderId))
          .limit(1);

        if (existingPayment) {
          await db.transaction(async (tx) => {
            await tx
              .update(orders)
              .set({
                status: "CONFIRMED",
                paymentStatus: "PAID",
                paymentId: rzpPaymentId || existingPayment.providerPaymentId,
                updatedAt: new Date(),
              })
              .where(eq(orders.id, existingPayment.orderId));

            await tx
              .update(payments)
              .set({
                status: "CAPTURED",
                providerPaymentId: rzpPaymentId || existingPayment.providerPaymentId,
                signatureVerified: true,
                updatedAt: new Date(),
              })
              .where(eq(payments.providerOrderId, rzpOrderId));

            await tx.insert(orderTimeline).values({
              id: `log_${Math.random().toString(36).substring(2, 11)}`,
              orderId: existingPayment.orderId,
              status: "CONFIRMED",
              message: `Webhook received: Payment captured (${rzpPaymentId || "Razorpay"})`,
            });
          });

          // Idempotent trigger of Shiprocket fulfillment after webhook confirms payment
          try {
            const { triggerOrderFulfillment } = await import("@/actions/shiprocket");
            await triggerOrderFulfillment(existingPayment.orderId);
          } catch (shiprocketErr) {
            console.error(`Webhook Shiprocket trigger error for order ${existingPayment.orderId}:`, shiprocketErr);
          }

          // Dispatch Order Confirmation Email asynchronously
          try {
            const { sendOrderConfirmationEmail } = await import("@/lib/email");
            await sendOrderConfirmationEmail(existingPayment.orderId);
          } catch (emailErr) {
            console.error(`Webhook Order Confirmation Email error for order ${existingPayment.orderId}:`, emailErr);
          }
        }
      } else if (event === "payment.failed") {
        const [existingPayment] = await db
          .select()
          .from(payments)
          .where(eq(payments.providerOrderId, rzpOrderId))
          .limit(1);

        if (existingPayment) {
          await db
            .update(payments)
            .set({
              status: "FAILED",
              updatedAt: new Date(),
            })
            .where(eq(payments.providerOrderId, rzpOrderId));
        }
      } else if (event === "refund.processed" || event === "refund.created") {
        const refundEntity = payload.payload?.refund?.entity;
        if (refundEntity) {
          const rzpRefundId = refundEntity.id;
          const notes = refundEntity.notes || {};
          const internalRefundId = notes.refundId || notes.refund_id;

          const { refunds } = await import("@/db/schema/refund");
          const { getOrCreateWallet, creditWallet } = await import("@/lib/wallet");

          let matchingRefund: any = null;
          if (internalRefundId) {
            const found = await db.select().from(refunds).where(eq(refunds.id, internalRefundId)).limit(1);
            matchingRefund = found[0];
          }
          if (!matchingRefund && rzpRefundId) {
            const found = await db.select().from(refunds).where(eq(refunds.razorpayRefundId, rzpRefundId)).limit(1);
            matchingRefund = found[0];
          }

          if (matchingRefund && matchingRefund.status !== "COMPLETED") {
            const walletTxId: string | null = matchingRefund.walletTransactionId;

            if (matchingRefund.refundMethod === "rc_wallet" && matchingRefund.userId) {
              const userWallet = await getOrCreateWallet(matchingRefund.userId);
              await creditWallet(
                userWallet.id,
                matchingRefund.amountPaise,
                "REFUND",
                matchingRefund.orderId,
                `Confirmed Refund for Order ${matchingRefund.orderId}`,
                "order"
              );
            }

            await db
              .update(refunds)
              .set({
                status: "COMPLETED",
                razorpayRefundId: rzpRefundId,
                walletTransactionId: walletTxId,
                processedAt: new Date(),
              })
              .where(eq(refunds.id, matchingRefund.id));

            console.log(`Razorpay Webhook: Refund ${matchingRefund.id} confirmed and completed.`);
          }
        }
      }
    }

    return NextResponse.json({ success: true, receivedEvent: event });
  } catch (err: any) {
    console.error("Razorpay webhook processing error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
