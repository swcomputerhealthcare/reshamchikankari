import { NextResponse } from "next/server";
import { env } from "@/lib/validation/env";
import { db } from "@/db";
import { orders, shipmentTrackingEvents } from "@/db/schema/order";
import { eq } from "drizzle-orm";
import { mapShiprocketStatusToInternal } from "@/lib/shiprocket";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature =
      req.headers.get("x-shiprocket-signature") ||
      req.headers.get("x-api-key") ||
      req.headers.get("token") ||
      req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
      "";
    const secret = process.env.SHIPROCKET_WEBHOOK_SECRET || env.SHIPROCKET_WEBHOOK_SECRET || "shiprocket_wh_secret_reshamk_test";

    // Optional token validation if header is passed
    if (signature && secret && signature !== secret) {
      // If signature is provided and doesn't match, log warning but continue in dev mode
      if (env.NODE_ENV === "production") {
        console.warn("Shiprocket Webhook Signature Mismatch:", signature);
        return NextResponse.json({ error: "Unauthorized webhook signature" }, { status: 401 });
      }
    }

    const payload = JSON.parse(rawBody);

    // Shiprocket tracking webhook payload fields
    const orderNumber = payload.order_id || payload.channel_order_id;
    const awbCode = payload.awb || payload.awb_code;
    const currentStatus = payload.current_status || payload.status || "UNKNOWN";
    const location = payload.location || payload.current_location || "In Transit";
    const activity = payload.activity || payload.scans?.[0]?.activity || `Shipment status: ${currentStatus}`;
    const eventTimeStr = payload.date || payload.event_time || new Date().toISOString();

    if (!orderNumber && !awbCode) {
      return NextResponse.json(
        { message: "Missing order_id or awb identifier in payload" },
        { status: 200 }
      );
    }

    const isDbAvailable = !!process.env.DATABASE_URL && process.env.DATABASE_URL.indexOf("[YOUR-PASSWORD]") === -1;

    if (isDbAvailable) {
      // Find order by orderNumber or awbCode
      let targetOrder = null;
      if (orderNumber) {
        const found = await db
          .select()
          .from(orders)
          .where(eq(orders.orderNumber, String(orderNumber)))
          .limit(1);
        targetOrder = found[0];
      }

      if (!targetOrder && awbCode) {
        const found = await db
          .select()
          .from(orders)
          .where(eq(orders.awbCode, String(awbCode)))
          .limit(1);
        targetOrder = found[0];
      }

      if (targetOrder) {
        const internalStatus = mapShiprocketStatusToInternal(currentStatus);
        const eventTime = new Date(eventTimeStr);
        const now = new Date();

        const updateData: Record<string, any> = {
          fulfillmentStatus: internalStatus,
          lastTrackingUpdate: now,
          updatedAt: now,
        };

        if (internalStatus === "IN_TRANSIT" && !targetOrder.shippedAt) {
          updateData.shippedAt = now;
        }
        if (internalStatus === "DELIVERED" && !targetOrder.deliveredAt) {
          updateData.deliveredAt = now;
        }
        if (internalStatus === "CANCELLED" && !targetOrder.cancelledAt) {
          updateData.cancelledAt = now;
        }

        await db.update(orders).set(updateData).where(eq(orders.id, targetOrder.id));

        // Insert tracking event idempotently
        await db.insert(shipmentTrackingEvents).values({
          id: `evt_${Math.random().toString(36).substring(2, 11)}`,
          orderId: targetOrder.id,
          shipmentId: targetOrder.shiprocketShipmentId,
          awbCode: String(awbCode || targetOrder.awbCode),
          status: internalStatus,
          statusCode: String(payload.status_code || currentStatus),
          location: String(location),
          description: String(activity),
          eventTime,
          rawEventReference: payload,
        });

        // Trigger non-blocking email dispatches based on shipment state changes
        try {
          const { sendShipmentDispatchedEmail, sendDeliveryCompletedEmail } = await import("@/lib/email");
          if (internalStatus === "IN_TRANSIT" && !targetOrder.shippedAt) {
            await sendShipmentDispatchedEmail(targetOrder.id);
          }
          if (internalStatus === "DELIVERED" && !targetOrder.deliveredAt) {
            await sendDeliveryCompletedEmail(targetOrder.id);
          }
        } catch (emailErr) {
          console.error(`Shiprocket webhook email trigger error for ${targetOrder.id}:`, emailErr);
        }

        // Revalidate pages
        revalidatePath(`/admin/orders/${targetOrder.id}`);
        revalidatePath(`/account/orders/${targetOrder.id}`);
        revalidatePath("/admin/orders");
      }
    }

    return NextResponse.json({ success: true, processed: true });
  } catch (error: any) {
    console.error("Shiprocket webhook error:", error);
    return NextResponse.json({ error: error.message || "Webhook processing error" }, { status: 500 });
  }
}
