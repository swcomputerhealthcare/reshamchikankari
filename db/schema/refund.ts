import { pgTable, text, timestamp, integer, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { orders, orderItems } from "./order";
import { profiles } from "./auth";
import { walletTransactions } from "./wallet";

export const refunds = pgTable("refunds", {
  id: text("id").primaryKey(),
  orderId: text("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "restrict" }),
  orderItemId: text("order_item_id")
    .references(() => orderItems.id, { onDelete: "set null" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "restrict" }),
  amountPaise: integer("amount_paise").notNull(),
  reason: text("reason").notNull(),
  status: text("status").notNull().default("PENDING"), // 'PENDING' | 'COMPLETED' | 'FAILED'
  refundMethod: text("refund_method").notNull(), // 'original_payment_method' | 'rc_wallet'
  walletTransactionId: text("wallet_transaction_id")
    .references(() => walletTransactions.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  processedAt: timestamp("processed_at"),
});

export const refundsRelations = relations(refunds, ({ one }) => ({
  order: one(orders, {
    fields: [refunds.orderId],
    references: [orders.id],
  }),
  orderItem: one(orderItems, {
    fields: [refunds.orderItemId],
    references: [orderItems.id],
  }),
  user: one(profiles, {
    fields: [refunds.userId],
    references: [profiles.id],
  }),
  walletTransaction: one(walletTransactions, {
    fields: [refunds.walletTransactionId],
    references: [walletTransactions.id],
  }),
}));

export type Refund = typeof refunds.$inferSelect;
export type NewRefund = typeof refunds.$inferInsert;
