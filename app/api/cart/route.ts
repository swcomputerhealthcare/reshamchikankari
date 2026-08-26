import { NextResponse } from "next/server";
import { getCartDetails } from "@/lib/cart";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cart = await getCartDetails();
    return NextResponse.json(cart);
  } catch (err) {
    console.error("Failed to fetch cart details in GET handler:", err);
    return NextResponse.json({ items: [], subtotalPaise: 0 }, { status: 500 });
  }
}
