/*
  # Add AI Analysis to Properties

  1. Changes
    - Add `ai_analysis` column to `properties` table to store AI-generated deal analysis
      - Column type: jsonb (allows storing structured JSON data)
      - Nullable: true (existing properties won't have AI analysis)
      - Default: null

  2. Details
    - The AI analysis includes:
      - dealRating: excellent/good/fair/poor
      - estimatedMonthlyRent: number
      - rentalYield: number
      - purchaseCosts: number
      - totalInvestment: number
      - annualProfit: number
      - roi: number
      - reasoning: string
      - marketComparison: string
      - riskFactors: array of strings
      - dataSources: optional string

  3. Notes
    - This column is optional and will only be populated for properties analyzed with AI
    - Existing properties will have null for this field
*/

-- Add ai_analysis column to properties table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'properties' AND column_name = 'ai_analysis'
  ) THEN
    ALTER TABLE properties ADD COLUMN ai_analysis jsonb DEFAULT null;
  END IF;
END $$;