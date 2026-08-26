'use client';

import React, { useState, useTransition } from "react";
import { toggleCouponStatusAction } from "@/actions/coupon";

interface CouponToggleProps {
  id: string;
  initialActive: boolean;
}

export default function CouponToggle({ id, initialActive }: CouponToggleProps) {
  const [isPending, startTransition] = useTransition();
  const [active, setActive] = useState(initialActive);

  const handleToggle = () => {
    startTransition(async () => {
      const nextActive = !active;
      const res = await toggleCouponStatusAction(id, nextActive);
      if (res.success) {
        setActive(nextActive);
      } else {
        alert("Failed to update status");
      }
    });
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`px-3 py-1 text-[10px] font-sans font-bold uppercase tracking-widest transition-colors ${
        active
          ? "bg-green-50 text-green-700 hover:bg-green-100 border border-green-200"
          : "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
      }`}
    >
      {isPending ? "..." : active ? "Active" : "Inactive"}
    </button>
  );
}
