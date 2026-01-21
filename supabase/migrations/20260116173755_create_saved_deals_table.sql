/*
  # Create Saved Deals Table

  1. New Tables
    - `saved_deals`
      - `id` (uuid, primary key, auto-generated)
      - `user_id` (uuid, references auth.users)
      - `address` (text) - Property address
      - `asking_price` (numeric) - Asking price in GBP
      - `property_type` (text) - Type: House, Flat, or Commercial
      - `bedrooms` (integer) - Number of bedrooms
      - `renovation_costs` (numeric) - Estimated renovation costs
      - `ai_analysis` (jsonb) - Full AI analysis data
      - `analyzed_date` (timestamptz) - Date when analysis was performed
      - `status` (text) - Status: considering, rejected, or purchased
      - `created_at` (timestamptz) - Auto timestamp
      - `updated_at` (timestamptz) - Auto timestamp

  2. Security
    - Enable RLS on saved_deals table
    - Add policies for authenticated users to:
      - View their own saved deals
      - Create their own saved deals
      - Update their own saved deals
      - Delete their own saved deals
*/

-- Create saved_deals table
CREATE TABLE IF NOT EXISTS saved_deals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  address text NOT NULL,
  asking_price numeric NOT NULL CHECK (asking_price > 0),
  property_type text NOT NULL CHECK (property_type IN ('House', 'Flat', 'Commercial')),
  bedrooms integer NOT NULL CHECK (bedrooms > 0),
  renovation_costs numeric NOT NULL DEFAULT 0 CHECK (renovation_costs >= 0),
  ai_analysis jsonb NOT NULL,
  analyzed_date timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'considering' CHECK (status IN ('considering', 'rejected', 'purchased')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS saved_deals_user_id_idx ON saved_deals(user_id);
CREATE INDEX IF NOT EXISTS saved_deals_status_idx ON saved_deals(status);
CREATE INDEX IF NOT EXISTS saved_deals_analyzed_date_idx ON saved_deals(analyzed_date);

-- Enable Row Level Security
ALTER TABLE saved_deals ENABLE ROW LEVEL SECURITY;

-- Saved deals policies
CREATE POLICY "Users can view own saved deals"
  ON saved_deals FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved deals"
  ON saved_deals FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own saved deals"
  ON saved_deals FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved deals"
  ON saved_deals FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_saved_deals_updated_at
  BEFORE UPDATE ON saved_deals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
