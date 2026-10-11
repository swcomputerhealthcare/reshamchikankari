'use client';

import React, { useState, useEffect, useTransition, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { applyCouponAction, removeCouponAction } from "@/actions/coupon";
import { Check, Loader2, Tag, Lock, Gift } from "lucide-react";
import Button from "@/components/ui/button";

interface EditorialOrderSummaryProps {
  subtotalPaise: number;
  canonicalSubtotalPaise?: number;
  navratriDiscountPaise?: number;
  isNavratriActive?: boolean;
  shippingPaise: number;
  codFeePaise?: number;
  appliedWalletPaise?: number;
  initialCouponCode?: string;
  initialDiscountPaise?: number;
  isCheckoutPending?: boolean;
  paymentMethod?: "ONLINE" | "COD";
  onSubmitOrder?: (e: React.FormEvent) => void;
  ctaText?: string;
  showCheckoutButton?: boolean;
  onDiscountChange?: (discountPaise: number, code?: string) => void;
}

export default function EditorialOrderSummary({
  subtotalPaise,
  canonicalSubtotalPaise,
  navratriDiscountPaise,
  isNavratriActive,
  shippingPaise,
  codFeePaise = 0,
  appliedWalletPaise = 0,
  initialCouponCode,
  initialDiscountPaise = 0,
  isCheckoutPending = false,
  paymentMethod = "ONLINE",
  onSubmitOrder,
  ctaText,
  showCheckoutButton = true,
  onDiscountChange,
}: EditorialOrderSummaryProps) {
  const prefersReducedMotion = useReducedMotion();
  const [isPending, startTransition] = useTransition();

  // Coupon state
  const [couponCodeInput, setCouponCodeInput] = useState(initialCouponCode || "");
  const [appliedCode, setAppliedCode] = useState<string | undefined>(initialCouponCode);
  const [discountPaise, setDiscountPaise] = useState<number>(initialDiscountPaise);
  const [couponError, setCouponError] = useState<string | null>(null);

  // Derive Navratri discount and canonical base subtotal
  const effectiveNavratriDiscountPaise =
    navratriDiscountPaise !== undefined
      ? navratriDiscountPaise
      : (canonicalSubtotalPaise && canonicalSubtotalPaise > subtotalPaise
          ? canonicalSubtotalPaise - subtotalPaise
          : 0);

  const effectiveCanonicalSubtotalPaise =
    canonicalSubtotalPaise !== undefined && canonicalSubtotalPaise > 0
      ? canonicalSubtotalPaise
      : subtotalPaise + effectiveNavratriDiscountPaise;

  const targetTotalPaise = Math.max(
    0,
    subtotalPaise - discountPaise + shippingPaise + codFeePaise - appliedWalletPaise
  );

  const baseTotalWithoutDiscountPaise = Math.max(
    0,
    effectiveCanonicalSubtotalPaise + shippingPaise + codFeePaise - appliedWalletPaise
  );

  const totalSavingsPaise = effectiveNavratriDiscountPaise + discountPaise;

  // Animated Price Interpolation State
  const prevTotalRef = useRef<number | null>(null);
  const [displayedTotalPaise, setDisplayedTotalPaise] = useState<number>(() => targetTotalPaise);

  // Smooth numeric counter animation interpolation over 450ms
  useEffect(() => {
    if (prefersReducedMotion) {
      setDisplayedTotalPaise(targetTotalPaise);
      prevTotalRef.current = targetTotalPaise;
      return;
    }

    const startVal = prevTotalRef.current ?? displayedTotalPaise;
    const endVal = targetTotalPaise;
    if (startVal === endVal) return;

    let startTime: number | null = null;
    const duration = 450;
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min(1, (timestamp - startTime) / duration);
      // Ease-out cubic
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const currentVal = Math.round(startVal + (endVal - startVal) * easedProgress);

      setDisplayedTotalPaise(currentVal);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        prevTotalRef.current = endVal;
      }
    };

    animationFrameId = requestAnimationFrame(step);

    return () => cancelAnimationFrame(animationFrameId);
  }, [targetTotalPaise, prefersReducedMotion]);

  // Apply Coupon Handler
  const handleApplyCoupon = () => {
    if (!couponCodeInput.trim() || isPending) return;
    setCouponError(null);

    startTransition(async () => {
      try {
        const res = await applyCouponAction(couponCodeInput, subtotalPaise);
        if (res.success && res.discountPaise !== undefined) {
          const applied = res.code || couponCodeInput.trim().toUpperCase();
          setAppliedCode(applied);
          setDiscountPaise(res.discountPaise);
          setCouponError(null);
          onDiscountChange?.(res.discountPaise, applied);
        } else {
          setCouponError(res.error || "Coupon code is invalid.");
        }
      } catch (err) {
        setCouponError("Unable to verify offer. Please try again.");
      }
    });
  };

  // Remove Coupon Handler
  const handleRemoveCoupon = () => {
    if (isPending) return;
    setCouponError(null);

    startTransition(async () => {
      try {
        await removeCouponAction();
        setAppliedCode(undefined);
        setDiscountPaise(0);
        setCouponCodeInput("");
        onDiscountChange?.(0, undefined);
      } catch (err) {
        setCouponError("Failed to remove coupon. Please try again.");
      }
    });
  };

  const formatAmount = (paise: number) => {
    const rs = paise / 100;
    return rs % 1 !== 0
      ? rs.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : rs.toLocaleString("en-IN");
  };

  return (
    <div className="bg-[#F8F2EC] border border-[#ECE9E2] p-6 sm:p-8 rounded-2xl shadow-xs space-y-6 text-left font-sans select-none">
      <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-[#7C7A5A] border-b border-[#ECE9E2] pb-4">
        ORDER SUMMARY
      </h2>

      {/* Pricing Rows */}
      <div className="space-y-3.5 border-b border-[#ECE9E2] pb-6 text-xs text-neutral-700">
        {/* Product Subtotal (Pre-campaign) */}
        <div className="flex justify-between items-center">
          <span className="text-neutral-600">Product Subtotal</span>
          <span className="font-semibold text-[#161616]">
            ₹{formatAmount(effectiveCanonicalSubtotalPaise)}
          </span>
        </div>

        {/* Navratri Sale 20% Discount Row */}
        {effectiveNavratriDiscountPaise > 0 && (
          <div className="flex justify-between items-center text-[#B66F79] font-semibold">
            <span className="flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-[#B66F79]" />
              Navratri Discount (20%)
            </span>
            <span>&minus; ₹{formatAmount(effectiveNavratriDiscountPaise)}</span>
          </div>
        )}

        {/* Subtotal after Navratri */}
        {effectiveNavratriDiscountPaise > 0 && (
          <div className="flex justify-between items-center text-neutral-600 text-[11px]">
            <span>Subtotal after Navratri</span>
            <span className="font-medium text-[#161616]">
              ₹{formatAmount(subtotalPaise)}
            </span>
          </div>
        )}

        {/* Complimentary Free Gift Privilege */}
        <div className="flex justify-between items-center bg-[#FFF9F4] p-2.5 rounded-xl border border-[#7C7A5A]/25 text-xs text-[#7C7A5A]">
          <span className="flex items-center gap-1.5 font-medium">
            <Gift className="w-3.5 h-3.5 text-[#E694AA]" />
            Free Gift on Every Order
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-neutral-400 line-through">₹499</span>
            <span className="font-bold text-[11px] uppercase tracking-wider text-[#7C7A5A]">
              FREE
            </span>
          </div>
        </div>

        {/* Animated Coupon Discount Row */}
        <AnimatePresence>
          {discountPaise > 0 && appliedCode && (
            <motion.div
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="flex justify-between items-center text-[#7C7A5A] font-semibold"
            >
              <span className="flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-[#E694AA]" />
                Welcome 10% Discount ({appliedCode})
              </span>
              <span>&minus; ₹{formatAmount(discountPaise)}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Subtotal after eligible discounts */}
        {discountPaise > 0 && (
          <div className="flex justify-between items-center text-neutral-600 text-[11px]">
            <span>Subtotal after eligible discounts</span>
            <span className="font-medium text-[#161616]">
              ₹{formatAmount(Math.max(0, subtotalPaise - discountPaise))}
            </span>
          </div>
        )}

        {/* Estimated Shipping */}
        <div className="flex justify-between items-center">
          <span className="text-neutral-600">Estimated Shipping</span>
          <span className="font-semibold text-[#7C7A5A] uppercase text-[11px] tracking-wider">
            {shippingPaise === 0 ? "FREE" : `₹${formatAmount(shippingPaise)}`}
          </span>
        </div>

        {/* COD Fee */}
        {codFeePaise > 0 && (
          <div className="flex justify-between items-center text-amber-800 font-semibold">
            <span>COD Handling Charge</span>
            <span>₹{formatAmount(codFeePaise)}</span>
          </div>
        )}

        {/* Wallet Deduction */}
        {appliedWalletPaise > 0 && (
          <div className="flex justify-between items-center text-[#7C7A5A] font-semibold">
            <span>RC Wallet Applied</span>
            <span>&minus; ₹{formatAmount(appliedWalletPaise)}</span>
          </div>
        )}

        {/* Taxes & Duties */}
        <div className="flex justify-between items-center text-neutral-500">
          <span>Taxes & Duties</span>
          <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-400">INCLUSIVE</span>
        </div>
      </div>

      {/* Applied Coupon / Coupon Entry Box (No nested <form> tag) */}
      <div className="border-b border-[#ECE9E2] pb-6 space-y-2.5">
        <span className="text-[10px] font-mono font-bold tracking-[0.2em] uppercase text-neutral-500 block">
          PROMOTIONAL COUPON
        </span>

        {appliedCode && discountPaise > 0 ? (
          /* Editorial Applied Coupon Label */
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.3 }}
            className="bg-[#FFF9F4] border border-[#7C7A5A]/20 p-3.5 rounded-xl flex items-center justify-between text-xs"
          >
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 bg-[#7C7A5A] text-[#FFF9F4] rounded-full flex items-center justify-center text-[10px]">
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </span>
              <span className="font-mono font-bold tracking-wider text-[#7C7A5A] uppercase">
                {appliedCode}
              </span>
              <span className="text-[10px] text-neutral-500 font-medium">applied</span>
            </div>

            <button
              type="button"
              onClick={handleRemoveCoupon}
              disabled={isPending}
              className="text-[10px] font-mono font-bold tracking-widest uppercase text-neutral-500 hover:text-[#E694AA] transition-colors cursor-pointer border-none bg-transparent disabled:opacity-50"
            >
              {isPending ? "REMOVING..." : "REMOVE"}
            </button>
          </motion.div>
        ) : (
          /* Coupon Entry Container */
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={couponCodeInput}
                onChange={(e) => {
                  setCouponCodeInput(e.target.value.toUpperCase());
                  if (couponError) setCouponError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleApplyCoupon();
                  }
                }}
                placeholder="Enter coupon code (e.g. WELCOME10)"
                disabled={isPending}
                className="flex-1 bg-white border border-[#ECE9E2] px-3.5 py-2.5 rounded-xl text-xs uppercase font-mono tracking-wider focus:outline-none focus:border-[#7C7A5A] text-[#161616] placeholder:text-neutral-400 placeholder:normal-case placeholder:font-sans"
              />
              <Button
                type="button"
                onClick={handleApplyCoupon}
                isLoading={isPending}
                disabled={!couponCodeInput.trim() || isPending}
                variant="outline"
                className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl border-[#7C7A5A] text-[#7C7A5A] hover:bg-[#7C7A5A] hover:text-[#FFF9F4] transition-all"
              >
                APPLY
              </Button>
            </div>

            {/* Quick-Click Welcome Coupon Suggestion */}
            <div className="flex items-center gap-1.5 pt-1">
              <span className="text-[10px] text-neutral-400 font-sans">Available:</span>
              <button
                type="button"
                onClick={() => {
                  setCouponCodeInput("WELCOME10");
                  setCouponError(null);
                }}
                className="text-[10px] font-mono font-bold text-[#7C7A5A] hover:text-[#E694AA] underline cursor-pointer bg-transparent border-none p-0"
              >
                WELCOME10 (10% OFF)
              </button>
            </div>

            {/* Inline Coupon Error Feedback */}
            <AnimatePresence>
              {couponError && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="text-[11px] text-[#B66F79] font-sans font-medium pl-1 leading-normal"
                >
                  ✦ {couponError}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Main Total Transformation Block */}
      <div className="pt-2 space-y-4">
        <div className="flex justify-between items-baseline font-sans">
          <span className="text-xs uppercase tracking-widest text-neutral-500 font-bold">TOTAL</span>

          <div className="text-right flex flex-col items-end">
            {/* If discount is active: Show animated old price with left-to-right strike-through line */}
            {totalSavingsPaise > 0 && (
              <div className="relative inline-block mb-0.5">
                <span className="text-xs text-neutral-400 font-mono font-medium tracking-tight">
                  ₹{formatAmount(baseTotalWithoutDiscountPaise)}
                </span>

                {/* Animated Strike-Through Line */}
                <motion.div
                  initial={prefersReducedMotion ? { scaleX: 1 } : { scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  exit={{ scaleX: 0 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[1px] bg-[#E694AA] origin-left"
                />
              </div>
            )}

            {/* New Discounted / Interpolated Total */}
            <motion.span
              key={displayedTotalPaise}
              initial={prefersReducedMotion ? {} : { opacity: 0.9, y: 2 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="text-2xl sm:text-3xl font-bold text-[#161616] tracking-tight font-sans"
            >
              ₹{formatAmount(displayedTotalPaise)}
            </motion.span>

            {/* Subtext: "You save ₹..." */}
            <AnimatePresence>
              {totalSavingsPaise > 0 && (
                <motion.span
                  initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 4 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="text-[11px] font-sans font-semibold text-[#7C7A5A] mt-0.5 block"
                >
                  You save ₹{formatAmount(totalSavingsPaise)}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Optional Checkout Submit CTA */}
        {showCheckoutButton && (
          <div className="pt-2 space-y-3">
            <Button
              type="button"
              onClick={onSubmitOrder as any}
              variant="primary"
              isLoading={isCheckoutPending}
              disabled={isCheckoutPending}
              className="w-full py-4 text-xs tracking-[0.18em] uppercase font-bold bg-[#7C7A5A] hover:bg-black text-[#FFF9F4] rounded-xl transition-all border-none"
            >
              {isCheckoutPending
                ? "PROCESSING..."
                : ctaText
                ? ctaText
                : targetTotalPaise === 0
                ? "PLACE ORDER (PAID VIA WALLET)"
                : paymentMethod === "COD"
                ? "PLACE COD ORDER"
                : "PROCEED TO SECURE CHECKOUT"}
            </Button>

            <div className="flex justify-center items-center gap-2 text-[10px] uppercase font-mono tracking-wider text-neutral-400">
              <Lock className="w-3 h-3 text-[#7C7A5A]" /> 256-Bit Encrypted Transaction
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
