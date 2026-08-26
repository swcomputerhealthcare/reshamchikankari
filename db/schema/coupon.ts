import { pgTable, text, timestamp, integer, boolean, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { profiles } from "./auth";

export const coupons = pgTable("coupons", {
  id: text("id").primaryKey(),
  code: text("code").notNull().unique(),
  type: text("type").notNull(), // "PERCENTAGE" | "FIXED_AMOUNT"
  value: integer("value").notNull(),
  minimumOrderPaise: integer("minimum_order_paise").notNull().default(0),
  maximumDiscountPaise: integer("maximum_discount_paise"),
  usageLimit: integer("usage_limit"),
  usageCount: integer("usage_count").notNull().default(0),
  perUserLimit: integer("per_user_limit").notNull().default(1),
  startsAt: timestamp("starts_at"),
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const couponUsage = pgTable("coupon_usage", {
  id: text("id").primaryKey(),
  couponId: text("coupon_id")
    .notNull()
    .references(() => coupons.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  orderId: text("order_id").notNull(),
  discountPaise: integer("discount_paise").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const couponsRelations = relations(coupons, ({ many }) => ({
  usages: many(couponUsage),
}));

export const couponUsageRelations = relations(couponUsage, ({ one }) => ({
  coupon: one(coupons, {
    fields: [couponUsage.couponId],
    references: [coupons.id],
  }),
  user: one(profiles, {
    fields: [couponUsage.userId],
    references: [profiles.id],
  }),
}));

export type Coupon = typeof coupons.$inferSelect;
export type CouponUsage = typeof couponUsage.$inferSelect;

