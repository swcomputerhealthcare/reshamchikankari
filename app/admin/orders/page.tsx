import React from "react";
import { requireAdmin } from "@/lib/auth/helpers";
import Container from "@/components/ui/container";
import { db } from "@/db";
import { orders } from "@/db/schema/order";
import { desc } from "drizzle-orm";
import OrderListController from "@/components/admin/order-list-controller";

export const metadata = {
  title: "Admin Orders Directory — Resham",
};

export default async function AdminOrdersPage() {
  // Enforce ADMIN role check
  await requireAdmin();

  let ordersList: any[] = [];
  const isDbAvailable = !!process.env.DATABASE_URL && process.env.DATABASE_URL.indexOf("[YOUR-PASSWORD]") === -1;

  if (isDbAvailable) {
    try {
      ordersList = await db.query.orders.findMany({
        orderBy: desc(orders.createdAt),
        with: {
          user: true,
        },
      });
    } catch (e) {
      console.error("Failed to query database orders list:", e);
    }
  }

  return (
    <div className="pb-24 selection:bg-brand-pink/20">
      {/* Header section */}
      <div className="bg-brand-black text-brand-offwhite py-8 mb-12">
        <Container>
          <span className="text-[10px] tracking-widest uppercase text-neutral-400 font-semibold mb-1 block">
            Management Portal
          </span>
          <h1 className="font-display text-3xl tracking-wide">
            Order Fulfillment
          </h1>
        </Container>
      </div>

      {/* Main orders table and filter controller */}
      <Container>
        <OrderListController initialOrders={ordersList} />
      </Container>
    </div>
  );
}
