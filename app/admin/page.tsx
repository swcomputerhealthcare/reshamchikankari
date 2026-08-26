import React from "react";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/helpers";
import Container from "@/components/ui/container";
import Button from "@/components/ui/button";
import { db } from "@/db";
import { orders, orderItems } from "@/db/schema/order";
import { profiles } from "@/db/schema/auth";
import { sql, desc, eq } from "drizzle-orm";
import AdminChart from "@/components/admin/admin-chart";
import {
  TrendingUp,
  ShoppingBag,
  Users,
  BadgeCent,
  ArrowRight
} from "lucide-react";

export const metadata = {
  title: "Admin Dashboard — Resham",
};

export default async function AdminDashboardPage() {
  // Check auth
  await requireAdmin();

  // Fetch KPI data
  let totalRevenuePaise = 0;
  let totalOrdersCount = 0;
  let totalCustomersCount = 0;
  let recentOrdersList: any[] = [];
  let topProductsList: any[] = [];
  let chartData: any[] = [];

  const isDbAvailable = !!process.env.DATABASE_URL && process.env.DATABASE_URL.indexOf("[YOUR-PASSWORD]") === -1;

  if (isDbAvailable) {
    try {
      // Total Revenue (only paid orders count toward revenue)
      const revResult = await db
        .select({ total: sql<string>`sum(${orders.totalPaise})` })
        .from(orders)
        .where(eq(orders.paymentStatus, "PAID"));
      totalRevenuePaise = parseInt(revResult[0]?.total || "0", 10);

      // Total Orders
      const orderCountResult = await db
        .select({ count: sql<string>`count(*)` })
        .from(orders);
      totalOrdersCount = parseInt(orderCountResult[0]?.count || "0", 10);

      // Total Customers
      const customerCountResult = await db
        .select({ count: sql<string>`count(*)` })
        .from(profiles)
        .where(eq(profiles.role, "CUSTOMER"));
      totalCustomersCount = parseInt(customerCountResult[0]?.count || "0", 10);

      // Recent Orders (last 5)
      recentOrdersList = await db
        .select()
        .from(orders)
        .orderBy(desc(orders.createdAt))
        .limit(5);

      // Top Products list
      topProductsList = await db
        .select({
          productId: orderItems.productId,
          productName: orderItems.productNameSnapshot,
          unitsSold: sql<string>`sum(${orderItems.quantity})`,
          revenue: sql<string>`sum(${orderItems.lineTotalPaise})`,
        })
        .from(orderItems)
        .groupBy(orderItems.productId, orderItems.productNameSnapshot)
        .orderBy(desc(sql`sum(${orderItems.quantity})`))
        .limit(5);

      // Get last 7 days sales data for chart
      const last7Days = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toISOString().split("T")[0];
      }).reverse();

      const allRecentOrders = await db
        .select()
        .from(orders)
        .orderBy(desc(orders.createdAt));

      chartData = last7Days.map((dateStr) => {
        const dayOrders = allRecentOrders.filter(
          (o) => o.createdAt.toISOString().split("T")[0] === dateStr
        );
        const revenue = dayOrders
          .filter((o) => o.paymentStatus === "PAID")
          .reduce((sum, o) => sum + o.totalPaise, 0);

        const [_, m, d] = new Date(dateStr).toDateString().split(" ");
        return {
          label: `${d} ${m}`,
          revenue,
          orders: dayOrders.length,
        };
      });
    } catch (e) {
      console.error("Dashboard queries failed:", e);
    }
  }

  // Calculate AOV
  const averageOrderValuePaise = totalOrdersCount > 0 ? Math.round(totalRevenuePaise / totalOrdersCount) : 0;

  // Mock charts if offline/no data
  if (chartData.length === 0) {
    chartData = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const [unused, m, day] = d.toDateString().split(" ");
      return {
        label: `${day} ${m}`,
        revenue: 0,
        orders: 0,
      };
    });
  }

  return (
    <div className="pb-24 selection:bg-brand-pink/20">
      {/* Header Panel */}
      <div className="bg-brand-black text-brand-offwhite py-8 mb-12">
        <Container className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] tracking-widest uppercase text-neutral-400 font-semibold mb-1 block">
              Overview
            </span>
            <h1 className="font-display text-3xl tracking-wide">
              Good evening, Admin
            </h1>
            <p className="text-xs text-neutral-400 font-sans mt-0.5">
              Here&apos;s what&apos;s happening with Resham Chikankari today.
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/admin/products/new">
              <Button variant="accent" className="py-2 text-xs">
                Add Product
              </Button>
            </Link>
          </div>
        </Container>
      </div>

      {/* KPI Cards Grid */}
      <Container className="mb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Revenue Card */}
          <div className="bg-white border border-brand-black/5 p-6 rounded-xs shadow-xs flex items-center gap-4">
            <div className="h-10 w-10 bg-brand-sage/10 text-brand-sage flex items-center justify-center rounded-xs flex-shrink-0">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] tracking-widest uppercase text-neutral-400 font-bold block mb-1">
                Net Revenue
              </span>
              <span className="text-xl font-semibold text-brand-black block">
                ₹{(totalRevenuePaise / 100).toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          {/* Orders Card */}
          <div className="bg-white border border-brand-black/5 p-6 rounded-xs shadow-xs flex items-center gap-4">
            <div className="h-10 w-10 bg-brand-pink/15 text-brand-pink flex items-center justify-center rounded-xs flex-shrink-0">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] tracking-widest uppercase text-neutral-400 font-bold block mb-1">
                Orders placed
              </span>
              <span className="text-xl font-semibold text-brand-black block">
                {totalOrdersCount}
              </span>
            </div>
          </div>

          {/* Customers Card */}
          <div className="bg-white border border-brand-black/5 p-6 rounded-xs shadow-xs flex items-center gap-4">
            <div className="h-10 w-10 bg-neutral-100 text-neutral-600 flex items-center justify-center rounded-xs flex-shrink-0">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] tracking-widest uppercase text-neutral-400 font-bold block mb-1">
                Customers
              </span>
              <span className="text-xl font-semibold text-brand-black block">
                {totalCustomersCount}
              </span>
            </div>
          </div>

          {/* AOV Card */}
          <div className="bg-white border border-brand-black/5 p-6 rounded-xs shadow-xs flex items-center gap-4">
            <div className="h-10 w-10 bg-[#3F5031]/10 text-brand-sage flex items-center justify-center rounded-xs flex-shrink-0">
              <BadgeCent className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] tracking-widest uppercase text-neutral-400 font-bold block mb-1">
                Avg Order Value
              </span>
              <span className="text-xl font-semibold text-brand-black block">
                ₹{(averageOrderValuePaise / 100).toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>
      </Container>

      {/* Main Analytics Section */}
      <Container className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
        {/* Performance Chart */}
        <div className="lg:col-span-8 bg-white border border-brand-black/5 p-6 sm:p-8 rounded-xs shadow-xs h-fit">
          <AdminChart data={chartData} />
        </div>

        {/* Top Selling Products */}
        <div className="lg:col-span-4 bg-white border border-brand-black/5 p-6 rounded-xs shadow-xs h-full flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-500 mb-6">
              Top Products
            </h3>
            {topProductsList.length === 0 ? (
              <div className="text-center py-12 text-neutral-400 text-xs">
                No product sales records yet.
              </div>
            ) : (
              <div className="space-y-4">
                {topProductsList.map((prod, i) => (
                  <div key={prod.productId} className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-3">
                      <span className="font-display text-xs text-neutral-400 font-medium">
                        0{i + 1}
                      </span>
                      <div className="min-w-0">
                        <span className="text-xs font-semibold text-brand-black block truncate max-w-[150px]">
                          {prod.productName || "Product"}
                        </span>
                        <span className="text-[10px] text-neutral-400 block font-sans">
                          {parseInt(prod.unitsSold)} sold
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-brand-black">
                      ₹{(parseInt(prod.revenue) / 100).toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="border-t border-neutral-100 pt-4 mt-6">
            <Link
              href="/admin/products"
              className="text-xs font-bold text-brand-pink hover:text-brand-black transition-colors uppercase tracking-widest flex items-center justify-between w-full"
            >
              <span>Manage Catalog</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </Container>

      {/* Recent Orders section */}
      <Container>
        <div className="bg-white border border-brand-black/5 p-6 sm:p-8 rounded-xs shadow-xs overflow-x-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-500">
              Recent Orders
            </h3>
            <Link
              href="/admin/orders"
              className="text-xs font-bold text-brand-pink hover:text-brand-black transition-colors uppercase tracking-widest flex items-center gap-1.5"
            >
              <span>View All</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {recentOrdersList.length === 0 ? (
            <div className="text-center py-16 text-neutral-400 text-xs">
              No orders placed yet.
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-neutral-100 text-neutral-400 uppercase tracking-widest text-[9px] font-bold">
                  <th className="py-3.5 pr-4">Order ID</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Total</th>
                  <th className="py-3.5 px-4">Payment status</th>
                  <th className="py-3.5 pl-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {recentOrdersList.map((ord) => {
                  const [_, m, d] = ord.createdAt.toDateString().split(" ");
                  return (
                    <tr key={ord.id} className="hover:bg-neutral-50/50">
                      <td className="py-4 pr-4 font-sans font-semibold text-brand-black">
                        #{ord.orderNumber}
                      </td>
                      <td className="py-4 px-4 text-neutral-500 font-sans">
                        {d} {m} {ord.createdAt.getFullYear()}
                      </td>
                      <td className="py-4 px-4 font-semibold text-brand-black">
                        ₹{(ord.totalPaise / 100).toLocaleString("en-IN")}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-widest rounded-xs ${
                            ord.paymentStatus === "PAID"
                              ? "bg-brand-sage/10 text-brand-sage"
                              : ord.paymentStatus === "FAILED"
                              ? "bg-red-50 text-red-600"
                              : "bg-amber-50 text-amber-600"
                          }`}
                        >
                          {ord.paymentStatus}
                        </span>
                      </td>
                      <td className="py-4 pl-4 text-right">
                        <Link
                          href={`/admin/orders/${ord.id}`}
                          className="text-xs font-semibold text-brand-pink hover:text-brand-black transition-colors uppercase tracking-wider"
                        >
                          Details
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </Container>
    </div>
  );
}
