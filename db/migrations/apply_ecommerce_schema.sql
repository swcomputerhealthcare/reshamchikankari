-- Resham Chikankari Ecommerce Database Schema Migration
-- Designed for Supabase / PostgreSQL.
-- Run this script in the Supabase SQL Editor to upgrade the existing database structure.

-- ==========================================
-- 1. RENAME WALLET & WITHDRAWAL TABLES (SAFE DATA RETENTION)
-- ==========================================
-- 1. Try to rename wallet_accounts to wallets (if exists)
ALTER TABLE IF EXISTS "wallet_accounts" RENAME TO "wallets";

-- Create wallets table if it doesn't exist
CREATE TABLE IF NOT EXISTS "wallets" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"balance_paise" integer DEFAULT 0 NOT NULL,
	"available_balance_paise" integer DEFAULT 0 NOT NULL,
	"locked_balance_paise" integer DEFAULT 0 NOT NULL,
	"currency" text DEFAULT 'INR' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "wallets_user_id_unique" UNIQUE("user_id")
);

-- Ensure balance_paise column exists (for the renamed case)
ALTER TABLE "wallets" ADD COLUMN IF NOT EXISTS "balance_paise" integer DEFAULT 0 NOT NULL;

DO $$
BEGIN
  BEGIN
    ALTER TABLE "wallets" RENAME CONSTRAINT "wallet_accounts_user_id_unique" TO "wallets_user_id_unique";
  EXCEPTION
    WHEN undefined_object THEN NULL;
  END;
END $$;

-- 2. Try to rename withdrawal_requests to wallet_withdrawals (if exists)
ALTER TABLE IF EXISTS "withdrawal_requests" RENAME TO "wallet_withdrawals";

-- Create wallet_withdrawals table if it doesn't exist
CREATE TABLE IF NOT EXISTS "wallet_withdrawals" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"wallet_id" text NOT NULL,
	"payout_method_id" text NOT NULL,
	"amount_paise" integer NOT NULL,
	"fee_paise" integer DEFAULT 0 NOT NULL,
	"net_amount_paise" integer NOT NULL,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"method" text,
	"destination_reference" text,
	"failure_reason" text,
	"provider" text,
	"provider_reference_id" text,
	"failure_code" text,
	"failure_message" text,
	"idempotency_key" text NOT NULL,
	"requested_at" timestamp DEFAULT now() NOT NULL,
	"processed_at" timestamp,
	"completed_at" timestamp,
	"failed_at" timestamp,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	CONSTRAINT "wallet_withdrawals_idempotency_key_unique" UNIQUE("idempotency_key")
);

-- Ensure new columns exist (for the renamed case)
ALTER TABLE "wallet_withdrawals" ADD COLUMN IF NOT EXISTS "method" text;
ALTER TABLE "wallet_withdrawals" ADD COLUMN IF NOT EXISTS "destination_reference" text;
ALTER TABLE "wallet_withdrawals" ADD COLUMN IF NOT EXISTS "failure_reason" text;

DO $$
BEGIN
  BEGIN
    ALTER TABLE "wallet_withdrawals" RENAME CONSTRAINT "withdrawal_requests_idempotency_key_unique" TO "wallet_withdrawals_idempotency_key_unique";
  EXCEPTION
    WHEN undefined_object THEN NULL;
  END;
END $$;


