'use server';

import { revalidatePath } from "next/cache";
import { requireUser, requireAdmin } from "@/lib/auth/helpers";
import {
  getOrCreateWallet,
  creditWallet,
  lockWalletFunds,
  releaseWalletFunds,
  completeWalletWithdrawal,
} from "@/lib/wallet";
import { db } from "@/db";
import {
  payoutMethods,
  withdrawalRequests,
  walletTransactions,
  walletAccounts,
} from "@/db/schema/wallet";
import { profiles } from "@/db/schema/auth";
import { eq, desc, and } from "drizzle-orm";
import fs from "fs";
import path from "path";
import os from "os";
import { isValidUPI, isValidIFSC, isValidBankAccount, executeRazorpayXPayout } from "@/lib/razorpay-services";

const hasDatabase = () => {
  return !!process.env.DATABASE_URL && process.env.DATABASE_URL.indexOf("[YOUR-PASSWORD]") === -1;
};

const getMockDbPath = () => {
  if (process.env.VERCEL || process.env.NODE_ENV === "production") {
    return path.join(os.tmpdir(), "wallet_mock.json");
  }
  return path.join(process.cwd(), "db", "wallet_mock.json");
};

function readMockStore() {
  try {
    const mockPath = getMockDbPath();
    if (fs.existsSync(mockPath)) {
      return JSON.parse(fs.readFileSync(mockPath, "utf-8"));
    }
  } catch (err) {
    console.warn("Read mock store error fallback:", err);
  }
  return { wallets: {}, transactions: [], payoutMethods: [], withdrawalRequests: [] };
}

