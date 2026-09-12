"use client";

import { useEffect, useRef } from "react";
import { event } from "@/lib/pixel";

interface OrderSuccessTrackerProps {
  orderNumber: string;
  totalPaise: number;
}

export default function OrderSuccessTracker({
  orderNumber,
  totalPaise,
}: OrderSuccessTrackerProps) {
  const trackedRef = useRef(false);

  useEffect(() => {
    // Avoid double-firing on React Strict Mode re-mounts
    if (trackedRef.current) return;
    trackedRef.current = true;

    event("Purchase", {
      content_type: "product",
      value: (totalPaise / 100).toFixed(2),
      currency: "INR",
      order_id: orderNumber,
    });
  }, [orderNumber, totalPaise]);

  return null;
}
