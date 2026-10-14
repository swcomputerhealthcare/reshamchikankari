import React from "react";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/helpers";
import Container from "@/components/ui/container";
import Button from "@/components/ui/button";
import { db } from "@/db";
import { orders, orderItems } from "@/db/schema/order";
import { profiles } from "@/db/schema/auth";
import { sql, desc, eq } from "drizzle-orm";
import { products, productVariants } from "@/db/schema/catalog";
import { coupons } from "@/db/schema/coupon";
import { reviews } from "@/db/schema/review";
import { getPromotionCampaignAction } from "@/actions/promotions";
import AdminChart from "@/components/admin/admin-chart";
import {
  TrendingUp,
  ShoppingBag,
  Users,
  BadgeCent,
  ArrowRight,
  Package,
  AlertTriangle,
  Clock,
  Truck,
  Ticket,
  Sparkles,
  Star,
  CheckCircle2,
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

  // Operational metrics
  let totalProducts = 0;
  let activeProducts = 0;
  let outOfStockVariants = 0;
  let lowStockVariants = 0;
  let ordersToday = 0;
  let pendingOrders = 0;
  let codAwaiting = 0;
  let paidRazorpayOrders = 0;
  let missingAwbOrders = 0;
  let activeCouponsCount = 0;
  let isPromotionActive = false;
  let promoDiscountPercentage = 20;
  let pendingReviewsCount = 0;

  const isDbAvailable = !!process.env.DATABASE_URL && process.env.DATABASE_URL.indexOf("[YOUR-PASSWORD]") === -1;

  if (isDbAvailable) {
    try {
      // 1. Total Revenue (only paid orders count toward completed sales revenue)
      const revResult = await db
        .select({ total: sql<string>`sum(${orders.totalPaise})` })
        .from(orders)
        .where(eq(orders.paymentStatus, "PAID"));
      totalRevenuePaise = parseInt(revResult[0]?.total || "0", 10);

      // 2. Total Orders
      const orderCountResult = await db
        .select({ count: sql<string>`count(*)` })
        .from(orders);
      totalOrdersCount = parseInt(orderCountResult[0]?.count || "0", 10);

      // 3. Total Customers
      const customerCountResult = await db
        .select({ count: sql<string>`count(*)` })
        .from(profiles)
        .where(eq(profiles.role, "CUSTOMER"));
      totalCustomersCount = parseInt(customerCountResult[0]?.count || "0", 10);

      // 4. Products & Variants aggregates
      const [prodRes] = await db
        .select({
          total: sql<number>`count(*)::int`,
          active: sql<number>`count(*) filter (where ${products.isActive} = true)::int`,
        })
        .from(products);
      totalProducts = prodRes?.total || 0;
      activeProducts = prodRes?.active || 0;

      const [varRes] = await db
        .select({
          outOfStock: sql<number>`count(*) filter (where ${productVariants.stock} <= 0 or ${productVariants.isAvailable} = false)::int`,
          lowStock: sql<number>`count(*) filter (where ${productVariants.stock} > 0 and ${productVariants.stock} <= 3 and ${productVariants.isAvailable} = true)::int`,
        })
        .from(productVariants);
      outOfStockVariants = varRes?.outOfStock || 0;
      lowStockVariants = varRes?.lowStock || 0;

      // 5. Order Fulfillment aggregates
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const [orderAgg] = await db
        .select({
          ordersToday: sql<number>`count(*) filter (where ${orders.createdAt} >= ${todayStart})::int`,
          pending: sql<number>`count(*) filter (where ${orders.status} = 'PENDING')::int`,
          paid: sql<number>`count(*) filter (where ${orders.paymentStatus} = 'PAID')::int`,
          codAwaiting: sql<number>`count(*) filter (where ${orders.paymentProvider} = 'COD' and ${orders.status} != 'DELIVERED' and ${orders.status} != 'CANCELLED')::int`,
          missingAwb: sql<number>`count(*) filter (where (${orders.awbCode} is null or ${orders.awbCode} = '') and ${orders.status} != 'CANCELLED')::int`,
        })
        .from(orders);

      ordersToday = orderAgg?.ordersToday || 0;
      pendingOrders = orderAgg?.pending || 0;
      paidRazorpayOrders = orderAgg?.paid || 0;
      codAwaiting = orderAgg?.codAwaiting || 0;
      missingAwbOrders = orderAgg?.missingAwb || 0;

      // 6. Active Coupons & Promotion
      const [couponRes] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(coupons)
        .where(eq(coupons.isActive, true));
      activeCouponsCount = couponRes?.count || 0;

      const promoCampaign = await getPromotionCampaignAction();
      isPromotionActive = promoCampaign.isActive;
      promoDiscountPercentage = promoCampaign.discountPercent;

      // 7. Pending Reviews
      const [reviewRes] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(reviews)
        .where(eq(reviews.isApproved, false));
      pendingReviewsCount = reviewRes?.count || 0;

      // 8. Recent Orders (last 5)
      recentOrdersList = await db
        .select()
        .from(orders)
        .orderBy(desc(orders.createdAt))
        .limit(5);

      // 9. Top Products list
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

      // 10. Chart data
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
          (o) => new Date(o.createdAt).toISOString().split("T")[0] === dateStr
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
            <div className="h-10 w-10 bg-brand-sage/10 text-brand-sage flex items-center justify-center rounded-xs flex-shrink-0">
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

      {/* Real-time Operational Health & Business Controls (Phase 15) */}
      <Container className="mb-12">
        <div className="bg-white border border-brand-black/10 rounded-xs p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-neutral-100">
            <div>
              <span className="text-[10px] tracking-widest uppercase font-bold text-neutral-400 block mb-0.5">
                Authoritative Database Status
              </span>
              <h2 className="font-display text-xl font-bold text-brand-black">
                Operational & Catalog Health
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Live PostgreSQL Connected
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {/* 1. Products */}
            <Link
              href="/admin/products"
              className="p-4 rounded-xs border border-neutral-100 bg-neutral-50/50 hover:bg-neutral-50 transition-colors group"
            >
              <div className="flex items-center justify-between text-neutral-400 mb-2">
                <Package className="h-4 w-4 group-hover:text-brand-black transition-colors" />
                <span className="text-[9px] uppercase font-bold tracking-wider text-emerald-600 font-semibold">
                  {activeProducts} Live
                </span>
              </div>
              <div className="text-xl font-bold text-brand-black">{totalProducts}</div>
              <div className="text-[10px] text-neutral-500 font-medium mt-0.5">Total Products</div>
            </Link>

            {/* 2. Out of Stock Variants */}
            <Link
              href="/admin/products"
              className={`p-4 rounded-xs border transition-colors group ${
                outOfStockVariants > 0
                  ? "bg-red-50/40 border-red-200 hover:bg-red-50/80"
                  : "bg-neutral-50/50 border-neutral-100 hover:bg-neutral-50"
              }`}
            >
              <div className="flex items-center justify-between text-neutral-400 mb-2">
                <AlertTriangle
                  className={`h-4 w-4 ${outOfStockVariants > 0 ? "text-red-500" : "group-hover:text-brand-black"}`}
                />
                {outOfStockVariants > 0 && (
                  <span className="text-[9px] uppercase font-bold tracking-wider text-red-600">Action Req</span>
                )}
              </div>
              <div className={`text-xl font-bold ${outOfStockVariants > 0 ? "text-red-700" : "text-brand-black"}`}>
                {outOfStockVariants}
              </div>
              <div className="text-[10px] text-neutral-500 font-medium mt-0.5">Out-of-Stock Sizes</div>
            </Link>

            {/* 3. Low Stock Variants */}
            <Link
              href="/admin/products"
              className={`p-4 rounded-xs border transition-colors group ${
                lowStockVariants > 0
                  ? "bg-amber-50/40 border-amber-200 hover:bg-amber-50/80"
                  : "bg-neutral-50/50 border-neutral-100 hover:bg-neutral-50"
              }`}
            >
              <div className="flex items-center justify-between text-neutral-400 mb-2">
                <Clock className={`h-4 w-4 ${lowStockVariants > 0 ? "text-amber-500" : "group-hover:text-brand-black"}`} />
                {lowStockVariants > 0 && (
                  <span className="text-[9px] uppercase font-bold tracking-wider text-amber-600">Low</span>
                )}
              </div>
              <div className={`text-xl font-bold ${lowStockVariants > 0 ? "text-amber-700" : "text-brand-black"}`}>
                {lowStockVariants}
              </div>
              <div className="text-[10px] text-neutral-500 font-medium mt-0.5">Low Stock (≤ 3)</div>
            </Link>

            {/* 4. COD Orders Awaiting Fulfillment */}
            <Link
              href="/admin/orders"
              className="p-4 rounded-xs border border-neutral-100 bg-neutral-50/50 hover:bg-neutral-50 transition-colors group"
            >
              <div className="flex items-center justify-between text-neutral-400 mb-2">
                <Truck className="h-4 w-4 group-hover:text-brand-black transition-colors" />
                <span className="text-[9px] uppercase font-bold tracking-wider text-neutral-500 font-semibold">
                  {missingAwbOrders} unassigned
                </span>
              </div>
              <div className="text-xl font-bold text-brand-black">{codAwaiting}</div>
              <div className="text-[10px] text-neutral-500 font-medium mt-0.5">COD Awaiting Ship</div>
            </Link>

            {/* 5. Active Promotions & Coupons */}
            <Link
              href="/admin/promotions"
              className="p-4 rounded-xs border border-neutral-100 bg-neutral-50/50 hover:bg-neutral-50 transition-colors group"
            >
              <div className="flex items-center justify-between text-neutral-400 mb-2">
                <Sparkles className="h-4 w-4 text-brand-pink" />
                <span className="text-[9px] uppercase font-bold tracking-wider text-brand-pink font-semibold">
                  {isPromotionActive ? `${promoDiscountPercentage}% Active` : "Inactive"}
                </span>
              </div>
              <div className="text-xl font-bold text-brand-black">{activeCouponsCount}</div>
              <div className="text-[10px] text-neutral-500 font-medium mt-0.5">Coupons & Campaigns</div>
            </Link>

            {/* 6. Pending Reviews */}
            <Link
              href="/admin/reviews"
              className={`p-4 rounded-xs border transition-colors group ${
                pendingReviewsCount > 0
                  ? "bg-brand-pink/5 border-brand-pink/20 hover:bg-brand-pink/10"
                  : "bg-neutral-50/50 border-neutral-100 hover:bg-neutral-50"
              }`}
            >
              <div className="flex items-center justify-between text-neutral-400 mb-2">
                <Star className="h-4 w-4 text-amber-500" />
                {pendingReviewsCount > 0 && (
                  <span className="text-[9px] uppercase font-bold tracking-wider text-brand-pink font-semibold">Queue</span>
                )}
              </div>
              <div className="text-xl font-bold text-brand-black">{pendingReviewsCount}</div>
              <div className="text-[10px] text-neutral-500 font-medium mt-0.5">Pending Reviews</div>
            </Link>
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
                  const dateObj = new Date(ord.createdAt);
                  const [_, m, d] = dateObj.toDateString().split(" ");
                  return (
                    <tr key={ord.id} className="hover:bg-neutral-50/50">
                      <td className="py-4 pr-4 font-sans font-semibold text-brand-black">
                        #{ord.orderNumber}
                      </td>
                      <td className="py-4 px-4 text-neutral-500 font-sans">
                        {d} {m} {dateObj.getFullYear()}
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
