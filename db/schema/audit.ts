import { pgTable, text, timestamp, uuid, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { profiles } from "./auth";

export const adminActivities = pgTable("admin_activities", {
  id: text("id").primaryKey(),
  adminId: uuid("admin_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  action: text("action").notNull(), // e.g. 'PRODUCT_CREATED', 'PRODUCT_UPDATED', 'PRODUCT_ARCHIVED', etc.
  entityType: text("entity_type").notNull(), // e.g. 'product', 'review', 'order', 'coupon', 'wallet'
  entityId: text("entity_id").notNull(),
  metadata: jsonb("metadata").notNull().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const adminActivitiesRelations = relations(adminActivities, ({ one }) => ({
  admin: one(profiles, {
    fields: [adminActivities.adminId],
    references: [profiles.id],
  }),
}));

export type AdminActivity = typeof adminActivities.$inferSelect;
export type NewAdminActivity = typeof adminActivities.$inferInsert;
