'use client';

import React, { useState, useTransition } from "react";
import { useCart } from "@/context/cart-context";

interface CouponInputProps {
  appliedCode?: string;
  subtotalPaise: number;
}

export default function CouponInput({ appliedCode, subtotalPaise }: CouponInputProps) {
  const { applyCouponOptimistic, removeCouponOptimistic } = useCart();
  const [code, setCode] = useState(appliedCode || "");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(!!appliedCode);
  const [isPending, startTransition] = useTransition();

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setError("");

    startTransition(async () => {
      const res = await applyCouponOptimistic(code);
      if (res.success) {
        setSuccess(true);
      } else {
        setError(res.error || "Failed to apply coupon");
        setSuccess(false);
      }
    });
  };

  const handleRemove = () => {
    setError("");
    startTransition(async () => {
      const res = await removeCouponOptimistic();
      if (res.success) {
        setSuccess(false);
        setCode("");
      }
    });
  };

  return (
    <div className="space-y-3 font-sans text-xs border-t border-brand-black/5 pt-6">
      {success ? (
        <div className="bg-[#3F5031]/5 text-[#3F5031] p-3.5 border border-[#3F5031]/10 flex items-center justify-between rounded-full px-5 text-[11px] font-medium">
          <div>
            <span className="font-bold tracking-wider uppercase">{appliedCode || code}</span> applied successfully
          </div>
          <button
            onClick={handleRemove}
            disabled={isPending}
            className="text-[9px] uppercase font-bold tracking-widest text-[#6f6f68] hover:text-brand-pink transition-colors cursor-pointer border-none bg-transparent"
          >
            Remove
          </button>
        </div>
      ) : (
        <form onSubmit={handleApply} className="space-y-2">
          <label htmlFor="coupon" className="block text-[10px] uppercase tracking-widest text-neutral-400 font-bold mb-1 pl-1">
            Promotional Coupon
          </label>
          <div className="flex gap-2">
            <input
              id="coupon"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Enter coupon code"
              className="flex-1 px-4 py-2.5 bg-transparent border border-brand-black/15 focus:border-brand-black focus:outline-none text-xs rounded-full placeholder:text-neutral-300 font-medium"
            />
            <button
              type="submit"
              className="px-6 h-[38px] bg-brand-black hover:bg-brand-sage text-brand-offwhite text-[10px] font-bold uppercase tracking-widest rounded-full transition-all duration-300 disabled:opacity-50 cursor-pointer border-none"
              disabled={isPending || !code.trim()}
            >
              {isPending ? "..." : "Apply"}
            </button>
          </div>
          {error && <p className="text-[#E694AA] text-[10px] pl-4 leading-relaxed font-sans mt-1">{error}</p>}
        </form>
      )}
    </div>
  );
}
