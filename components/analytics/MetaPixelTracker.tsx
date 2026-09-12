"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { pageview } from "@/lib/pixel";

export default function MetaPixelTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isInitialMount = useRef(true);

  useEffect(() => {
    // Skip initial page load because the base script in <head> already tracked PageView
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Track page views on client-side route transitions
    pageview();
  }, [pathname, searchParams]);

  return null;
}
