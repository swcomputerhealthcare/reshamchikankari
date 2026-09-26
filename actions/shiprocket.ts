"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/helpers";
import { db } from "@/db";
import { orders, shipmentTrackingEvents } from "@/db/schema/order";
import { eq, or } from "drizzle-orm";
import {
  createShiprocketOrder,
  assignShiprocketAWB,
  generateShiprocketPickup,
  trackShiprocketShipment,
  checkCourierServiceability,
  getShiprocketOrderDetails,
  getValidatedPickupLocation,
  extractShipmentFromOrderDetails,
  type DBOrderForShipment,
} from "@/lib/shiprocket";

// Idempotently create Shiprocket shipment for an order
export async function triggerOrderFulfillment(orderId: string) {
  try {
    // 1. Query order with items & shipping metadata (by DB id or Order Number)
    const orderData = await db.query.orders.findFirst({
      where: or(eq(orders.id, orderId), eq(orders.orderNumber, orderId)),
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

    // Allow paid orders, COD orders, or confirmed/processing orders
    const isEligibleForShipment =
      orderData.paymentStatus === "PAID" ||
      orderData.paymentProvider === "COD" ||
      orderData.paymentStatus === "COD_PENDING" ||
      orderData.status === "CONFIRMED" ||
      orderData.status === "PROCESSING";

    if (!isEligibleForShipment) {
      return { success: false, error: `Order is not confirmed for shipping (Status: ${orderData.status}, Payment: ${orderData.paymentStatus}).` };
    }

    // PART 10: Validate Pickup Location before proceeding (do NOT fall back to customer address)
    const pickupLoc = await getValidatedPickupLocation();
    if (!pickupLoc.valid) {
      const errorMsg = pickupLoc.error || "Invalid Shiprocket pickup location.";
      await db
        .update(orders)
        .set({
          shippingError: errorMsg,
          updatedAt: new Date(),
        })
        .where(eq(orders.id, orderData.id));

      return { success: false, error: errorMsg };
    }

    // IDEMPOTENCY GUARD (PART 16): Check what stage the order is at
    let srOrderId: string | null = orderData.shiprocketOrderId || null;
    let srShipmentId: string | null = orderData.shiprocketShipmentId || null;
    let awbCode: string | null = orderData.awbCode || null;
    let courierName: string | null = orderData.courierName || null;
    let courierCompanyId: number | null = orderData.courierCompanyId || null;

    // Check live Shiprocket status if srOrderId exists but awbCode is missing
    if (srOrderId && !awbCode) {
      try {
        const srDetails = await getShiprocketOrderDetails(srOrderId);
        const shipment = extractShipmentFromOrderDetails(srDetails.data?.data);
        if (shipment?.id && !srShipmentId) {
          srShipmentId = shipment.id;
        }
        if (shipment?.awb) {
          awbCode = shipment.awb;
          courierName = shipment.courier || courierName || "Express Courier";
          courierCompanyId = shipment.courierCompanyId || courierCompanyId;
        }
      } catch (checkErr) {
        console.warn("Could not check live Shiprocket order status:", checkErr);
      }
    }

    // If order already has AWB and pickup scheduled, nothing more to do
    if (srOrderId && awbCode && (orderData.fulfillmentStatus === "PICKUP_SCHEDULED" || orderData.pickupScheduledAt)) {
      console.log(`Order ${orderId} already fulfilled with AWB ${awbCode} and pickup scheduled.`);
      return {
        success: true,
        alreadyProcessed: true,
        shiprocketOrderId: srOrderId,
        shiprocketShipmentId: srShipmentId,
        awbCode,
        courierName,
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

    // 2. Create Shiprocket Order ONLY if srOrderId does not exist yet (Idempotent!)
    if (!srOrderId) {
      const createRes = await createShiprocketOrder(shipmentOrder, pickupLoc.locationName);
      if (!createRes.success || !createRes.data) {
        const errorMsg = createRes.error || "Shiprocket order creation failed.";
        await db
          .update(orders)
          .set({
            fulfillmentStatus: "PENDING",
            shippingError: errorMsg,
            updatedAt: new Date(),
          })
          .where(eq(orders.id, orderData.id));

        return { success: false, error: errorMsg };
      }

      const srData = createRes.data;
      srOrderId = String(srData.order_id);
      srShipmentId = String(srData.shipment_id);

      // Check if AWB was automatically generated during order creation
      if (srData.awb_code) {
        awbCode = srData.awb_code;
        courierName = srData.courier_name || courierName || "Express Courier";
        courierCompanyId = srData.courier_company_id ? Number(srData.courier_company_id) : courierCompanyId;
      }

      await db
        .update(orders)
        .set({
          shiprocketOrderId: srOrderId,
          shiprocketShipmentId: srShipmentId,
          fulfillmentStatus: awbCode ? "AWB_ASSIGNED" : "SHIPMENT_CREATED",
          shippingError: null,
          shippingCreatedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(orders.id, orderData.id));
    }

    // 3. Assign Courier / AWB ONLY if awbCode does not exist yet (Idempotent!)
    if (!awbCode && srShipmentId) {
      let courierId: number | undefined = undefined;
      try {
        const addrSnap = (orderData.shippingAddressSnapshot as any) || {};
        const destPincode = String(
          addrSnap.pincode ||
          addrSnap.zip ||
          "226001"
        );
        const totalWeight = shipmentOrder.items.reduce(
          (acc, i) => acc + (i.product?.weightKg ?? 0.5) * i.quantity,
          0
        );
        const serviceCheck = await checkCourierServiceability(destPincode, totalWeight || 0.5, pickupLoc.pincode);
        if (serviceCheck.serviceable && serviceCheck.recommendedCourierId) {
          courierId = serviceCheck.recommendedCourierId;
        }
      } catch (e) {
        console.warn("Serviceability lookup error during AWB assignment:", e);
      }

      // Attempt AWB assignment with recommended courier
      let awbRes = await assignShiprocketAWB(srShipmentId, courierId);
      let awbData = awbRes.data?.response?.data || (awbRes.data as any);

      // Check if AWB code returned directly
      if (awbRes.success && awbData && (awbData.awb_code || awbData.awb)) {
        awbCode = awbData.awb_code || awbData.awb;
        courierName = awbData.courier_name || awbData.courier || "Express Courier";
        courierCompanyId = awbData.courier_company_id ? Number(awbData.courier_company_id) : null;
      } else {
        // Check if error message indicates AWB is already assigned
        const rawErrMsg = String(
          (awbRes.data as any)?.message ||
          awbData?.awb_assign_error ||
          awbRes.error ||
          ""
        );
        const match = rawErrMsg.match(/already assigned with awb\s*-\s*([a-zA-Z0-9]+)/i);

        if (match?.[1]) {
          awbCode = match[1];
          // Try to get courier name from live order details
          try {
            const srDetails = await getShiprocketOrderDetails(srOrderId!);
            const shipment = extractShipmentFromOrderDetails(srDetails.data?.data);
            if (shipment?.courier) courierName = shipment.courier;
            if (shipment?.courierCompanyId) courierCompanyId = shipment.courierCompanyId;
          } catch {}
          courierName = courierName || "Delhivery Air";
        } else {
          // Fallback: Retry auto-assignment without explicit courierId
          console.warn(`AWB assignment notice for shipment ${srShipmentId}. Attempting auto courier allocation...`);
          const fallbackRes = await assignShiprocketAWB(srShipmentId);
          const fallbackData = fallbackRes.data?.response?.data || (fallbackRes.data as any);

          if (fallbackRes.success && fallbackData && (fallbackData.awb_code || fallbackData.awb)) {
            awbCode = fallbackData.awb_code || fallbackData.awb;
            courierName = fallbackData.courier_name || fallbackData.courier || "Express Courier";
            courierCompanyId = fallbackData.courier_company_id ? Number(fallbackData.courier_company_id) : null;
          } else {
            const fallbackErrMsg = String(
              (fallbackRes.data as any)?.message ||
              fallbackData?.awb_assign_error ||
              fallbackRes.error ||
              ""
            );
            const fallbackMatch = fallbackErrMsg.match(/already assigned with awb\s*-\s*([a-zA-Z0-9]+)/i);
            if (fallbackMatch?.[1]) {
              awbCode = fallbackMatch[1];
              courierName = courierName || "Delhivery Air";
            } else {
              // Final check: query live order details in case Shiprocket assigned it asynchronously
              try {
                const srDetails = await getShiprocketOrderDetails(srOrderId!);
                const shipment = extractShipmentFromOrderDetails(srDetails.data?.data);
                if (shipment?.awb) {
                  awbCode = shipment.awb;
                  courierName = shipment.courier || "Express Courier";
                  courierCompanyId = shipment.courierCompanyId;
                }
              } catch {}
            }
          }
        }
      }

      if (!awbCode) {
        const errorMsg =
          awbData?.awb_assign_error ||
          (awbRes.data as any)?.message ||
          awbRes.error ||
          "Awaiting manual courier/AWB assignment in Shiprocket dashboard.";
        console.warn(`AWB assignment notice for order ${orderId}:`, errorMsg);
        await db
          .update(orders)
          .set({
            shippingError: errorMsg,
            updatedAt: new Date(),
          })
          .where(eq(orders.id, orderData.id));
      }
    }

    // 4. If AWB is assigned, update DB and schedule pickup
    if (awbCode) {
      const trackingUrl = `https://shiprocket.co/tracking/${awbCode}`;
      await db
        .update(orders)
        .set({
          awbCode,
          courierName: courierName || "Express Courier",
          courierCompanyId,
          trackingUrl,
          fulfillmentStatus: "AWB_ASSIGNED",
          shippingError: null,
          updatedAt: new Date(),
        })
        .where(eq(orders.id, orderData.id));

      // 5. Schedule Pickup if not already scheduled
      if (srShipmentId && orderData.fulfillmentStatus !== "PICKUP_SCHEDULED" && !orderData.pickupScheduledAt) {
        const pickupRes = await generateShiprocketPickup(srShipmentId);
        if (pickupRes.success) {
          await db
            .update(orders)
            .set({
              fulfillmentStatus: "PICKUP_SCHEDULED",
              pickupScheduledAt: new Date(),
              updatedAt: new Date(),
            })
            .where(eq(orders.id, orderData.id));
        } else {
          console.warn(`Pickup scheduling notice for order ${orderId}:`, pickupRes.error);
        }
      }

      // Dispatch Shipment Dispatched Email asynchronously
      try {
        const { sendShipmentDispatchedEmail } = await import("@/lib/email");
        await sendShipmentDispatchedEmail(orderData.id);
      } catch (emailErr) {
        console.error(`Shipment Dispatched Email error for order ${orderId}:`, emailErr);
      }
    }

    try {
      revalidatePath(`/admin/orders/${orderData.id}`);
      revalidatePath(`/account/orders/${orderData.id}`);
    } catch (revalErr) {
      console.warn("Path revalidation warning:", revalErr);
    }

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

    if (orderData.awbCode) {
      return { success: true, awbCode: orderData.awbCode, courierName: orderData.courierName };
    }

    let awbCode: string | null = null;
    let courierName: string | null = null;
    let courierCompanyId: number | null = null;

    const awbRes = await assignShiprocketAWB(orderData.shiprocketShipmentId);
    const awbData = awbRes.data?.response?.data || (awbRes.data as any);

    if (awbRes.success && awbData?.awb_code) {
      awbCode = awbData.awb_code;
      courierName = awbData.courier_name || "Express Courier";
      courierCompanyId = awbData.courier_company_id ? Number(awbData.courier_company_id) : null;
    } else {
      const errMsg = String(
        (awbRes.data as any)?.message ||
        awbData?.awb_assign_error ||
        awbRes.error ||
        ""
      );
      const match = errMsg.match(/already assigned with awb\s*-\s*([a-zA-Z0-9]+)/i);
      if (match?.[1]) {
        awbCode = match[1];
      } else if (orderData.shiprocketOrderId) {
        const srDetails = await getShiprocketOrderDetails(orderData.shiprocketOrderId);
        const shipment = extractShipmentFromOrderDetails(srDetails.data?.data);
        if (shipment?.awb) {
          awbCode = shipment.awb;
          courierName = shipment.courier;
          courierCompanyId = shipment.courierCompanyId;
        }
      }
    }

    if (!awbCode) {
      const detailedError =
        (awbRes.data?.response?.data as any)?.awb_assign_error ||
        (awbRes.data as any)?.message ||
        awbRes.error ||
        "Failed to assign AWB. Please ensure your Shiprocket wallet has sufficient balance or assign courier directly via Shiprocket dashboard.";
      return { success: false, error: detailedError };
    }

    const trackingUrl = `https://shiprocket.co/tracking/${awbCode}`;

    await db
      .update(orders)
      .set({
        awbCode,
        courierName: courierName || "Express Courier",
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

    if (!orderData) {
      return { success: false, error: "Order not found." };
    }

    // If order has no AWB yet, check if Shiprocket has assigned one
    if (!orderData.awbCode && orderData.shiprocketOrderId) {
      try {
        const srDetails = await getShiprocketOrderDetails(orderData.shiprocketOrderId);
        const shipment = extractShipmentFromOrderDetails(srDetails.data?.data);
        const liveAwb = shipment?.awb;
        if (liveAwb) {
          const courierName = shipment?.courier || null;
          const trackingUrl = `https://shiprocket.co/tracking/${liveAwb}`;
          await db
            .update(orders)
            .set({
              awbCode: liveAwb,
              courierName,
              courierCompanyId: shipment?.courierCompanyId || null,
              trackingUrl,
              fulfillmentStatus: "AWB_ASSIGNED",
              shippingError: null,
              updatedAt: new Date(),
            })
            .where(eq(orders.id, orderId));

          revalidatePath(`/admin/orders/${orderId}`);
          revalidatePath(`/account/orders/${orderId}`);
          return { success: true, awbCode: liveAwb, courierName };
        }
      } catch (checkErr) {
        console.warn("Could not sync live AWB during tracking sync:", checkErr);
      }
    }

    if (!orderData.awbCode) {
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
