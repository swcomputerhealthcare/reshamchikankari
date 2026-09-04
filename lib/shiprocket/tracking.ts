import { shiprocketFetch } from "./client";
import type { TrackingResponse, InternalFulfillmentStatus } from "./types";

export function mapShiprocketStatusToInternal(
  srStatus: string | number
): InternalFulfillmentStatus {
  const statusStr = String(srStatus).toUpperCase().trim();

  if (statusStr.includes("DELIVERED")) return "DELIVERED";
  if (statusStr.includes("OUT FOR DELIVERY") || statusStr.includes("OUT_FOR_DELIVERY")) return "OUT_FOR_DELIVERY";
  if (statusStr.includes("TRANSIT") || statusStr.includes("SHIPPED") || statusStr.includes("DISPATCHED")) return "IN_TRANSIT";
  if (statusStr.includes("PICKUP SCHEDULED") || statusStr.includes("PICKUP GENERATED") || statusStr.includes("PICKED UP")) return "PICKUP_SCHEDULED";
  if (statusStr.includes("AWB") || statusStr.includes("ASSIGNED")) return "AWB_ASSIGNED";
  if (statusStr.includes("NEW") || statusStr.includes("CREATED") || statusStr.includes("PROCESSING")) return "SHIPMENT_CREATED";
  if (statusStr.includes("CANCEL")) return "CANCELLED";
  if (statusStr.includes("RTO") || statusStr.includes("RETURN")) return "RTO";

  return "EXCEPTION";
}

export async function trackShiprocketShipment(awbCode: string) {
  const res = await shiprocketFetch<TrackingResponse>(
    `/courier/track/awb/${awbCode}`,
    {
      method: "GET",
    }
  );

  if (!res.success || !res.data) {
    return {
      success: false,
      error: res.error || "Failed to fetch tracking data",
    };
  }

  const trackData = res.data.tracking_data;
  const currentStatusStr = trackData.shipment_track?.[0]?.current_status || "UNKNOWN";
  const internalStatus = mapShiprocketStatusToInternal(currentStatusStr);

  return {
    success: true,
    internalStatus,
    rawStatus: currentStatusStr,
    activities: trackData.shipment_track_activities || [],
    trackUrl: trackData.track_url || `https://shiprocket.co/tracking/${awbCode}`,
  };
}
