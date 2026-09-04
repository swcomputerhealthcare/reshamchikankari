"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/helpers";
import { db } from "@/db";
import { orders, shipmentTrackingEvents } from "@/db/schema/order";
import { products } from "@/db/schema/catalog";
import { eq } from "drizzle-orm";
import {
  createShiprocketOrder,
  assignShiprocketAWB,
  generateShiprocketPickup,
  trackShiprocketShipment,
  mapShiprocketStatusToInternal,
  type DBOrderForShipment,
} from "@/lib/shiprocket";

// Idempotently create Shiprocket shipment for an order
export async function triggerOrderFulfillment(orderId: string) {
  try {
    // 1. Query order with items & shipping metadata
    const orderData = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
      with: {
        items: {
          with: {
            product: true,
          },
        },
      },
    });

    if (!orderData) {
      return { success: false, error: "Order not found." };
    }

    // Ensure order is paid before triggering fulfillment
    if (orderData.paymentStatus !== "PAID") {
      return { success: false, error: "Order payment is not confirmed (Status must be PAID)." };
    }

    // IDEMPOTENCY GUARD: If shiprocket_order_id already exists, return existing status
    if (orderData.shiprocketOrderId) {
      console.log(`Order ${orderId} already has Shiprocket Order ID ${orderData.shiprocketOrderId}. Skipping creation.`);
      return {
        success: true,
        alreadyProcessed: true,
        shiprocketOrderId: orderData.shiprocketOrderId,
        awbCode: orderData.awbCode,
        fulfillmentStatus: orderData.fulfillmentStatus,
      };
    }

    // Build shipment order object
    const shipmentOrder: DBOrderForShipment = {
      id: orderData.id,
      orderNumber: orderData.orderNumber,
      subtotalPaise: orderData.subtotalPaise,
      discountPaise: orderData.discountPaise,
      shippingPaise: orderData.shippingPaise,
      totalPaise: orderData.totalPaise,
      paymentProvider: orderData.paymentProvider,
      shippingAddressSnapshot: orderData.shippingAddressSnapshot,
      createdAt: orderData.createdAt,
      items: orderData.items.map((i) => ({
        productName: i.productName,
        sku: i.sku,
        quantity: i.quantity,
        unitPricePaise: i.unitPricePaise,
        lineTotalPaise: i.lineTotalPaise,
        product: i.product,
      })),
    };

    // 2. Create Shiprocket Order
    const createRes = await createShiprocketOrder(shipmentOrder);
    if (!createRes.success || !createRes.data) {
      const errorMsg = createRes.error || "Shiprocket order creation failed.";
      await db
        .update(orders)
        .set({
          fulfillmentStatus: "PENDING",
          shippingError: errorMsg,
          updatedAt: new Date(),
        })
        .where(eq(orders.id, orderId));

      return { success: false, error: errorMsg };
    }

    const srData = createRes.data;
    const srOrderId = String(srData.order_id);
    const srShipmentId = String(srData.shipment_id);

    // Update DB with Shiprocket Order ID & Shipment ID
    await db
      .update(orders)
      .set({
        shiprocketOrderId: srOrderId,
        shiprocketShipmentId: srShipmentId,
        fulfillmentStatus: "SHIPMENT_CREATED",
        shippingError: null,
        shippingCreatedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId));

    // 3. Assign AWB
    let awbCode = srData.awb_code || null;
    let courierName = srData.courier_name || null;
    let courierCompanyId = srData.courier_company_id ? Number(srData.courier_company_id) : null;

    if (!awbCode && srShipmentId) {
      const awbRes = await assignShiprocketAWB(srShipmentId);
      if (awbRes.success && awbRes.data?.response?.data) {
        const awbData = awbRes.data.response.data;
        awbCode = awbData.awb_code;
        courierName = awbData.courier_name;
        courierCompanyId = awbData.courier_company_id;
      }
    }

    if (awbCode) {
      const trackingUrl = `https://shiprocket.co/tracking/${awbCode}`;
      await db
        .update(orders)
        .set({
          awbCode,
          courierName,
          courierCompanyId,
          trackingUrl,
          fulfillmentStatus: "AWB_ASSIGNED",
          updatedAt: new Date(),
        })
        .where(eq(orders.id, orderId));

      // 4. Request Pickup
      const pickupRes = await generateShiprocketPickup(srShipmentId);
      if (pickupRes.success) {
        await db
          .update(orders)
          .set({
            fulfillmentStatus: "PICKUP_SCHEDULED",
            pickupScheduledAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(orders.id, orderId));
      }

      // Dispatch Shipment Dispatched Email asynchronously
      try {
        const { sendShipmentDispatchedEmail } = await import("@/lib/email");
        await sendShipmentDispatchedEmail(orderId);
      } catch (emailErr) {
        console.error(`Shipment Dispatched Email error for order ${orderId}:`, emailErr);
      }
    }

    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath(`/account/orders/${orderId}`);

    return {
      success: true,
      shiprocketOrderId: srOrderId,
      shiprocketShipmentId: srShipmentId,
      awbCode,
      courierName,
    };
  } catch (error: any) {
    console.error(`Fulfillment error for order ${orderId}:`, error);
    return { success: false, error: error.message || "Failed to process fulfillment." };
  }
}

