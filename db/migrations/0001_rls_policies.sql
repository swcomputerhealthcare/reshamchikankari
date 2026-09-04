-- RESHAM CHIKANKARI - Phase 16 Production RLS Policies & Tables
-- Safe, idempotent execution script for Supabase SQL Editor

-- 0. Ensure processed_webhooks table exists
CREATE TABLE IF NOT EXISTS "processed_webhooks" (
  "id" text PRIMARY KEY,
  "provider" text NOT NULL,
  "event_type" text NOT NULL,
  "processed_at" timestamp NOT NULL DEFAULT now()
);

-- 1. Profiles Table
ALTER TABLE IF EXISTS "profiles" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can select own profile" ON "profiles";
DROP POLICY IF EXISTS "Users can update own profile" ON "profiles";
DROP POLICY IF EXISTS "Admins full control on profiles" ON "profiles";

CREATE POLICY "Users can select own profile" ON "profiles" FOR SELECT USING (auth.uid()::text = id::text);
CREATE POLICY "Users can update own profile" ON "profiles" FOR UPDATE USING (auth.uid()::text = id::text);
CREATE POLICY "Admins full control on profiles" ON "profiles" FOR ALL USING (
  EXISTS (SELECT 1 FROM "profiles" WHERE id::text = auth.uid()::text AND role = 'ADMIN')
);

-- 2. Carts & Cart Items
ALTER TABLE IF EXISTS "carts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "cart_items" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users access own cart" ON "carts";
DROP POLICY IF EXISTS "Users access own cart items" ON "cart_items";

CREATE POLICY "Users access own cart" ON "carts" FOR ALL USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users access own cart items" ON "cart_items" FOR ALL USING (
  EXISTS (SELECT 1 FROM "carts" WHERE id = cart_items.cart_id AND user_id::text = auth.uid()::text)
);

-- 3. Wishlists & Wishlist Items
ALTER TABLE IF EXISTS "wishlists" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "wishlist_items" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users access own wishlist" ON "wishlists";
DROP POLICY IF EXISTS "Users access own wishlist items" ON "wishlist_items";

CREATE POLICY "Users access own wishlist" ON "wishlists" FOR ALL USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users access own wishlist items" ON "wishlist_items" FOR ALL USING (
  EXISTS (SELECT 1 FROM "wishlists" WHERE id = wishlist_items.wishlist_id AND user_id::text = auth.uid()::text)
);

-- 4. Orders, Order Items & Shipping Addresses
ALTER TABLE IF EXISTS "orders" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "order_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "shipping_addresses" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users select own orders" ON "orders";
DROP POLICY IF EXISTS "Users insert own orders" ON "orders";
DROP POLICY IF EXISTS "Admins full control on orders" ON "orders";

CREATE POLICY "Users select own orders" ON "orders" FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users insert own orders" ON "orders" FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Admins full control on orders" ON "orders" FOR ALL USING (
  EXISTS (SELECT 1 FROM "profiles" WHERE id::text = auth.uid()::text AND role = 'ADMIN')
);

-- 5. Catalog (Public Read, Admin Write)
ALTER TABLE IF EXISTS "products" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "product_variants" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "product_images" ADD COLUMN IF NOT EXISTS "color_name" text;
ALTER TABLE IF EXISTS "product_images" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "categories" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read products" ON "products";
DROP POLICY IF EXISTS "Public read product_variants" ON "product_variants";
DROP POLICY IF EXISTS "Public read product_images" ON "product_images";
DROP POLICY IF EXISTS "Public read categories" ON "categories";

CREATE POLICY "Public read products" ON "products" FOR SELECT USING (true);
CREATE POLICY "Public read product_variants" ON "product_variants" FOR SELECT USING (true);
CREATE POLICY "Public read product_images" ON "product_images" FOR SELECT USING (true);
CREATE POLICY "Public read categories" ON "categories" FOR SELECT USING (true);

-- 6. Wallets & Wallet Transactions
ALTER TABLE IF EXISTS "wallets" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "wallet_transactions" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users select own wallet" ON "wallets";
DROP POLICY IF EXISTS "Users select own transactions" ON "wallet_transactions";

CREATE POLICY "Users select own wallet" ON "wallets" FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users select own transactions" ON "wallet_transactions" FOR SELECT USING (auth.uid()::text = user_id::text);

-- 7. Processed Webhooks (Internal System Only)
ALTER TABLE IF EXISTS "processed_webhooks" ENABLE ROW LEVEL SECURITY;
