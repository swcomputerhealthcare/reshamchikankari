/**
 * Resham Chikankari — Central Canonical Pricing & Promotion Engine
 *
 * SINGLE SOURCE OF TRUTH for all product, variant, cart, and checkout pricing calculations.
 * All amounts are computed in integer paise to avoid floating-point inaccuracy.
 *
 * Conceptual calculation hierarchy:
 * canonical product price
 * → 20% Navratri discount
 * → discounted product subtotal
 * → eligible Welcome 10% discount (sequential stacking on discounted subtotal)
 * → valid wallet adjustment
 * → applicable shipping
 * → applicable COD fee
 * → final payable total
 */

import { NAVRATRI_CAMPAIGN, isNavratriPromotionActive } from "./navratri";

export interface ProductPriceBreakdown {
  canonicalPricePaise: number; // Pre-campaign selling price (authoritative baseline)
  navratriDiscountPaise: number; // Automatic 20% discount amount
  sellingPricePaise: number; // Navratri selling price (or canonical if campaign inactive)
  discountPercent: number; // 20 if active, 0 if inactive
  isNavratriActive: boolean;
  mrpPaise: number | null; // Canonical MRP if provided (distinguished from pre-campaign selling price)
  displayBadge: string; // e.g. "NAVRATRI SALE · 20% OFF"
  badgeShort: string; // e.g. "20% OFF"
  saleTag: string; // e.g. "NAVRATRI SALE"
}

export interface PricingLineItem {
  id?: string;
  productId: string;
  variantId?: string | null;
  canonicalPricePaise: number;
  quantity: number;
}

export interface OrderPricingBreakdown {
  // Pre-campaign product subtotal
  canonicalSubtotalPaise: number;
  // Navratri 20% automatic discount
  navratriDiscountPaise: number;
  isNavratriActive: boolean;
  // Subtotal after Navratri discount
  discountedSubtotalPaise: number;
  // Welcome coupon or other coupon discount
  couponCode?: string | null;
  couponDiscountPaise: number;
  // Subtotal after all eligible product discounts
  subtotalAfterDiscountsPaise: number;
  // Shipping (storewide Free = 0, or explicit)
  shippingPaise: number;
  // COD handling charge (5000 paise for COD, 0 for ONLINE)
  codFeePaise: number;
  // Taxes (inclusive = 0)
  taxPaise: number;
  // Order total before wallet
  orderTotalPaise: number;
  // RC Wallet deduction
  appliedWalletPaise: number;
  // Final payable total (must match Razorpay / COD payable amount)
  finalPayablePaise: number;
}

/**
 * Calculate product or variant price breakdown.
 * Preserves the base canonical price while computing the 20% promotional discount.
 */
export function calculateProductPrice(
  canonicalPricePaise: number,
  mrpPaise?: number | null,
  forceActive?: boolean
): ProductPriceBreakdown {
  const active = forceActive !== undefined ? forceActive : isNavratriPromotionActive();

  if (!active || canonicalPricePaise <= 0) {
    return {
      canonicalPricePaise,
      navratriDiscountPaise: 0,
      sellingPricePaise: canonicalPricePaise,
      discountPercent: 0,
      isNavratriActive: false,
      mrpPaise: mrpPaise ?? null,
      displayBadge: "",
      badgeShort: "",
      saleTag: "",
    };
  }

  // Integer arithmetic: exactly 20% discount
  const navratriDiscountPaise = Math.round((canonicalPricePaise * NAVRATRI_CAMPAIGN.discountPercent) / 100);
  const sellingPricePaise = Math.max(0, canonicalPricePaise - navratriDiscountPaise);

  return {
    canonicalPricePaise,
    navratriDiscountPaise,
    sellingPricePaise,
    discountPercent: NAVRATRI_CAMPAIGN.discountPercent,
    isNavratriActive: true,
    mrpPaise: mrpPaise ?? null,
    displayBadge: NAVRATRI_CAMPAIGN.displayBadge,
    badgeShort: NAVRATRI_CAMPAIGN.badgeShort,
    saleTag: NAVRATRI_CAMPAIGN.saleTag,
  };
}

/**
 * Calculate complete cart and order pricing breakdown.
 * Deterministic calculation used across cart, checkout, order creation, and payment initialization.
 */
export function calculateOrderPricing(options: {
  items: PricingLineItem[];
  coupon?: {
    code: string;
    discountPaise: number;
  } | null;
  paymentMethod?: "ONLINE" | "COD";
  shippingPaise?: number;
  walletAmountPaise?: number;
  forceCampaignActive?: boolean;
}): OrderPricingBreakdown {
  const {
    items,
    coupon,
    paymentMethod = "ONLINE",
    shippingPaise = 0,
    walletAmountPaise = 0,
    forceCampaignActive,
  } = options;

  const isNavratriActive = forceCampaignActive !== undefined
    ? forceCampaignActive
    : isNavratriPromotionActive();

  let canonicalSubtotalPaise = 0;
  let navratriDiscountPaise = 0;

  for (const item of items) {
    const qty = Math.max(1, item.quantity);
    const itemCanonicalPaise = item.canonicalPricePaise || 0;
    canonicalSubtotalPaise += itemCanonicalPaise * qty;

    if (isNavratriActive && itemCanonicalPaise > 0) {
      const itemDiscountPaise = Math.round(
        (itemCanonicalPaise * NAVRATRI_CAMPAIGN.discountPercent) / 100
      );
      navratriDiscountPaise += itemDiscountPaise * qty;
    }
  }

  const discountedSubtotalPaise = Math.max(0, canonicalSubtotalPaise - navratriDiscountPaise);

  // Coupon discount is applied to the discountedSubtotalPaise
  const couponDiscountPaise = coupon && coupon.discountPaise > 0
    ? Math.min(coupon.discountPaise, discountedSubtotalPaise)
    : 0;

  const subtotalAfterDiscountsPaise = Math.max(
    0,
    discountedSubtotalPaise - couponDiscountPaise
  );

  const codFeePaise = paymentMethod === "COD" ? 5000 : 0;
  const taxPaise = 0;

  const orderTotalPaise = Math.max(
    0,
    subtotalAfterDiscountsPaise + shippingPaise + codFeePaise + taxPaise
  );

  const appliedWalletPaise = Math.min(Math.max(0, walletAmountPaise), orderTotalPaise);
  const finalPayablePaise = Math.max(0, orderTotalPaise - appliedWalletPaise);

  return {
    canonicalSubtotalPaise,
    navratriDiscountPaise,
    isNavratriActive,
    discountedSubtotalPaise,
    couponCode: coupon?.code || null,
    couponDiscountPaise,
    subtotalAfterDiscountsPaise,
    shippingPaise,
    codFeePaise,
    taxPaise,
    orderTotalPaise,
    appliedWalletPaise,
    finalPayablePaise,
  };
}

/**
 * Format paise to Indian Rupee display string.
 */
export function formatPaiseToRupees(paise: number, includeFraction = false): string {
  const rupees = paise / 100;
  if (includeFraction && rupees % 1 !== 0) {
    return rupees.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
  return Math.round(rupees).toLocaleString("en-IN");
}
