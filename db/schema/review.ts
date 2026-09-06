import { pgTable, text, timestamp, integer, boolean, uuid, check, unique } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { relations } from "drizzle-orm";
import { profiles } from "./auth";
import { products } from "./catalog";
import { orders } from "./order";

export const reviews = pgTable("reviews", {
  id: text("id").primaryKey(),
  productId: text("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .references(() => profiles.id, { onDelete: "cascade" }),
  orderId: text("order_id")
    .references(() => orders.id, { onDelete: "set null" }),
  authorName: text("author_name"),
  authorCity: text("author_city"),
  rating: integer("rating").notNull(),
  title: text("title"),
  body: text("body").notNull(),
  isVerifiedPurchase: boolean("is_verified_purchase").notNull().default(false),
  isApproved: boolean("is_approved").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  ratingCheck: check("reviews_rating_check", sql`${table.rating} >= 1 AND ${table.rating} <= 5`),
}));


export const reviewsRelations = relations(reviews, ({ one }) => ({
  product: one(products, {
    fields: [reviews.productId],
    references: [products.id],
  }),
  user: one(profiles, {
    fields: [reviews.userId],
    references: [profiles.id],
  }),
  order: one(orders, {
    fields: [reviews.orderId],
    references: [orders.id],
  }),
}));

export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;
