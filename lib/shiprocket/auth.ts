import { env } from "@/lib/validation/env";
import type { ShiprocketAuthResponse } from "./types";

const SHIPROCKET_AUTH_URL = "https://apiv2.shiprocket.in/v1/external/auth/login";

interface CachedToken {
  token: string;
  expiresAt: number;
}

let cachedToken: CachedToken | null = null;

export async function getShiprocketToken(): Promise<string> {
  const now = Date.now();
  
  // Return cached token if valid (leave 1 hour margin before expiration)
  if (cachedToken && cachedToken.expiresAt > now + 3600 * 1000) {
    return cachedToken.token;
  }

  const email = process.env.SHIPROCKET_EMAIL || env.SHIPROCKET_EMAIL;
  const password = process.env.SHIPROCKET_PASSWORD || env.SHIPROCKET_PASSWORD;

  if (!email || !password) {
    throw new Error("Shiprocket credentials (SHIPROCKET_EMAIL, SHIPROCKET_PASSWORD) are not configured in environment variables.");
  }

  try {
    const res = await fetch(SHIPROCKET_AUTH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`Shiprocket Auth Failed (${res.status}):`, errorText);
      throw new Error(`Shiprocket Auth failed: ${res.statusText}`);
    }

    const data: ShiprocketAuthResponse = await res.json();
    if (!data.token) {
      throw new Error("Invalid auth response: missing token from Shiprocket");
    }

    // Cache token for 9 days (Shiprocket tokens expire in 10 days)
    cachedToken = {
      token: data.token,
      expiresAt: now + 9 * 24 * 3600 * 1000,
    };

    return data.token;
  } catch (error: any) {
    console.error("Shiprocket authentication error:", error);
    throw error;
  }
}

export function invalidateShiprocketToken() {
  cachedToken = null;
}
