import React from "react";
import Link from "next/link";
import Container from "@/components/ui/container";
import Button from "@/components/ui/button";
import { requireUser } from "@/lib/auth/helpers";
import { db } from "@/db";
import { orders } from "@/db/schema/order";
import { eq, desc } from "drizzle-orm";
import { Package, ChevronRight, ShoppingBag, Heart, Wallet, History } from "lucide-react";

export const metadata = {
  title: "My Account — Resham Chikankari",
  description: "Manage your profile, order history, wallet, and wishlist settings.",
};

export default async function AccountPage() {
  const user = await requireUser();

  const isDbAvailable = !!process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("[YOUR-PASSWORD]");

  let recentOrders: any[] = [];
  if (isDbAvailable) {
    try {
      recentOrders = await db.query.orders.findMany({
        where: eq(orders.userId, user.id),
        orderBy: [desc(orders.createdAt)],
        limit: 3,
        with: {
          items: true,
        },
      });
    } catch (e) {
      console.error("Failed to query recent orders for account dashboard:", e);
    }
  }

  return (
    <div className="bg-[#FFF9F4] min-h-screen py-12 sm:py-16 font-sans text-[#161616] select-none">
      <Container className="max-w-4xl space-y-12">
        
        {/* Top Header Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 sm:gap-12">
          
          {/* Main Account Profile Dashboard Card */}
          <div className="md:col-span-8 bg-white border border-[#ECE9E2] p-6 sm:p-8 rounded-2xl shadow-xs space-y-8">
            <div>
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#7C7A5A] font-bold block mb-1">
                PATRON DASHBOARD
              </span>
              <h1 className="font-display text-4xl text-[#161616]">
                Namaste, {user.name}
              </h1>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-[#ECE9E2]">
              <div>
                <h4 className="text-[10px] uppercase font-bold tracking-widest text-[#69727D] mb-1">Email Address</h4>
                <p className="text-xs font-semibold text-neutral-700">{user.email}</p>
              </div>
              <div>
                <h4 className="text-[10px] uppercase font-bold tracking-widest text-[#69727D] mb-1">Account Status</h4>
                <p className="text-xs font-bold text-[#7C7A5A] uppercase tracking-wider">{user.role}</p>
              </div>
              <div>
                <h4 className="text-[10px] uppercase font-bold tracking-widest text-[#69727D] mb-1">Member Since</h4>
                <p className="text-xs font-semibold text-neutral-700">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }) : "Active Patron"}
                </p>
              </div>
            </div>

            <div className="pt-6 border-t border-[#ECE9E2] flex flex-wrap items-center gap-4">
              <Link href="/account/orders">
                <button className="h-10 px-5 bg-[#7C7A5A] text-white hover:bg-[#656347] text-[10px] uppercase tracking-[0.18em] font-semibold transition-all rounded-full flex items-center gap-2 cursor-pointer shadow-xs">
                  <History className="w-3.5 h-3.5" /> View Order History
                </button>
              </Link>
              {user.role === "ADMIN" && (
                <Link href="/admin/products">
                  <button className="h-10 px-5 bg-white border border-[#ECE9E2] hover:border-[#161616] text-[#161616] text-[10px] uppercase tracking-[0.18em] font-semibold transition-all rounded-full cursor-pointer">
                    Admin Portal
                  </button>
                </Link>
              )}
            </div>
          </div>

          {/* Quick Links Menu Side Card */}
          <div className="md:col-span-4 bg-white border border-[#ECE9E2] p-6 rounded-2xl shadow-xs h-fit space-y-6">
            <h3 className="text-xs uppercase tracking-widest text-[#69727D] font-bold border-b border-[#ECE9E2] pb-3">
              Account Menu
            </h3>
            <ul className="space-y-4 text-xs font-bold uppercase tracking-widest text-neutral-700">
              <li>
                <Link href="/account/orders" className="hover:text-[#7C7A5A] transition-colors flex items-center justify-between group">
                  <span className="flex items-center gap-2">
                    <History className="w-4 h-4 text-[#7C7A5A]" /> My Orders
                  </span>
                  <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:translate-x-1 transition-transform" />
                </Link>
              </li>
              <li>
                <Link href="/account/wallet" className="hover:text-[#7C7A5A] transition-colors flex items-center justify-between group">
                  <span className="flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-[#7C7A5A]" /> My RC Wallet
                  </span>
                  <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:translate-x-1 transition-transform" />
                </Link>
              </li>
              <li>
                <Link href="/account/wishlist" className="hover:text-[#7C7A5A] transition-colors flex items-center justify-between group">
                  <span className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-[#E694AA]" /> Wishlist
                  </span>
                  <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:translate-x-1 transition-transform" />
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Recent Orders Preview Section */}
        <div className="bg-white border border-[#ECE9E2] p-6 sm:p-8 rounded-2xl shadow-xs space-y-6">
          <div className="flex justify-between items-center border-b border-[#ECE9E2] pb-4">
            <div>
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#7C7A5A]">RECENT PURCHASES</span>
              <h2 className="font-display text-2xl text-[#161616]">Order History Preview</h2>
            </div>
            <Link href="/account/orders" className="text-xs uppercase tracking-widest font-bold text-[#7C7A5A] hover:underline flex items-center gap-1">
              View All ({recentOrders.length}) <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="py-8 text-center space-y-3">
              <Package className="w-8 h-8 text-neutral-300 mx-auto" />
              <p className="text-xs text-neutral-500">No orders placed yet.</p>
              <Link href="/shop" className="inline-block pt-1">
                <button className="h-9 px-4 bg-[#F8F2EC] border border-[#ECE9E2] text-[10px] font-bold uppercase tracking-widest hover:bg-[#7C7A5A] hover:text-white transition-all rounded-full cursor-pointer">
                  Explore Shop
                </button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[#ECE9E2]">
              {recentOrders.map((ord) => (
                <div key={ord.id} className="py-4 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <span className="font-mono text-xs font-bold text-[#161616] block">{ord.orderNumber}</span>
                    <span className="text-[10px] text-neutral-400 font-sans">
                      {new Date(ord.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-xs text-[#7C7A5A] block">₹{(ord.totalPaise / 100).toLocaleString("en-IN")}</span>
                    <span className="text-[10px] uppercase font-semibold text-neutral-500">{ord.status}</span>
                  </div>
                  <Link href={`/account/orders/${ord.id}`}>
                    <button className="h-8 px-3 bg-[#F8F2EC] border border-[#ECE9E2] text-[10px] font-bold uppercase tracking-wider hover:bg-[#7C7A5A] hover:text-white transition-all rounded-full cursor-pointer">
                      Receipt & Details
                    </button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

      </Container>
    </div>
  );
}
