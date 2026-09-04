import { shiprocketFetch } from "./client";
import { env } from "@/lib/validation/env";
import type {
  CreateShiprocketOrderPayload,
  CreateShiprocketOrderResponse,
  ShiprocketOrderItemInput,
} from "./types";

export interface DBOrderForShipment {
  id: string;
  orderNumber: string;
  subtotalPaise: number;
  discountPaise: number;
  shippingPaise: number;
  totalPaise: number;
  paymentProvider: string | null;
  shippingAddressSnapshot: any;
  createdAt: Date | string;
  items: Array<{
    productName: string;
    sku: string;
    quantity: number;
    unitPricePaise: number;
    lineTotalPaise: number;
    product?: {
      weightKg?: number | null;
      lengthCm?: number | null;
      breadthCm?: number | null;
      heightCm?: number | null;
      hsnCode?: string | null;
    } | null;
  }>;
}

export function buildShiprocketOrderPayload(
  order: DBOrderForShipment
): CreateShiprocketOrderPayload {
  const addr = order.shippingAddressSnapshot || {};

  // Calculate total package weight & max dimensions from order items
  let totalWeightKg = 0;
  let maxLengthCm = 30;
  let maxBreadthCm = 25;
  let maxHeightCm = 5;

  const orderItems: ShiprocketOrderItemInput[] = order.items.map((item) => {
    const itemWeight = item.product?.weightKg ?? 0.5; // Default 0.5kg for Chikankari garment
    totalWeightKg += itemWeight * item.quantity;

    if (item.product?.lengthCm && item.product.lengthCm > maxLengthCm) {
      maxLengthCm = item.product.lengthCm;
    }
    if (item.product?.breadthCm && item.product.breadthCm > maxBreadthCm) {
      maxBreadthCm = item.product.breadthCm;
    }
    if (item.product?.heightCm && item.product.heightCm > maxHeightCm) {
      maxHeightCm = item.product.heightCm;
    }

    return {
      name: item.productName || "Lucknowi Chikankari Garment",
      sku: item.sku || `RC-${order.id.slice(-6).toUpperCase()}`,
      units: item.quantity,
      selling_price: Math.round(item.unitPricePaise / 100),
      discount: 0,
      hsn: item.product?.hsnCode || "6204",
    };
  });

  // Ensure minimum total weight is 0.5kg
  if (totalWeightKg <= 0 || isNaN(totalWeightKg)) {
    totalWeightKg = 0.5;
  }

  // Format order date YYYY-MM-DD HH:mm
  const dateObj = new Date(order.createdAt);
  const formattedDate = dateObj.toISOString().replace("T", " ").substring(0, 16);

  const isCOD = order.paymentProvider === "COD";

  const firstName = addr.firstName || addr.name?.split(" ")[0] || "Valued";
  const lastName = addr.lastName || addr.name?.split(" ").slice(1).join(" ") || "Customer";

  return {
    order_id: order.orderNumber,
    order_date: formattedDate,
    pickup_location: env.SHIPROCKET_PICKUP_LOCATION || "Primary",
    billing_customer_name: firstName,
    billing_last_name: lastName,
    billing_address: addr.addressLine1 || addr.address || "Lucknow Store Order",
    billing_address_2: addr.addressLine2 || "",
    billing_city: addr.city || "Lucknow",
    billing_pincode: String(addr.pincode || addr.zip || "226001"),
    billing_state: addr.state || "Uttar Pradesh",
    billing_country: addr.country || "India",
    billing_email: addr.email || "customer@reshamchikankari.com",
    billing_phone: String(addr.phone || "9999999999"),
    shipping_is_billing: true,
    order_items: orderItems,
    payment_method: isCOD ? "COD" : "Prepaid",
    shipping_charges: Math.round(order.shippingPaise / 100),
    total_discount: Math.round(order.discountPaise / 100),
    sub_total: Math.round(order.subtotalPaise / 100),
    length: maxLengthCm,
    breadth: maxBreadthCm,
    height: maxHeightCm,
    weight: Number(totalWeightKg.toFixed(2)),
  };
}

export async function createShiprocketOrder(order: DBOrderForShipment) {
  const payload = buildShiprocketOrderPayload(order);

  const res = await shiprocketFetch<CreateShiprocketOrderResponse>(
    "/orders/create/adhoc",
    {
      method: "POST",
      body: payload,
    }
  );

  return res;
}

export async function cancelShiprocketOrder(shiprocketOrderId: number | string) {
  const res = await shiprocketFetch<{ status: number; message: string }>(
    "/orders/cancel",
    {
      method: "POST",
      body: { ids: [Number(shiprocketOrderId)] },
    }
  );

  return res;
}
