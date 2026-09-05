import { db } from "@/db";
import { walletAccounts, walletTransactions, withdrawalRequests } from "@/db/schema/wallet";
import { eq, and } from "drizzle-orm";
import fs from "fs";
import path from "path";

// Helper to determine if Drizzle DB is available
const hasDatabase = () => {
  return !!process.env.DATABASE_URL && process.env.DATABASE_URL.indexOf("[YOUR-PASSWORD]") === -1;
};

// Mock Offline File Store Setup
const MOCK_DB_PATH = path.join(process.cwd(), "db", "wallet_mock.json");

interface MockStore {
  wallets: Record<string, { id: string; userId: string; availableBalancePaise: number; lockedBalancePaise: number; currency: string }>;
  transactions: any[];
  payoutMethods: any[];
  withdrawalRequests: any[];
}

function readMockStore(): MockStore {
  if (!fs.existsSync(MOCK_DB_PATH)) {
    const initialStore = { wallets: {}, transactions: [], payoutMethods: [], withdrawalRequests: [] };
    fs.mkdirSync(path.dirname(MOCK_DB_PATH), { recursive: true });
    fs.writeFileSync(MOCK_DB_PATH, JSON.stringify(initialStore, null, 2));
    return initialStore;
  }
  try {
    return JSON.parse(fs.readFileSync(MOCK_DB_PATH, "utf-8"));
  } catch {
    return { wallets: {}, transactions: [], payoutMethods: [], withdrawalRequests: [] };
  }
}

function writeMockStore(store: MockStore) {
  fs.mkdirSync(path.dirname(MOCK_DB_PATH), { recursive: true });
  fs.writeFileSync(MOCK_DB_PATH, JSON.stringify(store, null, 2));
}

// WALLET LEDGER OPERATIONS

export async function getOrCreateWallet(userId: string) {
  if (!hasDatabase()) {
    const store = readMockStore();
    let wallet = Object.values(store.wallets).find((w) => w.userId === userId);
    if (!wallet) {
      const id = `wall_${Math.random().toString(36).substring(2, 11)}`;
      wallet = {
        id,
        userId,
        availableBalancePaise: 0,
        lockedBalancePaise: 0,
        currency: "INR",
      };
      store.wallets[id] = wallet;
      writeMockStore(store);
    }
    return wallet;
  }

  // Database mode
  try {
    const existing = await db.select().from(walletAccounts).where(eq(walletAccounts.userId, userId)).limit(1);
    if (existing[0]) {
      return existing[0];
    }

    // Ensure profiles record exists first to satisfy foreign key constraint
    try {
      const { profiles } = await import("@/db/schema/auth");
      await db.insert(profiles).values({
        id: userId,
        fullName: "Valued Customer",
        email: `${userId}@user.com`,
        role: "CUSTOMER",
      }).onConflictDoNothing();
    } catch (profileErr) {
      console.warn("Profile auto-insert warning for wallet creation:", profileErr);
    }

    const newWalletId = `wall_${Math.random().toString(36).substring(2, 11)}`;
    await db.insert(walletAccounts).values({
      id: newWalletId,
      userId,
      availableBalancePaise: 0,
      lockedBalancePaise: 0,
      currency: "INR",
    });

    const created = await db.select().from(walletAccounts).where(eq(walletAccounts.id, newWalletId)).limit(1);
    return created[0] || { id: newWalletId, userId, availableBalancePaise: 0, lockedBalancePaise: 0, currency: "INR" };
  } catch (err) {
    console.warn("Database wallet lookup/creation warning, returning fallback wallet:", err);
    return {
      id: `wall_${Math.random().toString(36).substring(2, 11)}`,
      userId,
      availableBalancePaise: 0,
      lockedBalancePaise: 0,
      currency: "INR",
    };
  }
}

