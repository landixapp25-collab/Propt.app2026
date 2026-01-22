import { supabase } from './supabase';
import { Property, Transaction, AIAnalysis, SavedDeal, DealStatus, Notification, NotificationType, PropertyStatus } from '../types';

export interface DBProperty {
  id: string;
  user_id: string;
  name: string;
  purchase_price: number;
  purchase_date: string;
  property_type: 'House' | 'Flat' | 'Commercial';
  current_value: number;
  status: PropertyStatus;
  ai_analysis?: any;
  is_demo?: boolean;
  created_at: string;
  updated_at: string;
}

export interface DBTransaction {
  id: string;
  user_id: string;
  property_id: string;
  type: 'Income' | 'Expense';
  category: string;
  amount: number;
  date: string;
  description?: string;
  receipt_filename?: string;
  receipt_data?: string;
  receipt_upload_date?: string;
  receipt_file_type?: string;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  fullName?: string;
  bio?: string;
  avatarUrl?: string;
  phone?: string;
}

export interface DBProfile {
  id: string;
  full_name?: string;
  bio?: string;
  avatar_url?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export interface DBSavedDeal {
  id: string;
  user_id: string;
  address: string;
  asking_price: number;
  property_type: 'House' | 'Flat' | 'Commercial';
  bedrooms: number | null;
  renovation_costs: number;
  ai_analysis: any;
  analyzed_date: string;
  status: DealStatus;
  created_at: string;
  updated_at: string;
}

export const propertyService = {
  async getAll(): Promise<Property[]> {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map((p: DBProperty) => ({
      id: p.id,
      name: p.name,
      purchasePrice: p.purchase_price,
      purchaseDate: p.purchase_date,
      propertyType: p.property_type,
      currentValue: p.current_value,
      status: p.status,
      aiAnalysis: p.ai_analysis as AIAnalysis | undefined,
      isDemo: p.is_demo,
    }));
  },

  async create(property: Omit<Property, 'id'>): Promise<Property> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const insertData: any = {
      user_id: user.id,
      name: property.name,
      purchase_price: property.purchasePrice,
      purchase_date: property.purchaseDate,
      property_type: property.propertyType,
      current_value: property.currentValue,
      status: property.status || 'Stabilized',
    };

    if (property.aiAnalysis) {
      insertData.ai_analysis = property.aiAnalysis;
    }

    if (property.isDemo !== undefined) {
      insertData.is_demo = property.isDemo;
    }

    const { data, error } = await supabase
      .from('properties')
      .insert(insertData)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      name: data.name,
      purchasePrice: data.purchase_price,
      purchaseDate: data.purchase_date,
      propertyType: data.property_type,
      currentValue: data.current_value,
      status: data.status,
      aiAnalysis: data.ai_analysis as AIAnalysis | undefined,
      isDemo: data.is_demo,
    };
  },

  async update(id: string, property: Partial<Omit<Property, 'id'>>): Promise<Property> {
    const updateData: any = {};
    if (property.name !== undefined) updateData.name = property.name;
    if (property.purchasePrice !== undefined) updateData.purchase_price = property.purchasePrice;
    if (property.purchaseDate !== undefined) updateData.purchase_date = property.purchaseDate;
    if (property.propertyType !== undefined) updateData.property_type = property.propertyType;
    if (property.currentValue !== undefined) updateData.current_value = property.currentValue;
    if (property.status !== undefined) updateData.status = property.status;
    if (property.aiAnalysis !== undefined) updateData.ai_analysis = property.aiAnalysis;
    if (property.isDemo !== undefined) updateData.is_demo = property.isDemo;

    const { data, error } = await supabase
      .from('properties')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      name: data.name,
      purchasePrice: data.purchase_price,
      purchaseDate: data.purchase_date,
      propertyType: data.property_type,
      currentValue: data.current_value,
      status: data.status,
      aiAnalysis: data.ai_analysis as AIAnalysis | undefined,
      isDemo: data.is_demo,
    };
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async createDemoProperty(): Promise<Property> {
    const demoProperty = {
      name: 'Sample Property - 123 Demo Street',
      purchasePrice: 200000,
      purchaseDate: new Date().toISOString().split('T')[0],
      propertyType: 'House' as const,
      currentValue: 250000,
      status: 'Stabilized' as const,
      isDemo: true,
    };

    return this.create(demoProperty);
  },

  async deleteDemoProperties(): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('user_id', user.id)
      .eq('is_demo', true);

    if (error) throw error;
  },

  async hasDemoProperty(): Promise<boolean> {
    const { data, error } = await supabase
      .from('properties')
      .select('id')
      .eq('is_demo', true)
      .maybeSingle();

    if (error) throw error;
    return !!data;
  },
};

