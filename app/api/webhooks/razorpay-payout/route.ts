import { NextResponse } from "next/server";
import crypto from "crypto";
import { completeWalletWithdrawal, releaseWalletFunds } from "@/lib/wallet";
import { env } from "@/lib/validation/env";

export const dynamic = "force-dynamic";

// Simple webhook signature verification
function verifySignature(payload: string, signature: string, secret: string) {
  if (secret === "dummy_secret") return true; // Local development bypass
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(payload);
  const digest = hmac.digest("hex");
  return digest === signature;
}

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature") || "";
    const secret = env.RAZORPAY_WEBHOOK_SECRET;

    if (!verifySignature(rawBody, signature, secret)) {
      return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event; // 'payout.processed' or 'payout.failed' or 'payout.reversed'
    const payout = payload.payload?.payout?.entity;

    if (!payout) {
      return NextResponse.json({ error: "Invalid payload format" }, { status: 400 });
    }

    // Razorpay X Payout metadata or reference_id holds our internal withdrawal request ID
    const withdrawalId = payout.notes?.withdrawal_id || payout.reference_id;
    const providerRef = payout.id;

    if (!withdrawalId) {
      return NextResponse.json({ message: "No corresponding internal withdrawal ID found" }, { status: 200 });
    }

    if (event === "payout.processed" || event === "payout.completed") {
      await completeWalletWithdrawal(withdrawalId, providerRef);
      console.log(`Webhook payout success: completed request ${withdrawalId}`);
    } else if (event === "payout.failed" || event === "payout.reversed") {
      const code = payout.failure_reason || "PAYOUT_FAILED";
      const message = payout.status_details?.description || "Razorpay payout execution failed";
      await releaseWalletFunds(withdrawalId, code, message);
      console.log(`Webhook payout failed: reversed request ${withdrawalId} - Reason: ${message}`);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Razorpay payout webhook processing error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
