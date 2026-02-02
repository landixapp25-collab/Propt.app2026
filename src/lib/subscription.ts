import { supabase } from './supabase';

export type SubscriptionTier = 'free' | 'pro' | 'business';
export type SubscriptionStatus = 'active' | 'trialing' | 'canceled' | 'past_due';

export interface UserProfile {
  id: string;
  full_name: string | null;
  subscription_tier: SubscriptionTier;
  subscription_status: SubscriptionStatus;
  trial_ends_at: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
}

export interface UsageData {
  transactions_added: number;
  ai_receipts_used: number;
}

export interface FeatureLimits {
  maxProperties: number;
  maxTransactionsPerMonth: number;
  maxAIReceiptsPerMonth: number;
  canExportTaxPack: boolean;
  canUseAIReceipts: boolean;
}

const FEATURE_LIMITS: Record<SubscriptionTier, FeatureLimits> = {
  free: {
    maxProperties: 1,
    maxTransactionsPerMonth: 10,
    maxAIReceiptsPerMonth: 0,
    canExportTaxPack: false,
    canUseAIReceipts: false,
  },
  pro: {
    maxProperties: 6,
    maxTransactionsPerMonth: Infinity,
    maxAIReceiptsPerMonth: 100,
    canExportTaxPack: true,
    canUseAIReceipts: true,
  },
  business: {
    maxProperties: Infinity,
    maxTransactionsPerMonth: Infinity,
    maxAIReceiptsPerMonth: Infinity,
    canExportTaxPack: true,
    canUseAIReceipts: true,
  },
};

export async function getUserProfile(): Promise<UserProfile | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, subscription_tier, subscription_status, trial_ends_at, stripe_customer_id, stripe_subscription_id')
      .eq('id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    return data as UserProfile;
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    return null;
  }
}

export async function getPropertyCount(userId: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('properties')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_demo', false);

    if (error) {
      console.error('Error counting properties:', error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error('Error in getPropertyCount:', error);
    return 0;
  }
}

export async function getMonthlyUsage(userId: string): Promise<UsageData> {
  try {
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from('usage_tracking')
      .select('transactions_added, ai_receipts_used')
      .eq('user_id', userId)
      .eq('month', currentMonth.toISOString().split('T')[0])
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching usage:', error);
    }

    return {
      transactions_added: data?.transactions_added || 0,
      ai_receipts_used: data?.ai_receipts_used || 0,
    };
  } catch (error) {
    console.error('Error in getMonthlyUsage:', error);
    return { transactions_added: 0, ai_receipts_used: 0 };
  }
}

export async function incrementTransactionUsage(userId: string): Promise<void> {
  try {
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);
    const monthStr = currentMonth.toISOString().split('T')[0];

    const { error } = await supabase.rpc('increment_usage', {
      p_user_id: userId,
      p_month: monthStr,
      p_field: 'transactions_added',
    });

    if (error) {
      console.error('Error incrementing transaction usage:', error);
    }
  } catch (error) {
    console.error('Error in incrementTransactionUsage:', error);
  }
}

export async function incrementAIReceiptUsage(userId: string): Promise<void> {
  try {
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);
    const monthStr = currentMonth.toISOString().split('T')[0];

    const { error } = await supabase.rpc('increment_usage', {
      p_user_id: userId,
      p_month: monthStr,
      p_field: 'ai_receipts_used',
    });

    if (error) {
      console.error('Error incrementing AI receipt usage:', error);
    }
  } catch (error) {
    console.error('Error in incrementAIReceiptUsage:', error);
  }
}

export function getFeatureLimits(tier: SubscriptionTier): FeatureLimits {
  return FEATURE_LIMITS[tier];
}

export function isOnTrial(profile: UserProfile | null): boolean {
  if (!profile || !profile.trial_ends_at) return false;

  const trialEndDate = new Date(profile.trial_ends_at);
  return trialEndDate > new Date() && profile.subscription_status === 'trialing';
}

export function getTrialDaysRemaining(profile: UserProfile | null): number {
  if (!profile || !profile.trial_ends_at) return 0;

  const trialEndDate = new Date(profile.trial_ends_at);
  const now = new Date();
  const diffTime = trialEndDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return Math.max(0, diffDays);
}

export async function canAddProperty(userId: string, tier: SubscriptionTier): Promise<{ allowed: boolean; reason?: string }> {
  const limits = getFeatureLimits(tier);
  const currentCount = await getPropertyCount(userId);

  if (currentCount >= limits.maxProperties) {
    if (tier === 'free') {
      return {
        allowed: false,
        reason: 'Free plan allows 1 property. Upgrade to Pro for up to 6 properties.',
      };
    } else if (tier === 'pro') {
      return {
        allowed: false,
        reason: 'Pro plan allows 6 properties. Upgrade to Business for unlimited properties.',
      };
    }
  }

  return { allowed: true };
}

export async function canAddTransaction(userId: string, tier: SubscriptionTier): Promise<{ allowed: boolean; reason?: string }> {
  if (tier !== 'free') {
    return { allowed: true };
  }

  const limits = getFeatureLimits(tier);
  const usage = await getMonthlyUsage(userId);

  if (usage.transactions_added >= limits.maxTransactionsPerMonth) {
    return {
      allowed: false,
      reason: "You've reached your 10 transaction limit this month. Upgrade to Pro for unlimited transactions.",
    };
  }

  return { allowed: true };
}

export async function canUseAIReceipt(userId: string, tier: SubscriptionTier): Promise<{ allowed: boolean; reason?: string }> {
  const limits = getFeatureLimits(tier);

  if (!limits.canUseAIReceipts) {
    return {
      allowed: false,
      reason: 'AI receipt extraction is a Pro feature. Try it free for 7 days!',
    };
  }

  if (tier === 'pro') {
    const usage = await getMonthlyUsage(userId);
    if (usage.ai_receipts_used >= limits.maxAIReceiptsPerMonth) {
      return {
        allowed: false,
        reason: "You've used 100/100 AI receipts this month. Upgrade to Business for unlimited.",
      };
    }
  }

  return { allowed: true };
}

export function canExportTaxPack(tier: SubscriptionTier): { allowed: boolean; reason?: string } {
  const limits = getFeatureLimits(tier);

  if (!limits.canExportTaxPack) {
    return {
      allowed: false,
      reason: 'Tax pack exports are a Pro feature. Start your 7-day free trial!',
    };
  }

  return { allowed: true };
}
