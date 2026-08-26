'use server';

import { revalidatePath } from "next/cache";
import { requireUser, requireAdmin } from "@/lib/auth/helpers";
import { getOrCreateWallet, creditWallet, lockWalletFunds, releaseWalletFunds, completeWalletWithdrawal } from "@/lib/wallet";
import { db } from "@/db";
import { payoutMethods, withdrawalRequests, walletTransactions, walletAccounts } from "@/db/schema/wallet";
import { user } from "@/db/schema/auth";
import { eq, desc } from "drizzle-orm";
import fs from "fs";
import path from "path";

const hasDatabase = () => {
  return !!process.env.DATABASE_URL && process.env.DATABASE_URL.indexOf("[YOUR-PASSWORD]") === -1;
};

const MOCK_DB_PATH = path.join(process.cwd(), "db", "wallet_mock.json");

function readMockStore() {
  if (!fs.existsSync(MOCK_DB_PATH)) return { wallets: {}, transactions: [], payoutMethods: [], withdrawalRequests: [] };
  try {
    return JSON.parse(fs.readFileSync(MOCK_DB_PATH, "utf-8"));
  } catch {
    return { wallets: {}, transactions: [], payoutMethods: [], withdrawalRequests: [] };
  }
}

function writeMockStore(store: any) {
  fs.writeFileSync(MOCK_DB_PATH, JSON.stringify(store, null, 2));
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

// 3. Add payout method
export async function addPayoutMethodAction(data: {
  type: "UPI" | "BANK";
  accountHolderName: string;
  upiId?: string;
  bankAccountLast4?: string;
  ifsc?: string;
}) {
  const currentUser = await requireUser();
  const methodId = `paym_${Math.random().toString(36).substring(2, 11)}`;

  // Redact input details for BANK type if passed raw
  let last4 = data.bankAccountLast4 || "";
  if (data.type === "BANK" && last4.length > 4) {
    last4 = last4.slice(-4);
  }

  try {
    const newMethod = {
      id: methodId,
      userId: currentUser.id,
      type: data.type,
      accountHolderName: data.accountHolderName,
      upiId: data.type === "UPI" ? data.upiId : null,
      bankAccountLast4: data.type === "BANK" ? last4 : null,
      ifsc: data.type === "BANK" ? data.ifsc : null,
      isVerified: true, // Auto verify for convenience
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (!hasDatabase()) {
      const store = readMockStore();
      store.payoutMethods.push(newMethod);
      writeMockStore(store);
      return { success: true, payoutMethod: newMethod };
    }

    await db.insert(payoutMethods).values({
      id: methodId,
      userId: currentUser.id,
      type: data.type,
      accountHolderName: data.accountHolderName,
      upiId: data.type === "UPI" ? data.upiId : null,
      bankAccountLast4: data.type === "BANK" ? last4 : null,
      ifsc: data.type === "BANK" ? data.ifsc : null,
      isVerified: true,
    });

    return { success: true, payoutMethod: newMethod };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to add payout method." };
  }
}

// 4. Get payout methods
export async function getPayoutMethodsAction() {
  const currentUser = await requireUser();

  if (!hasDatabase()) {
    const store = readMockStore();
    const methods = store.payoutMethods.filter((m: any) => m.userId === currentUser.id);
    return { success: true, payoutMethods: methods };
  }

  const methods = await db.select().from(payoutMethods).where(eq(payoutMethods.userId, currentUser.id));
  return { success: true, payoutMethods: methods };
}

// 5. Submit withdrawal request
export async function requestWithdrawalAction(amountPaise: number, payoutMethodId: string) {
  const currentUser = await requireUser();
  const wallet = await getOrCreateWallet(currentUser.id);

  if (amountPaise < 10000) {
    return { success: false, error: "Minimum withdrawal amount is ₹100." };
  }
  if (amountPaise > wallet.availableBalancePaise) {
    return { success: false, error: "Insufficient available balance to withdraw." };
  }

  // Verify payout method ownership
  let methodExists = false;
  if (!hasDatabase()) {
    const store = readMockStore();
    methodExists = store.payoutMethods.some((m: any) => m.id === payoutMethodId && m.userId === currentUser.id);
  } else {
    const method = await db.select().from(payoutMethods).where(eq(payoutMethods.id, payoutMethodId)).limit(1);
    methodExists = !!method[0] && method[0].userId === currentUser.id;
  }

  if (!methodExists) {
    return { success: false, error: "Invalid payout destination method." };
  }

  const idempotencyKey = `idemp_${currentUser.id}_${Date.now()}`;
  try {
    const req = await lockWalletFunds(wallet.id, amountPaise, payoutMethodId, idempotencyKey);
    revalidatePath("/account/wallet");
    return { success: true, withdrawal: req };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to process withdrawal." };
  }
}

// 6. Get user's withdrawal requests
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

// ADMIN ACTIONS

// 7. Admin: Get all withdrawal requests
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
          user: u ? { email: `user_${u.userId}@example.com` } : { email: "unknown@example.com" },
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
      status: withdrawalRequests.status,
      requestedAt: withdrawalRequests.requestedAt,
      payoutMethod: payoutMethods,
      userEmail: user.email,
    })
    .from(withdrawalRequests)
    .innerJoin(payoutMethods, eq(withdrawalRequests.payoutMethodId, payoutMethods.id))
    .innerJoin(user, eq(withdrawalRequests.userId, user.id))
    .orderBy(desc(withdrawalRequests.requestedAt));

  const mappedReqs = reqs.map((r) => ({
    id: r.id,
    amountPaise: r.amountPaise,
    status: r.status,
    requestedAt: r.requestedAt,
    payoutMethod: r.payoutMethod,
    user: { email: r.userEmail },
  }));

  return { success: true, withdrawals: mappedReqs };
}

// 8. Admin: Approve withdrawal request
export async function adminApproveWithdrawalAction(requestId: string) {
  await requireAdmin();

  const providerRef = `ref_prov_${Math.random().toString(36).substring(2, 11)}`;
  try {
    await completeWalletWithdrawal(requestId, providerRef);
    revalidatePath("/admin/wallet");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to approve withdrawal." };
  }
}

// 9. Admin: Reject withdrawal request
export async function adminRejectWithdrawalAction(requestId: string, reason: string) {
  await requireAdmin();

  try {
    await releaseWalletFunds(requestId, "CANCELLED", reason);
    revalidatePath("/admin/wallet");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to reject withdrawal." };
  }
}

// 10. Admin: Issue manual wallet credit (goodwill / adjustments)
export async function adminCreditWalletAction(userEmail: string, amountPaise: number, reason: string) {
  await requireAdmin();

  if (amountPaise <= 0) {
    return { success: false, error: "Credit amount must be positive." };
  }

  let targetUserId = "";
  if (!hasDatabase()) {
    const store = readMockStore();
    // Simulate finding user by email
    const w = Object.values(store.wallets).find((item: any) => item.userId.includes(userEmail) || userEmail.includes(item.userId));
    targetUserId = w ? (w as any).userId : `mock_user_${userEmail.split("@")[0]}`;
  } else {
    const u = await db.select().from(user).where(eq(user.email, userEmail)).limit(1);
    if (!u[0]) return { success: false, error: "User with this email not found." };
    targetUserId = u[0].id;
  }

  const wallet = await getOrCreateWallet(targetUserId);
  const refId = `adm_${Math.random().toString(36).substring(2, 11)}`;

  try {
    await creditWallet(wallet.id, amountPaise, "ADMIN_CREDIT", refId, reason, "admin");
    revalidatePath("/admin/wallet");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to credit wallet." };
  }
}
