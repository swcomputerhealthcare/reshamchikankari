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

      // Mock mode fallback for local testing when credentials aren't live
      if (token === "mock_shiprocket_token_dev_mode") {
        return handleMockResponse<T>(endpoint, method, body);
      }

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

// Development fallback mock engine when credentials are dummy/mock
function handleMockResponse<T>(endpoint: string, method: string, body?: any): { success: boolean; data?: T; error?: string } {
  console.log(`[MOCK SHIPROCKET API] ${method} ${endpoint}`, body);

  if (endpoint.includes("/orders/create/adhoc")) {
    const mockId = Math.floor(10000000 + Math.random() * 90000000);
    const mockShipmentId = Math.floor(20000000 + Math.random() * 90000000);
    return {
      success: true,
      data: {
        order_id: mockId,
        shipment_id: mockShipmentId,
        status: "NEW",
        status_code: 1,
        awb_code: `SR${mockShipmentId}`,
        courier_company_id: "10",
        courier_name: "Blue Dart",
      } as any,
    };
  }

  if (endpoint.includes("/courier/serviceability")) {
    return {
      success: true,
      data: {
        status: 200,
        data: {
          available_courier_companies: [
            {
              courier_company_id: 10,
              courier_name: "Blue Dart Surface",
              min_weight: 0.5,
              rate: 90,
              cod_charges: 0,
              estimated_delivery_days: "3-4 Days",
              etd: "3-4 Days",
              is_surface: true,
              rating: 4.8,
            },
            {
              courier_company_id: 12,
              courier_name: "Delhivery Express",
              min_weight: 0.5,
              rate: 110,
              cod_charges: 0,
              estimated_delivery_days: "2-3 Days",
              etd: "2-3 Days",
              is_surface: false,
              rating: 4.5,
            },
          ],
          recommended_courier_company_id: 10,
        },
      } as any,
    };
  }

  if (endpoint.includes("/courier/assign/awb")) {
    const mockShipment = body?.shipment_id || "20001001";
    return {
      success: true,
      data: {
        status: 200,
        awb_assign_status: 1,
        response: {
          data: {
            courier_company_id: 10,
            awb_code: `AWB${Math.floor(100000000 + Math.random() * 900000000)}`,
            courier_name: "Blue Dart",
            shipment_id: Number(mockShipment),
            order_id: 10001001,
            pickup_scheduled_date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
            tracking_url: `https://shiprocket.co/tracking/AWB${mockShipment}`,
          },
        },
      } as any,
    };
  }

  if (endpoint.includes("/courier/generate/pickup")) {
    return {
      success: true,
      data: {
        status: 200,
        response: {
          pickup_status: 1,
          response: {
            pickup_scheduled_date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
            pickup_token_number: `PKP${Math.floor(100000 + Math.random() * 900000)}`,
            status: "SUCCESS",
          },
        },
      } as any,
    };
  }

  if (endpoint.includes("/courier/track/awb")) {
    return {
      success: true,
      data: {
        tracking_data: {
          track_status: 1,
          shipment_status: 7,
          shipment_track: [
            {
              id: 1,
              awb_code: "AWB123456789",
              courier_name: "Blue Dart",
              current_status: "IN TRANSIT",
              origin: "Lucknow",
              destination: "New Delhi",
              pickup_date: new Date().toISOString(),
              delivered_date: "",
              weight: "0.5",
              packages: 1,
            },
          ],
          shipment_track_activities: [
            {
              date: new Date().toISOString(),
              status: "IN TRANSIT",
              activity: "Package reached sorting facility at Lucknow Hub",
              location: "Lucknow",
            },
          ],
        },
      } as any,
    };
  }

  return { success: true, data: { status: 200, message: "Mock operation successful" } as any };
}
