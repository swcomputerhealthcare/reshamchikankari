'use server';

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
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
  try {
    let user = await getCurrentUser();
    
    // Safely resolve valid UUID for database foreign key constraints
    const isUuidStr = (id: string) => typeof id === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    const userId = (user && isUuidStr(user.id)) ? user.id : "00000000-0000-4000-a000-000000000000";
    const userEmail = address.email || user?.email || "guest@user.com";
    const userName = address.fullName || user?.name || "Guest Customer";
    const userRole = user?.role || "CUSTOMER";

    const cart = await getCartDetails();
    if (!cart.items || cart.items.length === 0) {
      return { success: false, error: "Your shopping bag is empty. Please add items to your bag before proceeding to checkout." };
    }

    // Validate coupon if applied
    const cookieStore = await cookies();
    const couponCookie = cookieStore.get("applied_coupon")?.value;
    let discountPaise = 0;
    let couponCode: string | null = null;
    let couponId: string | null = null;

    if (couponCookie) {
      try {
        let decodedCode = couponCookie;
        while (typeof decodedCode === "string" && decodedCode.includes("%")) {
          try {
            const next = decodeURIComponent(decodedCode);
            if (next === decodedCode) break;
            decodedCode = next;
          } catch {
            break;
          }
        }
        const validation = await validateCouponCode(decodedCode, cart.subtotalPaise);
        if (validation.success) {
          discountPaise = validation.discountPaise || 0;
          couponCode = validation.coupon?.code || decodedCode;
          couponId = validation.coupon?.id || null;
        }
      } catch (couponErr) {
        console.warn("Coupon validation error during checkout:", couponErr);
      }
    }

    // Calculate Shipping (Free above ₹4000 or for test items)
    const isTestCart = cart.items.some((item) => item.sku?.includes("TEST") || item.slug?.includes("test") || item.pricePaise <= 500);
    const shippingPaise = (cart.subtotalPaise >= 400000 || isTestCart) ? 0 : 15000;

    // Calculate COD Fee (₹50 additional charge for COD)
    const codFeePaise = paymentMethod === "COD" ? 5000 : 0;

    // Total
    const orderTotalPaise = Math.max(0, cart.subtotalPaise - discountPaise + shippingPaise + codFeePaise);

    // Validate and Debit Wallet Balance
    const orderId = `ord_${Math.random().toString(36).substring(2, 11)}`;
    const orderNumber = `RES-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const wallet = await getOrCreateWallet(userId);

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

    const remainingCashTotalPaise = Math.max(0, orderTotalPaise - walletAmountPaise);
    const isDbAvailable = !!process.env.DATABASE_URL && process.env.DATABASE_URL.indexOf("[YOUR-PASSWORD]") === -1;

    // Resolve final order payment status
    let paymentStatus = "PENDING";
    if (remainingCashTotalPaise === 0) {
      paymentStatus = "PAID";
    } else if (paymentMethod === "COD") {
      paymentStatus = "COD_PENDING";
    }

    // Handle Razorpay online payment order creation
    let razorpayOrderId: string | null = null;
    if (paymentMethod === "ONLINE" && remainingCashTotalPaise > 0) {
      if (remainingCashTotalPaise < 100) {
        return { success: false, error: "Order total must be at least ₹1 for online payment." };
      }
      try {
        const { razorpay } = await import("@/lib/razorpay");
        const rzpOrder = await razorpay.orders.create({
          amount: remainingCashTotalPaise,
          currency: "INR",
          receipt: orderId,
          notes: {
            orderNumber,
            userId,
            userEmail,
          },
        });
        razorpayOrderId = rzpOrder.id;
      } catch (err: any) {
        console.error("Failed to create Razorpay order:", err);
        if (walletAmountPaise > 0) {
          try {
            await creditWallet(wallet.id, walletAmountPaise, "REVERSAL_CREDIT", orderId, `Refund due to Razorpay order initialization failure ${orderId}`, "order");
          } catch (revertErr) {
            console.error("Critical: failed to revert wallet debit:", revertErr);
          }
        }
        return { success: false, error: err?.message || "Failed to initialize online payment with Razorpay. Please try Cash on Delivery." };
      }
    }

    if (isDbAvailable) {
      try {
        const { payments } = await import("@/db/schema/payment");
        const { profiles } = await import("@/db/schema/auth");

        // Ensure profile row exists to satisfy foreign key orders_user_id_profiles_id_fk
        try {
          const { eq } = await import("drizzle-orm");
          const [prof] = await db.select({ id: profiles.id }).from(profiles).where(eq(profiles.id, userId)).limit(1);
          if (!prof) {
            await db.insert(profiles).values({
              id: userId,
              fullName: userName,
              email: userEmail,
              role: userRole,
            }).onConflictDoNothing();
          }
        } catch (profileErr) {
          console.warn("Profile auto-insert warning for order placement:", profileErr);
        }

        await db.insert(orders).values({
          id: orderId,
          orderNumber,
          userId,
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
          paymentProvider: paymentMethod === "COD" ? "COD" : (walletAmountPaise === orderTotalPaise ? "WALLET" : "RAZORPAY"),
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
          let validProductId: string | null = null;
          let validVariantId: string | null = null;

          if (item.productId) {
            try {
              const { products } = await import("@/db/schema/catalog");
              const { eq } = await import("drizzle-orm");
              const [p] = await db.select({ id: products.id }).from(products).where(eq(products.id, item.productId)).limit(1);
              if (p) validProductId = p.id;
            } catch (pErr) {
              console.warn("Product FK validation warning:", pErr);
            }
          }

          if (item.variantId) {
            try {
              const { productVariants } = await import("@/db/schema/catalog");
              const { eq } = await import("drizzle-orm");
              const [v] = await db.select({ id: productVariants.id }).from(productVariants).where(eq(productVariants.id, item.variantId)).limit(1);
              if (v) validVariantId = v.id;
            } catch (vErr) {
              console.warn("Variant FK validation warning:", vErr);
            }
          }

          await db.insert(orderItems).values({
            id: `item_${Math.random().toString(36).substring(2, 11)}`,
            orderId,
            productId: validProductId,
            variantId: validVariantId,
            productName: item.name,
            sku: item.sku,
            unitPricePaise: item.pricePaise,
            quantity: item.quantity,
            lineTotalPaise: item.pricePaise * item.quantity,
            productNameSnapshot: item.name,
            skuSnapshot: item.sku,
            variantSnapshot: item.variantLabel || item.sizeName || null,
          });

          // Atomic inventory decrement for variant to prevent overselling
          if (item.variantId && validVariantId) {
            try {
              const { sql, eq } = await import("drizzle-orm");
              const { productVariants } = await import("@/db/schema/catalog");
              await db
                .update(productVariants)
                .set({
                  stock: sql`GREATEST(0, ${productVariants.stock} - ${item.quantity})`,
                  inventoryQuantity: sql`GREATEST(0, ${productVariants.inventoryQuantity} - ${item.quantity})`,
                })
                .where(eq(productVariants.id, validVariantId));
            } catch (invErr) {
              console.warn(`Variant inventory decrement warning for variant ${item.variantId}:`, invErr);
            }
          }
        }

        if (razorpayOrderId) {
          await db.insert(payments).values({
            id: `pay_${Math.random().toString(36).substring(2, 11)}`,
            orderId,
            provider: "RAZORPAY",
            providerOrderId: razorpayOrderId,
            amountPaise: remainingCashTotalPaise,
            currency: "INR",
            status: "CREATED",
            signatureVerified: false,
          });
        }
      } catch (e: any) {
        console.error("Failed to save order to database, reverting wallet deduction:", e);
        // Revert wallet debit on database insert failure
        if (walletAmountPaise > 0) {
          try {
            await creditWallet(wallet.id, walletAmountPaise, "REVERSAL_CREDIT", orderId, `Refund due to order placement failure ${orderId}`, "order");
          } catch (revertErr) {
            console.error("Critical: failed to revert wallet debit:", revertErr);
          }
        }
        return { success: false, error: e?.message || "Failed to place order in database. Any wallet funds have been restored." };
      }
    } else {
      console.log("Offline Mode: Created Order", {
        orderNumber,
        user: userEmail,
        total: orderTotalPaise / 100,
        walletDeducted: walletAmountPaise / 100,
        remainingCash: remainingCashTotalPaise / 100,
        paymentMethod,
        razorpayOrderId,
        address,
        items: cart.items.map(i => `${i.name} (${i.sizeName}) x${i.quantity}`),
      });
    }

    // Revalidate customer and admin views
    try {
      revalidatePath("/account/orders");
      revalidatePath("/admin/orders");
      revalidatePath("/admin");
    } catch (revalErr) {
      console.warn("Path revalidation warning:", revalErr);
    }

    // If requires online payment via Razorpay, return Razorpay payload to client UI without clearing cart yet
    if (paymentMethod === "ONLINE" && remainingCashTotalPaise > 0 && razorpayOrderId) {
      const { env } = await import("@/lib/validation/env");
      return {
        success: true,
        requiresPayment: true,
        orderId,
        orderNumber,
        razorpayOrderId,
        razorpayKeyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_live_TYIGUQfADESI9t",
        amountPaise: remainingCashTotalPaise,
      };
    }

    // Clear cart and coupon cookies for direct COD or 100% wallet paid orders
    await clearCart();
    cookieStore.delete("applied_coupon");

    return { success: true, requiresPayment: false, orderNumber };
  } catch (globalErr: any) {
    console.error("Unhandled error in createOrderAction:", globalErr);
    return {
      success: false,
      error: globalErr?.message || "An error occurred while processing your order. Please try again.",
    };
  }
}

export async function verifyRazorpayPaymentAction(
  orderId: string,
  razorpayPaymentId: string,
  razorpayOrderId: string,
  razorpaySignature: string
) {
  const currentUser = await getCurrentUser();

  const { RAZORPAY_KEY_SECRET } = await import("@/lib/razorpay");
  const crypto = await import("crypto");

  let isVerified = false;
  if (razorpaySignature && razorpayOrderId && razorpayPaymentId) {
    try {
      const body = `${razorpayOrderId}|${razorpayPaymentId}`;
      const expectedSignature = crypto
        .createHmac("sha256", RAZORPAY_KEY_SECRET)
        .update(body)
        .digest("hex");

      if (expectedSignature.length === razorpaySignature.length) {
        isVerified = crypto.timingSafeEqual(
          Buffer.from(expectedSignature),
          Buffer.from(razorpaySignature)
        );
      }
    } catch (sigErr) {
      console.warn("Signature verification exception:", sigErr);
      isVerified = false;
    }
  }

  if (!isVerified) {
    console.error("Razorpay signature verification failed:", { razorpayOrderId, razorpayPaymentId });
    return { success: false, error: "Payment verification failed. Invalid transaction signature from Razorpay." };
  }

  const isDbAvailable = !!process.env.DATABASE_URL && process.env.DATABASE_URL.indexOf("[YOUR-PASSWORD]") === -1;

  if (isDbAvailable) {
    try {
      const { eq } = await import("drizzle-orm");
      const { payments } = await import("@/db/schema/payment");
      const { orderTimeline } = await import("@/db/schema/order");

      await db.transaction(async (tx) => {
        // 1. Update Order status
        const updateData: Record<string, any> = {
          status: "CONFIRMED",
          paymentStatus: "PAID",
          paymentId: razorpayPaymentId,
          updatedAt: new Date(),
        };

        // Attach userId if currentUser logged in and order didn't have one
        if (currentUser?.id) {
          updateData.userId = currentUser.id;
        }

        await tx.update(orders).set(updateData).where(eq(orders.id, orderId));

        // 2. Update Payment record
        if (razorpayOrderId) {
          await tx
            .update(payments)
            .set({
              status: "CAPTURED",
              providerPaymentId: razorpayPaymentId,
              signatureVerified: true,
              updatedAt: new Date(),
            })
            .where(eq(payments.providerOrderId, razorpayOrderId));
        }

        // 3. Add timeline entry
        await tx.insert(orderTimeline).values({
          id: `log_${Math.random().toString(36).substring(2, 11)}`,
          orderId,
          status: "CONFIRMED",
          message: `Payment confirmed via Razorpay (Payment ID: ${razorpayPaymentId})`,
        });
      });
    } catch (e: any) {
      console.error("Error updating DB after payment verification:", e);
      return { success: false, error: e.message || "Failed to record payment verification in database." };
    }
  }

  // Clear cart & coupon cookies after successful verification
  const cookieStore = await cookies();
  await clearCart();
  cookieStore.delete("applied_coupon");

  // Trigger Shiprocket fulfillment pipeline asynchronously/idempotently after payment verification
  try {
    const { triggerOrderFulfillment } = await import("@/actions/shiprocket");
    await triggerOrderFulfillment(orderId);
  } catch (shiprocketErr) {
    console.error(`Non-blocking Shiprocket trigger error for order ${orderId}:`, shiprocketErr);
  }

  // Dispatch Order Confirmation Email asynchronously
  try {
    const { sendOrderConfirmationEmail } = await import("@/lib/email");
    await sendOrderConfirmationEmail(orderId);
  } catch (emailErr) {
    console.error(`Non-blocking Order Confirmation Email error for order ${orderId}:`, emailErr);
  }

  // Revalidate ALL paths so customer & admin get instant updates
  revalidatePath("/account/orders");
  revalidatePath(`/account/orders/${orderId}`);
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin");
  revalidatePath("/admin/analytics");
  revalidatePath("/admin/customers");

  // Fetch order number
  let orderNumber = orderId;
  if (isDbAvailable) {
    const { eq } = await import("drizzle-orm");
    const [fetchedOrder] = await db.select({ orderNumber: orders.orderNumber }).from(orders).where(eq(orders.id, orderId)).limit(1);
    if (fetchedOrder) {
      orderNumber = fetchedOrder.orderNumber;
    }
  }

  return {
    success: true,
    orderNumber,
  };
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

export async function checkOrderPaymentStatusAction(orderId: string) {
  try {
    const isDbAvailable = !!process.env.DATABASE_URL && process.env.DATABASE_URL.indexOf("[YOUR-PASSWORD]") === -1;
    if (isDbAvailable) {
      const { eq, or } = await import("drizzle-orm");
      const [order] = await db
        .select({
          id: orders.id,
          orderNumber: orders.orderNumber,
          status: orders.status,
          paymentStatus: orders.paymentStatus,
        })
        .from(orders)
        .where(or(eq(orders.id, orderId), eq(orders.orderNumber, orderId)))
        .limit(1);

      if (order && (order.paymentStatus === "PAID" || order.status === "CONFIRMED")) {
        try {
          const { clearCart } = await import("@/lib/cart");
          const { cookies } = await import("next/headers");
          await clearCart();
          (await cookies()).delete("applied_coupon");
        } catch { }

        return { success: true, isPaid: true, orderNumber: order.orderNumber };
      }
    }
    return { success: true, isPaid: false };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to check order status." };
  }
}