// Admin Action: Create or Retry Shipment
export async function adminRetryShipmentAction(orderId: string) {
  await requireAdmin();
  const res = await triggerOrderFulfillment(orderId);
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
  return res;
}

// Admin Action: Assign/Retry AWB
export async function adminRetryAssignAWBAction(orderId: string) {
  await requireAdmin();
  try {
    const orderData = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
    });

    if (!orderData || !orderData.shiprocketShipmentId) {
      return { success: false, error: "No shipment ID found for this order." };
    }

    const awbRes = await assignShiprocketAWB(orderData.shiprocketShipmentId);
    if (!awbRes.success || !awbRes.data?.response?.data) {
      return { success: false, error: awbRes.error || "Failed to assign AWB." };
    }

    const awbData = awbRes.data.response.data;
    const awbCode = awbData.awb_code;
    const courierName = awbData.courier_name;
    const courierCompanyId = awbData.courier_company_id;
    const trackingUrl = awbData.tracking_url || `https://shiprocket.co/tracking/${awbCode}`;

    await db
      .update(orders)
      .set({
        awbCode,
        courierName,
        courierCompanyId,
        trackingUrl,
        fulfillmentStatus: "AWB_ASSIGNED",
        shippingError: null,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId));

    revalidatePath(`/admin/orders/${orderId}`);
    return { success: true, awbCode, courierName };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to assign AWB." };
  }
}

// Admin Action: Request Pickup
export async function adminRetryPickupAction(orderId: string) {
  await requireAdmin();
  try {
    const orderData = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
    });

    if (!orderData || !orderData.shiprocketShipmentId) {
      return { success: false, error: "No shipment ID found for this order." };
    }

    const pickupRes = await generateShiprocketPickup(orderData.shiprocketShipmentId);
    if (!pickupRes.success) {
      return { success: false, error: pickupRes.error || "Failed to schedule pickup." };
    }

    await db
      .update(orders)
      .set({
        fulfillmentStatus: "PICKUP_SCHEDULED",
        pickupScheduledAt: new Date(),
        shippingError: null,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId));

    revalidatePath(`/admin/orders/${orderId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to schedule pickup." };
  }
}

// Admin / System Action: Sync Tracking Status
export async function syncOrderTrackingAction(orderId: string) {
  try {
    const orderData = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
    });

    if (!orderData || !orderData.awbCode) {
      return { success: false, error: "No AWB code available for tracking." };
    }

    const trackRes = await trackShiprocketShipment(orderData.awbCode);
    if (!trackRes.success) {
      return { success: false, error: trackRes.error || "Tracking update failed." };
    }

    const newStatus: string = trackRes.internalStatus || "IN_TRANSIT";
    const now = new Date();

    const updateData: Record<string, any> = {
      fulfillmentStatus: newStatus,
      lastTrackingUpdate: now,
      updatedAt: now,
    };

    if (newStatus === "IN_TRANSIT" && !orderData.shippedAt) {
      updateData.shippedAt = now;
    }
    if (newStatus === "DELIVERED" && !orderData.deliveredAt) {
      updateData.deliveredAt = now;
    }
    if (newStatus === "CANCELLED" && !orderData.cancelledAt) {
      updateData.cancelledAt = now;
    }

    await db.update(orders).set(updateData).where(eq(orders.id, orderId));

    // Log latest activity event
    if (trackRes.activities && trackRes.activities.length > 0) {
      const latestAct = trackRes.activities[0];
      const actStatus = latestAct?.status ? String(latestAct.status) : "STATUS_UPDATE";
      const actLocation = latestAct?.location ? String(latestAct.location) : "In Transit";
      const actDesc = latestAct?.activity ? String(latestAct.activity) : `Status updated to ${newStatus}`;
      const actTime = latestAct?.date ? new Date(latestAct.date) : now;

      await db
        .insert(shipmentTrackingEvents)
        .values({
          id: `evt_${Math.random().toString(36).substring(2, 11)}`,
          orderId,
          shipmentId: orderData.shiprocketShipmentId || null,
          awbCode: orderData.awbCode || null,
          status: newStatus,
          statusCode: actStatus,
          location: actLocation,
          description: actDesc,
          eventTime: actTime,
          rawEventReference: latestAct || {},
        });
    }

    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath(`/account/orders/${orderId}`);

    return { success: true, status: newStatus };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to sync tracking." };
  }
}
