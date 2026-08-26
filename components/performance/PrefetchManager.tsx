'use client';

import React, { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

// Define Network Information API types
interface NetworkConnection {
  saveData?: boolean;
  effectiveType?: "slow-2g" | "2g" | "3g" | "4g";
}

declare global {
  interface Navigator {
    connection?: NetworkConnection;
  }
}

const P0_ROUTES = ["/shop", "/cart", "/account/wishlist", "/account/wallet"];
const P1_ROUTES = ["/checkout", "/about"];

export default function PrefetchManager() {
  const router = useRouter();
  const prefetchedUrls = useRef<Set<string>>(new Set());

  useEffect(() => {
    // 1. Connection check
    const connection = navigator.connection;
    const isSlowConnection =
      connection &&
      (connection.saveData ||
        connection.effectiveType === "slow-2g" ||
        connection.effectiveType === "2g" ||
        connection.effectiveType === "3g");

    // Helper to queue task on browser idle
    const runOnIdle = (callback: () => void) => {
      if (typeof window !== "undefined" && "requestIdleCallback" in window) {
        window.requestIdleCallback(callback);
      } else {
        setTimeout(callback, 2000);
      }
    };

    const prefetchUrl = (url: string) => {
      // Basic validation: starts with / and is not a dynamic file or anchor
      if (
        !url.startsWith("/") ||
        url.includes("#") ||
        url.includes(".") ||
        url.startsWith("/api")
      ) {
        return;
      }

      if (prefetchedUrls.current.has(url)) return;

      prefetchedUrls.current.add(url);
      try {
        router.prefetch(url);
      } catch (err) {
        console.warn("Failed to prefetch url:", url, err);
      }
    };

    // 2. Queue priority routes (P0 & P1) only on fast connections
    if (!isSlowConnection) {
      runOnIdle(() => {
        // High priority
        P0_ROUTES.forEach((route) => prefetchUrl(route));

        // Medium priority
        setTimeout(() => {
          P1_ROUTES.forEach((route) => prefetchUrl(route));
        }, 3000);
      });
    }

    // 3. Delegate event listeners to body to handle hover (intent) & keyboard focus
    const handleIntent = (e: Event) => {
      const target = e.target as HTMLElement;
      const link = target.closest("a");
      if (!link) return;

      const href = link.getAttribute("href");
      if (href) {
        prefetchUrl(href);
      }
    };

    // Register listeners with passive options for optimal scrolling performance
    document.body.addEventListener("pointerover", handleIntent, { passive: true });
    document.body.addEventListener("focusin", handleIntent, { passive: true });

    return () => {
      document.body.removeEventListener("pointerover", handleIntent);
      document.body.removeEventListener("focusin", handleIntent);
    };
  }, [router]);

  return null;
}
