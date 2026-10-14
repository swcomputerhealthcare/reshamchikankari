import React from "react";
import { requireAdmin } from "@/lib/auth/helpers";
import Container from "@/components/ui/container";
import CampaignManager from "@/components/admin/campaign-manager";
import { getPromotionCampaignAction } from "@/actions/promotions";
import { db } from "@/db";
import { coupons } from "@/db/schema/coupon";
import { eq } from "drizzle-orm";
import { isDatabaseConfigured } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Promotions & Navratri Campaign — Resham Admin",
  description: "Centrally manage seasonal discounts, Navratri promotions, and welcome offer stacking rules.",
};

export default async function AdminPromotionsPage() {
  await requireAdmin();

  const campaign = await getPromotionCampaignAction();

  let welcomeCoupon: any = null;
  if (isDatabaseConfigured()) {
    try {
      const [res] = await db
        .select()
        .from(coupons)
        .where(eq(coupons.code, "WELCOME10"))
        .limit(1);

      if (res) {
        welcomeCoupon = {
          code: res.code,
          value: res.value,
          minOrderRupees: res.minimumOrderPaise / 100,
          maxDiscountRupees: res.maximumDiscountPaise ? res.maximumDiscountPaise / 100 : null,
          isActive: res.isActive,
        };
      }
    } catch (e) {
      console.warn("Could not load WELCOME10 coupon info:", e);
    }
  }

  return (
    <div className="pb-24 selection:bg-brand-pink/20 font-sans">
      {/* Header section */}
      <div className="bg-brand-black text-brand-offwhite py-8 mb-12">
        <Container>
          <span className="text-[10px] tracking-widest uppercase text-neutral-400 font-semibold mb-1 block">
            Promotional Engine
          </span>
          <h1 className="font-display text-3xl tracking-wide text-white">
            Campaigns & Festive Offers
          </h1>
          <p className="text-xs text-neutral-400 font-sans mt-0.5 max-w-xl">
            Configure storewide festive discounts, set promotion active dates, and preview mathematical customer price calculations. Canonical product prices remain safe and separate in the database.
          </p>
        </Container>
      </div>

      <Container>
        <CampaignManager
          initialCampaign={campaign}
          welcomeCoupon={welcomeCoupon}
        />
      </Container>
    </div>
  );
}
