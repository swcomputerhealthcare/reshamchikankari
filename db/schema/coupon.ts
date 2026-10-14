import { pgTable, text, timestamp, integer, boolean, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { profiles } from "./auth";

export const coupons = pgTable("coupons", {
  id: text("id").primaryKey(),
  code: text("code").notNull().unique(),
  codeHash: text("code_hash").unique(),
  codeMasked: text("code_masked"),
  codeSuffix: text("code_suffix"),
  description: text("description"),
  type: text("type").notNull(), // "PERCENTAGE" | "FIXED_AMOUNT" | "FIXED"
  value: integer("value").notNull(),
  minimumOrderPaise: integer("minimum_order_paise").notNull().default(0),
  maximumDiscountPaise: integer("maximum_discount_paise"),
  usageLimit: integer("usage_limit"),
  usageCount: integer("usage_count").notNull().default(0),
  perUserLimit: integer("per_user_limit").notNull().default(1),
  isPrivate: boolean("is_private").notNull().default(false),
  isSingleUse: boolean("is_single_use").notNull().default(false),
  assignedUserId: uuid("assigned_user_id").references(() => profiles.id, { onDelete: "set null" }),
  assignedEmail: text("assigned_email"),
  canStackWithCampaigns: boolean("can_stack_with_campaigns").notNull().default(true),
  internalReason: text("internal_reason"),
  startsAt: timestamp("starts_at"),
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").notNull().default(true),
  revokedAt: timestamp("revoked_at"),
  revokedBy: text("revoked_by"),
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

export const securityRateLimits = pgTable("security_rate_limits", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  action: text("action").notNull(),
  hitCount: integer("hit_count").notNull().default(1),
  firstHitAt: timestamp("first_hit_at").notNull().defaultNow(),
  lastHitAt: timestamp("last_hit_at").notNull().defaultNow(),
  blockedUntil: timestamp("blocked_until"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const couponsRelations = relations(coupons, ({ many, one }) => ({
  usages: many(couponUsage),
  assignedUser: one(profiles, {
    fields: [coupons.assignedUserId],
    references: [profiles.id],
  }),
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
export type SecurityRateLimit = typeof securityRateLimits.$inferSelect;

