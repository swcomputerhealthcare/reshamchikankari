-- Resham Chikankari - Row Level Security (RLS) Setup
-- Run this script in the Supabase SQL Editor to enable RLS and apply security policies on all user-owned tables.

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

-- 1. Enable Row Level Security (RLS) on all user-owned tables
ALTER TABLE IF EXISTS public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.wallet_withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.admin_activities ENABLE ROW LEVEL SECURITY;

-- Note: user table is a reserved keyword in PostgreSQL, wrap in double quotes
ALTER TABLE IF EXISTS public."user" ENABLE ROW LEVEL SECURITY;

-- 2. APPLY POLICIES

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

-- 9. ADMIN ACTIVITIES POLICIES
DROP POLICY IF EXISTS "Admin only activities access" ON public.admin_activities;
CREATE POLICY "Admin only activities access"
  ON public.admin_activities
  FOR ALL
  TO authenticated
  USING (public.is_admin());

