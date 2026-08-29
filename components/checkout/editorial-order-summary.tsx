'use client';

import React, { useState, useEffect, useTransition, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { applyCouponAction, removeCouponAction } from "@/actions/coupon";
import { Check, Loader2, Tag, Lock } from "lucide-react";
import Button from "@/components/ui/button";

interface EditorialOrderSummaryProps {
  subtotalPaise: number;
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
}

export default function EditorialOrderSummary({
  subtotalPaise,
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
}: EditorialOrderSummaryProps) {
  const prefersReducedMotion = useReducedMotion();
  const [isPending, startTransition] = useTransition();

  // Coupon state
  const [couponCodeInput, setCouponCodeInput] = useState(initialCouponCode || "");
  const [appliedCode, setAppliedCode] = useState<string | undefined>(initialCouponCode);
  const [discountPaise, setDiscountPaise] = useState<number>(initialDiscountPaise);
  const [couponError, setCouponError] = useState<string | null>(null);

  // Animated Price Interpolation State
  const prevTotalRef = useRef<number | null>(null);
  const [displayedTotalPaise, setDisplayedTotalPaise] = useState<number>(() => {
    return subtotalPaise - initialDiscountPaise + shippingPaise + codFeePaise - appliedWalletPaise;
  });

  const targetTotalPaise = Math.max(
    0,
    subtotalPaise - discountPaise + shippingPaise + codFeePaise - appliedWalletPaise
  );

  const baseTotalWithoutDiscountPaise = Math.max(
    0,
    subtotalPaise + shippingPaise + codFeePaise - appliedWalletPaise
  );

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
          setAppliedCode(res.code || couponCodeInput.trim().toUpperCase());
          setDiscountPaise(res.discountPaise);
          setCouponError(null);
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
      } catch (err) {
        setCouponError("Failed to remove coupon. Please try again.");
      }
    });
  };

  const formattedBaseTotal = (baseTotalWithoutDiscountPaise / 100).toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  const formattedDisplayedTotal = (displayedTotalPaise / 100).toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  const formattedSavings = (discountPaise / 100).toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  return (
    <div className="bg-[#FAF7F2] border border-[#161616]/10 p-6 sm:p-8 rounded-2xl shadow-xs space-y-6 text-left font-sans select-none">
      <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-[#3F5031] border-b border-[#161616]/10 pb-4">
        ORDER SUMMARY
      </h2>

      {/* Pricing Rows */}
      <div className="space-y-3.5 border-b border-[#161616]/10 pb-6 text-xs text-neutral-700">
        {/* Bag Subtotal */}
        <div className="flex justify-between items-center">
          <span className="text-neutral-600">Bag Subtotal</span>
          <span className="font-semibold text-[#161616]">
            ₹{(subtotalPaise / 100).toLocaleString("en-IN")}
          </span>
        </div>

        {/* Animated Discount Row */}
        <AnimatePresence>
          {discountPaise > 0 && appliedCode && (
            <motion.div
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="flex justify-between items-center text-[#3F5031] font-semibold"
            >
              <span className="flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-[#E694AA]" />
                Discount ({appliedCode})
              </span>
              <span>&minus; ₹{(discountPaise / 100).toLocaleString("en-IN")}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Estimated Shipping */}
        <div className="flex justify-between items-center">
          <span className="text-neutral-600">Estimated Shipping</span>
          <span className="font-semibold text-[#3F5031] uppercase text-[11px] tracking-wider">
            {shippingPaise === 0 ? "FREE" : `₹${(shippingPaise / 100).toLocaleString("en-IN")}`}
          </span>
        </div>

        {/* COD Fee */}
        {codFeePaise > 0 && (
          <div className="flex justify-between items-center text-amber-800 font-semibold">
            <span>COD Handling Charge</span>
            <span>₹{(codFeePaise / 100).toLocaleString("en-IN")}</span>
          </div>
        )}

        {/* Wallet Deduction */}
        {appliedWalletPaise > 0 && (
          <div className="flex justify-between items-center text-[#3F5031] font-semibold">
            <span>RC Wallet Applied</span>
            <span>&minus; ₹{(appliedWalletPaise / 100).toLocaleString("en-IN")}</span>
          </div>
        )}

        {/* Taxes & Duties */}
        <div className="flex justify-between items-center text-neutral-500">
          <span>Taxes & Duties</span>
          <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-400">INCLUSIVE</span>
        </div>
      </div>

      {/* Applied Coupon / Coupon Entry Box (No nested <form> tag) */}
      <div className="border-b border-[#161616]/10 pb-6 space-y-2.5">
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
            className="bg-[#FFF9F4] border border-[#3F5031]/20 p-3.5 rounded-xl flex items-center justify-between text-xs"
          >
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 bg-[#3F5031] text-[#FFF9F4] rounded-full flex items-center justify-center text-[10px]">
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </span>
              <span className="font-mono font-bold tracking-wider text-[#3F5031] uppercase">
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
          /* Coupon Entry Container (Div instead of Form to prevent nested forms) */
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
                placeholder="Enter coupon code (e.g. FESTIVE500)"
                disabled={isPending}
                className="flex-1 px-4 py-2.5 bg-white border border-[#161616]/15 rounded-xl text-xs font-mono uppercase tracking-wider text-[#161616] focus:outline-none focus:ring-1 focus:ring-[#3F5031] disabled:opacity-50 placeholder:text-neutral-400 placeholder:normal-case placeholder:font-sans"
              />
              <button
                type="button"
                onClick={handleApplyCoupon}
                disabled={isPending || !couponCodeInput.trim()}
                className="px-5 py-2.5 bg-[#161616] hover:bg-[#3F5031] text-[#FFF9F4] text-[10px] font-bold uppercase tracking-widest rounded-xl transition-colors disabled:opacity-40 cursor-pointer border-none flex items-center gap-1.5"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" /> CHECKING...
                  </>
                ) : (
                  "APPLY"
                )}
              </button>
            </div>

            {/* Inline Editorial Error Message */}
            <AnimatePresence>
              {couponError && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="text-[11px] text-[#E694AA] font-sans font-medium pl-1 leading-normal"
                >
                  {couponError}
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
            {discountPaise > 0 && (
              <div className="relative inline-block mb-0.5">
                <span className="text-xs text-neutral-400 font-mono font-medium tracking-tight">
                  ₹{formattedBaseTotal}
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
              ₹{formattedDisplayedTotal}
            </motion.span>

            {/* Subtext: "You save ₹500" */}
            <AnimatePresence>
              {discountPaise > 0 && (
                <motion.span
                  initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 4 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="text-[11px] font-sans font-semibold text-[#3F5031] mt-0.5 block"
                >
                  You save ₹{formattedSavings}
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
              className="w-full py-4 text-xs tracking-[0.18em] uppercase font-bold bg-[#3F5031] hover:bg-black text-[#FFF9F4] rounded-xl transition-all border-none"
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
              <Lock className="w-3 h-3 text-[#3F5031]" /> 256-Bit Encrypted Transaction
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
