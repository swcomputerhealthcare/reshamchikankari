import { pgTable, text, timestamp, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { products, productVariants } from "./catalog";

export const inventoryTransactions = pgTable("inventory_transactions", {
  id: text("id").primaryKey(),
  productId: text("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  variantId: text("variant_id").references(() => productVariants.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  quantityDelta: integer("quantity_delta").notNull(),
  referenceType: text("reference_type").notNull(),
  referenceId: text("reference_id"),
  reason: text("reason"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const inventoryTransactionsRelations = relations(inventoryTransactions, ({ one }) => ({
  product: one(products, {
    fields: [inventoryTransactions.productId],
    references: [products.id],
  }),
  variant: one(productVariants, {
    fields: [inventoryTransactions.variantId],
    references: [productVariants.id],
  }),
}));

export type InventoryTransaction = typeof inventoryTransactions.$inferSelect;
export type NewInventoryTransaction = typeof inventoryTransactions.$inferInsert;
