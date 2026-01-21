/*
  # Optimize RLS Policies for Performance

  1. Changes
    - Replace auth.uid() with (select auth.uid()) in all RLS policies
    - This prevents re-evaluation of auth.uid() for each row
    - Significantly improves query performance at scale
    
  2. Tables Updated
    - properties
    - transactions
    - saved_deals
    - notifications
    
  3. Performance Impact
    - Reduces function calls from O(n) to O(1) per query
    - Recommended best practice by Supabase
*/

-- Drop and recreate properties policies
DROP POLICY IF EXISTS "Users can read own properties" ON properties;
DROP POLICY IF EXISTS "Users can insert own properties" ON properties;
DROP POLICY IF EXISTS "Users can update own properties" ON properties;
DROP POLICY IF EXISTS "Users can delete own properties" ON properties;

CREATE POLICY "Users can read own properties"
  ON properties
  FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own properties"
  ON properties
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own properties"
  ON properties
  FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own properties"
  ON properties
  FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- Drop and recreate transactions policies
DROP POLICY IF EXISTS "Users can read own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can update own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can delete own transactions" ON transactions;

CREATE POLICY "Users can read own transactions"
  ON transactions
  FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own transactions"
  ON transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own transactions"
  ON transactions
  FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own transactions"
  ON transactions
  FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- Drop and recreate saved_deals policies
DROP POLICY IF EXISTS "Users can read own saved deals" ON saved_deals;
DROP POLICY IF EXISTS "Users can insert own saved deals" ON saved_deals;
DROP POLICY IF EXISTS "Users can update own saved deals" ON saved_deals;
DROP POLICY IF EXISTS "Users can delete own saved deals" ON saved_deals;

CREATE POLICY "Users can read own saved deals"
  ON saved_deals
  FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own saved deals"
  ON saved_deals
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own saved deals"
  ON saved_deals
  FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own saved deals"
  ON saved_deals
  FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- Drop and recreate notifications policies
DROP POLICY IF EXISTS "Users can read own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can insert own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can delete own notifications" ON notifications;

CREATE POLICY "Users can read own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can update own notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own notifications"
  ON notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own notifications"
  ON notifications
  FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));