-- ==========================================
-- 2. CREATE NEW ECOMMERCE TABLES
-- ==========================================
CREATE TABLE IF NOT EXISTS "addresses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"full_name" text NOT NULL,
	"phone" text NOT NULL,
	"address_line_1" text NOT NULL,
	"address_line_2" text,
	"city" text NOT NULL,
	"state" text NOT NULL,
	"pincode" text NOT NULL,
	"country" text DEFAULT 'India' NOT NULL,
	"landmark" text,
	"is_default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "product_option_values" (
	"id" text PRIMARY KEY NOT NULL,
	"option_id" text NOT NULL,
	"value" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "product_options" (
	"id" text PRIMARY KEY NOT NULL,
	"product_id" text NOT NULL,
	"name" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "hero_slides" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"subtitle" text,
	"image_url" text NOT NULL,
	"mobile_image_url" text,
	"button_text" text,
	"button_url" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "media" (
	"id" text PRIMARY KEY NOT NULL,
	"url" text NOT NULL,
	"public_id" text NOT NULL,
	"type" text NOT NULL,
	"alt_text" text,
	"width" integer,
	"height" integer,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "page_seo" (
	"id" text PRIMARY KEY NOT NULL,
	"path" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"og_title" text,
	"og_description" text,
	"og_image" text,
	"canonical_url" text,
	"no_index" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "page_seo_path_unique" UNIQUE("path")
);

CREATE TABLE IF NOT EXISTS "seo_settings" (
	"id" text PRIMARY KEY DEFAULT 'global' NOT NULL,
	"site_title" text NOT NULL,
	"meta_description" text NOT NULL,
	"default_og_image" text,
	"robots" text,
	"canonical" text,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "site_settings" (
	"id" text PRIMARY KEY DEFAULT 'global' NOT NULL,
	"store_name" text NOT NULL,
	"store_email" text NOT NULL,
	"support_phone" text,
	"shipping_threshold" integer DEFAULT 0 NOT NULL,
	"default_currency" text DEFAULT 'INR' NOT NULL,
	"announcement_bar_text" text,
	"social_links" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"footer_configuration" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"maintenance_mode" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "order_timeline" (
	"id" text PRIMARY KEY NOT NULL,
	"order_id" text NOT NULL,
	"status" text NOT NULL,
	"message" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "refunds" (
	"id" text PRIMARY KEY NOT NULL,
	"order_id" text NOT NULL,
	"order_item_id" text,
	"user_id" uuid NOT NULL,
	"amount_paise" integer NOT NULL,
	"reason" text NOT NULL,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"refund_method" text NOT NULL,
	"wallet_transaction_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"processed_at" timestamp
);

CREATE TABLE IF NOT EXISTS "reviews" (
	"id" text PRIMARY KEY NOT NULL,
	"product_id" text NOT NULL,
	"user_id" uuid NOT NULL,
	"order_id" text,
	"rating" integer NOT NULL,
	"title" text,
	"body" text NOT NULL,
	"is_verified_purchase" boolean DEFAULT false NOT NULL,
	"is_approved" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "reviews_user_id_product_id_unique" UNIQUE("user_id","product_id"),
	CONSTRAINT "reviews_rating_check" CHECK ("rating" >= 1 AND "rating" <= 5)
);

CREATE TABLE IF NOT EXISTS "subscribers" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"subscribed_at" timestamp DEFAULT now() NOT NULL,
	"unsubscribed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "subscribers_email_unique" UNIQUE("email")
);

-- ==========================================
-- 3. DROP OLD USER FK CONSTRAINTS AND MIGRATE COLUMNS TO UUID
-- ==========================================
ALTER TABLE "carts" DROP CONSTRAINT IF EXISTS "carts_user_id_user_id_fk";
ALTER TABLE "coupon_usage" DROP CONSTRAINT IF EXISTS "coupon_usage_user_id_user_id_fk";
ALTER TABLE "orders" DROP CONSTRAINT IF EXISTS "orders_user_id_user_id_fk";
ALTER TABLE "payout_methods" DROP CONSTRAINT IF EXISTS "payout_methods_user_id_user_id_fk";
ALTER TABLE "wallet_transactions" DROP CONSTRAINT IF EXISTS "wallet_transactions_wallet_id_wallet_accounts_id_fk";
ALTER TABLE "wallet_transactions" DROP CONSTRAINT IF EXISTS "wallet_transactions_user_id_user_id_fk";
ALTER TABLE "wishlists" DROP CONSTRAINT IF EXISTS "wishlists_user_id_user_id_fk";

-- Alter column types from text to uuid safely
ALTER TABLE "carts" ALTER COLUMN "user_id" SET DATA TYPE uuid USING user_id::uuid;
ALTER TABLE "coupon_usage" ALTER COLUMN "user_id" SET DATA TYPE uuid USING user_id::uuid;
ALTER TABLE "orders" ALTER COLUMN "user_id" SET DATA TYPE uuid USING user_id::uuid;
ALTER TABLE "payout_methods" ALTER COLUMN "user_id" SET DATA TYPE uuid USING user_id::uuid;
ALTER TABLE "wallet_transactions" ALTER COLUMN "user_id" SET DATA TYPE uuid USING user_id::uuid;
ALTER TABLE "wishlists" ALTER COLUMN "user_id" SET DATA TYPE uuid USING user_id::uuid;

-- ==========================================
-- 4. EXTEND EXISTING TABLES WITH TARGET ECOMMERCE FIELDS
-- ==========================================
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "phone" text;
ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "image_url" text;
ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "sort_order" integer DEFAULT 0 NOT NULL;

ALTER TABLE "product_images" ALTER COLUMN "public_id" DROP NOT NULL;
ALTER TABLE "product_images" ADD COLUMN IF NOT EXISTS "image_url" text;
ALTER TABLE "product_images" ADD COLUMN IF NOT EXISTS "alt_text" text;
ALTER TABLE "product_images" ADD COLUMN IF NOT EXISTS "is_primary" boolean DEFAULT false NOT NULL;
ALTER TABLE "product_images" ADD COLUMN IF NOT EXISTS "width" integer;
ALTER TABLE "product_images" ADD COLUMN IF NOT EXISTS "height" integer;

ALTER TABLE "product_variants" ADD COLUMN IF NOT EXISTS "compare_at_price_paise" integer;
ALTER TABLE "product_variants" ADD COLUMN IF NOT EXISTS "inventory_quantity" integer DEFAULT 0 NOT NULL;
ALTER TABLE "product_variants" ADD COLUMN IF NOT EXISTS "is_available" boolean DEFAULT true NOT NULL;

ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "featured" boolean DEFAULT false NOT NULL;

ALTER TABLE "order_items" ADD COLUMN IF NOT EXISTS "product_name_snapshot" text;
ALTER TABLE "order_items" ADD COLUMN IF NOT EXISTS "sku_snapshot" text;
ALTER TABLE "order_items" ADD COLUMN IF NOT EXISTS "variant_snapshot" text;

ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "payment_provider" text;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "payment_id" text;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "wallet_amount_paise" integer DEFAULT 0 NOT NULL;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "currency" text DEFAULT 'INR' NOT NULL;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "coupon_id" text;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "billing_address_snapshot" jsonb;

-- ==========================================
-- 5. APPLY FOREIGN KEYS AND INDEXES
-- ==========================================
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "product_option_values" ADD CONSTRAINT "product_option_values_option_id_product_options_id_fk" FOREIGN KEY ("option_id") REFERENCES "public"."product_options"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "product_options" ADD CONSTRAINT "product_options_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "order_timeline" ADD CONSTRAINT "order_timeline_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "refunds" ADD CONSTRAINT "refunds_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE restrict ON UPDATE no action;
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_order_item_id_order_items_id_fk" FOREIGN KEY ("order_item_id") REFERENCES "public"."order_items"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE restrict ON UPDATE no action;
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_wallet_transaction_id_wallet_transactions_id_fk" FOREIGN KEY ("wallet_transaction_id") REFERENCES "public"."wallet_transactions"("id") ON DELETE set null ON UPDATE no action;

ALTER TABLE "reviews" ADD CONSTRAINT "reviews_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE set null ON UPDATE no action;

ALTER TABLE "wallets" ADD CONSTRAINT "wallets_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE restrict ON UPDATE no action;

ALTER TABLE "wallet_withdrawals" ADD CONSTRAINT "wallet_withdrawals_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE restrict ON UPDATE no action;
ALTER TABLE "wallet_withdrawals" ADD CONSTRAINT "wallet_withdrawals_wallet_id_wallets_id_fk" FOREIGN KEY ("wallet_id") REFERENCES "public"."wallets"("id") ON DELETE restrict ON UPDATE no action;
ALTER TABLE "wallet_withdrawals" ADD CONSTRAINT "wallet_withdrawals_payout_method_id_payout_methods_id_fk" FOREIGN KEY ("payout_method_id") REFERENCES "public"."payout_methods"("id") ON DELETE restrict ON UPDATE no action;

ALTER TABLE "carts" ADD CONSTRAINT "carts_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "coupon_usage" ADD CONSTRAINT "coupon_usage_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE restrict ON UPDATE no action;
ALTER TABLE "payout_methods" ADD CONSTRAINT "payout_methods_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "wallet_transactions" ADD CONSTRAINT "wallet_transactions_wallet_id_wallets_id_fk" FOREIGN KEY ("wallet_id") REFERENCES "public"."wallets"("id") ON DELETE restrict ON UPDATE no action;
ALTER TABLE "wallet_transactions" ADD CONSTRAINT "wallet_transactions_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE restrict ON UPDATE no action;
ALTER TABLE "wishlists" ADD CONSTRAINT "wishlists_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;

CREATE INDEX IF NOT EXISTS "cart_items_cart_id_idx" ON "cart_items" USING btree ("cart_id");
CREATE INDEX IF NOT EXISTS "product_images_product_id_idx" ON "product_images" USING btree ("product_id");
CREATE INDEX IF NOT EXISTS "product_variants_product_id_idx" ON "product_variants" USING btree ("product_id");
CREATE INDEX IF NOT EXISTS "products_category_id_idx" ON "products" USING btree ("category_id");

ALTER TABLE "wishlist_items" ADD CONSTRAINT "wishlist_items_wishlist_id_product_id_unique" UNIQUE("wishlist_id","product_id");

-- ==========================================
-- 6. ADMIN UTILITY FUNCTIONS & RLS POLICIES
-- ==========================================

-- Custom helper to check if authenticated user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'ADMIN'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable Row Level Security (RLS) on all user-owned tables
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- 1. ADDRESSES POLICIES
DROP POLICY IF EXISTS "Allow user addresses access" ON public.addresses;
CREATE POLICY "Allow user addresses access"
  ON public.addresses
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id);

-- 2. CARTS POLICIES
DROP POLICY IF EXISTS "Allow user carts access" ON public.carts;
CREATE POLICY "Allow user carts access"
  ON public.carts
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow user cart_items access" ON public.cart_items;
CREATE POLICY "Allow user cart_items access"
  ON public.cart_items
  FOR ALL
  TO authenticated
  USING (
    cart_id IN (SELECT id FROM public.carts WHERE user_id = auth.uid())
    OR public.is_admin()
  )
  WITH CHECK (
    cart_id IN (SELECT id FROM public.carts WHERE user_id = auth.uid())
  );

-- 3. WISHLISTS POLICIES
DROP POLICY IF EXISTS "Allow user wishlists access" ON public.wishlists;
CREATE POLICY "Allow user wishlists access"
  ON public.wishlists
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow user wishlist_items access" ON public.wishlist_items;
CREATE POLICY "Allow user wishlist_items access"
  ON public.wishlist_items
  FOR ALL
  TO authenticated
  USING (
    wishlist_id IN (SELECT id FROM public.wishlists WHERE user_id = auth.uid())
    OR public.is_admin()
  )
  WITH CHECK (
    wishlist_id IN (SELECT id FROM public.wishlists WHERE user_id = auth.uid())
  );

-- 4. ORDERS POLICIES
DROP POLICY IF EXISTS "Allow user orders access" ON public.orders;
CREATE POLICY "Allow user orders access"
  ON public.orders
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Allow user order_items access" ON public.order_items;
CREATE POLICY "Allow user order_items access"
  ON public.order_items
  FOR SELECT
  TO authenticated
  USING (
    order_id IN (SELECT id FROM public.orders WHERE user_id = auth.uid())
    OR public.is_admin()
  );

-- 5. REVIEWS POLICIES
DROP POLICY IF EXISTS "Allow public read approved reviews" ON public.reviews;
CREATE POLICY "Allow public read approved reviews"
  ON public.reviews
  FOR SELECT
  TO public
  USING (is_approved = true OR auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Allow authenticated review insert" ON public.reviews;
CREATE POLICY "Allow authenticated review insert"
  ON public.reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow owner review updates" ON public.reviews;
CREATE POLICY "Allow owner review updates"
  ON public.reviews
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow owner review deletion" ON public.reviews;
CREATE POLICY "Allow owner review deletion"
  ON public.reviews
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

-- 6. WALLET POLICIES
DROP POLICY IF EXISTS "Allow user wallet access" ON public.wallets;
CREATE POLICY "Allow user wallet access"
  ON public.wallets
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Allow user transactions access" ON public.wallet_transactions;
CREATE POLICY "Allow user transactions access"
  ON public.wallet_transactions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Allow user withdrawals access" ON public.wallet_withdrawals;
CREATE POLICY "Allow user withdrawals access"
  ON public.wallet_withdrawals
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Allow user withdrawal request insertion" ON public.wallet_withdrawals;
CREATE POLICY "Allow user withdrawal request insertion"
  ON public.wallet_withdrawals
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- 7. REFUNDS POLICIES
DROP POLICY IF EXISTS "Allow user refunds access" ON public.refunds;
CREATE POLICY "Allow user refunds access"
  ON public.refunds
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

-- 8. SUBSCRIBERS POLICIES
DROP POLICY IF EXISTS "Allow public newsletter subscription" ON public.subscribers;
CREATE POLICY "Allow public newsletter subscription"
  ON public.subscribers
  FOR INSERT
  TO public
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow admin subscribers read" ON public.subscribers;
CREATE POLICY "Allow admin subscribers read"
  ON public.subscribers
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Allow admin subscribers update" ON public.subscribers;
CREATE POLICY "Allow admin subscribers update"
  ON public.subscribers
  FOR UPDATE
  TO authenticated
  USING (public.is_admin());
