import { NextResponse } from "next/server";
import crypto from "crypto";
import { env } from "@/lib/validation/env";
import { db } from "@/db";
import { orders, shipmentTrackingEvents, orderTimeline } from "@/db/schema/order";
import { eq, or } from "drizzle-orm";
import { mapShiprocketStatusToInternal } from "@/lib/shiprocket";

export const dynamic = "force-dynamic";

function verifyShiprocketHeader(req: Request): boolean {
  const secret = process.env.SHIPROCKET_WEBHOOK_SECRET || env.SHIPROCKET_WEBHOOK_SECRET;
  if (!secret) return true; // If no secret configured, proceed

  const sigHeader = req.headers.get("x-shiprocket-signature") || req.headers.get("x-api-key");
  if (!sigHeader) return true;

  return sigHeader === secret;
}

export async function POST(req: Request) {
  try {
    if (!verifyShiprocketHeader(req)) {
      return NextResponse.json({ error: "Invalid Shiprocket webhook header signature." }, { status: 401 });
    }

    const payload = await req.json();
    console.log("Inbound Shiprocket Webhook Event:", payload);

    const isDbAvailable = !!process.env.DATABASE_URL && process.env.DATABASE_URL.indexOf("[YOUR-PASSWORD]") === -1;
    if (!isDbAvailable) {
      return NextResponse.json({ success: true, message: "Offline simulation webhook acknowledged." });
    }

    // Shiprocket payload structure:
    // { order_id, sr_order_id, shipment_id, awb, current_status, current_status_id, courier_name, location, etd, ... }
    const srOrderId = payload.sr_order_id ? String(payload.sr_order_id) : (payload.order_id ? String(payload.order_id) : null);
    const channelOrderId = payload.channel_order_id || payload.order_id || payload.order_number;
    const awbCode = payload.awb || payload.awb_code;
    const currentStatusStr = payload.current_status || payload.status || "IN_TRANSIT";
    const courierName = payload.courier_name || payload.courier;
    const location = payload.location || payload.current_location || "In Transit";

    if (!srOrderId && !channelOrderId && !awbCode) {
      return NextResponse.json({ message: "No identifying order/shipment fields found in webhook payload." }, { status: 200 });
    }

    // Find order by shiprocketOrderId, orderNumber, DB id, or awbCode
    const conditions = [];
    if (srOrderId) conditions.push(eq(orders.shiprocketOrderId, srOrderId));
    if (channelOrderId) {
      conditions.push(eq(orders.orderNumber, String(channelOrderId)));
      conditions.push(eq(orders.id, String(channelOrderId)));
    }
    if (awbCode) conditions.push(eq(orders.awbCode, String(awbCode)));

    const [matchedOrder] = await db
      .select()
      .from(orders)
      .where(or(...conditions))
      .limit(1);

    if (!matchedOrder) {
      console.warn("Shiprocket Webhook: No matching order found for payload", payload);
      return NextResponse.json({ message: "Webhook acknowledged; no matching order found." }, { status: 200 });
    }

    const internalStatus = mapShiprocketStatusToInternal(currentStatusStr);
    const now = new Date();

    const updateData: Record<string, any> = {
      fulfillmentStatus: internalStatus,
      lastTrackingUpdate: now,
      updatedAt: now,
    };

    if (awbCode && !matchedOrder.awbCode) {
      updateData.awbCode = String(awbCode);
      updateData.trackingUrl = `https://shiprocket.co/tracking/${awbCode}`;
    }
    if (courierName && !matchedOrder.courierName) {
      updateData.courierName = String(courierName);
    }
    if (internalStatus === "IN_TRANSIT" && !matchedOrder.shippedAt) {
      updateData.shippedAt = now;
    }
    if (internalStatus === "DELIVERED" && !matchedOrder.deliveredAt) {
      updateData.deliveredAt = now;
    }
    if (internalStatus === "CANCELLED" && !matchedOrder.cancelledAt) {
      updateData.cancelledAt = now;
    }

    await db.update(orders).set(updateData).where(eq(orders.id, matchedOrder.id));

    // Record tracking event activity
    await db.insert(shipmentTrackingEvents).values({
      id: `evt_${Math.random().toString(36).substring(2, 11)}`,
      orderId: matchedOrder.id,
      shipmentId: matchedOrder.shiprocketShipmentId || (payload.shipment_id ? String(payload.shipment_id) : null),
      awbCode: awbCode || matchedOrder.awbCode || null,
      status: internalStatus,
      statusCode: payload.current_status_id ? String(payload.current_status_id) : currentStatusStr,
      location: String(location),
      description: payload.scans?.[0]?.instructions || payload.scans?.[0]?.activity || `Status updated to ${currentStatusStr}`,
      eventTime: payload.updated_at ? new Date(payload.updated_at) : now,
      rawEventReference: payload,
    });

    // Record timeline log
    await db.insert(orderTimeline).values({
      id: `log_${Math.random().toString(36).substring(2, 11)}`,
      orderId: matchedOrder.id,
      status: internalStatus,
      message: `Shiprocket Webhook: ${currentStatusStr} (${location})`,
    });

    const { revalidatePath } = await import("next/cache");
    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${matchedOrder.id}`);
    revalidatePath(`/account/orders/${matchedOrder.id}`);

    return NextResponse.json({ success: true, orderId: matchedOrder.id, status: internalStatus });
  } catch (err: any) {
    console.error("Shiprocket webhook processing error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
