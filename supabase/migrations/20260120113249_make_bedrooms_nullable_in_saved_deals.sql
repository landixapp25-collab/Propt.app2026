/*
  # Make bedrooms nullable in saved_deals table

  1. Changes
    - Make `bedrooms` column nullable in `saved_deals` table
    - Remove the NOT NULL constraint that's causing insert failures
  
  2. Reason
    - The application doesn't collect bedroom data during deal analysis
    - TypeScript types have bedrooms as optional but database schema requires it
    - This mismatch causes "Failed to save deal" errors
*/

-- Make bedrooms nullable
ALTER TABLE saved_deals 
ALTER COLUMN bedrooms DROP NOT NULL;

-- Update the check constraint to allow NULL
ALTER TABLE saved_deals 
DROP CONSTRAINT IF EXISTS saved_deals_bedrooms_check;

ALTER TABLE saved_deals 
ADD CONSTRAINT saved_deals_bedrooms_check 
CHECK (bedrooms IS NULL OR bedrooms > 0);