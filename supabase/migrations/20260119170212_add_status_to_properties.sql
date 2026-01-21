/*
  # Add status field to properties table

  1. Changes
    - Add `status` column to `properties` table
      - Type: text with check constraint
      - Default: 'Stabilized'
      - Valid values: 'Stabilized', 'In Development', 'Under Offer', 'Planning'
    - Set existing properties to 'Stabilized' status

  2. Notes
    - Uses CHECK constraint to ensure only valid status values
    - Default value set to 'Stabilized' for backward compatibility
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'properties' AND column_name = 'status'
  ) THEN
    ALTER TABLE properties 
    ADD COLUMN status text DEFAULT 'Stabilized' NOT NULL
    CHECK (status IN ('Stabilized', 'In Development', 'Under Offer', 'Planning'));
  END IF;
END $$;