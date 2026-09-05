import React from "react";
import Link from "next/link";
import Image from "next/image";
import Container from "@/components/ui/container";
import { requireUser } from "@/lib/auth/helpers";
import { db } from "@/db";
import { orders } from "@/db/schema/order";
import { eq, desc, or, sql } from "drizzle-orm";
import { Package, Clock, ArrowRight, ShieldCheck, ShoppingBag, ChevronRight } from "lucide-react";

export const metadata = {
  title: "My Orders — Resham Chikankari",
  description: "View and track your handcrafted Lucknowi Chikankari orders.",
};

export default async function CustomerOrdersPage() {
  const user = await requireUser();

  const isDbAvailable = !!process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("[YOUR-PASSWORD]");

  let userOrders: any[] = [];

  if (isDbAvailable) {
    try {
      const userEmailLower = (user.email || "").toLowerCase();
      userOrders = await db.query.orders.findMany({
        where: or(
          eq(orders.userId, user.id),
          sql`LOWER(shipping_address_snapshot->>'email') = ${userEmailLower}`,
          sql`LOWER(billing_address_snapshot->>'email') = ${userEmailLower}`
        ),
        orderBy: [desc(orders.createdAt)],
        with: {
          items: true,
        },
      });
    } catch (e) {
      console.error("Failed to query customer orders:", e);
    }
  }

  const getStatusBadge = (status: string, paymentStatus: string) => {
    const s = (status || "").toUpperCase();
    const ps = (paymentStatus || "").toUpperCase();

    if (s === "DELIVERED") {
      return (
        <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] uppercase font-bold tracking-wider rounded-full">
          Delivered
        </span>
      );
    }
    if (s === "SHIPPED") {
      return (
        <span className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 text-[10px] uppercase font-bold tracking-wider rounded-full">
          In Transit / Shipped
        </span>
      );
    }
    if (s === "CONFIRMED" || ps === "PAID") {
      return (
        <span className="px-3 py-1 bg-[#7C7A5A]/10 text-[#7C7A5A] border border-[#7C7A5A]/20 text-[10px] uppercase font-bold tracking-wider rounded-full">
          Confirmed
        </span>
      );
    }
    if (s === "CANCELLED") {
      return (
        <span className="px-3 py-1 bg-rose-50 text-rose-700 border border-rose-200 text-[10px] uppercase font-bold tracking-wider rounded-full">
          Cancelled
        </span>
      );
    }
    return (
      <span className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 text-[10px] uppercase font-bold tracking-wider rounded-full">
        Processing
      </span>
    );
  };

  return (
    <div className="bg-[#FFF9F4] min-h-screen text-[#161616] py-12 sm:py-16 select-none font-sans">
      <Container className="max-w-4xl">
        
        {/* Breadcrumb Navigation */}
        <div className="mb-8 flex items-center gap-2 text-xs uppercase font-bold tracking-widest text-neutral-400">
          <Link href="/account" className="hover:text-[#7C7A5A] transition-colors">
            Account
          </Link>
          <span>/</span>
          <span className="text-[#7C7A5A]">Order History</span>
        </div>

        {/* Page Title Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pb-6 border-b border-[#ECE9E2] mb-10">
          <div>
            <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#E694AA] mb-1 block">
              HERITAGE ARCHIVES
            </span>
            <h1 className="font-display text-3xl sm:text-5xl text-[#161616]">
              My Orders ({userOrders.length})
            </h1>
          </div>
          <Link href="/shop">
            <button className="h-10 px-5 bg-white border border-[#ECE9E2] text-[#161616] hover:border-[#7C7A5A] hover:text-[#7C7A5A] text-[10px] uppercase tracking-[0.18em] font-bold transition-all rounded-full flex items-center gap-1.5 cursor-pointer">
              <ShoppingBag className="w-3.5 h-3.5" /> Continue Shopping
            </button>
          </Link>
        </div>

        {/* Orders List Container */}
        {userOrders.length === 0 ? (
          <div className="bg-white border border-[#ECE9E2] p-12 sm:p-16 rounded-3xl text-center space-y-6 shadow-xs">
            <div className="w-16 h-16 bg-[#7C7A5A]/10 rounded-full flex items-center justify-center mx-auto text-[#7C7A5A]">
              <Package className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="font-display text-2xl sm:text-3xl text-[#161616]">
                No orders placed yet
              </h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto leading-relaxed">
                Discover handcrafted Lucknowi Chikankari pieces crafted by local artisans.
              </p>
            </div>
            <Link href="/shop" className="inline-block pt-2">
              <button className="h-12 px-8 bg-[#161616] text-white hover:bg-[#7C7A5A] text-[11px] uppercase tracking-[0.18em] font-semibold transition-all rounded-full cursor-pointer">
                Explore Collection
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {userOrders.map((order) => {
              const formattedDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              });

              return (
                <div
                  key={order.id}
                  className="bg-white border border-[#ECE9E2] p-6 sm:p-8 rounded-2xl shadow-xs hover:shadow-md transition-shadow duration-300 space-y-6"
                >
                  {/* Top Card Info Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-[#ECE9E2]">
                    <div className="space-y-1">
                      <span className="text-[10px] text-[#69727D] font-bold uppercase tracking-widest block">
                        ORDER NUMBER
                      </span>
                      <span className="font-mono text-sm font-bold text-[#161616]">
                        {order.orderNumber}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] text-[#69727D] font-bold uppercase tracking-widest block">
                        DATE PLACED
                      </span>
                      <span className="text-xs font-semibold text-neutral-700">
                        {formattedDate}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] text-[#69727D] font-bold uppercase tracking-widest block">
                        TOTAL CASH
                      </span>
                      <span className="font-display text-lg font-bold text-[#7C7A5A]">
                        ₹{(order.totalPaise / 100).toLocaleString("en-IN")}
                      </span>
                    </div>

                    <div>
                      {getStatusBadge(order.status, order.paymentStatus)}
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  <div className="space-y-3">
                    {order.items && order.items.length > 0 ? (
                      order.items.map((item: any) => (
                        <div key={item.id} className="flex items-center gap-4 py-1">
                          <div className="w-12 h-14 bg-[#F8F2EC] border border-[#ECE9E2] rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden relative">
                            <Package className="w-5 h-5 text-neutral-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-semibold text-[#161616] truncate">
                              {item.productName}
                            </h4>
                            <p className="text-[10px] text-[#69727D] mt-0.5">
                              Size: {item.variantSnapshot || "Standard"} | Qty: {item.quantity} | SKU: {item.sku}
                            </p>
                          </div>
                          <div className="text-right text-xs font-bold text-[#161616]">
                            ₹{((item.unitPricePaise * item.quantity) / 100).toLocaleString("en-IN")}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-neutral-500 italic">Handcrafted order items</p>
                    )}
                  </div>

                  {/* Bottom Action Row */}
                  <div className="pt-4 border-t border-[#ECE9E2] flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[#69727D]">
                      Payment: {order.paymentProvider || "ONLINE"} ({order.paymentStatus})
                    </span>

                    <Link href={`/account/orders/${order.id}`}>
                      <button className="px-5 py-2.5 bg-[#F8F2EC] border border-[#ECE9E2] hover:bg-[#7C7A5A] hover:text-white hover:border-[#7C7A5A] text-[10px] uppercase font-bold tracking-widest text-[#161616] transition-all rounded-full flex items-center gap-1.5 cursor-pointer">
                        View Details & Receipt <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </Link>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </Container>
    </div>
  );
}
