/*
  # Create PropertyAI Database Schema

  1. New Tables
    - `properties`
      - `id` (uuid, primary key, auto-generated)
      - `user_id` (uuid, references auth.users)
      - `name` (text) - Property name/address
      - `purchase_price` (numeric) - Purchase price in GBP
      - `purchase_date` (date) - Date of purchase
      - `property_type` (text) - Type: House, Flat, or Commercial
      - `current_value` (numeric) - Current market value in GBP
      - `created_at` (timestamptz) - Auto timestamp
      - `updated_at` (timestamptz) - Auto timestamp

    - `transactions`
      - `id` (uuid, primary key, auto-generated)
      - `user_id` (uuid, references auth.users)
      - `property_id` (uuid, references properties)
      - `type` (text) - Income or Expense
      - `category` (text) - Category of transaction
      - `amount` (numeric) - Amount in GBP
      - `date` (date) - Transaction date
      - `description` (text, optional) - Additional notes
      - `created_at` (timestamptz) - Auto timestamp
      - `updated_at` (timestamptz) - Auto timestamp

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to:
      - View their own properties and transactions
      - Create their own properties and transactions
      - Update their own properties and transactions
      - Delete their own properties and transactions
*/

-- Create properties table
CREATE TABLE IF NOT EXISTS properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  purchase_price numeric NOT NULL CHECK (purchase_price > 0),
  purchase_date date NOT NULL,
  property_type text NOT NULL CHECK (property_type IN ('House', 'Flat', 'Commercial')),
  current_value numeric NOT NULL CHECK (current_value > 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('Income', 'Expense')),
  category text NOT NULL,
  amount numeric NOT NULL CHECK (amount > 0),
  date date NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS properties_user_id_idx ON properties(user_id);
CREATE INDEX IF NOT EXISTS transactions_user_id_idx ON transactions(user_id);
CREATE INDEX IF NOT EXISTS transactions_property_id_idx ON transactions(property_id);
CREATE INDEX IF NOT EXISTS transactions_date_idx ON transactions(date);

-- Enable Row Level Security
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Properties policies
CREATE POLICY "Users can view own properties"
  ON properties FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own properties"
  ON properties FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own properties"
  ON properties FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own properties"
  ON properties FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Transactions policies
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions"
  ON transactions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions"
  ON transactions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
