'use server';

import { cookies } from "next/headers";
import { getCurrentUser, requireAdmin } from "@/lib/auth/helpers";
import { getCartDetails, clearCart } from "@/lib/cart";
import { validateCouponCode } from "@/lib/coupon";
import { db } from "@/db";
import { orders, orderItems } from "@/db/schema/order";

import { getOrCreateWallet, debitWalletForOrder, creditWallet } from "@/lib/wallet";

export interface AddressData {
  fullName: string;
  email: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
}

export async function createOrderAction(
  address: AddressData,
  paymentMethod: "ONLINE" | "COD",
  walletAmountPaise = 0
) {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "Please log in to complete your checkout." };
  }

  const cart = await getCartDetails();
  if (cart.items.length === 0) {
    return { success: false, error: "Your shopping bag is empty." };
  }

  // Validate coupon if applied
  const cookieStore = await cookies();
  const couponCookie = cookieStore.get("applied_coupon")?.value;
  let discountPaise = 0;
  let couponCode: string | null = null;
  let couponId: string | null = null;

  if (couponCookie) {
    const decodedCode = decodeURIComponent(couponCookie);
    const validation = await validateCouponCode(decodedCode, cart.subtotalPaise);
    if (validation.success) {
      discountPaise = validation.discountPaise || 0;
      couponCode = validation.coupon?.code || decodedCode;
      couponId = validation.coupon?.id || null;
    }
  }

  // Calculate Shipping (Free above ₹4000)
  const shippingPaise = cart.subtotalPaise >= 400000 ? 0 : 15000;

  // Calculate COD Fee (₹50 additional charge for COD)
  const codFeePaise = paymentMethod === "COD" ? 5000 : 0;

  // Total
  const orderTotalPaise = cart.subtotalPaise - discountPaise + shippingPaise + codFeePaise;

  // Validate and Debit Wallet Balance
  const orderId = `ord_${Math.random().toString(36).substring(2, 11)}`;
  const orderNumber = `RES-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const wallet = await getOrCreateWallet(user.id);

  if (walletAmountPaise > 0) {
    if (walletAmountPaise > wallet.availableBalancePaise) {
      return { success: false, error: "Requested wallet balance is no longer available." };
    }
    if (walletAmountPaise > orderTotalPaise) {
      return { success: false, error: "Wallet amount cannot exceed order total." };
    }

    try {
      await debitWalletForOrder(wallet.id, walletAmountPaise, orderId);
    } catch (e: any) {
      return { success: false, error: e.message || "Failed to deduct wallet balance." };
    }
  }

  const remainingCashTotalPaise = orderTotalPaise - walletAmountPaise;
  const isDbAvailable = !!process.env.DATABASE_URL && process.env.DATABASE_URL.indexOf("[YOUR-PASSWORD]") === -1;

  // Resolve final order payment status
  let paymentStatus = "PENDING";
  if (remainingCashTotalPaise === 0) {
    paymentStatus = "PAID";
  } else if (paymentMethod === "COD") {
    paymentStatus = "COD_PENDING";
  }

  if (isDbAvailable) {
    try {
      await db.insert(orders).values({
        id: orderId,
        orderNumber,
        userId: user.id,
        status: "PENDING",
        paymentStatus,
        subtotalPaise: cart.subtotalPaise,
        discountPaise,
        shippingPaise: shippingPaise + codFeePaise, // Fold shipping + COD fee together
        taxPaise: 0,
        totalPaise: orderTotalPaise,
        couponCodeSnapshot: couponCode,
        shippingAddressSnapshot: {
          ...address,
          paymentMethod,
          walletPaidPaise: walletAmountPaise,
          remainingCashTotalPaise,
        },
        paymentProvider: paymentMethod === "COD" ? "COD" : (walletAmountPaise === orderTotalPaise ? "WALLET" : "ONLINE"),
        paymentId: null,
        walletAmountPaise,
        currency: "INR",
        couponId,
        billingAddressSnapshot: {
          ...address,
          paymentMethod,
          walletPaidPaise: walletAmountPaise,
          remainingCashTotalPaise,
        },
      });

      for (const item of cart.items) {
        await db.insert(orderItems).values({
          id: `item_${Math.random().toString(36).substring(2, 11)}`,
          orderId,
          productId: item.productId,
          variantId: item.variantId,
          productName: item.name,
          sku: item.sku,
          unitPricePaise: item.pricePaise,
          quantity: item.quantity,
          lineTotalPaise: item.pricePaise * item.quantity,
          productNameSnapshot: item.name,
          skuSnapshot: item.sku,
          variantSnapshot: item.sizeName || null,
        });
      }
    } catch (e) {
      console.error("Failed to save order to database, reverting wallet deduction:", e);
      // Revert wallet debit on database insert failure
      if (walletAmountPaise > 0) {
        try {
          await creditWallet(wallet.id, walletAmountPaise, "REVERSAL_CREDIT", orderId, `Refund due to order placement failure ${orderId}`, "order");
        } catch (revertErr) {
          console.error("Critical: failed to revert wallet debit:", revertErr);
        }
      }
      return { success: false, error: "Failed to place order in database. Any wallet funds have been restored." };
    }
  } else {
    console.log("Offline Mode: Created Order", {
      orderNumber,
      user: user.email,
      total: orderTotalPaise / 100,
      walletDeducted: walletAmountPaise / 100,
      remainingCash: remainingCashTotalPaise / 100,
      paymentMethod,
      address,
      items: cart.items.map(i => `${i.name} (${i.sizeName}) x${i.quantity}`),
    });
  }

  // Clear cart and coupon cookies
  await clearCart();
  cookieStore.delete("applied_coupon");

  return { success: true, orderNumber };
}

export async function updateOrderStatusAction(
  orderId: string,
  status: string,
  message: string
) {
  await requireAdmin();

  const isDbAvailable = !!process.env.DATABASE_URL && process.env.DATABASE_URL.indexOf("[YOUR-PASSWORD]") === -1;

  if (isDbAvailable) {
    try {
      const orderTimelineSchema = (await import("@/db/schema/order")).orderTimeline;

      const { eq } = await import("drizzle-orm");

      await db.transaction(async (tx) => {
        // 1. Update order status
        await tx
          .update(orders)
          .set({ status, updatedAt: new Date() })
          .where(eq(orders.id, orderId));

        // 2. Add log to orderTimeline
        await tx.insert(orderTimelineSchema).values({
          id: `log_${Math.random().toString(36).substring(2, 11)}`,
          orderId,
          status,
          message,
        });
      });

      const { revalidatePath } = await import("next/cache");
      revalidatePath("/admin/orders");
      revalidatePath(`/admin/orders/${orderId}`);
      return { success: true };
    } catch (e: any) {
      console.error("Failed to update order status:", e);
      return { success: false, error: e.message || "Failed to update order status." };
    }
  } else {
    return { success: true, message: "Offline simulated status update." };
  }
}

