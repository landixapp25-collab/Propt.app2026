/*
  # Add Receipt Support to Transactions

  1. Changes
    - Add receipt columns to transactions table:
      - `receipt_filename` (text) - Original filename of the receipt
      - `receipt_data` (text) - Base64 encoded receipt data
      - `receipt_upload_date` (timestamptz) - When receipt was uploaded
      - `receipt_file_type` (text) - File type (jpg, png, pdf)

  2. Notes
    - All receipt columns are optional
    - Receipts stored as base64 strings in database
    - File types limited to jpg, png, pdf for validation
*/

-- Add receipt columns to transactions table
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
    ALTER TABLE transactions ADD COLUMN receipt_upload_date timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'transactions' AND column_name = 'receipt_file_type'
  ) THEN
    ALTER TABLE transactions ADD COLUMN receipt_file_type text;
  END IF;
END $$;