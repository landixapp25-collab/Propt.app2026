/*
  # Add Missing Columns to Tables

  1. Changes to Properties Table
    - Add `status` column (text, default 'Stabilized')
    - Add `ai_analysis` column (jsonb, nullable)
    - Add `updated_at` column (timestamptz)

  2. Changes to Transactions Table
    - Add `receipt_filename` column (text, nullable)
    - Add `receipt_data` column (text, nullable)
    - Add `receipt_upload_date` column (text, nullable)
    - Add `receipt_file_type` column (text, nullable)
    - Add `updated_at` column (timestamptz)

  3. Changes to Saved Deals Table
    - Add `status` column (text, default 'Analyzing')
    - Add `updated_at` column (timestamptz)

  4. Notes
    - Using DO blocks to safely add columns if they don't exist
    - All operations are idempotent and safe to run multiple times
*/

-- Add missing columns to properties table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'properties' AND column_name = 'status'
  ) THEN
    ALTER TABLE properties ADD COLUMN status text DEFAULT 'Stabilized';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'properties' AND column_name = 'ai_analysis'
  ) THEN
    ALTER TABLE properties ADD COLUMN ai_analysis jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'properties' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE properties ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Add missing columns to transactions table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'transactions' AND column_name = 'receipt_filename'
  ) THEN
    ALTER TABLE transactions ADD COLUMN receipt_filename text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'transactions' AND column_name = 'receipt_data'
  ) THEN
    ALTER TABLE transactions ADD COLUMN receipt_data text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'transactions' AND column_name = 'receipt_upload_date'
  ) THEN
    ALTER TABLE transactions ADD COLUMN receipt_upload_date text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'transactions' AND column_name = 'receipt_file_type'
  ) THEN
    ALTER TABLE transactions ADD COLUMN receipt_file_type text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'transactions' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE transactions ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Add missing columns to saved_deals table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'saved_deals' AND column_name = 'status'
  ) THEN
    ALTER TABLE saved_deals ADD COLUMN status text DEFAULT 'Analyzing';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'saved_deals' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE saved_deals ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;