export async function creditWallet(
  walletId: string,
  amountPaise: number,
  type: string,
  referenceId: string | null,
  description: string,
  referenceType?: string
) {
  if (amountPaise <= 0) throw new Error("Credit amount must be positive");

  if (!hasDatabase()) {
    const store = readMockStore();
    const wallet = store.wallets[walletId];
    if (!wallet) throw new Error("Wallet not found");

    // Idempotency check
    const isDuplicate = store.transactions.some(
      (tx) => tx.walletId === walletId && tx.referenceId === referenceId && tx.referenceType === referenceType
    );
    if (isDuplicate) return wallet;

    wallet.availableBalancePaise += amountPaise;
    const balanceAfter = wallet.availableBalancePaise;

    store.transactions.push({
      id: `tx_${Math.random().toString(36).substring(2, 11)}`,
      walletId,
      userId: wallet.userId,
      type,
      amountPaise,
      balanceAfterPaise: balanceAfter,
      referenceType: referenceType || null,
      referenceId: referenceId || null,
      description,
      metadata: {},
      createdAt: new Date().toISOString(),
    });

    writeMockStore(store);
    return wallet;
  }

  // Database mode: transaction with row locking
  return await db.transaction(async (tx) => {
    // Idempotency Check
    if (referenceId && referenceType) {
      const duplicate = await tx
        .select()
        .from(walletTransactions)
        .where(
          and(
            eq(walletTransactions.walletId, walletId),
            eq(walletTransactions.referenceId, referenceId),
            eq(walletTransactions.referenceType, referenceType)
          )
        )
        .limit(1);

      if (duplicate[0]) {
        const wallet = await tx.select().from(walletAccounts).where(eq(walletAccounts.id, walletId)).limit(1);
        return wallet[0];
      }
    }

    // Row Lock
    const locked = await tx
      .select()
      .from(walletAccounts)
      .where(eq(walletAccounts.id, walletId))
      .for("update")
      .limit(1);
    const wallet = locked[0];
    if (!wallet) throw new Error("Wallet not found");

    const newBalance = wallet.availableBalancePaise + amountPaise;
    await tx
      .update(walletAccounts)
      .set({
        availableBalancePaise: newBalance,
        updatedAt: new Date(),
      })
      .where(eq(walletAccounts.id, walletId));

    await tx.insert(walletTransactions).values({
      id: `tx_${Math.random().toString(36).substring(2, 11)}`,
      walletId,
      userId: wallet.userId,
      type,
      amountPaise,
      balanceAfterPaise: newBalance,
      referenceType: referenceType || null,
      referenceId: referenceId || null,
      description,
    });

    return { ...wallet, availableBalancePaise: newBalance };
  });
}

export async function lockWalletFunds(
  walletId: string,
  amountPaise: number,
  payoutMethodId: string,
  idempotencyKey: string
) {
  if (amountPaise <= 0) throw new Error("Lock amount must be positive");

  if (!hasDatabase()) {
    const store = readMockStore();
    const wallet = store.wallets[walletId];
    if (!wallet) throw new Error("Wallet not found");

    // Idempotency check
    const existingRequest = store.withdrawalRequests.find((r) => r.idempotencyKey === idempotencyKey);
    if (existingRequest) return existingRequest;

    if (wallet.availableBalancePaise < amountPaise) {
      throw new Error("Insufficient wallet balance");
    }

    wallet.availableBalancePaise -= amountPaise;
    wallet.lockedBalancePaise += amountPaise;

    const reqId = `with_${Math.random().toString(36).substring(2, 11)}`;
    const newRequest = {
      id: reqId,
      userId: wallet.userId,
      walletId,
      payoutMethodId,
      amountPaise,
      feePaise: 0,
      netAmountPaise: amountPaise,
      status: "PENDING",
      provider: "MANUAL",
      providerReferenceId: null,
      idempotencyKey,
      requestedAt: new Date().toISOString(),
      metadata: {},
    };

    store.withdrawalRequests.push(newRequest);

    store.transactions.push({
      id: `tx_${Math.random().toString(36).substring(2, 11)}`,
      walletId,
      userId: wallet.userId,
      type: "WITHDRAWAL_LOCK",
      amountPaise: -amountPaise,
      balanceAfterPaise: wallet.availableBalancePaise,
      referenceType: "withdrawal",
      referenceId: reqId,
      description: `Funds locked for withdrawal request ${reqId}`,
      metadata: {},
      createdAt: new Date().toISOString(),
    });

    writeMockStore(store);
    return newRequest;
  }

  // Database mode: transaction with row locking
  return await db.transaction(async (tx) => {
    // Idempotency Check
    const dup = await tx.select().from(withdrawalRequests).where(eq(withdrawalRequests.idempotencyKey, idempotencyKey)).limit(1);
    if (dup[0]) return dup[0];

    // Row Lock
    const locked = await tx
      .select()
      .from(walletAccounts)
      .where(eq(walletAccounts.id, walletId))
      .for("update")
      .limit(1);
    const wallet = locked[0];
    if (!wallet) throw new Error("Wallet not found");

    if (wallet.availableBalancePaise < amountPaise) {
      throw new Error("Insufficient wallet balance");
    }

    const nextAvail = wallet.availableBalancePaise - amountPaise;
    const nextLocked = wallet.lockedBalancePaise + amountPaise;

    await tx
      .update(walletAccounts)
      .set({
        availableBalancePaise: nextAvail,
        lockedBalancePaise: nextLocked,
        updatedAt: new Date(),
      })
      .where(eq(walletAccounts.id, walletId));

    const reqId = `with_${Math.random().toString(36).substring(2, 11)}`;
    const newRequest = {
      id: reqId,
      userId: wallet.userId,
      walletId,
      payoutMethodId,
      amountPaise,
      feePaise: 0,
      netAmountPaise: amountPaise,
      status: "PENDING",
      provider: "MANUAL",
      idempotencyKey,
    };

    await tx.insert(withdrawalRequests).values(newRequest);

    await tx.insert(walletTransactions).values({
      id: `tx_${Math.random().toString(36).substring(2, 11)}`,
      walletId,
      userId: wallet.userId,
      type: "WITHDRAWAL_LOCK",
      amountPaise: -amountPaise,
      balanceAfterPaise: nextAvail,
      referenceType: "withdrawal",
      referenceId: reqId,
      description: `Funds locked for withdrawal request ${reqId}`,
    });

    return newRequest;
  });
}

