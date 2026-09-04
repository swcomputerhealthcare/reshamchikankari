import { shiprocketFetch } from "./client";
import type {
  ServiceabilityResponse,
  AssignAWBResponse,
  GeneratePickupResponse,
} from "./types";

export async function checkCourierServiceability(
  deliveryPincode: string,
  weightKg: number = 0.5,
  pickupPincode: string = "226001"
) {
  const res = await shiprocketFetch<ServiceabilityResponse>(
    "/courier/serviceability",
    {
      method: "GET",
      params: {
        pickup_postcode: pickupPincode,
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
