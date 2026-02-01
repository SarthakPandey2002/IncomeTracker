import { Request } from 'express';
import { User } from '@supabase/supabase-js';

// Extend Express Request to include authenticated user
export interface AuthenticatedRequest extends Request {
  user?: User;
}

// Database Types
export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  plan: 'free' | 'pro' | 'business';
  stripe_customer_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface IncomeSource {
  id: string;
  user_id: string;
  source_name: string;
  source_type: 'platform' | 'custom';
  icon_url: string | null;
  created_at: string;
}

export interface IncomeRecord {
  id: string;
  user_id: string;
  source_id: string | null;
  amount: number;
  currency: string;
  transaction_date: string;
  description: string | null;
  category: string | null;
  customer_name: string | null;
  external_transaction_id: string | null;
  raw_data: Record<string, unknown> | null;
  created_at: string;
  // Joined from income_sources table
  income_sources?: {
    source_name: string;
  };
}

export interface CsvMapping {
  id: string;
  user_id: string;
  mapping_name: string;
  column_mapping: ColumnMapping;
  created_at: string;
}

export interface ColumnMapping {
  amount: string;
  date: string;
  description?: string;
  category?: string;
  customer?: string;
  currency?: string;
  transaction_id?: string;
}

// API Response Types
export interface ApiResponseType<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// CSV Upload Types
export interface ParsedCsvRow {
  [key: string]: string | undefined;
}

export interface CsvPreview {
  headers: string[];
  rows: ParsedCsvRow[];
  totalRows: number;
}
