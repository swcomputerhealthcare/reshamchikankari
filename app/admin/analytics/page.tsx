/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { requireAdmin } from "@/lib/auth/helpers";
import Container from "@/components/ui/container";
import { db } from "@/db";
import { orders, orderItems } from "@/db/schema/order";
import { products, categories } from "@/db/schema/catalog";
import { eq, sql } from "drizzle-orm";
import AnalyticsView from "@/components/admin/analytics-view";

export const metadata = {
  title: "Admin Analytics Dashboard — Resham",
};

export default async function AdminAnalyticsPage() {
  // Enforce ADMIN role check
  await requireAdmin();

  let totalRevenue = 0;
  let totalOrders = 0;
  let categoryStatsList: any[] = [];
  let paymentStatsList: any[] = [];

  const isDbAvailable = !!process.env.DATABASE_URL && process.env.DATABASE_URL.indexOf("[YOUR-PASSWORD]") === -1;

  if (isDbAvailable) {
    try {
      // 1. Fetch total paid revenue
      const revResult = await db
        .select({ total: sql<string>`sum(${orders.totalPaise})` })
        .from(orders)
        .where(eq(orders.paymentStatus, "PAID"));
      totalRevenue = parseInt(revResult[0]?.total || "0", 10);

      // 2. Fetch total orders count
      const countResult = await db
        .select({ count: sql<string>`count(*)` })
        .from(orders);
      totalOrders = parseInt(countResult[0]?.count || "0", 10);

      // 3. Fetch category sales stats
      categoryStatsList = await db
        .select({
          categoryId: products.categoryId,
          categoryName: categories.name,
          revenue: sql<string>`sum(${orderItems.lineTotalPaise})`,
          units: sql<string>`sum(${orderItems.quantity})`,
        })
        .from(orderItems)
        .innerJoin(products, eq(orderItems.productId, products.id))
        .innerJoin(categories, eq(products.categoryId, categories.id))
        .innerJoin(orders, eq(orderItems.orderId, orders.id))
        .where(eq(orders.paymentStatus, "PAID"))
        .groupBy(products.categoryId, categories.name);

      // 4. Fetch payment splits
      paymentStatsList = await db
        .select({
          provider: orders.paymentProvider,
          count: sql<string>`count(*)`,
          revenue: sql<string>`sum(${orders.totalPaise})`,
        })
        .from(orders)
        .where(eq(orders.paymentStatus, "PAID"))
        .groupBy(orders.paymentProvider);
    } catch (e) {
      console.error("Failed to query database analytics data:", e);
    }
  }

  // Parse strings to integers/floats for visual chart client safety
  const categoryStats = categoryStatsList.map((c) => ({
    categoryId: c.categoryId,
    categoryName: c.categoryName,
    revenue: parseInt(c.revenue || "0", 10),
    units: parseInt(c.units || "0", 10),
  }));

  const paymentStats = paymentStatsList.map((p) => ({
    provider: p.provider,
    count: parseInt(p.count || "0", 10),
    revenue: parseInt(p.revenue || "0", 10),
  }));

  return (
    <div className="pb-24 selection:bg-brand-pink/20">
      {/* Header section */}
      <div className="bg-brand-black text-brand-offwhite py-8 mb-12">
        <Container>
          <span className="text-[10px] tracking-widest uppercase text-neutral-400 font-semibold mb-1 block">
            Management Portal
          </span>
          <h1 className="font-display text-3xl tracking-wide">
            Business Analytics
          </h1>
        </Container>
      </div>

      {/* Main analytics view */}
      <Container>
        <AnalyticsView
          totalRevenue={totalRevenue}
          totalOrders={totalOrders}
          categoryStats={categoryStats}
          paymentStats={paymentStats}
        />
      </Container>
    </div>
  );
}