function writeMockStore(store: any) {
  try {
    const mockPath = getMockDbPath();
    const dir = path.dirname(mockPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(mockPath, JSON.stringify(store, null, 2));
  } catch (err) {
    console.warn("Could not write mock wallet store file (read-only filesystem):", err);
  }
}

// 1. Get current user's wallet
export async function getWalletAction() {
  const currentUser = await requireUser();
  const wallet = await getOrCreateWallet(currentUser.id);
  return { success: true, wallet };
}

// 2. Get current user's transaction ledger
export async function getWalletTransactionsAction() {
  const currentUser = await requireUser();
  const wallet = await getOrCreateWallet(currentUser.id);

  if (!hasDatabase()) {
    const store = readMockStore();
    const txs = store.transactions
      .filter((tx: any) => tx.walletId === wallet.id)
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return { success: true, transactions: txs };
  }

  const txs = await db
    .select()
    .from(walletTransactions)
    .where(eq(walletTransactions.walletId, wallet.id))
    .orderBy(desc(walletTransactions.createdAt));

  return { success: true, transactions: txs };
}

// 3. Add payout method (UPI or Bank Account)
export async function addPayoutMethodAction(data: {
  type: "UPI" | "BANK";
  accountHolderName: string;
  upiId?: string;
  accountNumber?: string;
  ifsc?: string;
}) {
  const currentUser = await requireUser();

  const holderName = data.accountHolderName?.trim();
  if (!holderName || holderName.length < 2) {
    return { success: false, error: "Please enter a valid account holder name (min 2 characters)." };
  }

  let upiId: string | null = null;
  let fullAccountNumber: string | null = null;
  let last4: string | null = null;
  let ifsc: string | null = null;

  if (data.type === "UPI") {
    upiId = data.upiId?.trim() || "";
    if (!upiId) {
      return { success: false, error: "UPI ID is required." };
    }
    if (!isValidUPI(upiId)) {
      return {
        success: false,
        error: "Please enter a valid UPI ID (e.g. username@okhdfcbank or 9876543210@paytm).",
      };
    }
  } else if (data.type === "BANK") {
    fullAccountNumber = data.accountNumber?.trim().replace(/[\s\-]/g, "") || "";
    ifsc = data.ifsc?.trim().toUpperCase() || "";

    if (!fullAccountNumber) {
      return { success: false, error: "Bank account number is required." };
    }
    if (!isValidBankAccount(fullAccountNumber)) {
      return {
        success: false,
        error: "Please enter a valid 9 to 18 digit Indian bank account number.",
      };
    }
    if (!ifsc) {
      return { success: false, error: "Bank IFSC code is required." };
    }
    if (!isValidIFSC(ifsc)) {
      return {
        success: false,
        error: "Please enter a valid 11-character Indian IFSC code (e.g. HDFC0001234, SBIN0001234).",
      };
    }

    last4 = fullAccountNumber.slice(-4);
  } else {
    return { success: false, error: "Invalid payout method type." };
  }

  const methodId = `paym_${Math.random().toString(36).substring(2, 11)}`;

  try {
    const newMethod = {
      id: methodId,
      userId: currentUser.id,
      type: data.type,
      accountHolderName: holderName,
      upiId,
      accountNumber: fullAccountNumber,
      bankAccountLast4: last4,
      ifsc,
      isVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (!hasDatabase()) {
      const store = readMockStore();
      store.payoutMethods.push(newMethod);
      writeMockStore(store);
      revalidatePath("/account/wallet");
      return { success: true, payoutMethod: newMethod };
    }

    await db.insert(payoutMethods).values({
      id: methodId,
      userId: currentUser.id,
      type: data.type,
      accountHolderName: holderName,
      upiId,
      accountNumber: fullAccountNumber,
      bankAccountLast4: last4,
      ifsc,
      isVerified: true,
    });

    revalidatePath("/account/wallet");
    return { success: true, payoutMethod: newMethod };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to add payout method." };
  }
}

// 4. Delete payout method
export async function deletePayoutMethodAction(methodId: string) {
  const currentUser = await requireUser();

  try {
    if (!hasDatabase()) {
      const store = readMockStore();
      store.payoutMethods = store.payoutMethods.filter(
        (m: any) => !(m.id === methodId && m.userId === currentUser.id)
      );
      writeMockStore(store);
      revalidatePath("/account/wallet");
      return { success: true };
    }

    await db
      .delete(payoutMethods)
      .where(and(eq(payoutMethods.id, methodId), eq(payoutMethods.userId, currentUser.id)));

    revalidatePath("/account/wallet");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to delete payout method." };
  }
}

// 5. Get payout methods
export async function getPayoutMethodsAction() {
  const currentUser = await requireUser();

  if (!hasDatabase()) {
    const store = readMockStore();
    const methods = store.payoutMethods.filter((m: any) => m.userId === currentUser.id);
    return { success: true, payoutMethods: methods };
  }

  const methods = await db
    .select()
    .from(payoutMethods)
    .where(eq(payoutMethods.userId, currentUser.id))
    .orderBy(desc(payoutMethods.createdAt));

  return { success: true, payoutMethods: methods };
}

// 6. Submit withdrawal request
export async function requestWithdrawalAction(amountPaise: number, payoutMethodId: string) {
  const currentUser = await requireUser();
  const wallet = await getOrCreateWallet(currentUser.id);

  if (amountPaise < 100) {
    return { success: false, error: "Minimum withdrawal amount is ₹1." };
  }
  if (amountPaise > wallet.availableBalancePaise) {
    return {
      success: false,
      error: `Insufficient available balance to withdraw. Available: ₹${(wallet.availableBalancePaise / 100).toFixed(2)}.`,
    };
  }

  // Verify payout method ownership
  let targetMethod: any = null;
  if (!hasDatabase()) {
    const store = readMockStore();
    targetMethod = store.payoutMethods.find(
      (m: any) => m.id === payoutMethodId && m.userId === currentUser.id
    );
  } else {
    const methods = await db
      .select()
      .from(payoutMethods)
      .where(eq(payoutMethods.id, payoutMethodId))
      .limit(1);
    targetMethod = methods[0] && methods[0].userId === currentUser.id ? methods[0] : null;
  }

  if (!targetMethod) {
    return { success: false, error: "Invalid or unauthorized payout destination method." };
  }

  // Build clean destination reference and metadata
  const isUpi = targetMethod.type === "UPI";
  const destinationReference = isUpi
    ? `UPI: ${targetMethod.upiId} (${targetMethod.accountHolderName})`
    : `Bank: A/C •••• ${targetMethod.bankAccountLast4 || targetMethod.accountNumber?.slice(-4)} (IFSC: ${targetMethod.ifsc}, ${targetMethod.accountHolderName})`;

  const destinationMeta = {
    type: targetMethod.type,
    accountHolderName: targetMethod.accountHolderName,
    upiId: targetMethod.upiId,
    accountNumber: targetMethod.accountNumber,
    bankAccountLast4: targetMethod.bankAccountLast4,
    ifsc: targetMethod.ifsc,
  };

  const idempotencyKey = `payout_${currentUser.id}_${Date.now()}`;

  try {
    // 1. Lock wallet funds in DB atomically with full destination details
    const req = await lockWalletFunds(wallet.id, amountPaise, payoutMethodId, idempotencyKey, {
      method: targetMethod.type,
      destinationReference,
      provider: "MANUAL",
      metadata: destinationMeta,
    });

    // 2. Attempt automated RazorpayX Payout transfer
    const payoutRes = await executeRazorpayXPayout(
      req.id,
      amountPaise,
      {
        type: targetMethod.type as "UPI" | "BANK",
        accountHolderName: targetMethod.accountHolderName,
        upiId: targetMethod.upiId,
        accountNumber: targetMethod.accountNumber,
        bankAccountLast4: targetMethod.bankAccountLast4,
        ifsc: targetMethod.ifsc,
      },
      idempotencyKey
    );

    if (payoutRes.success) {
      if (payoutRes.status === "processed" || payoutRes.status === "completed") {
        await completeWalletWithdrawal(req.id, payoutRes.payoutId || `pout_${Date.now()}`, {
          provider: "RAZORPAY",
        });
        revalidatePath("/account/wallet");
        revalidatePath("/admin/wallet");
        return {
          success: true,
          withdrawal: { ...req, status: "COMPLETED" },
          message: `Payout of ₹${(amountPaise / 100).toLocaleString("en-IN")} transferred successfully!`,
        };
      }

      if (payoutRes.isQueuedForManual || payoutRes.status === "pending") {
        revalidatePath("/account/wallet");
        revalidatePath("/admin/wallet");
        return {
          success: true,
          withdrawal: { ...req, status: "PENDING" },
          message: `Withdrawal request submitted! Funds are locked in processing and will be transferred to your ${
            isUpi ? `UPI ID (${targetMethod.upiId})` : `Bank Account (•••• ${targetMethod.bankAccountLast4})`
          } shortly.`,
        };
      }

      // In processing with provider
      if (hasDatabase()) {
        await db
          .update(withdrawalRequests)
          .set({
            status: "PROCESSING",
            provider: "RAZORPAY",
            providerReferenceId: payoutRes.payoutId,
          })
          .where(eq(withdrawalRequests.id, req.id));
      }

      revalidatePath("/account/wallet");
      revalidatePath("/admin/wallet");
      return {
        success: true,
        withdrawal: { ...req, status: "PROCESSING" },
        message: "Payout initiated! Processing transfer via banking network.",
      };
    } else {
      // If validation explicitly rejected the destination details, refund immediately
      await releaseWalletFunds(req.id, "DESTINATION_INVALID", payoutRes.error || "Payout validation failed.");
      revalidatePath("/account/wallet");
      return {
        success: false,
        error: payoutRes.error || "Failed to initiate payout transfer. Please check your account details.",
      };
    }
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to process withdrawal." };
  }
}

// 7. Get user's withdrawal requests
export async function getWithdrawalRequestsAction() {
  const currentUser = await requireUser();

  if (!hasDatabase()) {
    const store = readMockStore();
    const reqs = store.withdrawalRequests
      .filter((r: any) => r.userId === currentUser.id)
      .sort((a: any, b: any) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());
    return { success: true, withdrawals: reqs };
  }

  const reqs = await db
    .select()
    .from(withdrawalRequests)
    .where(eq(withdrawalRequests.userId, currentUser.id))
    .orderBy(desc(withdrawalRequests.requestedAt));

  return { success: true, withdrawals: reqs };
}

// ==========================================
// ADMIN ACTIONS
// ==========================================

// 8. Admin: Get all withdrawal requests
export async function adminGetWithdrawalRequestsAction() {
  await requireAdmin();

  if (!hasDatabase()) {
    const store = readMockStore();
    const reqs = store.withdrawalRequests
      .map((r: any) => {
        const u = Object.values(store.wallets).find((w: any) => w.id === r.walletId) as any;
        const pm = store.payoutMethods.find((m: any) => m.id === r.payoutMethodId);
        return {
          ...r,
          user: u ? { email: `user_${u.userId}@example.com`, name: "Customer" } : { email: "customer@example.com", name: "Customer" },
          payoutMethod: pm,
        };
      })
      .sort((a: any, b: any) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());
    return { success: true, withdrawals: reqs };
  }

  const reqs = await db
    .select({
      id: withdrawalRequests.id,
      amountPaise: withdrawalRequests.amountPaise,
      feePaise: withdrawalRequests.feePaise,
      netAmountPaise: withdrawalRequests.netAmountPaise,
      status: withdrawalRequests.status,
      method: withdrawalRequests.method,
      destinationReference: withdrawalRequests.destinationReference,
      provider: withdrawalRequests.provider,
      providerReferenceId: withdrawalRequests.providerReferenceId,
      requestedAt: withdrawalRequests.requestedAt,
      completedAt: withdrawalRequests.completedAt,
      failedAt: withdrawalRequests.failedAt,
      failureMessage: withdrawalRequests.failureMessage,
      metadata: withdrawalRequests.metadata,
      payoutMethod: payoutMethods,
      userEmail: profiles.email,
      userName: profiles.fullName,
      userPhone: profiles.phone,
    })
    .from(withdrawalRequests)
    .leftJoin(payoutMethods, eq(withdrawalRequests.payoutMethodId, payoutMethods.id))
    .leftJoin(profiles, eq(withdrawalRequests.userId, profiles.id))
    .orderBy(desc(withdrawalRequests.requestedAt));

  const mappedReqs = reqs.map((r) => ({
    id: r.id,
    amountPaise: r.amountPaise,
    feePaise: r.feePaise,
    netAmountPaise: r.netAmountPaise,
    status: r.status,
    method: r.method,
    destinationReference: r.destinationReference,
    provider: r.provider,
    providerReferenceId: r.providerReferenceId,
    requestedAt: r.requestedAt,
    completedAt: r.completedAt,
    failedAt: r.failedAt,
    failureMessage: r.failureMessage,
    metadata: r.metadata,
    payoutMethod: r.payoutMethod,
    user: {
      email: r.userEmail || "customer@example.com",
      name: r.userName || "Customer",
      phone: r.userPhone || "",
    },
  }));

  return { success: true, withdrawals: mappedReqs };
}

// 9. Admin: Approve / Complete withdrawal with UTR or reference ID
export async function adminApproveWithdrawalAction(requestId: string, referenceId?: string) {
  await requireAdmin();

  const ref = referenceId?.trim() || `UTR_${Date.now()}`;
  try {
    await completeWalletWithdrawal(requestId, ref, { provider: "MANUAL" });
    revalidatePath("/account/wallet");
    revalidatePath("/admin/wallet");
    return { success: true, referenceId: ref };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to approve withdrawal." };
  }
}

// 10. Admin: Dispatch automated RazorpayX Payout
export async function adminExecuteRazorpayPayoutAction(requestId: string) {
  await requireAdmin();

  let req: any = null;
  let pm: any = null;

  if (!hasDatabase()) {
    const store = readMockStore();
    req = store.withdrawalRequests.find((r: any) => r.id === requestId);
    if (req) pm = store.payoutMethods.find((m: any) => m.id === req.payoutMethodId);
  } else {
    const res = await db
      .select({
        req: withdrawalRequests,
        pm: payoutMethods,
      })
      .from(withdrawalRequests)
      .leftJoin(payoutMethods, eq(withdrawalRequests.payoutMethodId, payoutMethods.id))
      .where(eq(withdrawalRequests.id, requestId))
      .limit(1);

    if (res[0]) {
      req = res[0].req;
      pm = res[0].pm;
    }
  }

  if (!req) return { success: false, error: "Withdrawal request not found." };
  if (req.status === "COMPLETED") return { success: false, error: "Withdrawal is already completed." };

  const targetDetails = {
    type: (req.method || pm?.type || "UPI") as "UPI" | "BANK",
    accountHolderName: pm?.accountHolderName || req.metadata?.accountHolderName,
    upiId: pm?.upiId || req.metadata?.upiId,
    accountNumber: pm?.accountNumber || req.metadata?.accountNumber,
    bankAccountLast4: pm?.bankAccountLast4 || req.metadata?.bankAccountLast4,
    ifsc: pm?.ifsc || req.metadata?.ifsc,
  };

  const idempotencyKey = `admin_pay_${requestId}_${Date.now()}`;
  const payoutRes = await executeRazorpayXPayout(requestId, req.amountPaise, targetDetails, idempotencyKey);

  if (payoutRes.success) {
    if (payoutRes.status === "processed" || payoutRes.status === "completed") {
      await completeWalletWithdrawal(requestId, payoutRes.payoutId || `pout_${Date.now()}`, {
        provider: "RAZORPAY",
      });
    } else {
      if (hasDatabase()) {
        await db
          .update(withdrawalRequests)
          .set({
            status: "PROCESSING",
            provider: "RAZORPAY",
            providerReferenceId: payoutRes.payoutId,
          })
          .where(eq(withdrawalRequests.id, requestId));
      }
    }

    revalidatePath("/admin/wallet");
    revalidatePath("/account/wallet");
    return { success: true, status: payoutRes.status, payoutId: payoutRes.payoutId };
  } else {
    return { success: false, error: payoutRes.error || "RazorpayX execution failed." };
  }
}

// 11. Admin: Reject withdrawal request
export async function adminRejectWithdrawalAction(requestId: string, reason: string) {
  await requireAdmin();

  try {
    await releaseWalletFunds(requestId, "CANCELLED_BY_ADMIN", reason || "Rejected by administrator");
    revalidatePath("/admin/wallet");
    revalidatePath("/account/wallet");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to reject withdrawal." };
  }
}

// 12. Admin: Issue manual wallet credit (goodwill / adjustments)
export async function adminCreditWalletAction(userEmail: string, amountPaise: number, reason: string) {
  await requireAdmin();

  if (amountPaise <= 0) {
    return { success: false, error: "Credit amount must be positive." };
  }

  const cleanEmail = userEmail.trim().toLowerCase();
  let targetUserId = "";

  if (!hasDatabase()) {
    const store = readMockStore();
    const w = Object.values(store.wallets).find(
      (item: any) => item.userId.includes(cleanEmail) || cleanEmail.includes(item.userId)
    );
    targetUserId = w ? (w as any).userId : `mock_user_${cleanEmail.split("@")[0]}`;
  } else {
    const u = await db.select().from(profiles).where(eq(profiles.email, cleanEmail)).limit(1);
    if (!u[0]) return { success: false, error: `User with email "${cleanEmail}" not found in profiles.` };
    targetUserId = u[0].id;
  }

  const wallet = await getOrCreateWallet(targetUserId);
  const refId = `adm_${Math.random().toString(36).substring(2, 11)}`;

  try {
    await creditWallet(wallet.id, amountPaise, "ADMIN_CREDIT", refId, reason, "admin");
    revalidatePath("/admin/wallet");
    revalidatePath("/account/wallet");
    return { success: true, message: `Successfully credited ₹${(amountPaise / 100).toLocaleString("en-IN")} to ${cleanEmail}` };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to credit wallet." };
  }
}

