/*
  # Update saved deals status values - Safe migration

  1. Changes
    - Update the status column in saved_deals table to support new status values
    - Old values: 'considering', 'rejected', 'purchased'
    - New values: 'reviewing', 'offer-made', 'due-diligence', 'acquired', 'rejected'
    - Update default value from 'considering' to 'reviewing'
  
  2. Reason
    - User wants more granular pipeline stages for saved deals
    - 'Acquired' status will trigger option to move deal to main portfolio
    - Keeping 'rejected' for deals that are no longer being pursued
  
  3. Strategy
    - Drop old constraint first
    - Update existing data
    - Update default value
    - Add new constraint
*/

-- Step 1: Drop the old constraint
ALTER TABLE saved_deals 
DROP CONSTRAINT IF EXISTS saved_deals_status_check;

-- Step 2: Update existing data to map old values to new values
UPDATE saved_deals 
SET status = CASE 
  WHEN status = 'considering' THEN 'reviewing'
  WHEN status = 'purchased' THEN 'acquired'
  ELSE status 
END;

-- Step 3: Update the default value
ALTER TABLE saved_deals 
ALTER COLUMN status SET DEFAULT 'reviewing'::text;

-- Step 4: Add new constraint with updated status values
ALTER TABLE saved_deals 
ADD CONSTRAINT saved_deals_status_check 
CHECK (status = ANY (ARRAY['reviewing'::text, 'offer-made'::text, 'due-diligence'::text, 'acquired'::text, 'rejected'::text]));