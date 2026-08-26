import { pgTable, text, timestamp, integer, boolean, jsonb } from "drizzle-orm/pg-core";

export const heroSlides = pgTable("hero_slides", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  imageUrl: text("image_url").notNull(),
  mobileImageUrl: text("mobile_image_url"),
  buttonText: text("button_text"),
  buttonUrl: text("button_url"),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const seoSettings = pgTable("seo_settings", {
  id: text("id").primaryKey().default("global"),
  siteTitle: text("site_title").notNull(),
  metaDescription: text("meta_description").notNull(),
  defaultOgImage: text("default_og_image"),
  robots: text("robots"),
  canonical: text("canonical"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const pageSeo = pgTable("page_seo", {
  id: text("id").primaryKey(),
  path: text("path").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  ogTitle: text("og_title"),
  ogDescription: text("og_description"),
  ogImage: text("og_image"),
  canonicalUrl: text("canonical_url"),
  noIndex: boolean("no_index").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const siteSettings = pgTable("site_settings", {
  id: text("id").primaryKey().default("global"),
  storeName: text("store_name").notNull(),
  storeEmail: text("store_email").notNull(),
  supportPhone: text("support_phone"),
  shippingThreshold: integer("shipping_threshold").notNull().default(0),
  defaultCurrency: text("default_currency").notNull().default("INR"),
  announcementBarText: text("announcement_bar_text"),
  socialLinks: jsonb("social_links").notNull().default({}),
  footerConfiguration: jsonb("footer_configuration").notNull().default({}),
  maintenanceMode: boolean("maintenance_mode").notNull().default(false),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const media = pgTable("media", {
  id: text("id").primaryKey(),
  url: text("url").notNull(),
  publicId: text("public_id").notNull(),
  type: text("type").notNull(), // 'image' | 'video'
  altText: text("alt_text"),
  width: integer("width"),
  height: integer("height"),
  metadata: jsonb("metadata").notNull().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type HeroSlide = typeof heroSlides.$inferSelect;
export type SeoSetting = typeof seoSettings.$inferSelect;
export type PageSeo = typeof pageSeo.$inferSelect;
export type SiteSetting = typeof siteSettings.$inferSelect;
export type Media = typeof media.$inferSelect;
