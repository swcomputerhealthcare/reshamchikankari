import { env } from "@/lib/validation/env";
import { db } from "@/db";
import { orders } from "@/db/schema/order";
import { eq } from "drizzle-orm";
import {
  renderOrderConfirmationEmailHtml,
  type OrderConfirmationEmailData,
} from "./templates/order-confirmation";
import {
  renderShipmentDispatchedEmailHtml,
  type ShipmentDispatchedEmailData,
} from "./templates/shipment-dispatched";
import {
  renderDeliveryCompletedEmailHtml,
  type DeliveryCompletedEmailData,
} from "./templates/delivery-completed";

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  const apiKey = process.env.RESEND_API_KEY || env.RESEND_API_KEY;

  if (!apiKey || apiKey === "dummy" || apiKey.includes("re_dummy")) {
    console.log(`[EMAIL SIMULATION] To: ${to} | Subject: ${subject}`);
    return { success: true, simulated: true };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: "Resham Chikankari <orders@reshamchikankari.com>",
        to: [to],
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Resend API dispatch error:", errText);
      return { success: false, error: errText };
    }

    const data = await res.json();
    return { success: true, data };
  } catch (error: any) {
    console.error("Resend sendEmail error:", error);
    return { success: false, error: error.message };
  }
}

// 1. Order Confirmation Email Dispatcher
export async function sendOrderConfirmationEmail(orderId: string) {
  try {
    const order = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
      with: { items: true, user: true },
    });

    if (!order) return { success: false, error: "Order not found" };

    const shipping = (order.shippingAddressSnapshot as any) || {};
    const recipientEmail = shipping.email || order.user?.email;

    if (!recipientEmail) return { success: false, error: "Recipient email unavailable" };

    const emailData: OrderConfirmationEmailData = {
      orderNumber: order.orderNumber,
      customerName: shipping.fullName || order.user?.fullName || "Valued Customer",
      customerEmail: recipientEmail,
      dateStr: new Date(order.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      paymentMethod: `${order.paymentStatus} (${order.paymentProvider || "ONLINE"})`,
      subtotal: `₹${(order.subtotalPaise / 100).toLocaleString("en-IN")}`,
      discount: `₹${(order.discountPaise / 100).toLocaleString("en-IN")}`,
      shipping: order.shippingPaise === 0 ? "FREE" : `₹${(order.shippingPaise / 100).toLocaleString("en-IN")}`,
      walletPaid: `₹${(order.walletAmountPaise / 100).toLocaleString("en-IN")}`,
      total: `₹${(order.totalPaise / 100).toLocaleString("en-IN")}`,
      items: order.items.map((i) => ({
        name: i.productName,
        sku: i.sku,
        sizeName: i.variantSnapshot || undefined,
        quantity: i.quantity,
        price: `₹${((i.unitPricePaise * i.quantity) / 100).toLocaleString("en-IN")}`,
      })),
      shippingAddress: {
        fullName: shipping.fullName || "Valued Customer",
        street: shipping.street || shipping.address || "Standard Shipping",
        city: shipping.city || "Lucknow",
        state: shipping.state || "Uttar Pradesh",
        pincode: String(shipping.zip || shipping.pincode || "226001"),
        phone: shipping.phone || "9999999999",
      },
    };

    const html = renderOrderConfirmationEmailHtml(emailData);
    return await sendEmail({
      to: recipientEmail,
      subject: `Order Confirmation #${order.orderNumber} — Resham Chikankari`,
      html,
    });
  } catch (error: any) {
    console.error(`Error building order confirmation email for ${orderId}:`, error);
    return { success: false, error: error.message };
  }
}

// 2. Shipment Dispatched Email Dispatcher
export async function sendShipmentDispatchedEmail(orderId: string) {
  try {
    const order = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
      with: { items: true, user: true },
    });

    if (!order || !order.awbCode) return { success: false, error: "Order or AWB code missing" };

    const shipping = (order.shippingAddressSnapshot as any) || {};
    const recipientEmail = shipping.email || order.user?.email;

    if (!recipientEmail) return { success: false, error: "Recipient email unavailable" };

    const emailData: ShipmentDispatchedEmailData = {
      orderNumber: order.orderNumber,
      customerName: shipping.fullName || order.user?.fullName || "Valued Customer",
      courierName: order.courierName || "Shiprocket Express",
      awbCode: order.awbCode,
      trackingUrl: order.trackingUrl || `https://shiprocket.co/tracking/${order.awbCode}`,
      destinationCity: shipping.city || "India",
      itemsCount: order.items.length,
    };

    const html = renderShipmentDispatchedEmailHtml(emailData);
    return await sendEmail({
      to: recipientEmail,
      subject: `Your Order #${order.orderNumber} Has Dispatched! — Resham Chikankari`,
      html,
    });
  } catch (error: any) {
    console.error(`Error building shipment email for ${orderId}:`, error);
    return { success: false, error: error.message };
  }
}

// 3. Delivery Completed Email Dispatcher
export async function sendDeliveryCompletedEmail(orderId: string) {
  try {
    const order = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
      with: { user: true },
    });

    if (!order) return { success: false, error: "Order not found" };

    const shipping = (order.shippingAddressSnapshot as any) || {};
    const recipientEmail = shipping.email || order.user?.email;

    if (!recipientEmail) return { success: false, error: "Recipient email unavailable" };

    const baseUrl = env.BETTER_AUTH_URL || "https://reshamchikankari.com";

    const emailData: DeliveryCompletedEmailData = {
      orderNumber: order.orderNumber,
      customerName: shipping.fullName || order.user?.fullName || "Valued Customer",
      deliveredDateStr: new Date(order.deliveredAt || Date.now()).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      reviewUrl: `${baseUrl}/patron-voices`,
    };

    const html = renderDeliveryCompletedEmailHtml(emailData);
    return await sendEmail({
      to: recipientEmail,
      subject: `Order #${order.orderNumber} Delivered — Share Your Patron Story`,
      html,
    });
  } catch (error: any) {
    console.error(`Error building delivery completed email for ${orderId}:`, error);
    return { success: false, error: error.message };
  }
}
