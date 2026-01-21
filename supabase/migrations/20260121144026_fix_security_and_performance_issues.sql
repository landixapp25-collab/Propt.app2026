/*
  # Fix Security and Performance Issues

  ## Changes Made

  ### 1. Add Missing Indexes
    - Add index on `notifications.property_id` for foreign key performance

  ### 2. Remove Unused Indexes
    - Drop `transactions_date_idx` (not being used)
    - Drop `saved_deals_analyzed_date_idx` (not being used)
    - Drop `idx_notifications_created_at` (not being used)
    - Drop `idx_notifications_read` (not being used)

  ### 3. Optimize RLS Policies
    Replace `auth.uid()` with `(select auth.uid())` in all policies to prevent 
    re-evaluation for each row. This significantly improves query performance at scale.
    
    Tables affected:
    - properties (4 policies)
    - transactions (4 policies)
    - profiles (3 policies)
    - saved_deals (4 policies)
    - notifications (4 policies)

  ### 4. Fix Function Search Paths
    Add explicit `SECURITY DEFINER SET search_path` to functions to prevent 
    role mutable search_path issues:
    - update_updated_at_column
    - handle_new_user

  ## Security Notes
    - All RLS policies remain restrictive and secure
    - Only authenticated users can access their own data
    - Function security is enhanced with explicit search paths
*/

-- ============================================================================
-- 1. Add Missing Indexes
-- ============================================================================

-- Add index for notifications.property_id foreign key
CREATE INDEX IF NOT EXISTS notifications_property_id_idx ON notifications(property_id);

-- ============================================================================
-- 2. Drop Unused Indexes
-- ============================================================================

DROP INDEX IF EXISTS transactions_date_idx;
DROP INDEX IF EXISTS saved_deals_analyzed_date_idx;
DROP INDEX IF EXISTS idx_notifications_created_at;
DROP INDEX IF EXISTS idx_notifications_read;

-- ============================================================================
-- 3. Optimize RLS Policies - PROPERTIES TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own properties" ON properties;
DROP POLICY IF EXISTS "Users can insert own properties" ON properties;
DROP POLICY IF EXISTS "Users can update own properties" ON properties;
DROP POLICY IF EXISTS "Users can delete own properties" ON properties;

CREATE POLICY "Users can view own properties"
  ON properties FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own properties"
  ON properties FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own properties"
  ON properties FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own properties"
  ON properties FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- ============================================================================
-- 3. Optimize RLS Policies - TRANSACTIONS TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can update own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can delete own transactions" ON transactions;

CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own transactions"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own transactions"
  ON transactions FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own transactions"
  ON transactions FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- ============================================================================
-- 3. Optimize RLS Policies - PROFILES TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

-- ============================================================================
-- 3. Optimize RLS Policies - SAVED_DEALS TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own saved deals" ON saved_deals;
DROP POLICY IF EXISTS "Users can insert own saved deals" ON saved_deals;
DROP POLICY IF EXISTS "Users can update own saved deals" ON saved_deals;
DROP POLICY IF EXISTS "Users can delete own saved deals" ON saved_deals;

CREATE POLICY "Users can view own saved deals"
  ON saved_deals FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own saved deals"
  ON saved_deals FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own saved deals"
  ON saved_deals FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own saved deals"
  ON saved_deals FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- ============================================================================
-- 3. Optimize RLS Policies - NOTIFICATIONS TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Users can read own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can insert own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can delete own notifications" ON notifications;

CREATE POLICY "Users can read own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own notifications"
  ON notifications FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- ============================================================================
-- 4. Fix Function Search Paths
-- ============================================================================

-- Recreate update_updated_at_column with secure search path
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate handle_new_user with secure search path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$;