/*
  # Make current_value nullable for properties

  1. Changes
    - Alter `current_value` column in `properties` table to allow NULL values
    - Remove the CHECK constraint requiring current_value > 0
    - Add new CHECK constraint allowing NULL or values > 0

  2. Notes
    - This allows developers to add assets without a current valuation
    - Particularly useful for properties in development where valuation is not yet determined
    - Existing properties will retain their current_value data
*/

-- Drop the old constraint
ALTER TABLE properties
DROP CONSTRAINT IF EXISTS properties_current_value_check;

-- Make current_value nullable and add new constraint
ALTER TABLE properties
ALTER COLUMN current_value DROP NOT NULL;

-- Add new constraint that allows NULL or positive values
ALTER TABLE properties
ADD CONSTRAINT properties_current_value_check
CHECK (current_value IS NULL OR current_value > 0);
