/**
 * Resham Chikankari — Navratri Promotional Campaign Configuration
 *
 * Centrally controlled configuration for the Navratri Sale promotion.
 * All promotion rules, active states, and discount rates are defined here.
 */

export interface PromotionCampaign {
  id: string;
  name: string;
  discountPercent: number; // 20% automatic discount
  displayBadge: string; // "NAVRATRI SALE · 20% OFF"
  badgeShort: string; // "20% OFF"
  saleTag: string; // "NAVRATRI SALE"
  isActive: boolean;
  startDate: string | null;
  endDate: string | null; // Configurable promotion end date
}

// Global Navratri Campaign Configuration
export const NAVRATRI_CAMPAIGN: PromotionCampaign = {
  id: "navratri-sale",
  name: "Navratri Sale",
  discountPercent: 20,
  displayBadge: "NAVRATRI SALE · 20% OFF",
  badgeShort: "20% OFF",
  saleTag: "NAVRATRI SALE",
  isActive: true, // Immediately active
  startDate: null,
  endDate: null, // End date to be configured when campaign schedule is finalized
};

// Runtime override state (useful for campaign deactivation tests & admin controls)
let runtimeCampaignOverride: boolean | null = null;

/**
 * Apply updated configuration dynamically (from DB or Admin UI)
 */
export function applyCampaignConfig(config: Partial<PromotionCampaign>): void {
  if (config.name !== undefined) NAVRATRI_CAMPAIGN.name = config.name;
  if (config.discountPercent !== undefined) {
    NAVRATRI_CAMPAIGN.discountPercent = config.discountPercent;
    NAVRATRI_CAMPAIGN.badgeShort = `${config.discountPercent}% OFF`;
    NAVRATRI_CAMPAIGN.displayBadge = `${(config.name || NAVRATRI_CAMPAIGN.name).toUpperCase()} · ${config.discountPercent}% OFF`;
  }
  if (config.displayBadge !== undefined) NAVRATRI_CAMPAIGN.displayBadge = config.displayBadge;
  if (config.badgeShort !== undefined) NAVRATRI_CAMPAIGN.badgeShort = config.badgeShort;
  if (config.saleTag !== undefined) NAVRATRI_CAMPAIGN.saleTag = config.saleTag;
  if (config.isActive !== undefined) NAVRATRI_CAMPAIGN.isActive = config.isActive;
  if (config.startDate !== undefined) NAVRATRI_CAMPAIGN.startDate = config.startDate;
  if (config.endDate !== undefined) NAVRATRI_CAMPAIGN.endDate = config.endDate;
}

/**
 * Check if the Navratri Sale promotion is currently active.
 * Governed by central configuration, environment variable, and optional date window.
 */
export function isNavratriPromotionActive(): boolean {
  if (runtimeCampaignOverride !== null) {
    return runtimeCampaignOverride;
  }

  // Environment variable override (e.g. NEXT_PUBLIC_NAVRATRI_SALE=false or NAVRATRI_SALE_ACTIVE=false)
  if (
    process.env.NEXT_PUBLIC_NAVRATRI_SALE === "false" ||
    process.env.NAVRATRI_SALE_ACTIVE === "false"
  ) {
    return false;
  }

  if (!NAVRATRI_CAMPAIGN.isActive) {
    return false;
  }

  const now = Date.now();
  if (NAVRATRI_CAMPAIGN.startDate && new Date(NAVRATRI_CAMPAIGN.startDate).getTime() > now) {
    return false;
  }
  if (NAVRATRI_CAMPAIGN.endDate && new Date(NAVRATRI_CAMPAIGN.endDate).getTime() < now) {
    return false;
  }

  return true;
}

/**
 * Programmatically toggle the campaign active state (for runtime tests & administrative control).
 */
export function setNavratriCampaignActive(active: boolean | null): void {
  runtimeCampaignOverride = active;
}