export async function releaseWalletFunds(
  withdrawalRequestId: string,
  failureCode?: string,
  failureMessage?: string
) {
  if (!hasDatabase()) {
    const store = readMockStore();
    const request = store.withdrawalRequests.find((r) => r.id === withdrawalRequestId);
    if (!request) throw new Error("Withdrawal request not found");
    if (request.status === "FAILED" || request.status === "REVERSED") return request;

    const wallet = store.wallets[request.walletId];
    if (wallet) {
      wallet.lockedBalancePaise = Math.max(0, wallet.lockedBalancePaise - request.amountPaise);
      wallet.availableBalancePaise += request.amountPaise;

      store.transactions.push({
        id: `tx_${Math.random().toString(36).substring(2, 11)}`,
        walletId: wallet.id,
        userId: wallet.userId,
        type: "WITHDRAWAL_REVERSAL",
        amountPaise: request.amountPaise,
        balanceAfterPaise: wallet.availableBalancePaise,
        referenceType: "withdrawal",
        referenceId: withdrawalRequestId,
        description: `Funds returned due to failed withdrawal ${withdrawalRequestId}`,
        metadata: {},
        createdAt: new Date().toISOString(),
      });
    }

    request.status = "FAILED";
    request.failureCode = failureCode || "FAILED";
    request.failureMessage = failureMessage || "Provider payout failed";
    request.failedAt = new Date().toISOString();

    writeMockStore(store);
    return request;
  }

  // Database mode: transaction with locking
  return await db.transaction(async (tx) => {
    const reqResult = await tx.select().from(withdrawalRequests).where(eq(withdrawalRequests.id, withdrawalRequestId)).limit(1);
    const request = reqResult[0];
    if (!request) throw new Error("Withdrawal request not found");
    if (request.status === "FAILED" || request.status === "REVERSED") return request;

    const locked = await tx
      .select()
      .from(walletAccounts)
      .where(eq(walletAccounts.id, request.walletId))
      .for("update")
      .limit(1);
    const wallet = locked[0];
    if (wallet) {
      const nextLocked = Math.max(0, wallet.lockedBalancePaise - request.amountPaise);
      const nextAvail = wallet.availableBalancePaise + request.amountPaise;

      await tx
        .update(walletAccounts)
        .set({
          availableBalancePaise: nextAvail,
          lockedBalancePaise: nextLocked,
          updatedAt: new Date(),
        })
        .where(eq(walletAccounts.id, wallet.id));

      await tx.insert(walletTransactions).values({
        id: `tx_${Math.random().toString(36).substring(2, 11)}`,
        walletId: wallet.id,
        userId: wallet.userId,
        type: "WITHDRAWAL_REVERSAL",
        amountPaise: request.amountPaise,
        balanceAfterPaise: nextAvail,
        referenceType: "withdrawal",
        referenceId: withdrawalRequestId,
        description: `Funds returned due to failed withdrawal ${withdrawalRequestId}`,
      });
    }

    await tx
      .update(withdrawalRequests)
      .set({
        status: "FAILED",
        failureCode: failureCode || "FAILED",
        failureMessage: failureMessage || "Provider payout failed",
        failedAt: new Date(),
      })
      .where(eq(withdrawalRequests.id, withdrawalRequestId));

    return { ...request, status: "FAILED" };
  });
}

