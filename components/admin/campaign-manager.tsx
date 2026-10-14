'use client';

import React, { useState, useTransition } from "react";
import { updatePromotionCampaignAction } from "@/actions/promotions";
import { PromotionCampaign } from "@/lib/promotions/navratri";
import { Sparkles, Save, Calendar, CheckCircle2, AlertCircle, Percent, ArrowRight, ShieldCheck } from "lucide-react";

interface CampaignManagerProps {
  initialCampaign: PromotionCampaign;
  welcomeCoupon?: {
    code: string;
    value: number;
    minOrderRupees: number;
    maxDiscountRupees: number | null;
    isActive: boolean;
  } | null;
}

export default function CampaignManager({
  initialCampaign,
  welcomeCoupon,
}: CampaignManagerProps) {
  const [campaign, setCampaign] = useState<PromotionCampaign>(initialCampaign);
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState<{ text: string; isError: boolean } | null>(null);

  // Form states
  const [name, setName] = useState(campaign.name);
  const [discountPercent, setDiscountPercent] = useState(campaign.discountPercent.toString());
  const [displayBadge, setDisplayBadge] = useState(campaign.displayBadge);
  const [isActive, setIsActive] = useState(campaign.isActive);
  const [startDate, setStartDate] = useState(campaign.startDate ? campaign.startDate.split("T")[0] : "");
  const [endDate, setEndDate] = useState(campaign.endDate ? campaign.endDate.split("T")[0] : "");

  // Interactive Test Price
  const [testCanonicalPrice, setTestCanonicalPrice] = useState("2695");
  const [includeWelcomeInPreview, setIncludeWelcomeInPreview] = useState(true);

  const showToast = (text: string, isError = false) => {
    setToast({ text, isError });
    setTimeout(() => setToast(null), 4000);
  };

  // Preview Calculations
  const numericCanonical = parseFloat(testCanonicalPrice) || 0;
  const canonicalPaise = Math.round(numericCanonical * 100);
  const currentDiscountPercent = parseFloat(discountPercent) || 0;

  const promoDiscountPaise = isActive
    ? Math.round((canonicalPaise * currentDiscountPercent) / 100)
    : 0;
  const promoSellingPricePaise = Math.max(0, canonicalPaise - promoDiscountPaise);

  let welcomeDiscountPaise = 0;
  if (includeWelcomeInPreview && welcomeCoupon?.isActive) {
    const rawWelcome = Math.round((promoSellingPricePaise * welcomeCoupon.value) / 100);
    const capPaise = (welcomeCoupon.maxDiscountRupees || 300) * 100;
    welcomeDiscountPaise = Math.min(rawWelcome, capPaise);
  }

  const finalCombinedPayablePaise = Math.max(0, promoSellingPricePaise - welcomeDiscountPaise);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const percentNum = parseFloat(discountPercent);
    if (isNaN(percentNum) || percentNum <= 0 || percentNum >= 100) {
      showToast("Please enter a valid discount percentage (1% to 99%).", true);
      return;
    }

    startTransition(async () => {
      const res = await updatePromotionCampaignAction({
        name: name.trim(),
        discountPercent: percentNum,
        displayBadge: displayBadge.trim() || undefined,
        isActive,
        startDate: startDate ? new Date(startDate).toISOString() : null,
        endDate: endDate ? new Date(endDate).toISOString() : null,
      });

      if (res.success && res.campaign) {
        setCampaign(res.campaign);
        showToast("Promotional campaign saved and applied live across storefront.");
      } else {
        showToast(res.error || "Failed to save promotional campaign.", true);
      }
    });
  };

  return (
    <div className="font-sans space-y-8">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 p-4 border text-xs font-bold uppercase tracking-widest rounded-xs shadow-lg transition-all ${
            toast.isError
              ? "bg-red-50 border-red-200 text-red-700"
              : "bg-brand-black border-white/10 text-brand-offwhite"
          }`}
        >
          {toast.text}
        </div>
      )}

      {/* Top Banner / Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-brand-black/5 p-6 rounded-xs shadow-xs">
          <span className="text-[10px] tracking-widest uppercase text-neutral-400 font-bold block mb-1">
            Active Campaign
          </span>
          <div className="text-xl font-bold text-brand-black flex items-center gap-2">
            <span>{campaign.name}</span>
            <span
              className={`inline-block px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-widest rounded-xs ${
                campaign.isActive
                  ? "bg-brand-sage/15 text-brand-sage border border-brand-sage/30"
                  : "bg-neutral-100 text-neutral-500 border border-neutral-200"
              }`}
            >
              {campaign.isActive ? "Live" : "Disabled"}
            </span>
          </div>
          <span className="text-xs text-neutral-400 mt-1 block">
            {campaign.isActive
              ? `${campaign.discountPercent}% automatic discount applied at checkout`
              : "Standard canonical prices active on storefront"}
          </span>
        </div>

        <div className="bg-white border border-brand-black/5 p-6 rounded-xs shadow-xs">
          <span className="text-[10px] tracking-widest uppercase text-neutral-400 font-bold block mb-1">
            Visible Storefront Tag
          </span>
          <div className="text-base font-semibold text-brand-black truncate">
            {campaign.displayBadge}
          </div>
          <span className="text-xs text-neutral-400 mt-1 block">
            Shown on product cards and detail banners
          </span>
        </div>

        <div className="bg-white border border-brand-black/5 p-6 rounded-xs shadow-xs">
          <span className="text-[10px] tracking-widest uppercase text-neutral-400 font-bold block mb-1">
            Welcome 10% Offer Stacking
          </span>
          <div className="text-base font-bold text-brand-sage flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4" />
            <span>Sequential Stacking Enabled</span>
          </div>
          <span className="text-xs text-neutral-400 mt-1 block">
            {welcomeCoupon?.code || "WELCOME10"} applies on discounted subtotal
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: Campaign Controls Form */}
        <div className="lg:col-span-7 bg-white border border-brand-black/5 p-6 sm:p-8 rounded-xs shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-500 flex items-center gap-2">
              <Sparkles className="h-4.5 w-4.5 text-brand-pink" />
              <span>Campaign Configuration</span>
            </h3>
            <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-mono">
              ID: {campaign.id}
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Enable/Disable Toggle */}
            <div className="p-4 bg-neutral-50 border border-neutral-200/80 rounded-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-brand-black uppercase tracking-wider block">
                  Campaign Status
                </span>
                <span className="text-[11px] text-neutral-500 leading-relaxed block mt-0.5">
                  When enabled, all eligible products automatically receive the promotion discount. When disabled, prices revert to canonical prices.
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer ml-4">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-sage"></div>
              </label>
            </div>

            {/* Campaign Name & Discount % */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-xs uppercase tracking-wider text-neutral-500 font-bold">
                  Campaign Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setDisplayBadge(`${e.target.value.toUpperCase()} · ${discountPercent}% OFF`);
                  }}
                  placeholder="e.g. Navratri Sale"
                  className="w-full px-4 py-3 bg-white border border-brand-black/15 focus:border-brand-sage focus:outline-none text-sm font-semibold text-brand-black rounded-xs"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs uppercase tracking-wider text-neutral-500 font-bold">
                  Automatic Discount (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="99"
                    step="1"
                    required
                    value={discountPercent}
                    onChange={(e) => {
                      setDiscountPercent(e.target.value);
                      setDisplayBadge(`${name.toUpperCase()} · ${e.target.value}% OFF`);
                    }}
                    className="w-full px-4 py-3 bg-white border border-brand-black/15 focus:border-brand-sage focus:outline-none text-sm font-semibold text-brand-black rounded-xs"
                  />
                  <Percent className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                </div>
              </div>
            </div>

            {/* Display Badge Text */}
            <div className="space-y-2">
              <label className="block text-xs uppercase tracking-wider text-neutral-500 font-bold">
                Storefront Badge Label
              </label>
              <input
                type="text"
                value={displayBadge}
                onChange={(e) => setDisplayBadge(e.target.value)}
                placeholder="NAVRATRI SALE · 20% OFF"
                className="w-full px-4 py-3 bg-white border border-brand-black/15 focus:border-brand-sage focus:outline-none text-sm font-semibold uppercase tracking-wider text-brand-black rounded-xs font-mono"
              />
              <span className="text-[10px] text-neutral-400 block">
                Preview: <span className="inline-block bg-[#B66F79] text-[#FFF9F4] px-2 py-0.5 text-[9px] font-bold uppercase rounded-[2px] ml-1">{displayBadge || "SALE"}</span>
              </span>
            </div>

            {/* Date Window */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              <div className="space-y-2">
                <label className="block text-xs uppercase tracking-wider text-neutral-500 font-bold flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Start Date (Optional)</span>
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-brand-black/15 focus:border-brand-sage focus:outline-none text-xs rounded-xs font-sans"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs uppercase tracking-wider text-neutral-500 font-bold flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>End / Expiry Date (Optional)</span>
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-brand-black/15 focus:border-brand-sage focus:outline-none text-xs rounded-xs font-sans"
                />
              </div>
            </div>

            {/* Submit Action */}
            <div className="border-t border-neutral-100 pt-6 flex justify-end">
              <button
                type="submit"
                disabled={isPending}
                className="px-8 py-3 bg-brand-sage hover:bg-[#324027] text-white text-xs uppercase tracking-widest font-bold transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer rounded-xs shadow-xs"
              >
                <Save className="h-4 w-4" />
                <span>{isPending ? "Saving..." : "Save Campaign Settings"}</span>
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT COLUMN: Interactive Price Test Simulator */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#FFFDF9] border border-brand-black/10 p-6 sm:p-8 rounded-xs shadow-xs space-y-6">
            <div className="border-b border-brand-black/10 pb-3">
              <span className="text-[10px] uppercase font-bold tracking-widest text-brand-pink block mb-1">
                Authoritative Validation
              </span>
              <h3 className="font-display text-lg text-brand-black tracking-wide">
                Live Pricing Engine Test
              </h3>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs uppercase tracking-wider text-neutral-500 font-bold">
                  Test Canonical Base Price (₹)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={testCanonicalPrice}
                    onChange={(e) => setTestCanonicalPrice(e.target.value)}
                    className="flex-1 px-4 py-2.5 bg-white border border-brand-black/15 focus:border-brand-sage focus:outline-none text-sm font-semibold rounded-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setTestCanonicalPrice("2695")}
                    className="px-3 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold uppercase tracking-wider rounded-xs cursor-pointer"
                  >
                    Chanderi (₹2,695)
                  </button>
                </div>
              </div>

              <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-neutral-700 select-none pt-1">
                <input
                  type="checkbox"
                  checked={includeWelcomeInPreview}
                  onChange={(e) => setIncludeWelcomeInPreview(e.target.checked)}
                  className="h-4 w-4 text-brand-sage focus:ring-brand-sage"
                />
                <span>Simulate eligible Welcome 10% coupon stacking</span>
              </label>

              {/* Math Breakdown Table */}
              <div className="bg-white border border-brand-black/5 p-4 rounded-xs text-xs space-y-3 font-sans mt-4">
                <div className="flex justify-between items-center text-neutral-600">
                  <span>Canonical Base Price:</span>
                  <span className="font-bold text-brand-black">
                    ₹{(canonicalPaise / 100).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex justify-between items-center text-brand-pink">
                  <span>
                    {isActive ? `${name} (-${currentDiscountPercent}%)` : "Campaign Inactive"}:
                  </span>
                  <span className="font-bold">
                    {isActive
                      ? `-₹${(promoDiscountPaise / 100).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
                      : "₹0.00"}
                  </span>
                </div>

                <div className="flex justify-between items-center text-neutral-800 border-t border-neutral-100 pt-2 font-medium">
                  <span>Promotional Selling Price:</span>
                  <span className="font-bold text-brand-black">
                    ₹{(promoSellingPricePaise / 100).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>

                {includeWelcomeInPreview && (
                  <div className="flex justify-between items-center text-brand-sage">
                    <span>Welcome 10% Stacking:</span>
                    <span className="font-bold">
                      -₹{(welcomeDiscountPaise / 100).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center border-t-2 border-brand-black/10 pt-3 text-sm font-bold text-brand-black">
                  <span>Final Customer Payable:</span>
                  <span className="text-base font-semibold text-brand-black">
                    ₹{(finalCombinedPayablePaise / 100).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Test verification note */}
              <div className="p-3 bg-brand-sage/10 border border-brand-sage/20 rounded-xs text-[11px] text-brand-sage leading-relaxed flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block uppercase tracking-wider text-[10px]">Reference Benchmark</span>
                  For ₹2,695 (CHANDERI SPARKLE SET DYED): 20% discount = ₹539 → ₹2,156. If Welcome 10% stacks, discount = ₹215.60 → final customer payable is <strong>₹1,940.40</strong>.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
