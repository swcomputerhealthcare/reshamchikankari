"use client";

import { useEffect } from "react";

/**
 * Global OAuth Code Interceptor
 * If Supabase or Google redirects to root (/) or any other page with a PKCE ?code=...,
 * this client-side handler automatically forwards the browser to /auth/callback
 * so the code is exchanged for authenticated session cookies.
 */
export default function AuthCodeHandler() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");

      if (code && !url.pathname.startsWith("/auth/callback")) {
        const callbackUrl = new URL("/auth/callback", window.location.origin);
        callbackUrl.search = url.search;
        window.location.replace(callbackUrl.toString());
      }
    } catch {
      // Ignore URL parsing errors
    }
  }, []);

  return null;
}
