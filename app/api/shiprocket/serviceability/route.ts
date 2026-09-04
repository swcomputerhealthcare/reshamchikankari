import { NextResponse } from "next/server";
import { checkCourierServiceability } from "@/lib/shiprocket";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pincode = searchParams.get("pincode")?.trim();
    const weightStr = searchParams.get("weight");
    const weight = weightStr ? parseFloat(weightStr) : 0.5;

    if (!pincode) {
      return NextResponse.json(
        { serviceable: false, error: "Pincode is required." },
        { status: 400 }
      );
    }

    // Validate 6-digit Indian Pincode format
    const pincodeRegex = /^[1-9][0-9]{5}$/;
    if (!pincodeRegex.test(pincode)) {
      return NextResponse.json(
        { serviceable: false, error: "Please enter a valid 6-digit Indian PIN code." },
        { status: 400 }
      );
    }

    const result = await checkCourierServiceability(pincode, isNaN(weight) ? 0.5 : weight);

    return NextResponse.json({
      serviceable: result.serviceable,
      recommendedCourierId: result.recommendedCourierId,
      couriers: result.couriers.map((c) => ({
        courierCompanyId: c.courier_company_id,
        courierName: c.courier_name,
        estimatedDeliveryDays: c.estimated_delivery_days,
        etd: c.etd,
        rate: c.rate,
      })),
      error: result.error,
    });
  } catch (error: any) {
    console.error("Serviceability route error:", error);
    return NextResponse.json(
      { serviceable: false, error: "Failed to verify pincode serviceability." },
      { status: 500 }
    );
  }
}
