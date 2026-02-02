/*
  # Add Subscription Tier to Profiles
  
  1. Changes
    - Add `subscription_tier` column to `profiles` table
      - Type: text with check constraint for valid values ('free', 'pro', 'business')
      - Default: 'free' (all existing and new users start with free tier)
      - Not null constraint
  
  2. Notes
    - This enables feature gating based on subscription tiers
    - Free tier: 1 property limit
    - Pro tier: 6 properties limit
    - Business tier: unlimited properties
*/

-- Add subscription_tier column to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'subscription_tier'
  ) THEN
    ALTER TABLE profiles 
    ADD COLUMN subscription_tier text NOT NULL DEFAULT 'free'
    CHECK (subscription_tier IN ('free', 'pro', 'business'));
  END IF;
END $$;

-- Update existing profiles to have free tier if they don't have one set
UPDATE profiles 
SET subscription_tier = 'free' 
WHERE subscription_tier IS NULL;