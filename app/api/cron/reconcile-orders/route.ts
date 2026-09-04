import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders, orderItems } from "@/db/schema/order";
import { productVariants } from "@/db/schema/catalog";
import { eq, and, lt, sql } from "drizzle-orm";

export async function GET(request: Request) {
  // Validate CRON_SECRET authorization header or query param
  const { searchParams } = new URL(request.url);
  const secretParam = searchParams.get("secret");
  const authHeader = request.headers.get("authorization");
  const expectedSecret = process.env.CRON_SECRET;

  if (expectedSecret && secretParam !== expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
    return NextResponse.json({ error: "Unauthorized cron execution request." }, { status: 401 });
  }

  const isDbAvailable = !!process.env.DATABASE_URL && process.env.DATABASE_URL.indexOf("[YOUR-PASSWORD]") === -1;
  if (!isDbAvailable) {
    return NextResponse.json({ message: "Database offline. Cron skipped." });
  }

  try {
    // Find PENDING orders older than 15 minutes
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

    const expiredOrders = await db
      .select({ id: orders.id, orderNumber: orders.orderNumber })
      .from(orders)
      .where(
        and(
          eq(orders.status, "PENDING"),
          eq(orders.paymentStatus, "PENDING"),
          lt(orders.createdAt, fifteenMinutesAgo)
        )
      );

    let releasedCount = 0;

    for (const expOrder of expiredOrders) {
      await db.transaction(async (tx) => {
        // 1. Mark order status EXPIRED
        await tx
          .update(orders)
          .set({ status: "EXPIRED", paymentStatus: "EXPIRED", updatedAt: new Date() })
          .where(eq(orders.id, expOrder.id));

        // 2. Fetch items and return stock to product variants
        const items = await tx
          .select({ variantId: orderItems.variantId, quantity: orderItems.quantity })
          .from(orderItems)
          .where(eq(orderItems.orderId, expOrder.id));

        for (const item of items) {
          if (item.variantId) {
            await tx
              .update(productVariants)
              .set({
                stock: sql`${productVariants.stock} + ${item.quantity}`,
                inventoryQuantity: sql`${productVariants.inventoryQuantity} + ${item.quantity}`,
              })
              .where(eq(productVariants.id, item.variantId));
          }
        }
      });
      releasedCount++;
    }

    return NextResponse.json({
      success: true,
      reconciledOrdersCount: releasedCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Order reconciliation cron error:", error);
    return NextResponse.json({ error: error.message || "Failed to reconcile orders." }, { status: 500 });
  }
}
