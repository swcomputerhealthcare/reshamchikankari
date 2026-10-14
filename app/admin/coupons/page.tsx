import React from "react";
import { requireAdmin } from "@/lib/auth/helpers";
import Container from "@/components/ui/container";
import CouponListController from "@/components/admin/coupon-list-controller";
import { db } from "@/db";
import { coupons } from "@/db/schema/coupon";
import { desc } from "drizzle-orm";
import { isDatabaseConfigured } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Coupon Management — Resham Admin",
  description: "Create, configure, and inspect customer discount coupons with live database enforcement.",
};

export default async function AdminCouponsPage() {
  await requireAdmin();

  let couponsList: any[] = [];
  if (isDatabaseConfigured()) {
    try {
      couponsList = await db
        .select()
        .from(coupons)
        .orderBy(desc(coupons.createdAt));
    } catch (e) {
      console.error("Failed to query coupons from database:", e);
    }
  }

  return (
    <div className="pb-24 selection:bg-brand-pink/20 font-sans">
      {/* Header section */}
      <div className="bg-brand-black text-brand-offwhite py-8 mb-12">
        <Container>
          <span className="text-[10px] tracking-widest uppercase text-neutral-400 font-semibold mb-1 block">
            Discount & Promotional Codes
          </span>
          <h1 className="font-display text-3xl tracking-wide text-white">
            Coupon Management
          </h1>
          <p className="text-xs text-neutral-400 font-sans mt-0.5 max-w-xl">
            Create percentage or fixed discount coupon codes, configure minimum order thresholds and maximum caps, set per-user and global usage limits, and monitor live patron redemptions.
          </p>
        </Container>
      </div>

      <Container>
        <CouponListController initialCoupons={couponsList} />
      </Container>
    </div>
  );
}
