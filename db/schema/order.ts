import { pgTable, text, timestamp, integer, jsonb, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { profiles } from "./auth";
import { products, productVariants } from "./catalog";

export const orders = pgTable("orders", {
  id: text("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  userId: uuid("user_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "restrict" }),
  status: text("status").notNull().default("PENDING"),
  paymentStatus: text("payment_status").notNull().default("PENDING"),
  paymentProvider: text("payment_provider"), // 'RAZORPAY' | 'COD'
  paymentId: text("payment_id"), // Provider transaction/payment ID
  subtotalPaise: integer("subtotal_paise").notNull(),
  discountPaise: integer("discount_paise").notNull().default(0),
  shippingPaise: integer("shipping_paise").notNull().default(0),
  taxPaise: integer("tax_paise").notNull().default(0),
  walletAmountPaise: integer("wallet_amount_paise").notNull().default(0), // Wallet balance applied
  totalPaise: integer("total_paise").notNull(),
  currency: text("currency").notNull().default("INR"),
  couponCodeSnapshot: text("coupon_code_snapshot"),
  couponId: text("coupon_id"), // Reference to coupons table if needed
  shippingAddressSnapshot: jsonb("shipping_address_snapshot").notNull(),
  billingAddressSnapshot: jsonb("billing_address_snapshot"), // Target schema
  
  // Shiprocket & Fulfillment Fields
  fulfillmentStatus: text("fulfillment_status").notNull().default("PENDING"),
  shiprocketOrderId: text("shiprocket_order_id"),
  shiprocketShipmentId: text("shiprocket_shipment_id"),
  awbCode: text("awb_code"),
  courierName: text("courier_name"),
  courierCompanyId: integer("courier_company_id"),
  trackingUrl: text("tracking_url"),
  pickupScheduledAt: timestamp("pickup_scheduled_at"),
  shippedAt: timestamp("shipped_at"),
  deliveredAt: timestamp("delivered_at"),
  cancelledAt: timestamp("cancelled_at"),
  lastTrackingUpdate: timestamp("last_tracking_update"),
  shippingError: text("shipping_error"),
  shippingCreatedAt: timestamp("shipping_created_at"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: text("id").primaryKey(),
  orderId: text("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: text("product_id").references(() => products.id, { onDelete: "set null" }),
  variantId: text("variant_id").references(() => productVariants.id, { onDelete: "set null" }),
  productName: text("product_name").notNull(),
  sku: text("sku").notNull(),
  productNameSnapshot: text("product_name_snapshot"), // target schema
  skuSnapshot: text("sku_snapshot"), // target schema
  variantSnapshot: text("variant_snapshot"), // target schema (size, color, etc.)
  unitPricePaise: integer("unit_price_paise").notNull(),
  quantity: integer("quantity").notNull(),
  lineTotalPaise: integer("line_total_paise").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const orderTimeline = pgTable("order_timeline", {
  id: text("id").primaryKey(),
  orderId: text("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  status: text("status").notNull(), // PENDING, CONFIRMED, SHIPPED, etc.
  message: text("message").notNull(), // Description of status change
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const shipmentTrackingEvents = pgTable("shipment_tracking_events", {
  id: text("id").primaryKey(),
  orderId: text("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  shipmentId: text("shipment_id"),
  awbCode: text("awb_code"),
  status: text("status").notNull(),
  statusCode: text("status_code"),
  location: text("location"),
  description: text("description"),
  eventTime: timestamp("event_time").notNull().defaultNow(),
  rawEventReference: jsonb("raw_event_reference"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(profiles, {
    fields: [orders.userId],
    references: [profiles.id],
  }),
  items: many(orderItems),
  timeline: many(orderTimeline),
  trackingEvents: many(shipmentTrackingEvents),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
  variant: one(productVariants, {
    fields: [orderItems.variantId],
    references: [productVariants.id],
  }),
}));

export const orderTimelineRelations = relations(orderTimeline, ({ one }) => ({
  order: one(orders, {
    fields: [orderTimeline.orderId],
    references: [orders.id],
  }),
}));

export const shipmentTrackingEventsRelations = relations(shipmentTrackingEvents, ({ one }) => ({
  order: one(orders, {
    fields: [shipmentTrackingEvents.orderId],
    references: [orders.id],
  }),
}));

export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type OrderTimeline = typeof orderTimeline.$inferSelect;
export type ShipmentTrackingEvent = typeof shipmentTrackingEvents.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type NewOrderItem = typeof orderItems.$inferInsert;
export type NewOrderTimeline = typeof orderTimeline.$inferInsert;
export type NewShipmentTrackingEvent = typeof shipmentTrackingEvents.$inferInsert;


