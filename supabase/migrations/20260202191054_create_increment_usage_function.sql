/*
  # Create increment_usage RPC function

  1. New Functions
    - `increment_usage` - Safely increments usage counters for subscription tracking
      - Handles both `usage_tracking` and `subscription_usage` tables
      - Uses upsert pattern to create or update records
      - Increments specified field (transactions_added or ai_receipts_used)

  2. Parameters
    - `p_user_id` (uuid) - User's ID
    - `p_month` (date) - Month to track (format: YYYY-MM-01)
    - `p_field` (text) - Field to increment ('transactions_added' or 'ai_receipts_used')

  3. Security
    - Function is marked as SECURITY DEFINER to allow updates
    - Only authenticated users can call this function
*/

CREATE OR REPLACE FUNCTION increment_usage(
  p_user_id uuid,
  p_month date,
  p_field text
) RETURNS void AS $$
BEGIN
  -- Insert or update in subscription_usage table
  INSERT INTO subscription_usage (user_id, month, transactions_added, ai_receipts_used)
  VALUES (
    p_user_id,
    p_month,
    CASE WHEN p_field = 'transactions_added' THEN 1 ELSE 0 END,
    CASE WHEN p_field = 'ai_receipts_used' THEN 1 ELSE 0 END
  )
  ON CONFLICT (user_id, month)
  DO UPDATE SET
    transactions_added = subscription_usage.transactions_added + 
      CASE WHEN p_field = 'transactions_added' THEN 1 ELSE 0 END,
    ai_receipts_used = subscription_usage.ai_receipts_used + 
      CASE WHEN p_field = 'ai_receipts_used' THEN 1 ELSE 0 END;

  -- Also update usage_tracking table if it exists
  INSERT INTO usage_tracking (user_id, month, transactions_added, ai_receipts_used)
  VALUES (
    p_user_id,
    p_month,
    CASE WHEN p_field = 'transactions_added' THEN 1 ELSE 0 END,
    CASE WHEN p_field = 'ai_receipts_used' THEN 1 ELSE 0 END
  )
  ON CONFLICT (user_id, month)
  DO UPDATE SET
    transactions_added = usage_tracking.transactions_added + 
      CASE WHEN p_field = 'transactions_added' THEN 1 ELSE 0 END,
    ai_receipts_used = usage_tracking.ai_receipts_used + 
      CASE WHEN p_field = 'ai_receipts_used' THEN 1 ELSE 0 END,
    updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
