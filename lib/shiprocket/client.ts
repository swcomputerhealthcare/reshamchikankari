import { getShiprocketToken, invalidateShiprocketToken } from "./auth";

const BASE_URL = "https://apiv2.shiprocket.in/v1/external";

export interface ShiprocketRequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: any;
  params?: Record<string, string | number | undefined>;
  timeoutMs?: number;
  retries?: number;
}

export async function shiprocketFetch<T>(
  endpoint: string,
  options: ShiprocketRequestOptions = {}
): Promise<{ success: boolean; data?: T; error?: string; rawResponse?: any }> {
  const {
    method = "GET",
    body,
    params,
    timeoutMs = 15000,
    retries = 2,
  } = options;

  let url = `${BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null) {
        searchParams.append(key, String(val));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  let attempt = 0;
  while (attempt <= retries) {
    try {
      const token = await getShiprocketToken();

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timer);

      // Handle 401 Unauthorized: token expired, invalidate & retry once
      if (response.status === 401 && attempt === 0) {
        console.warn("Shiprocket token expired (401). Refreshing token and retrying...");
        invalidateShiprocketToken();
        attempt++;
        continue;
      }

      // Handle transient errors (429, 502, 503, 504) with exponential backoff
      if ([429, 502, 503, 504].includes(response.status) && attempt < retries) {
        const backoffMs = Math.pow(2, attempt) * 1000;
        console.warn(`Shiprocket API transient error ${response.status}. Retrying in ${backoffMs}ms...`);
        await new Promise((res) => setTimeout(res, backoffMs));
        attempt++;
        continue;
      }

      const json = await response.json().catch(() => null);

      if (!response.ok) {
        const errorMsg = json?.message || json?.error || `Shiprocket error: HTTP ${response.status}`;
        console.error(`Shiprocket API Call Failed [${method} ${endpoint}]:`, errorMsg);
        return { success: false, error: String(errorMsg), rawResponse: json };
      }

      return { success: true, data: json as T, rawResponse: json };
    } catch (err: any) {
      if (err.name === "AbortError") {
        console.error(`Shiprocket API call timed out after ${timeoutMs}ms [${method} ${endpoint}]`);
        return { success: false, error: "Shiprocket service request timed out." };
      }

      if (attempt < retries) {
        attempt++;
        await new Promise((res) => setTimeout(res, 1000 * attempt));
        continue;
      }

      console.error(`Shiprocket API Exception [${method} ${endpoint}]:`, err?.message || err);
      return { success: false, error: err?.message || "Failed to communicate with shipping provider." };
    }
  }

  return { success: false, error: "Shiprocket request failed after retries." };
}
