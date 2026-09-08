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
  isQueuedForManual?: boolean;
  error?: string;
}

/**
 * Payout destination validation helpers
 */
export function isValidUPI(upi: string): boolean {
  if (!upi || typeof upi !== "string") return false;
  return /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(upi.trim());
}

export function isValidIFSC(ifsc: string): boolean {
  if (!ifsc || typeof ifsc !== "string") return false;
  return /^[A-Z]{4}0[A-Z0-9]{6}$/i.test(ifsc.trim());
}

export function isValidBankAccount(acc: string): boolean {
  if (!acc || typeof acc !== "string") return false;
  const clean = acc.replace(/[\s\-]/g, "");
  return /^\d{9,18}$/.test(clean);
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
    accountNumber?: string | null;
    bankAccountLast4?: string | null;
    ifsc?: string | null;
  },
  idempotencyKey: string
): Promise<RazorpayXPayoutResult> {
  const accountNumber = process.env.RAZORPAYX_ACCOUNT_NUMBER;
  const isRazorpayXConfigured =
    Boolean(accountNumber &&
    accountNumber !== "dummy_account" &&
    RAZORPAY_KEY_ID &&
    !RAZORPAY_KEY_ID.includes("dummy"));

  if (!isRazorpayXConfigured) {
    // If RazorpayX is not configured, queue the request for manual transfer
    console.log(`RazorpayX Payout: Queued for direct payout ${amountPaise} paise for withdrawal ${withdrawalId}`);
    return {
      success: true,
      isQueuedForManual: true,
      payoutId: `pout_pending_${Math.random().toString(36).substring(2, 11)}`,
      status: "pending",
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
      narration: "Resham Chikankari Refund",
      notes: {
        withdrawal_id: withdrawalId,
      },
    };

    if (payoutDetails.type === "UPI") {
      const upi = payoutDetails.upiId?.trim();
      if (!upi) {
        return {
          success: false,
          error: "UPI ID is required for UPI payout transfer.",
        };
      }
      payload.fund_account = {
        account_type: "vpa",
        vpa: {
          address: upi,
        },
        contact: {
          name: payoutDetails.accountHolderName?.trim() || "Resham Customer",
          type: "customer",
        },
      };
    } else if (payoutDetails.type === "BANK") {
      const acctNum = payoutDetails.accountNumber?.trim();
      const ifsc = payoutDetails.ifsc?.trim().toUpperCase();

      if (!acctNum || !ifsc) {
        return {
          success: false,
          error: "Full Bank Account Number and IFSC Code are required for bank payout.",
        };
      }

      payload.fund_account = {
        account_type: "bank_account",
        bank_account: {
          name: payoutDetails.accountHolderName?.trim() || "Resham Customer",
          ifsc,
          account_number: acctNum,
        },
        contact: {
          name: payoutDetails.accountHolderName?.trim() || "Resham Customer",
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
      console.warn("RazorpayX Payout API non-200 response:", data);
      const desc = data.error?.description || data.message || "RazorpayX Payout API execution failed.";

      // If RazorpayX is not enabled or account needs activation, queue as pending instead of failing
      const isConfigIssue =
        desc.toLowerCase().includes("not enabled") ||
        desc.toLowerCase().includes("account") ||
        desc.toLowerCase().includes("feature") ||
        desc.toLowerCase().includes("balance");

      if (isConfigIssue) {
        return {
          success: true,
          isQueuedForManual: true,
          payoutId: `pout_manual_${Math.random().toString(36).substring(2, 11)}`,
          status: "pending",
          error: desc,
        };
      }

      return {
        success: false,
        error: desc,
      };
    }
  } catch (err: any) {
    console.error("RazorpayX Payout request exception:", err);
    // Queue as manual fallback on unexpected network/service outage
    return {
      success: true,
      isQueuedForManual: true,
      payoutId: `pout_err_queued_${Math.random().toString(36).substring(2, 11)}`,
      status: "pending",
      error: err.message || "Failed to communicate with RazorpayX Payout service.",
    };
  }
}
