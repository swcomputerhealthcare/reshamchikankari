import { shiprocketFetch } from "./client";
import type {
  ServiceabilityResponse,
  AssignAWBResponse,
  GeneratePickupResponse,
} from "./types";

export interface ValidatedPickupLocation {
  valid: boolean;
  locationName: string;
  pincode: string;
  address?: string;
  city?: string;
  state?: string;
  phone?: string;
  name?: string;
  error?: string;
}

let cachedPickupLocation: { data: ValidatedPickupLocation; expiresAt: number } | null = null;

export async function getValidatedPickupLocation(forceRefresh = false): Promise<ValidatedPickupLocation> {
  const now = Date.now();
  if (!forceRefresh && cachedPickupLocation && cachedPickupLocation.expiresAt > now) {
    return cachedPickupLocation.data;
  }

  const configuredLocation = (process.env.SHIPROCKET_PICKUP_LOCATION || "Home").trim();
  const configuredLower = configuredLocation.toLowerCase();

  const res = await shiprocketFetch<{
    data: {
      shipping_address: Array<{
        id: number;
        pickup_location: string;
        address: string;
        city: string;
        state: string;
        pin_code: string;
        phone: string;
        name: string;
        is_primary_location?: number;
      }>;
    };
  }>("/settings/company/pickup");

  if (!res.success || !res.data?.data?.shipping_address) {
    console.warn("Could not fetch Shiprocket pickup locations from API:", res.error);
    const fallback: ValidatedPickupLocation = {
      valid: true,
      locationName: configuredLocation,
      pincode: process.env.SHIPROCKET_PICKUP_PINCODE || "110008",
    };
    return fallback;
  }

  const addresses = res.data.data.shipping_address;
  if (!addresses || addresses.length === 0) {
    return {
      valid: false,
      locationName: configuredLocation,
      pincode: process.env.SHIPROCKET_PICKUP_PINCODE || "110008",
      error: "No pickup addresses configured in Shiprocket dashboard (Settings -> Pickup Addresses).",
    };
  }

  // Look for exact/case-insensitive match
  const matched = addresses.find(
    (a) => a.pickup_location.trim().toLowerCase() === configuredLower
  );

  if (matched) {
    const data: ValidatedPickupLocation = {
      valid: true,
      locationName: matched.pickup_location,
      pincode: matched.pin_code,
      address: matched.address,
      city: matched.city,
      state: matched.state,
      phone: matched.phone,
      name: matched.name,
    };
    cachedPickupLocation = { data, expiresAt: now + 5 * 60 * 1000 };
    return data;
  }

  // Fallback to primary configured location in Shiprocket
  const primary = addresses.find((a) => a.is_primary_location === 1) || addresses[0];
  if (primary) {
    console.warn(
      `Configured pickup location '${configuredLocation}' not found in Shiprocket account. Using primary location '${primary.pickup_location}' (${primary.address}, ${primary.pin_code}).`
    );
    const data: ValidatedPickupLocation = {
      valid: true,
      locationName: primary.pickup_location,
      pincode: primary.pin_code,
      address: primary.address,
      city: primary.city,
      state: primary.state,
      phone: primary.phone,
      name: primary.name,
    };
    cachedPickupLocation = { data, expiresAt: now + 5 * 60 * 1000 };
    return data;
  }

  return {
    valid: false,
    locationName: configuredLocation,
    pincode: process.env.SHIPROCKET_PICKUP_PINCODE || "110008",
    error: `Configured pickup location '${configuredLocation}' not found in Shiprocket account. Available: ${addresses.map((a) => a.pickup_location).join(", ")}`,
  };
}

export async function checkCourierServiceability(
  deliveryPincode: string,
  weightKg: number = 0.5,
  pickupPincode?: string
) {
  let effectivePickupPincode = pickupPincode;
  if (!effectivePickupPincode) {
    try {
      const validatedLoc = await getValidatedPickupLocation();
      effectivePickupPincode = validatedLoc.pincode || process.env.SHIPROCKET_PICKUP_PINCODE || "110008";
    } catch {
      effectivePickupPincode = process.env.SHIPROCKET_PICKUP_PINCODE || "110008";
    }
  }

  const res = await shiprocketFetch<ServiceabilityResponse>(
    "/courier/serviceability",
    {
      method: "GET",
      params: {
        pickup_postcode: effectivePickupPincode,
        delivery_postcode: deliveryPincode,
        weight: String(weightKg),
        cod: "0",
      },
    }
  );

  if (!res.success || !res.data) {
    return {
      serviceable: false,
      error: res.error || "Pincode serviceability check failed.",
      couriers: [],
    };
  }

  const couriers = res.data.data?.available_courier_companies || [];
  const serviceable = couriers.length > 0;

  return {
    serviceable,
    recommendedCourierId: res.data.data?.recommended_courier_company_id,
    couriers,
  };
}

export async function assignShiprocketAWB(
  shipmentId: number | string,
  courierId?: number | string
) {
  const body: Record<string, any> = {
    shipment_id: String(shipmentId),
  };
  if (courierId) {
    body.courier_id = String(courierId);
  }

  const res = await shiprocketFetch<AssignAWBResponse>(
    "/courier/assign/awb",
    {
      method: "POST",
      body,
    }
  );

  return res;
}

export async function generateShiprocketPickup(shipmentId: number | string) {
  const res = await shiprocketFetch<GeneratePickupResponse>(
    "/courier/generate/pickup",
    {
      method: "POST",
      body: {
        shipment_id: [Number(shipmentId)],
      },
    }
  );

  return res;
}

export interface ExtractedShipmentInfo {
  id: string | null;
  awb: string | null;
  courier: string | null;
  courierCompanyId: number | null;
  status: string | null;
  pickupScheduledDate: string | null;
}

export function extractShipmentFromOrderDetails(srData: any): ExtractedShipmentInfo | null {
  if (!srData) return null;
  const shipments = srData.shipments || srData.data?.shipments;
  if (!shipments) return null;
  const single = Array.isArray(shipments) ? shipments[0] : shipments;
  if (!single) return null;
  return {
    id: single.id ? String(single.id) : null,
    awb: single.awb || single.awb_code || null,
    courier: single.courier || single.courier_name || null,
    courierCompanyId: single.courier_company_id || single.courier_id ? Number(single.courier_company_id || single.courier_id) : null,
    status: single.status || null,
    pickupScheduledDate: single.pickup_scheduled_date || null,
  };
}

export async function getShiprocketOrderDetails(orderId: number | string) {
  const res = await shiprocketFetch<{
    data: {
      id: number;
      channel_order_id?: string;
      status?: string;
      status_code?: number;
      shipments?: any;
    };
  }>(`/orders/show/${orderId}`, {
    method: "GET",
  });

  return res;
}

