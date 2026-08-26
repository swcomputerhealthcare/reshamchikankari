import { pgTable, text, timestamp, integer, boolean, jsonb, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { profiles } from "./auth";

export const walletAccounts = pgTable("wallets", {
  id: text("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => profiles.id, { onDelete: "restrict" }),
  balancePaise: integer("balance_paise").notNull().default(0), // target schema
  availableBalancePaise: integer("available_balance_paise").notNull().default(0), // keep for compatibility
  lockedBalancePaise: integer("locked_balance_paise").notNull().default(0), // keep for compatibility
  currency: text("currency").notNull().default("INR"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const walletTransactions = pgTable("wallet_transactions", {
  id: text("id").primaryKey(),
  walletId: text("wallet_id")
    .notNull()
    .references(() => walletAccounts.id, { onDelete: "restrict" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "restrict" }),
  type: text("type").notNull(), // 'REFUND' | 'CREDIT' | 'DEBIT' | 'ADJUSTMENT' | 'WITHDRAWAL' etc.
  amountPaise: integer("amount_paise").notNull(),
  balanceAfterPaise: integer("balance_after_paise").notNull(),
  referenceType: text("reference_type"), // 'order' | 'refund' | 'withdrawal' | 'admin'
  referenceId: text("reference_id"),
  description: text("description").notNull(),
  metadata: jsonb("metadata").notNull().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const payoutMethods = pgTable("payout_methods", {
  id: text("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // 'UPI' | 'BANK'
  accountHolderName: text("account_holder_name"),
  upiId: text("upi_id"),
  bankAccountLast4: text("bank_account_last4"),
  ifsc: text("ifsc"),
  isVerified: boolean("is_verified").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const withdrawalRequests = pgTable("wallet_withdrawals", {
  id: text("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "restrict" }),
  walletId: text("wallet_id")
    .notNull()
    .references(() => walletAccounts.id, { onDelete: "restrict" }),
  payoutMethodId: text("payout_method_id")
    .notNull()
    .references(() => payoutMethods.id, { onDelete: "restrict" }),
  amountPaise: integer("amount_paise").notNull(),
  feePaise: integer("fee_paise").notNull().default(0),
  netAmountPaise: integer("net_amount_paise").notNull(),
  status: text("status").notNull().default("PENDING"), // 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REVERSED' | 'CANCELLED'
  method: text("method"), // target schema: 'UPI' | 'BANK'
  destinationReference: text("destination_reference"), // target schema: account details/UPI ID
  failureReason: text("failure_reason"), // target schema
  provider: text("provider"), // 'RAZORPAY' | 'MANUAL'
  providerReferenceId: text("provider_reference_id"),
  failureCode: text("failure_code"),
  failureMessage: text("failure_message"),
  idempotencyKey: text("idempotency_key").notNull().unique(),
  requestedAt: timestamp("requested_at").notNull().defaultNow(),
  processedAt: timestamp("processed_at"),
  completedAt: timestamp("completed_at"),
  failedAt: timestamp("failed_at"),
  metadata: jsonb("metadata").notNull().default({}),
});

// Relationships
export const walletAccountsRelations = relations(walletAccounts, ({ one, many }) => ({
  user: one(profiles, {
    fields: [walletAccounts.userId],
    references: [profiles.id],
  }),
  transactions: many(walletTransactions),
  withdrawals: many(withdrawalRequests),
}));

export const walletTransactionsRelations = relations(walletTransactions, ({ one }) => ({
  wallet: one(walletAccounts, {
    fields: [walletTransactions.walletId],
    references: [walletAccounts.id],
  }),
  user: one(profiles, {
    fields: [walletTransactions.userId],
    references: [profiles.id],
  }),
}));

export const payoutMethodsRelations = relations(payoutMethods, ({ one, many }) => ({
  user: one(profiles, {
    fields: [payoutMethods.userId],
    references: [profiles.id],
  }),
  withdrawals: many(withdrawalRequests),
}));

export const withdrawalRequestsRelations = relations(withdrawalRequests, ({ one }) => ({
  user: one(profiles, {
    fields: [withdrawalRequests.userId],
    references: [profiles.id],
  }),
  wallet: one(walletAccounts, {
    fields: [withdrawalRequests.walletId],
    references: [walletAccounts.id],
  }),
  payoutMethod: one(payoutMethods, {
    fields: [withdrawalRequests.payoutMethodId],
    references: [payoutMethods.id],
  }),
}));

export type WalletAccount = typeof walletAccounts.$inferSelect;
export type WalletTransaction = typeof walletTransactions.$inferSelect;
export type PayoutMethod = typeof payoutMethods.$inferSelect;
export type WithdrawalRequest = typeof withdrawalRequests.$inferSelect;

export type NewWalletAccount = typeof walletAccounts.$inferInsert;
export type NewWalletTransaction = typeof walletTransactions.$inferInsert;
export type NewPayoutMethod = typeof payoutMethods.$inferInsert;
export type NewWithdrawalRequest = typeof withdrawalRequests.$inferInsert;

