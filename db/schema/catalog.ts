import { pgTable, text, timestamp, boolean, integer, real, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const categories = pgTable("categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  image: text("image"), // keep for compatibility
  imageUrl: text("image_url"), // target schema
  sortOrder: integer("sort_order").notNull().default(0), // target schema
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const products = pgTable("products", {
  id: text("id").primaryKey(),
  categoryId: text("category_id")
    .notNull()
    .references(() => categories.id, { onDelete: "restrict" }),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  sku: text("sku").notNull().unique(),
  pricePaise: integer("price_paise").notNull(),
  compareAtPricePaise: integer("compare_at_price_paise"),
  fabric: text("fabric"),
  color: text("color"),
  length: text("length"),
  neckline: text("neckline"),
  sleeves: text("sleeves"),
  occasion: text("occasion"),
  washCare: text("wash_care"),
  featured: boolean("featured").notNull().default(false), // target schema
  isActive: boolean("is_active").notNull().default(true),
  productNumber: integer("product_number"),
  weightKg: real("weight_kg").notNull().default(0.5),
  lengthCm: integer("length_cm").notNull().default(30),
  breadthCm: integer("breadth_cm").notNull().default(25),
  heightCm: integer("height_cm").notNull().default(5),
  hsnCode: text("hsn_code").notNull().default("6204"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => {
  return {
    categoryIdIdx: index("products_category_id_idx").on(table.categoryId),
  };
});

export const productImages = pgTable("product_images", {
  id: text("id").primaryKey(),
  productId: text("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  url: text("url").notNull(), // keep for compatibility
  imageUrl: text("image_url"), // target schema
  publicId: text("public_id"), // make it nullable
  alt: text("alt"), // keep for compatibility
  altText: text("alt_text"), // target schema
  colorName: text("color_name"), // optional color tag for image filter
  sortOrder: integer("sort_order").notNull().default(0),
  isPrimary: boolean("is_primary").notNull().default(false), // target schema
  width: integer("width"), // target schema
  height: integer("height"), // target schema
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => {
  return {
    productIdIdx: index("product_images_product_id_idx").on(table.productId),
  };
});

export const productVariants = pgTable("product_variants", {
  id: text("id").primaryKey(),
  productId: text("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  sku: text("sku").notNull().unique(),
  name: text("name").notNull(), // e.g. "S", "M", "L" or "Pink / S"
  colorName: text("color_name"), // e.g. "Peach Pink", "Sky Blue"
  colorCode: text("color_code"), // e.g. "#E98FA8"
  size: text("size"), // e.g. "S", "M", "L", "XL"
  imageId: text("image_id"), // optional linked product image ID
  pricePaise: integer("price_paise"),
  compareAtPricePaise: integer("compare_at_price_paise"), // target schema
  stock: integer("stock").notNull().default(0), // keep for compatibility
  inventoryQuantity: integer("inventory_quantity").notNull().default(0), // target schema
  isActive: boolean("is_active").notNull().default(true), // keep for compatibility
  isAvailable: boolean("is_available").notNull().default(true), // target schema
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => {
  return {
    productIdIdx: index("product_variants_product_id_idx").on(table.productId),
  };
});

// Product Options and Option Values for Flexible Attribute Architecture
export const productOptions = pgTable("product_options", {
  id: text("id").primaryKey(),
  productId: text("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  name: text("name").notNull(), // e.g. "Size", "Color"
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const productOptionValues = pgTable("product_option_values", {
  id: text("id").primaryKey(),
  optionId: text("option_id")
    .notNull()
    .references(() => productOptions.id, { onDelete: "cascade" }),
  value: text("value").notNull(), // e.g. "S", "M", "L" or "Red", "Blue"
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Relations Definitions
export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  images: many(productImages),
  variants: many(productVariants),
  options: many(productOptions),
}));

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, {
    fields: [productImages.productId],
    references: [products.id],
  }),
}));

export const productVariantsRelations = relations(productVariants, ({ one }) => ({
  product: one(products, {
    fields: [productVariants.productId],
    references: [products.id],
  }),
}));

export const productOptionsRelations = relations(productOptions, ({ one, many }) => ({
  product: one(products, {
    fields: [productOptions.productId],
    references: [products.id],
  }),
  values: many(productOptionValues),
}));

export const productOptionValuesRelations = relations(productOptionValues, ({ one }) => ({
  option: one(productOptions, {
    fields: [productOptionValues.optionId],
    references: [productOptions.id],
  }),
}));

export type Category = typeof categories.$inferSelect;
export type Product = typeof products.$inferSelect;
export type ProductImage = typeof productImages.$inferSelect;
export type ProductVariant = typeof productVariants.$inferSelect;
export type ProductOption = typeof productOptions.$inferSelect;
export type ProductOptionValue = typeof productOptionValues.$inferSelect;

