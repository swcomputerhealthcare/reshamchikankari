import { NextResponse } from "next/server";
import { razorpay } from "@/lib/razorpay";
import { env } from "@/lib/validation/env";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amountPaise, currency = "INR", orderNumber, userEmail } = body;

    if (!amountPaise || amountPaise < 100) {
      return NextResponse.json(
        { success: false, error: "Amount must be at least ₹1 (100 paise)." },
        { status: 400 }
      );
    }

    const order = await razorpay.orders.create({
      amount: amountPaise,
      currency,
      receipt: `rcpt_${Math.random().toString(36).substring(2, 11)}`,
      notes: {
        orderNumber: orderNumber || `RES-${Date.now()}`,
        userEmail: userEmail || "guest@user.com",
      },
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_live_TYIGUQfADESI9t",
    });
  } catch (error: any) {
    console.error("Razorpay order API route error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to create Razorpay order." },
      { status: 500 }
    );
  }
}
