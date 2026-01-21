/*
  # Remove Duplicate RLS Policies

  1. Changes
    - Remove old duplicate policies from previous migrations
    - Keep only the optimized versions with (select auth.uid())
    
  2. Tables Cleaned
    - properties
    - transactions
    - saved_deals
*/

-- Remove old duplicate properties policies
DROP POLICY IF EXISTS "Users can view their own properties" ON properties;
DROP POLICY IF EXISTS "Users can insert their own properties" ON properties;
DROP POLICY IF EXISTS "Users can update their own properties" ON properties;
DROP POLICY IF EXISTS "Users can delete their own properties" ON properties;

-- Remove old duplicate transactions policies
DROP POLICY IF EXISTS "Users can view their own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can insert their own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can update their own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can delete their own transactions" ON transactions;

-- Remove old duplicate saved_deals policies
DROP POLICY IF EXISTS "Users can view their own saved deals" ON saved_deals;
DROP POLICY IF EXISTS "Users can insert their own saved deals" ON saved_deals;
DROP POLICY IF EXISTS "Users can update their own saved deals" ON saved_deals;
DROP POLICY IF EXISTS "Users can delete their own saved deals" ON saved_deals;