import { razorpay, RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } from "@/lib/razorpay";

export interface RazorpayRefundResult {
  success: boolean;
  refundId?: string;
  status?: string;
  error?: string;
}

export interface RazorpayXPayoutResult {
  success: boolean;
  payoutId?: string;
  status?: string;
  error?: string;
}

/**
 * Execute Razorpay Payment Refund server-side
 * Uses Razorpay SDK or REST API with idempotency key
 */
export async function executeRazorpayRefund(
  paymentId: string,
  amountPaise: number,
  idempotencyKey: string,
  notes: Record<string, string> = {}
): Promise<RazorpayRefundResult> {
  if (!paymentId || paymentId.startsWith("cod_")) {
    return {
      success: false,
      error: "Refund cannot be processed: Cash on Delivery or invalid payment ID.",
    };
  }

  try {
    // Attempt refund via official Razorpay SDK
    const response = await (razorpay.payments as any).refund(paymentId, {
      amount: amountPaise,
      speed: "optimum",
      receipt: idempotencyKey,
      notes: {
        ...notes,
        idempotency_key: idempotencyKey,
      },
    });

    if (response && response.id) {
      return {
        success: true,
        refundId: response.id,
        status: response.status || "processed",
      };
    } else {
      return {
        success: false,
        error: "Razorpay refund response did not return a valid refund ID.",
      };
    }
  } catch (err: any) {
    console.error("Razorpay SDK refund call error:", err);
    
    // Fallback via direct REST API with Basic Auth
    try {
      const authHeader = `Basic ${Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString("base64")}`;
      const res = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}/refund`, {
        method: "POST",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
          "X-Razorpay-Idempotency-Header": idempotencyKey,
        },
        body: JSON.stringify({
          amount: amountPaise,
          notes,
        }),
      });

      const data = await res.json();
      if (res.ok && data.id) {
        return {
          success: true,
          refundId: data.id,
          status: data.status || "processed",
        };
      } else {
        return {
          success: false,
          error: data.error?.description || data.message || "Failed to execute Razorpay refund.",
        };
      }
    } catch (fetchErr: any) {
      return {
        success: false,
        error: fetchErr.message || "Failed to execute Razorpay refund REST API.",
      };
    }
  }
}

/**
 * Execute RazorpayX Payout server-side to transfer funds to customer UPI/Bank
 */
export async function executeRazorpayXPayout(
  withdrawalId: string,
  amountPaise: number,
  payoutDetails: {
    type: "UPI" | "BANK";
    accountHolderName?: string | null;
    upiId?: string | null;
    bankAccountLast4?: string | null;
    ifsc?: string | null;
  },
  idempotencyKey: string
): Promise<RazorpayXPayoutResult> {
  const accountNumber = process.env.RAZORPAYX_ACCOUNT_NUMBER;
  const isRazorpayXConfigured =
    accountNumber &&
    accountNumber !== "dummy_account" &&
    RAZORPAY_KEY_ID &&
    !RAZORPAY_KEY_ID.includes("dummy");

  if (!isRazorpayXConfigured) {
    // Safe Test Mode Simulation for RazorpayX Payouts
    console.log(`RazorpayX Payout Test Mode: Payout ${amountPaise} paise for withdrawal ${withdrawalId}`);
    return {
      success: true,
      payoutId: `pout_test_${Math.random().toString(36).substring(2, 11)}`,
      status: "processing",
    };
  }

  try {
    const authHeader = `Basic ${Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString("base64")}`;
    const mode = payoutDetails.type === "UPI" ? "UPI" : "IMPS";

    const payload: Record<string, any> = {
      account_number: accountNumber,
      amount: amountPaise,
      currency: "INR",
      mode,
      purpose: "refund",
      reference_id: withdrawalId,
      notes: {
        withdrawal_id: withdrawalId,
      },
    };

    if (payoutDetails.type === "UPI" && payoutDetails.upiId) {
      payload.fund_account = {
        account_type: "vpa",
        vpa: {
          address: payoutDetails.upiId,
        },
        contact: {
          name: payoutDetails.accountHolderName || "Resham Customer",
          type: "customer",
        },
      };
    }

    const res = await fetch("https://api.razorpay.com/v1/payouts", {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
        "X-Payout-Idempotency": idempotencyKey,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (res.ok && data.id) {
      return {
        success: true,
        payoutId: data.id,
        status: data.status || "processing",
      };
    } else {
      console.error("RazorpayX Payout API error:", data);
      return {
        success: false,
        error: data.error?.description || data.message || "RazorpayX Payout API execution failed.",
      };
    }
  } catch (err: any) {
    console.error("RazorpayX Payout request exception:", err);
    return {
      success: false,
      error: err.message || "Failed to communicate with RazorpayX Payout service.",
    };
  }
}