export const transactionService = {
  async getAll(): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false });

    if (error) throw error;

    return (data || []).map((t: DBTransaction) => ({
      id: t.id,
      propertyId: t.property_id,
      type: t.type,
      category: t.category,
      amount: t.amount,
      date: t.date,
      description: t.description,
      receipt: t.receipt_filename && t.receipt_data ? {
        filename: t.receipt_filename,
        data: t.receipt_data,
        uploadDate: t.receipt_upload_date || '',
        fileType: t.receipt_file_type || '',
      } : undefined,
    }));
  },

  async create(transaction: Omit<Transaction, 'id'>): Promise<Transaction> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const insertData: any = {
      user_id: user.id,
      property_id: transaction.propertyId,
      type: transaction.type,
      category: transaction.category,
      amount: transaction.amount,
      date: transaction.date,
      description: transaction.description,
    };

    if (transaction.receipt) {
      insertData.receipt_filename = transaction.receipt.filename;
      insertData.receipt_data = transaction.receipt.data;
      insertData.receipt_upload_date = transaction.receipt.uploadDate;
      insertData.receipt_file_type = transaction.receipt.fileType;
    }

    const { data, error } = await supabase
      .from('transactions')
      .insert(insertData)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      propertyId: data.property_id,
      type: data.type,
      category: data.category,
      amount: data.amount,
      date: data.date,
      description: data.description,
      receipt: data.receipt_filename && data.receipt_data ? {
        filename: data.receipt_filename,
        data: data.receipt_data,
        uploadDate: data.receipt_upload_date || '',
        fileType: data.receipt_file_type || '',
      } : undefined,
    };
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete transaction: ${error.message}`);
    }
  },
};

export const savedDealService = {
  async getAll(): Promise<SavedDeal[]> {
    const { data, error } = await supabase
      .from('saved_deals')
      .select('*')
      .order('analyzed_date', { ascending: false });

    if (error) throw error;

    return (data || []).map((d: DBSavedDeal) => {
      const aiAnalysis = d.ai_analysis as AIAnalysis;
      return {
        id: d.id,
        address: d.address,
        strategy: aiAnalysis.strategy,
        askingPrice: d.asking_price,
        propertyType: d.property_type,
        bedrooms: d.bedrooms ?? undefined,
        renovationCosts: d.renovation_costs,
        aiAnalysis,
        analyzedDate: d.analyzed_date,
        status: d.status,
      };
    });
  },

  async create(deal: Omit<SavedDeal, 'id'>): Promise<SavedDeal> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    if (!deal.askingPrice || deal.askingPrice <= 0) {
      throw new Error('Asking price must be greater than 0');
    }

    const { data, error } = await supabase
      .from('saved_deals')
      .insert({
        user_id: user.id,
        address: deal.address,
        asking_price: deal.askingPrice,
        property_type: deal.propertyType,
        bedrooms: deal.bedrooms || null,
        renovation_costs: deal.renovationCosts || 0,
        ai_analysis: deal.aiAnalysis,
        analyzed_date: deal.analyzedDate,
        status: deal.status,
      })
      .select()
      .single();

    if (error) throw error;

    const aiAnalysis = data.ai_analysis as AIAnalysis;
    return {
      id: data.id,
      address: data.address,
      strategy: aiAnalysis.strategy,
      askingPrice: data.asking_price,
      propertyType: data.property_type,
      bedrooms: data.bedrooms ?? undefined,
      renovationCosts: data.renovation_costs,
      aiAnalysis,
      analyzedDate: data.analyzed_date,
      status: data.status,
    };
  },

  async update(id: string, deal: Partial<Omit<SavedDeal, 'id'>>): Promise<SavedDeal> {
    const updateData: any = {};
    if (deal.address !== undefined) updateData.address = deal.address;
    if (deal.askingPrice !== undefined) updateData.asking_price = deal.askingPrice;
    if (deal.propertyType !== undefined) updateData.property_type = deal.propertyType;
    if (deal.bedrooms !== undefined) updateData.bedrooms = deal.bedrooms;
    if (deal.renovationCosts !== undefined) updateData.renovation_costs = deal.renovationCosts;
    if (deal.aiAnalysis !== undefined) updateData.ai_analysis = deal.aiAnalysis;
    if (deal.analyzedDate !== undefined) updateData.analyzed_date = deal.analyzedDate;
    if (deal.status !== undefined) updateData.status = deal.status;

    const { data, error } = await supabase
      .from('saved_deals')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    const aiAnalysis = data.ai_analysis as AIAnalysis;
    return {
      id: data.id,
      address: data.address,
      strategy: aiAnalysis.strategy,
      askingPrice: data.asking_price,
      propertyType: data.property_type,
      bedrooms: data.bedrooms ?? undefined,
      renovationCosts: data.renovation_costs,
      aiAnalysis,
      analyzedDate: data.analyzed_date,
      status: data.status,
    };
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('saved_deals')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

export const profileService = {
  async get(): Promise<Profile | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    return {
      id: data.id,
      fullName: data.full_name,
      bio: data.bio,
      avatarUrl: data.avatar_url,
      phone: data.phone,
    };
  },

  async update(profile: Partial<Omit<Profile, 'id'>>): Promise<Profile> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const upsertData: any = { id: user.id };
    if (profile.fullName !== undefined) upsertData.full_name = profile.fullName;
    if (profile.bio !== undefined) upsertData.bio = profile.bio;
    if (profile.avatarUrl !== undefined) upsertData.avatar_url = profile.avatarUrl;
    if (profile.phone !== undefined) upsertData.phone = profile.phone;

    const { data, error } = await supabase
      .from('profiles')
      .upsert(upsertData)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      fullName: data.full_name,
      bio: data.bio,
      avatarUrl: data.avatar_url,
      phone: data.phone,
    };
  },
};

export interface DBNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  property_id?: string;
  created_at: string;
}

export const notificationService = {
  async getAll(): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map((n: DBNotification) => ({
      id: n.id,
      userId: n.user_id,
      title: n.title,
      message: n.message,
      type: n.type,
      read: n.read,
      propertyId: n.property_id,
      createdAt: n.created_at,
    }));
  },

  async create(notification: Omit<Notification, 'id' | 'userId' | 'createdAt'>): Promise<Notification> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: user.id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        read: notification.read,
        property_id: notification.propertyId,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      userId: data.user_id,
      title: data.title,
      message: data.message,
      type: data.type,
      read: data.read,
      propertyId: data.property_id,
      createdAt: data.created_at,
    };
  },

  async markAsRead(id: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id);

    if (error) throw error;
  },

  async markAllAsRead(): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('read', false);

    if (error) throw error;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};
