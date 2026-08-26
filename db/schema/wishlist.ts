import { pgTable, text, timestamp, uuid, unique } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { profiles } from "./auth";
import { products } from "./catalog";

export const wishlists = pgTable("wishlists", {
  id: text("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => profiles.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const wishlistItems = pgTable("wishlist_items", {
  id: text("id").primaryKey(),
  wishlistId: text("wishlist_id")
    .notNull()
    .references(() => wishlists.id, { onDelete: "cascade" }),
  productId: text("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  wishlistProductUnique: unique("wishlist_items_wishlist_id_product_id_unique").on(table.wishlistId, table.productId),
}));

export const wishlistsRelations = relations(wishlists, ({ one, many }) => ({
  user: one(profiles, {
    fields: [wishlists.userId],
    references: [profiles.id],
  }),
  items: many(wishlistItems),
}));


export const wishlistItemsRelations = relations(wishlistItems, ({ one }) => ({
  wishlist: one(wishlists, {
    fields: [wishlistItems.wishlistId],
    references: [wishlists.id],
  }),
  product: one(products, {
    fields: [wishlistItems.productId],
    references: [products.id],
  }),
}));

export type Wishlist = typeof wishlists.$inferSelect;
export type WishlistItem = typeof wishlistItems.$inferSelect;
