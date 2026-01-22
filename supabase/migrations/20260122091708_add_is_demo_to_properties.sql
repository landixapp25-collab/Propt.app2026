/*
  # Add is_demo field to properties table

  1. Changes
    - Add `is_demo` (boolean) column to properties table with default value false
    - This allows marking properties created during onboarding as demo/sample properties
    - Demo properties can be easily identified and deleted after onboarding

  2. Notes
    - Uses IF NOT EXISTS to safely add column
    - Sets default to false so existing properties are not affected
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'properties' AND column_name = 'is_demo'
  ) THEN
    ALTER TABLE properties ADD COLUMN is_demo boolean DEFAULT false;
  END IF;
END $$;