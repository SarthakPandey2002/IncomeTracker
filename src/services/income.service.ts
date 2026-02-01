import { supabaseAdmin } from '../config/supabase';
import { IncomeRecord, IncomeSource } from '../types';
import { AppError } from '../middleware/error.middleware';

export class IncomeService {
  // Income Sources
  async createSource(userId: string, sourceName: string, sourceType: 'platform' | 'custom' = 'custom'): Promise<IncomeSource> {
    const { data, error } = await supabaseAdmin
      .from('income_sources')
      .insert({ user_id: userId, source_name: sourceName, source_type: sourceType })
      .select()
      .single();

    if (error) {
      throw new AppError(`Failed to create income source: ${error.message}`);
    }
    return data;
  }

  async getSources(userId: string): Promise<IncomeSource[]> {
    const { data, error } = await supabaseAdmin
      .from('income_sources')
      .select('*')
      .eq('user_id', userId)
      .order('source_name');

    if (error) {
      throw new AppError(`Failed to fetch income sources: ${error.message}`);
    }
    return data || [];
  }

  async getOrCreateSource(userId: string, sourceName: string): Promise<IncomeSource> {
    // Try to find existing source
    const { data: existing } = await supabaseAdmin
      .from('income_sources')
      .select('*')
      .eq('user_id', userId)
      .eq('source_name', sourceName)
      .single();

    if (existing) {
      return existing;
    }

    // Create new source
    return this.createSource(userId, sourceName);
  }

  // Income Records
  async createRecord(userId: string, record: Partial<IncomeRecord>): Promise<IncomeRecord> {
    const { data, error } = await supabaseAdmin
      .from('income_records')
      .insert({ ...record, user_id: userId })
      .select()
      .single();

    if (error) {
      throw new AppError(`Failed to create income record: ${error.message}`);
    }
    return data;
  }

  async createRecords(userId: string, records: Partial<IncomeRecord>[]): Promise<{ inserted: number; duplicates: number }> {
    const recordsWithUser = records.map((r) => ({ ...r, user_id: userId }));

    const { data, error } = await supabaseAdmin
      .from('income_records')
      .upsert(recordsWithUser, {
        onConflict: 'user_id,source_id,external_transaction_id,transaction_date,amount',
        ignoreDuplicates: true
      })
      .select();

    if (error) {
      throw new AppError(`Failed to create income records: ${error.message}`);
    }

    const inserted = data?.length || 0;
    const duplicates = records.length - inserted;
    return { inserted, duplicates };
  }

  async getRecords(
    userId: string,
    options: {
      startDate?: string;
      endDate?: string;
      sourceId?: string;
      category?: string;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<{ records: IncomeRecord[]; total: number }> {
    let query = supabaseAdmin
      .from('income_records')
      .select('*, income_sources(source_name)', { count: 'exact' })
      .eq('user_id', userId)
      .order('transaction_date', { ascending: false });

    if (options.startDate) {
      query = query.gte('transaction_date', options.startDate);
    }
    if (options.endDate) {
      query = query.lte('transaction_date', options.endDate);
    }
    if (options.sourceId) {
      query = query.eq('source_id', options.sourceId);
    }
    if (options.category) {
      query = query.eq('category', options.category);
    }
    if (options.limit) {
      query = query.limit(options.limit);
    }
    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error, count } = await query;

    if (error) {
      throw new AppError(`Failed to fetch income records: ${error.message}`);
    }

    return { records: data || [], total: count || 0 };
  }

  async getRecord(userId: string, recordId: string): Promise<IncomeRecord | null> {
    const { data, error } = await supabaseAdmin
      .from('income_records')
      .select('*, income_sources(source_name)')
      .eq('id', recordId)
      .eq('user_id', userId)
      .single();

    if (error) {
      return null;
    }
    return data;
  }

  async updateRecord(userId: string, recordId: string, updates: Partial<IncomeRecord>): Promise<IncomeRecord> {
    const { data, error } = await supabaseAdmin
      .from('income_records')
      .update(updates)
      .eq('id', recordId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new AppError(`Failed to update income record: ${error.message}`);
    }
    return data;
  }

  async deleteRecord(userId: string, recordId: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('income_records')
      .delete()
      .eq('id', recordId)
      .eq('user_id', userId);

    if (error) {
      throw new AppError(`Failed to delete income record: ${error.message}`);
    }
  }

  // Analytics
  async getSummary(userId: string, startDate?: string, endDate?: string) {
    let query = supabaseAdmin
      .from('income_records')
      .select('amount, currency, transaction_date, source_id, income_sources(source_name)')
      .eq('user_id', userId);

    if (startDate) {
      query = query.gte('transaction_date', startDate);
    }
    if (endDate) {
      query = query.lte('transaction_date', endDate);
    }

    const { data, error } = await query;

    if (error) {
      throw new AppError(`Failed to fetch summary: ${error.message}`);
    }

    const records = data || [];

    // Calculate totals
    const totalAmount = records.reduce((sum, r) => sum + Number(r.amount), 0);
    const recordCount = records.length;

    // Group by source
    const bySource: Record<string, number> = {};
    records.forEach((r) => {
      const incomeSource = r.income_sources as unknown as { source_name: string } | null;
      const sourceName = incomeSource?.source_name || 'Unknown';
      bySource[sourceName] = (bySource[sourceName] || 0) + Number(r.amount);
    });

    // Group by month
    const byMonth: Record<string, number> = {};
    records.forEach((r) => {
      const month = r.transaction_date.substring(0, 7); // YYYY-MM
      byMonth[month] = (byMonth[month] || 0) + Number(r.amount);
    });

    return {
      totalAmount,
      recordCount,
      bySource,
      byMonth,
    };
  }
}

export const incomeService = new IncomeService();
