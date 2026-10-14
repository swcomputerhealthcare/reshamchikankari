'use server';

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/helpers";
import { db } from "@/db";
import { siteSettings } from "@/db/schema/content";
import { eq } from "drizzle-orm";
import { NAVRATRI_CAMPAIGN, applyCampaignConfig, PromotionCampaign } from "@/lib/promotions/navratri";
import { logAdminActivity } from "@/lib/audit";
import { isDatabaseConfigured } from "@/lib/utils";

export async function getPromotionCampaignAction(): Promise<PromotionCampaign> {
  if (!isDatabaseConfigured()) {
    return { ...NAVRATRI_CAMPAIGN };
  }

  try {
    const row = await db.query.siteSettings.findFirst({
      where: eq(siteSettings.id, "global"),
    });

    const storedPromotions = (row?.promotions as Record<string, any>) || {};
    const campaignData = storedPromotions.navratriSale;

    if (campaignData && typeof campaignData === "object") {
      const merged: PromotionCampaign = {
        id: "navratri-sale",
        name: campaignData.name || NAVRATRI_CAMPAIGN.name,
        discountPercent: Number(campaignData.discountPercent) || NAVRATRI_CAMPAIGN.discountPercent,
        displayBadge: campaignData.displayBadge || `${(campaignData.name || NAVRATRI_CAMPAIGN.name).toUpperCase()} · ${campaignData.discountPercent}% OFF`,
        badgeShort: `${campaignData.discountPercent || NAVRATRI_CAMPAIGN.discountPercent}% OFF`,
        saleTag: (campaignData.name || NAVRATRI_CAMPAIGN.saleTag).toUpperCase(),
        isActive: campaignData.isActive !== undefined ? Boolean(campaignData.isActive) : NAVRATRI_CAMPAIGN.isActive,
        startDate: campaignData.startDate || null,
        endDate: campaignData.endDate || null,
      };

      applyCampaignConfig(merged);
      return merged;
    }
  } catch (err) {
    console.warn("Could not load promotion campaign from DB:", err);
  }

  return { ...NAVRATRI_CAMPAIGN };
}

export async function updatePromotionCampaignAction(data: {
  name: string;
  discountPercent: number;
  displayBadge?: string;
  isActive: boolean;
  startDate?: string | null;
  endDate?: string | null;
}) {
  const admin = await requireAdmin();

  if (typeof data.discountPercent !== "number" || data.discountPercent <= 0 || data.discountPercent >= 100) {
    return { success: false, error: "Discount percentage must be between 1% and 99%." };
  }

  if (!data.name || data.name.trim().length === 0) {
    return { success: false, error: "Campaign name is required." };
  }

  const campaignPayload: PromotionCampaign = {
    id: "navratri-sale",
    name: data.name.trim(),
    discountPercent: Math.round(data.discountPercent),
    displayBadge: data.displayBadge?.trim() || `${data.name.trim().toUpperCase()} · ${Math.round(data.discountPercent)}% OFF`,
    badgeShort: `${Math.round(data.discountPercent)}% OFF`,
    saleTag: data.name.trim().toUpperCase(),
    isActive: Boolean(data.isActive),
    startDate: data.startDate || null,
    endDate: data.endDate || null,
  };

  if (isDatabaseConfigured()) {
    try {
      const existing = await db.query.siteSettings.findFirst({
        where: eq(siteSettings.id, "global"),
      });

      const currentPromos = (existing?.promotions as Record<string, any>) || {};
      const updatedPromos = {
        ...currentPromos,
        navratriSale: {
          ...campaignPayload,
          updatedAt: new Date().toISOString(),
          updatedBy: admin.email,
        },
      };

      if (existing) {
        await db
          .update(siteSettings)
          .set({
            promotions: updatedPromos,
            updatedAt: new Date(),
          })
          .where(eq(siteSettings.id, "global"));
      } else {
        await db.insert(siteSettings).values({
          id: "global",
          storeName: "Resham Chikankari",
          storeEmail: "info@reshamchikankari.com",
          promotions: updatedPromos,
          updatedAt: new Date(),
        });
      }

      applyCampaignConfig(campaignPayload);

      await logAdminActivity(
        "CAMPAIGN_UPDATED",
        "promotion",
        "navratri-sale",
        {
          campaign: campaignPayload,
        },
        admin.id
      );

      try {
        revalidatePath("/");
        revalidatePath("/", "layout");
        revalidatePath("/shop");
        revalidatePath("/cart");
        revalidatePath("/checkout");
        revalidatePath("/admin/promotions");
        revalidatePath("/admin");
      } catch (revErr) {
        // Non-request environment fallback
      }

      return { success: true, campaign: campaignPayload };
    } catch (err: any) {
      console.error("Failed to update promotional campaign in DB:", err);
      return { success: false, error: err.message || "Failed to update campaign in database." };
    }
  } else {
    applyCampaignConfig(campaignPayload);
    return { success: true, campaign: campaignPayload };
  }
}
