import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/helpers";
import Container from "@/components/ui/container";
import { db } from "@/db";
import { profiles } from "@/db/schema/auth";
import { orders } from "@/db/schema/order";
import { wishlistItems, wishlists } from "@/db/schema/wishlist";
import { products } from "@/db/schema/catalog";
import { walletAccounts, walletTransactions } from "@/db/schema/wallet";
import { eq, desc } from "drizzle-orm";
import { ArrowLeft, User, ShoppingBag, Heart, Wallet, Clock } from "lucide-react";

interface AdminCustomerDetailPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export const metadata = {
  title: "Admin Customer Details — Resham",
};

export default async function AdminCustomerDetailPage(props: AdminCustomerDetailPageProps) {
  // Enforce ADMIN role check
  await requireAdmin();

  const params = await props.params;
  const id = params.id;

  let customer = null;
  let customerOrders: any[] = [];
  let customerWishlist: any[] = [];
  let walletDetails: any = null;
  let walletLogs: any[] = [];

  const isDbAvailable = !!process.env.DATABASE_URL && process.env.DATABASE_URL.indexOf("[YOUR-PASSWORD]") === -1;

  if (isDbAvailable) {
    try {
      // 1. Fetch customer details
      customer = await db.query.profiles.findFirst({
        where: eq(profiles.id, id),
      });

      if (customer) {
        // 2. Fetch order history
        customerOrders = await db.query.orders.findMany({
          where: eq(orders.userId, id),
          orderBy: desc(orders.createdAt),
        });

        // 3. Fetch wishlist items
        customerWishlist = await db
          .select({
            id: wishlistItems.id,
            productId: wishlistItems.productId,
            name: products.name,
            slug: products.slug,
            pricePaise: products.pricePaise,
          })
          .from(wishlistItems)
          .innerJoin(wishlists, eq(wishlistItems.wishlistId, wishlists.id))
          .innerJoin(products, eq(wishlistItems.productId, products.id))
          .where(eq(wishlists.userId, id));

        // 4. Fetch wallet and ledger transactions
        walletDetails = await db.query.walletAccounts.findFirst({
          where: eq(walletAccounts.userId, id),
        });

        if (walletDetails) {
          walletLogs = await db.query.walletTransactions.findMany({
            where: eq(walletTransactions.walletId, walletDetails.id),
            orderBy: desc(walletTransactions.createdAt),
          });
        }
      }
    } catch (e) {
      console.error("Failed to query customer details:", e);
    }
  }

  if (!customer) {
    notFound();
  }

  const [_, m, d] = new Date(customer.createdAt).toDateString().split(" ");

  return (
    <div className="pb-24 selection:bg-brand-pink/20 font-sans text-xs">
      {/* Header Panel */}
      <div className="bg-brand-black text-brand-offwhite py-8 mb-12">
        <Container>
          <Link
            href="/admin/customers"
            className="text-[10px] tracking-widest uppercase text-neutral-400 font-bold hover:text-white transition-colors flex items-center gap-1.5 mb-3"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Customers</span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-brand-sage flex items-center justify-center font-bold text-lg text-white border border-white/10 flex-shrink-0">
              {customer.fullName?.charAt(0).toUpperCase() || "C"}
            </div>
            <div>
              <span className="text-[10px] tracking-widest uppercase text-neutral-400 font-semibold mb-0.5 block">
                Customer account
              </span>
              <h1 className="font-display text-2xl tracking-wide text-white">
                {customer.fullName || "Guest Customer"}
              </h1>
            </div>
          </div>
        </Container>
      </div>

      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT SIDE: Order History, Wishlist */}
          <div className="lg:col-span-8 space-y-8">
            {/* Orders Summary List */}
            <div className="bg-white border border-brand-black/5 p-6 sm:p-8 rounded-xs shadow-xs">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-500 mb-6 flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-brand-pink" />
                <span>Orders History ({customerOrders.length})</span>
              </h3>

              {customerOrders.length === 0 ? (
                <div className="text-center py-10 text-neutral-400">
                  This customer has not placed any orders yet.
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-100 text-neutral-400 uppercase tracking-widest text-[9px] font-bold">
                      <th className="py-3.5 pr-4">Order ID</th>
                      <th className="py-3.5 px-4">Date</th>
                      <th className="py-3.5 px-4">Total</th>
                      <th className="py-3.5 px-4">Fulfillment</th>
                      <th className="py-3.5 pl-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {customerOrders.map((ord) => {
                      const [_, m, d] = ord.createdAt.toDateString().split(" ");
                      return (
                        <tr key={ord.id} className="hover:bg-neutral-50/50">
                          <td className="py-4 pr-4 font-sans font-bold text-brand-black">
                            #{ord.orderNumber}
                          </td>
                          <td className="py-4 px-4 text-neutral-500 font-sans">
                            {d} {m} {ord.createdAt.getFullYear()}
                          </td>
                          <td className="py-4 px-4 font-semibold text-brand-black font-sans">
                            ₹{(ord.totalPaise / 100).toLocaleString("en-IN")}
                          </td>
                          <td className="py-4 px-4">
                            <span className="inline-block px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest bg-neutral-100 text-neutral-700 rounded-xs">
                              {ord.status}
                            </span>
                          </td>
                          <td className="py-4 pl-4 text-right">
                            <Link
                              href={`/admin/orders/${ord.id}`}
                              className="font-bold text-brand-pink hover:text-brand-black uppercase tracking-wider transition-colors"
                            >
                              View
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Wishlist Snapshot */}
            <div className="bg-white border border-brand-black/5 p-6 sm:p-8 rounded-xs shadow-xs">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-500 mb-6 flex items-center gap-2">
                <Heart className="h-4 w-4 text-brand-pink" />
                <span>Wishlist Snapshot ({customerWishlist.length})</span>
              </h3>

              {customerWishlist.length === 0 ? (
                <div className="text-center py-8 text-neutral-400">
                  Wishlist is empty.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {customerWishlist.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 border border-neutral-100 rounded-xs flex items-center justify-between gap-4"
                    >
                      <div>
                        <span className="font-semibold text-brand-black block">{item.name}</span>
                        <span className="text-[9px] text-neutral-400 font-sans block mt-0.5">
                          ₹{(item.pricePaise / 100).toLocaleString("en-IN")}
                        </span>
                      </div>
                      <Link
                        href={`/admin/products/${item.productId}`}
                        className="font-bold text-brand-pink hover:text-brand-black uppercase tracking-wider"
                      >
                        Edit item
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT SIDE: Profile info, Wallet stats & ledger */}
          <div className="lg:col-span-4 space-y-8">
            {/* Contact details */}
            <div className="bg-white border border-brand-black/5 p-6 rounded-xs shadow-xs space-y-4">
              <h4 className="text-[10px] uppercase font-bold tracking-widest text-neutral-400 flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>Customer Profile</span>
              </h4>
              <div className="space-y-2">
                <div>
                  <span className="text-[9px] uppercase font-bold text-neutral-400 block tracking-wider">Email</span>
                  <span className="font-sans font-semibold text-brand-black">{customer.email || "-"}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-neutral-400 block tracking-wider">Phone</span>
                  <span className="font-sans font-semibold text-brand-black">{customer.phone || "-"}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-neutral-400 block tracking-wider">Joined</span>
                  <span className="font-sans text-neutral-500">{d} {m} {new Date(customer.createdAt).getFullYear()}</span>
                </div>
              </div>
            </div>

            {/* Wallet details */}
            <div className="bg-white border border-brand-black/5 p-6 rounded-xs shadow-xs space-y-4">
              <h4 className="text-[10px] uppercase font-bold tracking-widest text-neutral-400 flex items-center gap-2">
                <Wallet className="h-4 w-4 text-brand-pink" />
                <span>Wallet Balance</span>
              </h4>

              {walletDetails ? (
                <div>
                  <div className="text-2xl font-semibold text-brand-black">
                    ₹{(walletDetails.availableBalancePaise / 100).toLocaleString("en-IN")}
                  </div>
                  <span className="text-[10px] text-neutral-400 block font-sans mt-0.5">
                    Currency: {walletDetails.currency}
                  </span>
                </div>
              ) : (
                <div className="text-neutral-400">
                  No active wallet account found.
                </div>
              )}
            </div>

            {/* Wallet ledger logs */}
            {walletDetails && (
              <div className="bg-white border border-brand-black/5 p-6 rounded-xs shadow-xs space-y-4">
                <h4 className="text-[10px] uppercase font-bold tracking-widest text-neutral-400 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Wallet Ledger Logs</span>
                </h4>

                {walletLogs.length === 0 ? (
                  <div className="text-center py-6 text-neutral-400">
                    No transactions recorded.
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[300px] overflow-y-auto scrollbar-custom pr-2">
                    {walletLogs.map((log) => (
                      <div key={log.id} className="border-b border-neutral-50 pb-2 last:border-0 last:pb-0">
                        <div className="flex items-center justify-between text-[9px] uppercase tracking-widest font-bold mb-1">
                          <span
                            className={
                              log.type === "DEBIT" || log.type === "WITHDRAWAL"
                                ? "text-red-600"
                                : "text-brand-sage"
                            }
                          >
                            {log.type}
                          </span>
                          <span className="text-neutral-400 font-sans">
                            {new Date(log.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="font-semibold text-brand-black text-xs">
                          {log.type === "DEBIT" || log.type === "WITHDRAWAL" ? "-" : "+"}
                          ₹{(log.amountPaise / 100).toLocaleString("en-IN")}
                        </div>
                        <p className="text-[10px] text-neutral-500 font-sans leading-relaxed mt-0.5">
                          {log.description}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}
