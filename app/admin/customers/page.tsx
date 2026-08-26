import React from "react";
import { requireAdmin } from "@/lib/auth/helpers";
import Container from "@/components/ui/container";
import { db } from "@/db";
import { profiles } from "@/db/schema/auth";
import { orders } from "@/db/schema/order";
import { eq, desc, sql } from "drizzle-orm";
import CustomerListController from "@/components/admin/customer-list-controller";

export const metadata = {
  title: "Admin Customers Directory — Resham",
};

export default async function AdminCustomersPage() {
  // Enforce ADMIN role check
  await requireAdmin();

  let customersList: any[] = [];
  const isDbAvailable = !!process.env.DATABASE_URL && process.env.DATABASE_URL.indexOf("[YOUR-PASSWORD]") === -1;

  if (isDbAvailable) {
    try {
      customersList = await db
        .select({
          id: profiles.id,
          fullName: profiles.fullName,
          email: profiles.email,
          phone: profiles.phone,
          createdAt: profiles.createdAt,
          orderCount: sql<number>`count(${orders.id})`,
          totalSpent: sql<number>`coalesce(sum(case when ${orders.paymentStatus} = 'PAID' then ${orders.totalPaise} else 0 end), 0)`,
        })
        .from(profiles)
        .leftJoin(orders, eq(profiles.id, orders.userId))
        .where(eq(profiles.role, "CUSTOMER"))
        .groupBy(profiles.id, profiles.fullName, profiles.email, profiles.phone, profiles.createdAt)
        .orderBy(desc(profiles.createdAt));
    } catch (e) {
      console.error("Failed to query database customers list:", e);
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
            Registered Customers
          </h1>
        </Container>
      </div>

      {/* Main customers table and filter controller */}
      <Container>
        <CustomerListController initialCustomers={customersList} />
      </Container>
    </div>
  );
}
