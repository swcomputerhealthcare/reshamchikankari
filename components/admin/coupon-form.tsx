'use client';

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createCouponAction } from "@/actions/coupon";
import Button from "@/components/ui/button";

export default function CouponForm() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"PERCENTAGE" | "FIXED">("PERCENTAGE");
  const [discountValue, setDiscountValue] = useState("");
  const [minOrder, setMinOrder] = useState("");
  const [maxDiscount, setMaxDiscount] = useState("");
  const [expiration, setExpiration] = useState("");
  const [usageLimit, setUsageLimit] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const val = parseFloat(discountValue);
    if (isNaN(val) || val <= 0) {
      setError("Please enter a valid positive discount value");
      setIsLoading(false);
      return;
    }

    const minOrderVal = parseFloat(minOrder || "0");
    const minOrderValuePaise = Math.round(minOrderVal * 100);

    const maxDiscountVal = maxDiscount ? parseFloat(maxDiscount) : undefined;
    const maxDiscountValuePaise = maxDiscountVal ? Math.round(maxDiscountVal * 100) : undefined;

    // Fixed discount value is stored in paise
    const finalDiscountValue = discountType === "FIXED" ? Math.round(val * 100) : val;

    try {
      const res = await createCouponAction({
        code: code.trim().toUpperCase(),
        discountType,
        discountValue: finalDiscountValue,
        minOrderValuePaise,
        maxDiscountValuePaise,
        expirationDate: expiration || undefined,
        usageLimit: usageLimit ? parseInt(usageLimit) : undefined,
        isActive: true,
      });

      if (!res.success) {
        setError(res.error || "Failed to create coupon.");
      } else {
        setCode("");
        setDiscountValue("");
        setMinOrder("");
        setMaxDiscount("");
        setExpiration("");
        setUsageLimit("");
        router.refresh();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 font-sans text-xs">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-500 pb-2 border-b border-neutral-100">
        Create New Coupon
      </h3>

      {error && (
        <div className="bg-red-50 text-red-600 text-[10px] p-3 border border-red-100">
          {error}
        </div>
      )}

      {/* Code */}
      <div className="space-y-1">
        <label htmlFor="coup-code" className="block text-[10px] uppercase tracking-wider text-neutral-600 font-bold">
          Coupon Code
        </label>
        <input
          id="coup-code"
          type="text"
          required
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="e.g. WELCOME10"
          className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 focus:border-brand-black focus:outline-none text-xs"
        />
      </div>

      {/* Discount Type & Value */}
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <label htmlFor="coup-type" className="block text-[10px] uppercase tracking-wider text-neutral-600 font-bold">
            Discount Type
          </label>
          <select
            id="coup-type"
            value={discountType}
            onChange={(e) => {
              setDiscountType(e.target.value as "PERCENTAGE" | "FIXED");
              setDiscountValue("");
            }}
            className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 focus:border-brand-black focus:outline-none text-xs"
          >
            <option value="PERCENTAGE">Percentage (%)</option>
            <option value="FIXED">Fixed Amount (₹)</option>
          </select>
        </div>

        <div className="space-y-1">
          <label htmlFor="coup-val" className="block text-[10px] uppercase tracking-wider text-neutral-600 font-bold">
            {discountType === "PERCENTAGE" ? "Discount (%)" : "Discount (₹)"}
          </label>
          <input
            id="coup-val"
            type="number"
            step="0.01"
            required
            value={discountValue}
            onChange={(e) => setDiscountValue(e.target.value)}
            placeholder={discountType === "PERCENTAGE" ? "e.g. 10" : "e.g. 500"}
            className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 focus:border-brand-black focus:outline-none text-xs"
          />
        </div>
      </div>

      {/* Minimum Order & Max Discount */}
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <label htmlFor="coup-min" className="block text-[10px] uppercase tracking-wider text-neutral-600 font-bold">
            Min Order (₹)
          </label>
          <input
            id="coup-min"
            type="number"
            value={minOrder}
            onChange={(e) => setMinOrder(e.target.value)}
            placeholder="e.g. 1000"
            className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 focus:border-brand-black focus:outline-none text-xs"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="coup-max" className="block text-[10px] uppercase tracking-wider text-neutral-600 font-bold">
            Max Discount (₹)
          </label>
          <input
            id="coup-max"
            type="number"
            disabled={discountType === "FIXED"}
            value={maxDiscount}
            onChange={(e) => setMaxDiscount(e.target.value)}
            placeholder="e.g. 300"
            className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 focus:border-brand-black focus:outline-none text-xs disabled:opacity-50"
          />
        </div>
      </div>

      {/* Expiration Date & Usage Limit */}
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <label htmlFor="coup-exp" className="block text-[10px] uppercase tracking-wider text-neutral-600 font-bold">
            Expiry Date
          </label>
          <input
            id="coup-exp"
            type="date"
            value={expiration}
            onChange={(e) => setExpiration(e.target.value)}
            className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 focus:border-brand-black focus:outline-none text-xs"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="coup-limit" className="block text-[10px] uppercase tracking-wider text-neutral-600 font-bold">
            Usage Limit
          </label>
          <input
            id="coup-limit"
            type="number"
            value={usageLimit}
            onChange={(e) => setUsageLimit(e.target.value)}
            placeholder="e.g. 100"
            className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 focus:border-brand-black focus:outline-none text-xs"
          />
        </div>
      </div>

      <Button variant="primary" type="submit" className="w-full py-2.5 text-xs" isLoading={isLoading}>
        Create Coupon
      </Button>
    </form>
  );
}
