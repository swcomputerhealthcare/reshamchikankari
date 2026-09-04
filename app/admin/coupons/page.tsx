import React from "react";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/helpers";
import Container from "@/components/ui/container";
import Button from "@/components/ui/button";
import { getAllCoupons } from "@/lib/coupon";
import CouponToggle from "@/components/admin/coupon-toggle";
import CouponForm from "@/components/admin/coupon-form";

export const metadata = {
  title: "Admin Coupons Dashboard — Resham",
};

export default async function AdminCouponsPage() {
  // Authorize admin
  await requireAdmin();

  const couponsList = await getAllCoupons();

  return (
    <div className="bg-neutral-50 min-h-screen text-neutral-900 font-sans pb-24 selection:bg-brand-pink/20">
      {/* Header section */}
      <div className="bg-brand-black text-brand-offwhite py-8 mb-12">
        <Container className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] tracking-widest uppercase text-neutral-400 font-semibold mb-1 block">
              Management Portal
            </span>
            <h1 className="font-display text-3xl tracking-wide">
              Coupons Directory
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/admin/products">
              <Button variant="outline" className="text-white border-white/20 hover:bg-white/10 hover:text-white py-2 text-xs">
                Back to Products
              </Button>
            </Link>
          </div>
        </Container>
      </div>

      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Coupon Directory Table */}
          <div className="lg:col-span-8 bg-white border border-brand-black/5 p-6 sm:p-8 rounded-xs shadow-xs overflow-x-auto h-fit">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-500 mb-6">
              Active Coupons ({couponsList.length})
            </h2>

            {couponsList.length === 0 ? (
              <div className="text-center py-20 text-neutral-500 text-sm">
                No coupons found. Create one on the right panel.
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-neutral-100 text-neutral-400 uppercase tracking-widest text-[10px] font-bold">
                    <th className="py-3.5 pr-4">Code</th>
                    <th className="py-3.5 px-4">Discount</th>
                    <th className="py-3.5 px-4">Min Order</th>
                    <th className="py-3.5 px-4">Usages</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 pl-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {couponsList.map((coup) => (
                    <tr key={coup.id} className="hover:bg-neutral-50/50">
                      <td className="py-4 pr-4 font-bold text-brand-black font-sans">
                        {coup.code}
                      </td>
                      <td className="py-4 px-4">
                        {coup.type === "PERCENTAGE" ? (
                          <span className="font-semibold">{coup.value}% Off</span>
                        ) : (
                          <span className="font-semibold">₹{(coup.value / 100).toLocaleString("en-IN")} Off</span>
                        )}
                        {coup.maximumDiscountPaise && (
                          <div className="text-[10px] text-neutral-400">
                            Capped at ₹{(coup.maximumDiscountPaise / 100).toLocaleString("en-IN")}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-4 font-semibold text-neutral-700">
                        ₹{(coup.minimumOrderPaise / 100).toLocaleString("en-IN")}
                      </td>
                      <td className="py-4 px-4 text-neutral-500 font-sans">
                        {coup.usageCount} {coup.usageLimit ? `/ ${coup.usageLimit}` : ""}
                      </td>
                      <td className="py-4 px-4">
                        <CouponToggle id={coup.id} initialActive={coup.isActive} />
                      </td>
                      <td className="py-4 pl-4 text-right">
                        <form
                          action={async () => {
                            'use server';
                            const { deleteCouponAction } = await import("@/actions/coupon");
                            await deleteCouponAction(coup.id);
                          }}
                        >
                          <button
                            type="submit"
                            className="text-xs font-bold text-red-500 hover:text-red-700 uppercase tracking-wider cursor-pointer"
                          >
                            Delete
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Creation panel */}
          <div className="lg:col-span-4 bg-white border border-brand-black/5 p-6 rounded-xs shadow-xs h-fit">
            <CouponForm />
          </div>
        </div>
      </Container>
    </div>
  );
}