export async function completeWalletWithdrawal(withdrawalRequestId: string, providerRef: string) {
  if (!hasDatabase()) {
    const store = readMockStore();
    const request = store.withdrawalRequests.find((r) => r.id === withdrawalRequestId);
    if (!request) throw new Error("Withdrawal request not found");
    if (request.status === "COMPLETED") return request;

    const wallet = store.wallets[request.walletId];
    if (wallet) {
      wallet.lockedBalancePaise = Math.max(0, wallet.lockedBalancePaise - request.amountPaise);

      store.transactions.push({
        id: `tx_${Math.random().toString(36).substring(2, 11)}`,
        walletId: wallet.id,
        userId: wallet.userId,
        type: "WITHDRAWAL_COMPLETED",
        amountPaise: -request.amountPaise,
        balanceAfterPaise: wallet.availableBalancePaise,
        referenceType: "withdrawal",
        referenceId: withdrawalRequestId,
        description: `Withdrawal ${withdrawalRequestId} processed successfully`,
        metadata: {},
        createdAt: new Date().toISOString(),
      });
    }

    request.status = "COMPLETED";
    request.providerReferenceId = providerRef;
    request.completedAt = new Date().toISOString();

    writeMockStore(store);
    return request;
  }

  // Database mode: transaction with locking
  return await db.transaction(async (tx) => {
    const reqResult = await tx.select().from(withdrawalRequests).where(eq(withdrawalRequests.id, withdrawalRequestId)).limit(1);
    const request = reqResult[0];
    if (!request) throw new Error("Withdrawal request not found");
    if (request.status === "COMPLETED") return request;

    const locked = await tx
      .select()
      .from(walletAccounts)
      .where(eq(walletAccounts.id, request.walletId))
      .for("update")
      .limit(1);
    const wallet = locked[0];
    if (wallet) {
      const nextLocked = Math.max(0, wallet.lockedBalancePaise - request.amountPaise);

      await tx
        .update(walletAccounts)
        .set({
          lockedBalancePaise: nextLocked,
          updatedAt: new Date(),
        })
        .where(eq(walletAccounts.id, wallet.id));

      await tx.insert(walletTransactions).values({
        id: `tx_${Math.random().toString(36).substring(2, 11)}`,
        walletId: wallet.id,
        userId: wallet.userId,
        type: "WITHDRAWAL_COMPLETED",
        amountPaise: -request.amountPaise,
        balanceAfterPaise: wallet.availableBalancePaise,
        referenceType: "withdrawal",
        referenceId: withdrawalRequestId,
        description: `Withdrawal ${withdrawalRequestId} processed successfully`,
      });
    }

    await tx
      .update(withdrawalRequests)
      .set({
        status: "COMPLETED",
        providerReferenceId: providerRef,
        completedAt: new Date(),
      })
      .where(eq(withdrawalRequests.id, withdrawalRequestId));

    return { ...request, status: "COMPLETED", providerReferenceId: providerRef };
  });
}

export async function debitWalletForOrder(walletId: string, amountPaise: number, orderId: string) {
  if (amountPaise <= 0) throw new Error("Debit amount must be positive");

  if (!hasDatabase()) {
    const store = readMockStore();
    const wallet = store.wallets[walletId];
    if (!wallet) throw new Error("Wallet not found");

    if (wallet.availableBalancePaise < amountPaise) {
      throw new Error("Insufficient wallet balance");
    }

    wallet.availableBalancePaise -= amountPaise;

    store.transactions.push({
      id: `tx_${Math.random().toString(36).substring(2, 11)}`,
      walletId,
      userId: wallet.userId,
      type: "ORDER_DEBIT",
      amountPaise: -amountPaise,
      balanceAfterPaise: wallet.availableBalancePaise,
      referenceType: "order",
      referenceId: orderId,
      description: `Payment for order ${orderId}`,
      metadata: {},
      createdAt: new Date().toISOString(),
    });

    writeMockStore(store);
    return wallet;
  }

  // Database mode: transaction with row locking
  return await db.transaction(async (tx) => {
    // Row Lock
    const locked = await tx
      .select()
      .from(walletAccounts)
      .where(eq(walletAccounts.id, walletId))
      .for("update")
      .limit(1);
    const wallet = locked[0];
    if (!wallet) throw new Error("Wallet not found");

    if (wallet.availableBalancePaise < amountPaise) {
      throw new Error("Insufficient wallet balance");
    }

    const nextAvail = wallet.availableBalancePaise - amountPaise;

    await tx
      .update(walletAccounts)
      .set({
        availableBalancePaise: nextAvail,
        updatedAt: new Date(),
      })
      .where(eq(walletAccounts.id, walletId));

    await tx.insert(walletTransactions).values({
      id: `tx_${Math.random().toString(36).substring(2, 11)}`,
      walletId,
      userId: wallet.userId,
      type: "ORDER_DEBIT",
      amountPaise: -amountPaise,
      balanceAfterPaise: nextAvail,
      referenceType: "order",
      referenceId: orderId,
      description: `Payment for order ${orderId}`,
    });

    return { ...wallet, availableBalancePaise: nextAvail };
  });
}
