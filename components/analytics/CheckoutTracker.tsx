"use client";

import { useEffect, useRef } from "react";
import { event } from "@/lib/pixel";

interface CheckoutTrackerProps {
  subtotalPaise: number;
  itemCount: number;
}

export default function CheckoutTracker({
  subtotalPaise,
  itemCount,
}: CheckoutTrackerProps) {
  const trackedRef = useRef(false);

  useEffect(() => {
    if (trackedRef.current) return;
    trackedRef.current = true;

    event("InitiateCheckout", {
      content_type: "product",
      value: (subtotalPaise / 100).toFixed(2),
      currency: "INR",
      num_items: itemCount,
    });
  }, [subtotalPaise, itemCount]);

  return null;
}
